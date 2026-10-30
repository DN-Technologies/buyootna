import { execFile } from 'node:child_process';

import {
  ffprobeArgs,
  judgeVideo,
  Limiter,
  probeVideoFile,
  VideoProbeUnavailableError,
} from '../utils/video-probe';

jest.mock('node:child_process', () => ({ execFile: jest.fn() }));

const out = (
  over: {
    format?: Record<string, unknown>;
    streams?: Record<string, unknown>[];
  } = {},
) =>
  JSON.stringify({
    format: {
      format_name: 'mov,mp4,m4a,3gp,3g2,mj2',
      duration: '29.800000',
      ...over.format,
    },
    streams: over.streams ?? [
      { codec_type: 'video', codec_name: 'h264', width: 720, height: 1280 },
      { codec_type: 'audio', codec_name: 'aac' },
    ],
  });

describe('judgeVideo with other rules (reels)', () => {
  const rules = { maxMs: 60_500, maxSide: 1920, videoCodecs: ['h264'] };
  const hevc = [
    { codec_type: 'video', codec_name: 'hevc', width: 720, height: 1280 },
  ];

  it('a 60 s video passes them, and still fails the story rules', () => {
    const video = out({ format: { duration: '60.000000' } });
    expect(judgeVideo(video, rules)).toMatchObject({
      ok: true,
      durationMs: 60_000,
    });
    expect(judgeVideo(video)).toEqual({ ok: false, reason: 'too_long' });
  });

  it('HEVC fails them, and still passes the story rules', () => {
    expect(judgeVideo(out({ streams: hevc }), rules)).toEqual({
      ok: false,
      reason: 'video_codec',
    });
    expect(judgeVideo(out({ streams: hevc }))).toMatchObject({ ok: true });
  });
});

describe('judgeVideo', () => {
  it('a 30 s 720p H.264 + AAC phone video passes, with its measurements', () => {
    expect(judgeVideo(out())).toEqual({
      ok: true,
      width: 720,
      height: 1280,
      durationMs: 29_800,
    });
  });

  it('HEVC, no audio, and extra data tracks (iPhone timecode) are fine', () => {
    expect(
      judgeVideo(
        out({
          streams: [
            {
              codec_type: 'video',
              codec_name: 'hevc',
              width: 1080,
              height: 1920,
            },
            { codec_type: 'data', codec_name: 'none' },
          ],
        }),
      ),
    ).toMatchObject({ ok: true });
  });

  it('a portrait video stored sideways reports its shown size', () => {
    const sideways = (rotation: Record<string, unknown>) =>
      judgeVideo(
        out({
          streams: [
            {
              codec_type: 'video',
              codec_name: 'h264',
              width: 1280,
              height: 720,
              ...rotation,
            },
          ],
        }),
      );
    expect(sideways({ side_data_list: [{ rotation: -90 }] })).toMatchObject({
      width: 720,
      height: 1280,
    });
    expect(sideways({ tags: { rotate: '270' } })).toMatchObject({
      width: 720,
      height: 1280,
    });
    expect(sideways({ side_data_list: [{ rotation: 180 }] })).toMatchObject({
      width: 1280,
      height: 720,
    });
  });

  it('the length falls back to the video stream', () => {
    expect(
      judgeVideo(
        out({
          format: { duration: undefined },
          streams: [
            {
              codec_type: 'video',
              codec_name: 'h264',
              width: 720,
              height: 1280,
              duration: '12.5',
            },
          ],
        }),
      ),
    ).toMatchObject({ ok: true, durationMs: 12_500 });
  });

  it.each([
    ['30.5 s is the limit', out({ format: { duration: '30.5' } }), true],
    ['over 30.5 s', out({ format: { duration: '30.6' } }), 'too_long'],
    ['no length at all', out({ format: { duration: 'N/A' } }), 'no_duration'],
    [
      'a WebM/Matroska file',
      out({ format: { format_name: 'matroska,webm' } }),
      'not_a_video',
    ],
    ['a GIF', out({ format: { format_name: 'gif' } }), 'not_a_video'],
    ['not JSON', 'Invalid data found when processing input', 'not_a_video'],
    [
      'VP9 video',
      out({
        streams: [
          { codec_type: 'video', codec_name: 'vp9', width: 720, height: 1280 },
        ],
      }),
      'video_codec',
    ],
    [
      'two video streams',
      out({
        streams: [
          { codec_type: 'video', codec_name: 'h264', width: 720, height: 1280 },
          { codec_type: 'video', codec_name: 'h264', width: 720, height: 1280 },
        ],
      }),
      'video_streams',
    ],
    [
      'no video stream',
      out({ streams: [{ codec_type: 'audio', codec_name: 'aac' }] }),
      'video_streams',
    ],
    [
      'two audio streams',
      out({
        streams: [
          { codec_type: 'video', codec_name: 'h264', width: 720, height: 1280 },
          { codec_type: 'audio', codec_name: 'aac' },
          { codec_type: 'audio', codec_name: 'aac' },
        ],
      }),
      'audio_streams',
    ],
    [
      'Opus audio',
      out({
        streams: [
          { codec_type: 'video', codec_name: 'h264', width: 720, height: 1280 },
          { codec_type: 'audio', codec_name: 'opus' },
        ],
      }),
      'audio_codec',
    ],
    [
      '4K',
      out({
        streams: [
          {
            codec_type: 'video',
            codec_name: 'hevc',
            width: 2160,
            height: 3840,
          },
        ],
      }),
      'too_large',
    ],
    [
      'no dimensions',
      out({ streams: [{ codec_type: 'video', codec_name: 'h264' }] }),
      'no_dimensions',
    ],
  ])('%s', (_label, json, expected) => {
    const verdict = judgeVideo(json);
    if (expected === true) expect(verdict.ok).toBe(true);
    else expect(verdict).toEqual({ ok: false, reason: expected });
  });
});

