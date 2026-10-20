/**
 * Real ffprobe on real files, made on the spot with ffmpeg. Runs only where
 * both exist (the API image has them; most dev machines and CI don't):
 *
 *   docker run --rm -v "$PWD":"$PWD" -w "$PWD/apps/api" node:20-alpine \
 *     sh -c 'apk add --no-cache ffmpeg >/dev/null && \
 *       npx jest src/features/stories/tests/video-probe.ffprobe.spec.ts'
 */
import { execFileSync } from 'node:child_process';
import { mkdtempSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';

import { probeVideoFile } from '../utils/video-probe';

const has = (cmd: string) => {
  try {
    execFileSync(cmd, ['-version'], { stdio: 'ignore' });
    return true;
  } catch {
    return false;
  }
};
const available = has('ffprobe') && has('ffmpeg');
const describeIf = available ? describe : describe.skip;

describeIf('probeVideoFile with the real ffprobe', () => {
  let dir: string;
  const make = (name: string, args: string[]) => {
    const path = join(dir, name);
    execFileSync('ffmpeg', ['-v', 'error', '-y', ...args, path]);
    return path;
  };
  const colour = (seconds: number, size = '720x1280') => [
    '-f',
    'lavfi',
    '-i',
    `color=c=navy:s=${size}:d=${seconds}:r=15`,
  ];
  const tone = (seconds: number) => [
    '-f',
    'lavfi',
    '-i',
    `sine=frequency=440:duration=${seconds}`,
  ];

  beforeAll(() => {
    dir = mkdtempSync(join(tmpdir(), 'story-probe-'));
  });
  afterAll(() => rmSync(dir, { recursive: true, force: true }));

  it('a 30 s 720p H.264 + AAC MP4 passes, measured', async () => {
    const file = make('ok.mp4', [
      ...colour(30),
      ...tone(30),
      '-c:v',
      'libx264',
      '-preset',
      'ultrafast',
      '-pix_fmt',
      'yuv420p',
      '-c:a',
      'aac',
      '-shortest',
    ]);
    const verdict = await probeVideoFile(file);
    expect(verdict).toMatchObject({ ok: true, width: 720, height: 1280 });
    expect(verdict.ok && verdict.durationMs).toBeGreaterThan(29_500);
  }, 60_000);

  it('a 31 s video is too long', async () => {
    const file = make('long.mp4', [
      ...colour(31),
      '-c:v',
      'libx264',
      '-preset',
      'ultrafast',
      '-pix_fmt',
      'yuv420p',
    ]);
    await expect(probeVideoFile(file)).resolves.toEqual({
      ok: false,
      reason: 'too_long',
    });
  }, 60_000);

  it('a phone-style sideways recording reports portrait', async () => {
    const landscape = make('landscape.mp4', [
      ...colour(3, '1280x720'),
      '-c:v',
      'libx264',
      '-preset',
      'ultrafast',
      '-pix_fmt',
      'yuv420p',
    ]);
    // Phones store the turn as a display matrix, as this does
    const file = make('sideways.mov', [
      '-display_rotation',
      '90',
      '-i',
      landscape,
      '-c',
      'copy',
    ]);
    await expect(probeVideoFile(file)).resolves.toMatchObject({
      ok: true,
      width: 720,
      height: 1280,
    });
  }, 60_000);

  it('a VP9 WebM is refused', async () => {
    const file = make('clip.webm', [
      ...colour(2),
      '-c:v',
      'libvpx-vp9',
      '-deadline',
      'realtime',
    ]);
    await expect(probeVideoFile(file)).resolves.toEqual({
      ok: false,
      reason: 'not_a_video',
    });
  }, 60_000);

  it('a text file named .mp4 is refused', async () => {
    const file = join(dir, 'fake.mp4');
    writeFileSync(file, 'definitely not a video '.repeat(100));
    await expect(probeVideoFile(file)).resolves.toEqual({
      ok: false,
      reason: 'not_a_video',
    });
  });

  it('only the local file is read: a playlist pointing elsewhere is refused', async () => {
    const file = join(dir, 'list.mp4');
    writeFileSync(
      file,
      '#EXTM3U\n#EXTINF:10,\nhttp://169.254.169.254/latest/meta-data/\n',
    );
    await expect(probeVideoFile(file)).resolves.toMatchObject({ ok: false });
  });
});

if (!available) {
  it.skip('real ffprobe checks need ffprobe and ffmpeg installed', () =>
    undefined);
}
