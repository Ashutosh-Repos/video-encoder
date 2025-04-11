const { parentPort, workerData } = require("worker_threads");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

/**
 * Runs FFmpeg to adjust video aspect ratio using scaling and padding filters.
 * @param {string} inputFilePath - Path to the input video file.
 * @param {{width: number, height: number, dir: string}} metadata - Output metadata.
 */
const runFFmpeg = async (inputFilePath, metadata) => {
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
    const { inputFilePath, metadata } = workerData;
    console.log("Starting FFmpeg processing with metadata:", metadata);

    // Process the video.
    await runFFmpeg(inputFilePath, metadata);
    console.log("FFmpeg processing completed successfully.");

    // Notify the parent with the output file path.
    parentPort.postMessage({
      success: true,
      message: "FFmpeg processing completed",
      src: `${metadata.dir}/output.mp4`,
    });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
})();
