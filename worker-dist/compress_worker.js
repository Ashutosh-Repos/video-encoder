"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const child_process_1 = require("child_process");
const util_1 = require("util");
const execAsync = (0, util_1.promisify)(child_process_1.exec);
/**
 * Runs FFmpeg to compress the video file size.
 * @param inputFilePath - Path to the input video file.
 * @param metadata - Output metadata including chosen quality.
 */
const runFFmpeg = async (inputFilePath, metadata) => {
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
    const outputPath = `${metadata.dir}/output.mp4`;
    const ffmpegCommand = `ffmpeg -i "${inputFilePath}" -c:v libx264 -preset veryfast -crf ${crf} -c:a copy "${outputPath}"`;
    console.log("Executing FFmpeg command:");
    console.log(ffmpegCommand);
    await execAsync(ffmpegCommand);
};
(async () => {
    try {
        const { inputFilePath, metadata, } = worker_threads_1.workerData;
        console.log("Starting FFmpeg compression with metadata:", metadata);
        await runFFmpeg(inputFilePath, metadata);
        console.log("FFmpeg compression completed successfully.");
        worker_threads_1.parentPort?.postMessage({
            success: true,
            message: "FFmpeg compression completed",
            src: `${metadata.dir}/output.mp4`,
        });
    }
    catch (error) {
        worker_threads_1.parentPort?.postMessage({ success: false, error: error.message });
    }
})();
