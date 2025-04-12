"use client";

import React, { useState } from "react";
import { MiniBiFileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

const Page = () => {
  const [submitProgrees, setSubmitProgrees] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [srtFile, setSrtFile] = useState<File | null>(null);

  const handleFileChange = (files: { video?: File; subtitle?: File }): void => {
    if (files.video) setFile(files.video);
    if (files.subtitle) setSrtFile(files.subtitle);

    console.log("Selected video file:", files.video);
    console.log("Selected subtitle file:", files.subtitle);
  };

  const handleUpload = async (): Promise<void> => {
    setSubmitProgrees(true);
    if (!file) {
      toast.warning("Please select or drop a video file");
      return;
    }

    if (!srtFile) {
      toast.warning("Please select or drop a subtitle file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("subtitle", srtFile);

    try {
      const response = await fetch("/api/add_subtiltles", {
        method: "POST",
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error("Error:", errorData.error);
        alert(`Error: ${errorData.error}`);
        return;
      }

      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "output.mp4";
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      if (err instanceof Error) {
        console.error("Request failed:", err.message);
        toast.warning("Upload failed");
      } else {
        console.error("Unexpected error:", err);
      }
      alert("An unexpected error occurred.");
    } finally {
      setSubmitProgrees(false);
    }
  };

  return (
    <div className="w-full h-max relative">
      <div className="w-full h-max mx-auto">
        <div className="py-4 px-4 mx-auto max-w-screen-xl text-center lg:py-8 lg:px-12 mt-8">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            Write Subtitles in Video <br /> Effortlessly
          </h1>
          <p className="text-sm sm:text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
            Upload a video file and a subtitle file
          </p>
        </div>
      </div>
      <div className="w-full h-max p-8 flex items-center justify-center">
        <div className="w-max h-max grid place-items-center gap-4">
          <MiniBiFileUpload onChange={handleFileChange} />
          <div className="flex gap-4 items-center">
            {submitProgrees ? (
              <Button disabled>
                <Loader2 className="animate-spin" />
                Processing
              </Button>
            ) : (
              <Button
                className="font-bold cursor-pointer"
                onClick={handleUpload}
              >
                Upload
              </Button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;
