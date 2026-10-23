import AVFoundation
import ExpoModulesCore

struct TrimOptions: Record {
  @Field var startMs: Double = 0
  @Field var endMs: Double = 0
  @Field var muted: Bool = false
}

/**
 Cuts a story video to [startMs, endMs] (and drops its sound when muted),
 re-encoded as an MP4 of at most 720p, so a longer video can become a story
 of 30 seconds or less before it is uploaded.
 */
public class StoryVideoEditorModule: Module {
  public func definition() -> ModuleDefinition {
    Name("StoryVideoEditor")

    AsyncFunction("trimVideo") { (uri: URL, options: TrimOptions, promise: Promise) in
      let asset = AVURLAsset(url: uri)
      let range = CMTimeRange(
        start: CMTime(seconds: options.startMs / 1000, preferredTimescale: 600),
        end: CMTime(seconds: options.endMs / 1000, preferredTimescale: 600)
      )
      let composition = AVMutableComposition()

      guard
        let sourceVideo = asset.tracks(withMediaType: .video).first,
        let video = composition.addMutableTrack(
          withMediaType: .video, preferredTrackID: kCMPersistentTrackID_Invalid)
      else {
        promise.reject("ERR_STORY_TRIM", "The video has no picture track")
        return
      }

      do {
        try video.insertTimeRange(range, of: sourceVideo, at: .zero)
        // Keeps a portrait recording upright
        video.preferredTransform = sourceVideo.preferredTransform
        if !options.muted,
          let sourceAudio = asset.tracks(withMediaType: .audio).first,
          let audio = composition.addMutableTrack(
            withMediaType: .audio, preferredTrackID: kCMPersistentTrackID_Invalid)
        {
          try audio.insertTimeRange(range, of: sourceAudio, at: .zero)
        }
      } catch {
        promise.reject("ERR_STORY_TRIM", error.localizedDescription)
        return
      }

      guard
        let export = AVAssetExportSession(
          asset: composition, presetName: AVAssetExportPreset1280x720)
      else {
        promise.reject("ERR_STORY_TRIM", "The video can't be exported")
        return
      }
      let output = FileManager.default.temporaryDirectory
        .appendingPathComponent("story-\(UUID().uuidString).mp4")
      export.outputURL = output
      export.outputFileType = .mp4
      export.shouldOptimizeForNetworkUse = true

      export.exportAsynchronously {
        guard export.status == .completed else {
          try? FileManager.default.removeItem(at: output)
          promise.reject(
            "ERR_STORY_TRIM", export.error?.localizedDescription ?? "The video couldn't be cut")
          return
        }
        let size =
          (try? FileManager.default.attributesOfItem(atPath: output.path)[.size] as? NSNumber)?
          .doubleValue ?? 0
        promise.resolve([
          "uri": output.absoluteString,
          "sizeBytes": size,
          "durationMs": CMTimeGetSeconds(range.duration) * 1000,
        ])
      }
    }
  }
}
