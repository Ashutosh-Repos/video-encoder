const { parentPort, workerData } = require("worker_threads");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

/**
 * Runs FFmpeg to compress the video file size.
 * @param {string} inputFilePath - Path to the input video file.
 * @param {{dir: string, quality: string}} metadata - Output metadata including chosen quality.
 */
const runFFmpeg = async (inputFilePath, metadata) => {
  // Map quality option to a CRF value.
  let crf;
  switch (metadata.quality) {
    case "low":
      crf = 23;
      break;
    case "high":
      crf = 35;
      break;
    case "medium":
    default:
      crf = 28;
      break;
  }

  const ffmpegCommand = `ffmpeg -i "${inputFilePath}" -c:v libx264 -preset veryfast -crf ${crf} -c:a copy "${metadata.dir}/output.mp4"`;
  console.log("Executing FFmpeg command:");
  console.log(ffmpegCommand);
  await execAsync(ffmpegCommand);
};

(async () => {
  try {
    const { inputFilePath, metadata } = workerData;
    console.log("Starting FFmpeg compression with metadata:", metadata);
    await runFFmpeg(inputFilePath, metadata);
    console.log("FFmpeg compression completed successfully.");
    parentPort.postMessage({
      success: true,
      message: "FFmpeg compression completed",
      src: `${metadata.dir}/output.mp4`,
    });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
})();
