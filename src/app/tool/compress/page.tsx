"use client";
import React, { useState } from "react";
import { MiniFileUpload } from "@/components/ui/file-upload";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const Page = () => {
  const [submitProgrees, setSubmitProgrees] = useState<boolean>(false);
  const [file, setFile] = useState<File | null>(null);
  const [compressionQuality, setCompressionQuality] =
    useState<string>("medium");

  const handleFileChange = (selectedFile: File): void => {
    setFile(selectedFile);
    console.log("Selected file:", selectedFile);
  };

  const handleUpload = async (): Promise<void> => {
    setSubmitProgrees(true);
    if (!file) {
      toast.warning("Please select or drop a video file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);
    formData.append("compressionQuality", compressionQuality);

    try {
      const response = await fetch(
        `api/compress`,
        {
          method: "POST",
          body: formData,
        }
      );

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
            Compress your videos <br /> Effortlessly
          </h1>
          <p className="text-sm sm:text-lg font-normal text-gray-500 lg:text-xl sm:px-16 xl:px-48 dark:text-gray-400">
            Upload a video file and select compression options
          </p>
        </div>
      </div>
      <div className="w-full h-max p-8 flex items-center justify-center">
        <div className="w-max h-max grid place-items-center gap-4">
          <MiniFileUpload onChange={handleFileChange} />
          <div className="flex gap-4 items-center">
            <Select
              onValueChange={(value) => setCompressionQuality(value)}
              defaultValue="medium"
            >
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Compression Quality" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  <SelectLabel>Select Compression Quality</SelectLabel>
                  <SelectItem value="low">Low (CRF 23)</SelectItem>
                  <SelectItem value="medium">Medium (CRF 28)</SelectItem>
                  <SelectItem value="high">High (CRF 35)</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>

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
