"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { UploadCloud, FileVideo, X } from "lucide-react";
import { formatBytes } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface VideoDropzoneProps {
  onFileAccepted: (file: File | null) => void;
}

const MAX_FILE_SIZE = 500 * 1024 * 1024;

export default function VideoDropzone({ onFileAccepted }: VideoDropzoneProps) {
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles, fileRejections) => {
      setError(null);

      if (fileRejections.length > 0) {
        const rejection = fileRejections[0];
        const rejectionError = rejection.errors[0];

        if (rejectionError.code === "file-too-large") {
          setError(
            `File is too large. Max size is ${formatBytes(MAX_FILE_SIZE)}.`
          );
        } else {
          setError(`Unsupported file type. Please upload MP4, WebM, or Ogg.`);
        }
        onFileAccepted(null);
        return;
      }

      if (acceptedFiles.length > 0) {
        const acceptedFile = acceptedFiles[0];
        onFileAccepted(acceptedFile);
      }
    },
    accept: {
      "video/mp4": [".mp4"],
      "video/webm": [".webm"],
      "video/ogg": [".ogg"],
    },
    maxSize: MAX_FILE_SIZE,
    multiple: false,
  });

  return (
    <div
      {...getRootProps()}
      className={`
        flex flex-col items-center justify-center w-full h-64
        border-2 border-dashed rounded-lg cursor-pointer
        transition-colors
        ${isDragActive ? "border-primary bg-primary/10" : "border-muted"}
        ${error ? "border-destructive" : ""}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center text-center p-4">
        <UploadCloud className="w-10 h-10 mb-4 text-muted-foreground" />
        <p className="mb-2 text-sm text-muted-foreground">
          <span className="font-semibold text-primary">Click to upload</span> or
          drag and drop
        </p>
        <p className="text-xs text-muted-foreground">
          MP4, WebM, or Ogg (MAX. 500MB)
        </p>
        {error && (
          <p className="text-destructive text-sm mt-4 whitespace-pre-line">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}
