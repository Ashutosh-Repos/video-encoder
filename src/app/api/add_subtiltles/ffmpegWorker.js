const { parentPort, workerData } = require("worker_threads");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

/**
 * Re-encodes a video and converts its format.
 * @param {string} inputFilePath - Path to the input video file.
 * @param {{dir: string, subtitlePath: string}} metadata - Output metadata including quality and desired format.
 */
const runFFmpeg = async (inputFilePath, metadata) => {
  const format = metadata.format ? metadata.format.toLowerCase() : "mp4";
  let subtitleOption = "";

  if (metadata.subtitlePath) {
    subtitleOption = `-vf "subtitles='${metadata.subtitlePath.replace(
      /\\/g,
      "/"
    )}'"`;
  }

  const ffmpegCommand = `ffmpeg -i "${inputFilePath}" ${subtitleOption} -c:v libx264 -preset veryfast -crf 23 -c:a copy "${metadata.dir}/output.${format}"`;

  console.log("Executing FFmpeg command:");
  console.log(ffmpegCommand);
  await execAsync(ffmpegCommand);
};

(async () => {
  try {
    const { inputFilePath, metadata } = workerData;
    console.log("Starting FFmpeg re-encoding with metadata:", metadata);
    await runFFmpeg(inputFilePath, metadata);
    console.log("FFmpeg re-encoding completed successfully.");

    const format = metadata.format ? metadata.format.toLowerCase() : "mp4";

    parentPort.postMessage({
      success: true,
      message: "FFmpeg re-encoding completed",
      src: `${metadata.dir}/output.${format}`,
    });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
})();
