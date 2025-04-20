"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const worker_threads_1 = require("worker_threads");
const chokidar_1 = __importDefault(require("chokidar"));
const cloudinary_1 = __importDefault(require("cloudinary"));
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const cloudinary = cloudinary_1.default.v2;
// Configure Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDNAME,
    api_key: process.env.CLOUDAPIKEY,
    api_secret: process.env.CLOUDSECRET,
});
// Upload file to Cloudinary
const uploadToCloudinary = async (filePath, folder) => {
    return new Promise((resolve, reject) => {
        cloudinary.uploader.upload(filePath, {
            resource_type: "raw",
            folder,
            use_filename: true,
            unique_filename: false,
            overwrite: true,
        }, (error, result) => {
            if (error) {
                reject(new Error(`Cloudinary upload error for ${filePath}: ${error.message}`));
            }
            else {
                resolve(result.url);
            }
        });
    });
};
// Watch the folder for .ts and .m3u8 files and upload them to Cloudinary
const watchAndUpload = (uploadDir, cloudFolder) => {
    return new Promise((resolve, reject) => {
        let m3u8Uploaded = false;
        const uploadedSegments = new Set();
        const watcher = chokidar_1.default.watch(`${uploadDir}`, { persistent: true });
        watcher.on("add", async (filePath) => {
            const ext = path_1.default.extname(filePath);
            if (ext === ".ts" && !uploadedSegments.has(filePath)) {
                try {
                    const tsFile = path_1.default.basename(filePath);
                    worker_threads_1.parentPort?.postMessage({
                        success: true,
                        message: `Processing ${tsFile}...`,
                    });
                    await uploadToCloudinary(filePath, cloudFolder);
                    uploadedSegments.add(filePath);
                    await promises_1.default.rm(filePath);
                    worker_threads_1.parentPort?.postMessage({
                        success: true,
                        message: `Uploaded and removed ${tsFile}`,
                    });
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : "Unknown error";
                    worker_threads_1.parentPort?.postMessage({
                        success: false,
                        error: `Failed to process ${filePath}: ${errorMessage}`,
                    });
                }
            }
            if (ext === ".m3u8" && !m3u8Uploaded) {
                try {
                    const m3u8File = path_1.default.basename(filePath);
                    worker_threads_1.parentPort?.postMessage({
                        success: true,
                        message: `Processing ${m3u8File}...`,
                    });
                    const m3u8Url = await uploadToCloudinary(filePath, cloudFolder);
                    m3u8Uploaded = true;
                    await promises_1.default.rm(filePath);
                    watcher.close();
                    worker_threads_1.parentPort?.postMessage({
                        success: true,
                        message: `Uploaded and removed ${m3u8File}`,
                    });
                    resolve(m3u8Url);
                }
                catch (error) {
                    const errorMessage = error instanceof Error ? error.message : "Unknown error";
                    worker_threads_1.parentPort?.postMessage({
                        success: false,
                        error: `Failed to upload ${filePath}: ${errorMessage}`,
                    });
                    reject(error);
                }
            }
        });
        watcher.on("error", (error) => {
            const errorMessage = error instanceof Error ? error.message : "Unknown error";
            worker_threads_1.parentPort?.postMessage({ success: false, error: errorMessage });
            reject(new Error(`Chokidar watcher error: ${errorMessage}`));
        });
        watcher.on("ready", () => {
            worker_threads_1.parentPort?.postMessage({
                success: true,
                message: `Watcher is ready and monitoring directory: ${uploadDir}`,
            });
        });
    });
};
// Main upload worker logic
(async () => {
    try {
        const { uploadSubDir, folderUUID } = worker_threads_1.workerData;
        worker_threads_1.parentPort?.postMessage({
            success: true,
            message: `Starting to watch directory: ${JSON.stringify(uploadSubDir)}`,
        });
        const urls = [];
        for (const element of uploadSubDir) {
            const m3u8Url = await watchAndUpload(element.dir, `${folderUUID}/${element.height}p`);
            urls.push({ type: element.height, url: m3u8Url });
        }
        worker_threads_1.parentPort?.postMessage({
            success: true,
            urls,
            message: "All files processed successfully.",
        });
    }
    catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Unknown error";
        worker_threads_1.parentPort?.postMessage({ success: false, error: errorMessage });
    }
})();
