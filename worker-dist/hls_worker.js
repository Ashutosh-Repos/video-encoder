"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
// Run FFmpeg to generate HLS segments
const runFFmpeg = async (inputFilePath, uploadDir) => {
    console.log(`Running FFmpeg for resolution ${uploadDir.width}x${uploadDir.height}...`);
    const hlsCommand = `ffmpeg -i "${inputFilePath}" \
    -vf "scale=w=iw*min(${uploadDir.width}/iw\\,${uploadDir.height}/ih):h=ih*min(${uploadDir.width}/iw\\,${uploadDir.height}/ih),pad=${uploadDir.width}:${uploadDir.height}:(${uploadDir.width}-iw*min(${uploadDir.width}/iw\\,${uploadDir.height}/ih))/2:(${uploadDir.height}-ih*min(${uploadDir.width}/iw\\,${uploadDir.height}/ih))/2" \
    -c:v libx264 -preset veryfast -crf 23 \
    -g 48 -keyint_min 48 -sc_threshold 0 -hls_time 4 -hls_playlist_type vod \
    -c:a aac -b:a 128k -hls_segment_filename "${uploadDir.dir}/%03d.ts" \
    "${uploadDir.dir}/index.m3u8"`;
    console.log("Executing command:");
    console.log(hlsCommand);
    await execAsync(hlsCommand);
};
// Main FFmpeg worker logic
(async () => {
    try {
        const { inputFilePath, uploadSubDir } = worker_threads_1.workerData;
        console.log("Starting HLS generation...");
        for (const element of uploadSubDir) {
            console.log("Processing:", element);
            await runFFmpeg(inputFilePath, element);
        }
        worker_threads_1.parentPort?.postMessage({
            success: true,
            message: "FFmpeg HLS processing completed",
        });
    }
    catch (error) {
        worker_threads_1.parentPort?.postMessage({ success: false, error: error.message });
    }
})();
