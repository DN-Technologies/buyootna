export interface TrimVideoOptions {
  startMs: number;
  endMs: number;
  // Drop the sound track
  muted: boolean;
}

export interface TrimmedVideo {
  // file:// in the app's cache
  uri: string;
  sizeBytes: number;
  durationMs: number;
}

export interface StoryVideoEditorNative {
  trimVideo(uri: string, options: TrimVideoOptions): Promise<TrimmedVideo>;
}
