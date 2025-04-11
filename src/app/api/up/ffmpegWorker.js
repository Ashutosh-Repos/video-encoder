const { parentPort, workerData } = require("worker_threads");
const { exec } = require("child_process");
const { promisify } = require("util");

const execAsync = promisify(exec);

// Run FFmpeg to generate HLS segments
const runFFmpeg = async (inputFilePath, uploadDir) => {
  console.log(uploadDir);
  const hlsCommand = `ffmpeg -i "${inputFilePath}" \
    -vf "scale=w=iw*min(${uploadDir.width}/iw\\,${uploadDir.height}/ih):h=ih*min(${uploadDir.width}/iw\\,${uploadDir.height}/ih),pad=${uploadDir.width}:${uploadDir.height}:(${uploadDir.width}-iw*min(${uploadDir.width}/iw\\,${uploadDir.height}/ih))/2:(${uploadDir.height}-ih*min(${uploadDir.width}/iw\\,${uploadDir.height}/ih))/2" \
    -c:v libx264 -preset veryfast -crf 23 \
    -g 48 -keyint_min 48 -sc_threshold 0 -hls_time 4 -hls_playlist_type vod \
    -c:a aac -b:a 128k -hls_segment_filename "${uploadDir.dir}/%03d.ts" \
    "${uploadDir.dir}/index.m3u8"`;

  await execAsync(hlsCommand);
};

// Main FFmpeg worker logic
(async () => {
  try {
    const { inputFilePath, uploadSubDir } = workerData;
    console.log("reaching4");
    // Run FFmpeg to generate .ts segments and the .m3u8 filẻ̉̉̉
    uploadSubDir.forEach(async (element) => {
      console.log(element);
      await runFFmpeg(inputFilePath, element);
    });
    console.log("reaching5");

    // Notify parent that processing is complete
    parentPort.postMessage({
      success: true,
      message: "FFmpeg processing completed",
    });
  } catch (error) {
    parentPort.postMessage({ success: false, error: error.message });
  }
})();
