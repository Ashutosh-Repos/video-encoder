import { parentPort, workerData } from "worker_threads";
import { exec } from "child_process";
import { promisify } from "util";

const execAsync = promisify(exec);

// Define types for the input and metadata
interface Metadata {
  width: number;
  height: number;
  dir: string;
}

/**
 * Runs FFmpeg to adjust video aspect ratio using scaling and padding filters.
 * @param inputFilePath - Path to the input video file.
 * @param metadata - Output metadata containing width, height, and directory.
 */
const runFFmpeg = async (
  inputFilePath: string,
  metadata: Metadata
): Promise<void> => {
  // Build the FFmpeg command.
  const ffmpegCommand = `ffmpeg -i "${inputFilePath}" \
-vf "scale=w=iw*min(${metadata.width}/iw\\,${metadata.height}/ih):h=ih*min(${metadata.width}/iw\\,${metadata.height}/ih),pad=${metadata.width}:${metadata.height}:(${metadata.width}-iw*min(${metadata.width}/iw\\,${metadata.height}/ih))/2:(${metadata.height}-ih*min(${metadata.width}/iw\\,${metadata.height}/ih))/2" \
-c:v libx264 -preset veryfast -crf 23 \
"${metadata.dir}/output.mp4"`;

  console.log("Executing FFmpeg command:");
  console.log(ffmpegCommand);
  await execAsync(ffmpegCommand);
};

// Main FFmpeg worker logic.
(async () => {
  try {
    const {
      inputFilePath,
      metadata,
    }: { inputFilePath: string; metadata: Metadata } = workerData;

    console.log("Starting FFmpeg processing with metadata:", metadata);

    // Process the video.
    await runFFmpeg(inputFilePath, metadata);
    console.log("FFmpeg processing completed successfully.");

    // Notify the parent with the output file path.
    parentPort?.postMessage({
      success: true,
      message: "FFmpeg processing completed",
      src: `${metadata.dir}/output.mp4`,
    });
  } catch (error: unknown) {
    const errorMessage =
      error instanceof Error ? error.message : "Unknown error";
    parentPort?.postMessage({ success: false, error: errorMessage });
  }
})();
