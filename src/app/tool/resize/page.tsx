"use client";
import React, { useState } from "react";
import { MiniFileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

const Page = () => {
  const [files, setFiles] = useState<File | null>(null);
  const [submitProgrees, setSubmitProgrees] = useState<boolean>(false);
  const [showCustomInputs, setShowCustomInputs] = useState<boolean>(false);

  const [w_factor, setwFactor] = useState<string>("");
  const [h_factor, sethFactor] = useState<string>("");

  const handleFileChange = (file: File) => {
    setFiles(file);
    console.log("Selected file:", file);
  };

  const handleUpload = async () => {
    setSubmitProgrees(true);
    if (!files) {
      toast.warning("Please select or drop a video file");
      return;
    }

    if (!w_factor || !h_factor) {
      toast.warning("Please select or enter a valid aspect ratio");
      return;
    }
    const formData = new FormData();
    formData.append("file", files);
    formData.append("wfactor", w_factor);
    formData.append("hfactor", h_factor);

    try {
      const response = await fetch("/api/resize", {
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
    } catch (err: unknown) {
      if (err instanceof Error) {
        toast.warning("Upload failed");
        console.error("Request failed:", err.message);
      } else {
        console.error("Unexpected error:", err);
      }
    } finally {
      setSubmitProgrees(false);
    }
  };

  return (
    <div className="w-full h-max relative">
      <div className="w-full h-max mx-auto">
        <div className="py-4 px-4 mx-auto max-w-screen-xl text-center lg:py-8 lg:px-12 mt-8">
          <h1 className="mb-4 text-4xl font-extrabold tracking-tight leading-none text-gray-900 md:text-5xl lg:text-6xl dark:text-white">
            Resize your videos <br /> Effortlessly
          </h1>
          <p className="text-sm sm:text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
            Upload a video file and select resize options
          </p>
        </div>
      </div>
      <div className="w-full h-max p-8 flex items-center justify-center">
        <div className="w-max h-max grid place-items-center gap-4">
          <MiniFileUpload onChange={handleFileChange} />
          <div className="flex justify-center h-max w-max gap-4">
            <div className="flex flex-col gap-2 items-center justify-center">
              <Select
                onValueChange={(value) => {
                  if (value === "custom") {
                    setShowCustomInputs(true);
                    setwFactor("");
                    sethFactor("");
                  } else {
                    setShowCustomInputs(false);
                    const [w, h] = value.split(":");
                    setwFactor(w);
                    sethFactor(h);
                  }
                }}
              >
                <SelectTrigger className="w-[180px]">
                  <SelectValue placeholder="Select aspect ratio" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Select aspect ratio</SelectLabel>
                    <SelectItem value="16:9">YouTube (16:9)</SelectItem>
                    <SelectItem value="9:16">Instagram Reels (9:16)</SelectItem>
                    <SelectItem value="1:1">Instagram Post (1:1)</SelectItem>
                    <SelectItem value="4:5">Twiter Post (4:5)</SelectItem>
                    <SelectItem value="custom">Custom</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
              {showCustomInputs && (
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    placeholder="Width"
                    value={w_factor}
                    onChange={(e) => setwFactor(e.target.value)}
                    className="border rounded px-2 py-1 w-24"
                  />
                  <span className="text-white">:</span>
                  <input
                    type="number"
                    placeholder="Height"
                    value={h_factor}
                    onChange={(e) => sethFactor(e.target.value)}
                    className="border rounded px-2 py-1 w-24"
                  />
                </div>
              )}
            </div>

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
