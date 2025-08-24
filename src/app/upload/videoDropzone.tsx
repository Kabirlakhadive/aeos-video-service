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
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState<string | null>(null);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: (acceptedFiles, fileRejections) => {
      setError(null);

      if (fileRejections.length > 0) {
        const rejectionError = fileRejections[0].errors[0];
        setError(
          `File is too large.\n Or unsupported file type.\n Max size is ${formatBytes(
            MAX_FILE_SIZE
          )} `
        );
        setFile(null);
        onFileAccepted(null);
        return;
      }

      if (acceptedFiles.length > 0) {
        const acceptedFile = acceptedFiles[0];
        setFile(acceptedFile);
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

  const handleRemoveFile = () => {
    setFile(null);
    setError(null);
    onFileAccepted(null);
  };

  if (file) {
    return (
      <div className="border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg p-6 flex flex-col items-center text-center">
        <FileVideo className="w-16 h-16 text-primary" />
        <p className="font-semibold mt-4">{file.name}</p>
        <p className="text-sm text-muted-foreground">
          {formatBytes(file.size)}
        </p>
        <Button
          variant="destructive"
          size="sm"
          className="mt-4"
          onClick={handleRemoveFile}
        >
          <X className="w-4 h-4 mr-2" />
          Remove File
        </Button>
      </div>
    );
  }

  return (
    <div
      {...getRootProps()}
      className={`
        flex flex-col items-center justify-center w-full h-64
        border-2 border-dashed rounded-lg cursor-pointer
        transition-colors
        ${
          isDragActive
            ? "border-primary bg-primary/10"
            : "border-gray-300 dark:border-gray-600"
        }
        ${error ? "border-red-500" : ""}
      `}
    >
      <input {...getInputProps()} />
      <div className="flex flex-col items-center justify-center pt-5 pb-6">
        <UploadCloud className="w-10 h-10 mb-4 text-gray-500 dark:text-gray-400" />
        <p className="mb-2 text-sm text-gray-500 dark:text-gray-400">
          <span className="font-semibold">Click to upload</span> or drag and
          drop
        </p>
        <p className="text-xs text-gray-500 dark:text-gray-400">
          MP4, WebM, or Ogg (MAX. 500MB)
        </p>
        {error && <p className="text-red-500 text-sm mt-4">{error}</p>}
      </div>
    </div>
  );
}