describe('ffprobeArgs', () => {
  it('reads only the local file: no network or other protocols', () => {
    const args = ffprobeArgs('/tmp/story-x/media');
    expect(args).toEqual(
      expect.arrayContaining(['-protocol_whitelist', 'file', '-of', 'json']),
    );
    expect(args[args.indexOf('-protocol_whitelist') + 1]).toBe('file');
    expect(args.at(-1)).toBe('file:/tmp/story-x/media');
  });
});

describe('probeVideoFile', () => {
  type Callback = (error: Error | null, stdout: string) => void;
  const run = execFile as unknown as jest.Mock;
  const answer = (error: Record<string, unknown> | null, stdout = '') =>
    run.mockImplementationOnce(
      (_cmd: string, _args: string[], _opts: object, cb: Callback) => {
        cb(error ? Object.assign(new Error('ffprobe'), error) : null, stdout);
      },
    );

  beforeEach(() => run.mockReset());

  it('runs ffprobe directly (no shell) with a timeout and an output cap', async () => {
    answer(null, out());
    await expect(probeVideoFile('/tmp/v')).resolves.toMatchObject({ ok: true });
    expect(run).toHaveBeenCalledWith(
      'ffprobe',
      ffprobeArgs('/tmp/v'),
      expect.objectContaining({
        timeout: 15_000,
        maxBuffer: 1024 * 1024,
        killSignal: 'SIGKILL',
      }),
      expect.any(Function),
    );
    const [, , options] = run.mock.calls[0] as [string, string[], object];
    expect(options).not.toHaveProperty('shell');
  });

  it('a file ffprobe cannot read is not a video', async () => {
    answer({ code: 1 });
    await expect(probeVideoFile('/tmp/v')).resolves.toEqual({
      ok: false,
      reason: 'not_a_video',
    });
  });

  it('a probe that runs too long is killed and fails the file', async () => {
    answer({ killed: true, signal: 'SIGKILL' });
    await expect(probeVideoFile('/tmp/v')).resolves.toEqual({
      ok: false,
      reason: 'probe_timeout',
    });
  });

  it('too much output fails the file', async () => {
    answer({ code: 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER' });
    await expect(probeVideoFile('/tmp/v')).resolves.toEqual({
      ok: false,
      reason: 'probe_output',
    });
  });

  it('ffprobe missing from the server is the server’s problem, not the file’s', async () => {
    answer({ code: 'ENOENT' });
    await expect(probeVideoFile('/tmp/v')).rejects.toBeInstanceOf(
      VideoProbeUnavailableError,
    );
  });
});

describe('Limiter', () => {
  it('runs at most N at once and lets the rest through in turn', async () => {
    const limiter = new Limiter(2);
    let running = 0;
    let peak = 0;
    const releases: (() => void)[] = [];
    const task = () =>
      limiter.run(async () => {
        running += 1;
        peak = Math.max(peak, running);
        await new Promise<void>((resolve) => releases.push(resolve));
        running -= 1;
      });
    const all = Promise.all([task(), task(), task(), task()]);
    await new Promise((r) => setImmediate(r));
    expect(releases).toHaveLength(2);
    while (releases.length) {
      releases.shift()!();
      await new Promise((r) => setImmediate(r));
    }
    await all;
    expect(peak).toBe(2);
  });

  it('a failing task frees its place', async () => {
    const limiter = new Limiter(1);
    await expect(
      limiter.run(() => Promise.reject(new Error('x'))),
    ).rejects.toThrow('x');
    await expect(limiter.run(() => Promise.resolve(1))).resolves.toBe(1);
  });
});
