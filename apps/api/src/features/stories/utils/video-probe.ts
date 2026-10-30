import { execFile } from 'node:child_process';

import {
  STORY_AUDIO_CODECS,
  STORY_PROBE_MAX_CONCURRENT,
  STORY_PROBE_MAX_OUTPUT,
  STORY_PROBE_TIMEOUT_MS,
  STORY_VIDEO_CODECS,
  STORY_VIDEO_MAX_MS,
  STORY_VIDEO_MAX_SIDE,
} from '../stories.constants';

/** What ffprobe found, once it passed every rule. */
export interface ProbedVideo {
  width: number;
  height: number;
  durationMs: number;
}

export type VideoVerdict =
  ({ ok: true } & ProbedVideo) | { ok: false; reason: string };

/** What a video may be; Stories' own rules unless a caller passes others. */
export interface VideoRules {
  maxMs: number;
  maxSide: number;
  videoCodecs: readonly string[];
}

export const STORY_VIDEO_RULES: VideoRules = {
  maxMs: STORY_VIDEO_MAX_MS,
  maxSide: STORY_VIDEO_MAX_SIDE,
  videoCodecs: STORY_VIDEO_CODECS,
};

/** ffprobe could not run at all (not installed, or crashed for itself). */
export class VideoProbeUnavailableError extends Error {}

interface FfprobeStream {
  codec_type?: string;
  codec_name?: string;
  width?: number;
  height?: number;
  duration?: string;
  tags?: { rotate?: string };
  side_data_list?: { rotation?: number | string }[];
}
interface FfprobeOutput {
  format?: { format_name?: string; duration?: string };
  streams?: FfprobeStream[];
}

/**
 * The arguments for one local file. Only the file protocol is allowed, so a
 * crafted file can't make ffprobe open anything else.
 */
export function ffprobeArgs(path: string): string[] {
  return [
    '-v',
    'error',
    '-protocol_whitelist',
    'file',
    '-show_entries',
    'format=format_name,duration' +
      ':stream=codec_type,codec_name,width,height,duration' +
      ':stream_tags=rotate:stream_side_data=rotation',
    '-of',
    'json',
    `file:${path}`,
  ];
}

const seconds = (value: string | undefined): number | null => {
  const n = value === undefined ? NaN : Number.parseFloat(value);
  return Number.isFinite(n) && n > 0 ? n : null;
};

/** A quarter turn swaps the shown width and height (portrait phone video). */
function quarterTurned(stream: FfprobeStream): boolean {
  const raw =
    stream.side_data_list?.find((d) => d.rotation !== undefined)?.rotation ??
    stream.tags?.rotate;
  const degrees = Math.abs(Number(raw ?? 0)) % 180;
  return degrees === 90;
}

/**
 * Applies the rules to ffprobe's JSON: an MP4/MOV container, exactly one
 * video stream of an allowed codec (a story: H.264/HEVC), at most one AAC
 * audio stream, within the length and size (a story: ≤ 30.5 s, ≤ 1920 px per
 * side). Other streams (an iPhone's timecode/metadata tracks) are ignored.
 */
export function judgeVideo(
  json: string,
  rules: VideoRules = STORY_VIDEO_RULES,
): VideoVerdict {
  let out: FfprobeOutput;
  try {
    out = JSON.parse(json) as FfprobeOutput;
  } catch {
    return { ok: false, reason: 'not_a_video' };
  }
  const formats = (out.format?.format_name ?? '').split(',');
  if (!formats.includes('mov') && !formats.includes('mp4')) {
    return { ok: false, reason: 'not_a_video' };
  }
  const streams = out.streams ?? [];
  const videos = streams.filter((s) => s.codec_type === 'video');
  const audios = streams.filter((s) => s.codec_type === 'audio');
  if (videos.length !== 1) return { ok: false, reason: 'video_streams' };
  const video = videos[0];
  if (!rules.videoCodecs.includes(video.codec_name ?? '')) {
    return { ok: false, reason: 'video_codec' };
  }
  if (audios.length > 1) return { ok: false, reason: 'audio_streams' };
  if (
    audios.length === 1 &&
    !(STORY_AUDIO_CODECS as readonly string[]).includes(
      audios[0].codec_name ?? '',
    )
  ) {
    return { ok: false, reason: 'audio_codec' };
  }

  const duration = seconds(out.format?.duration) ?? seconds(video.duration);
  if (duration === null) return { ok: false, reason: 'no_duration' };
  const durationMs = Math.round(duration * 1000);
  if (durationMs > rules.maxMs) return { ok: false, reason: 'too_long' };

  const w = video.width ?? 0;
  const h = video.height ?? 0;
  if (!Number.isInteger(w) || !Number.isInteger(h) || w <= 0 || h <= 0) {
    return { ok: false, reason: 'no_dimensions' };
  }
  if (w > rules.maxSide || h > rules.maxSide) {
    return { ok: false, reason: 'too_large' };
  }
  const [width, height] = quarterTurned(video) ? [h, w] : [w, h];
  return { ok: true, width, height, durationMs };
}

/** At most N tasks at once; the rest wait their turn. */
export class Limiter {
  private running = 0;
  private readonly queue: (() => void)[] = [];

  constructor(private readonly max: number) {}

  async run<T>(task: () => Promise<T>): Promise<T> {
    if (this.running >= this.max) {
      await new Promise<void>((resolve) => this.queue.push(resolve));
    }
    this.running += 1;
    try {
      return await task();
    } finally {
      this.running -= 1;
      this.queue.shift()?.();
    }
  }
}

const probes = new Limiter(STORY_PROBE_MAX_CONCURRENT);

/**
 * Runs ffprobe on a local file (no shell, 15 s, 1 MB of output, two at a
 * time) and judges the result. A file ffprobe rejects or that takes too
 * long fails the story; ffprobe missing from the server throws instead, so
 * the story stays pending and the app can retry.
 */
export function probeVideoFile(
  path: string,
  rules: VideoRules = STORY_VIDEO_RULES,
): Promise<VideoVerdict> {
  return probes.run(
    () =>
      new Promise<VideoVerdict>((resolve, reject) => {
        execFile(
          'ffprobe',
          ffprobeArgs(path),
          {
            timeout: STORY_PROBE_TIMEOUT_MS,
            maxBuffer: STORY_PROBE_MAX_OUTPUT,
            killSignal: 'SIGKILL',
            windowsHide: true,
          },
          (error, stdout) => {
            if (!error) return resolve(judgeVideo(String(stdout), rules));
            const e = error as NodeJS.ErrnoException & { killed?: boolean };
            if (e.code === 'ENOENT') {
              return reject(
                new VideoProbeUnavailableError('ffprobe is not installed'),
              );
            }
            if (e.killed)
              return resolve({ ok: false, reason: 'probe_timeout' });
            if (e.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') {
              return resolve({ ok: false, reason: 'probe_output' });
            }
            resolve({ ok: false, reason: 'not_a_video' });
          },
        );
      }),
  );
}
