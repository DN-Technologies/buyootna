package expo.modules.storyvideoeditor

import android.media.MediaMetadataRetriever
import android.net.Uri
import android.os.Handler
import android.os.Looper
import androidx.annotation.OptIn
import androidx.media3.common.MediaItem
import androidx.media3.common.MimeTypes
import androidx.media3.common.util.UnstableApi
import androidx.media3.effect.Presentation
import androidx.media3.transformer.Composition
import androidx.media3.transformer.EditedMediaItem
import androidx.media3.transformer.Effects
import androidx.media3.transformer.ExportException
import androidx.media3.transformer.ExportResult
import androidx.media3.transformer.Transformer
import expo.modules.kotlin.Promise
import expo.modules.kotlin.exception.CodedException
import expo.modules.kotlin.modules.Module
import expo.modules.kotlin.modules.ModuleDefinition
import expo.modules.kotlin.records.Field
import expo.modules.kotlin.records.Record
import java.io.File
import java.util.UUID

class TrimOptions : Record {
  @Field var startMs: Double = 0.0
  @Field var endMs: Double = 0.0
  @Field var muted: Boolean = false
}

private class TrimException(message: String, cause: Throwable? = null) :
  CodedException("ERR_STORY_TRIM", message, cause)

/**
 * Cuts a story video to [startMs, endMs] (and drops its sound when muted),
 * as an H.264 MP4 of at most 720p, so a longer video can become a story of
 * 30 seconds or less before it is uploaded.
 */
@OptIn(UnstableApi::class)
class StoryVideoEditorModule : Module() {
  override fun definition() = ModuleDefinition {
    Name("StoryVideoEditor")

    AsyncFunction("trimVideo") { uri: String, options: TrimOptions, promise: Promise ->
      val context = appContext.reactContext
      if (context == null) {
        promise.reject(TrimException("The app isn't ready"))
        return@AsyncFunction
      }
      val source = Uri.parse(uri)
      val output = File(context.cacheDir, "story-${UUID.randomUUID()}.mp4")

      val clip = MediaItem.Builder()
        .setUri(source)
        .setClippingConfiguration(
          MediaItem.ClippingConfiguration.Builder()
            .setStartPositionMs(options.startMs.toLong())
            .setEndPositionMs(options.endMs.toLong())
            .build()
        )
        .build()

      // Down to 720p on the short side, never up
      val effects = if (shortSide(context, source) > 720) {
        Effects(listOf(), listOf(Presentation.createForShortSide(720)))
      } else {
        Effects.EMPTY
      }
      val edited = EditedMediaItem.Builder(clip)
        .setRemoveAudio(options.muted)
        .setEffects(effects)
        .build()

      // Transformer runs on a thread with a Looper
      Handler(Looper.getMainLooper()).post {
        val transformer = Transformer.Builder(context)
          .setVideoMimeType(MimeTypes.VIDEO_H264)
          .setAudioMimeType(MimeTypes.AUDIO_AAC)
          .addListener(object : Transformer.Listener {
            override fun onCompleted(composition: Composition, result: ExportResult) {
              promise.resolve(
                mapOf(
                  "uri" to Uri.fromFile(output).toString(),
                  "sizeBytes" to output.length().toDouble(),
                  "durationMs" to result.durationMs.toDouble(),
                )
              )
            }

            override fun onError(
              composition: Composition,
              result: ExportResult,
              exception: ExportException,
            ) {
              output.delete()
              promise.reject(TrimException(exception.message ?: "The video couldn't be cut", exception))
            }
          })
          .build()
        transformer.start(edited, output.absolutePath)
      }
    }
  }

  private fun shortSide(context: android.content.Context, uri: Uri): Int {
    val retriever = MediaMetadataRetriever()
    return try {
      retriever.setDataSource(context, uri)
      val width = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_WIDTH)?.toIntOrNull() ?: 0
      val height = retriever.extractMetadata(MediaMetadataRetriever.METADATA_KEY_VIDEO_HEIGHT)?.toIntOrNull() ?: 0
      minOf(width, height)
    } catch (e: Exception) {
      0
    } finally {
      retriever.release()
    }
  }
}
