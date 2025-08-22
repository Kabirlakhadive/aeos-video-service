// src/app/upload/page.tsx
"use client";

import { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import VideoDropzone from "./videoDropzone";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { generatePresignedUrl } from "./actions";
import { CheckCircle2 } from "lucide-react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [uploadSuccess, setUploadSuccess] = useState(false);

  const handleFileAccepted = (acceptedFile: File | null) => {
    if (acceptedFile) {
      setFile(acceptedFile);
      setError(null);
      setUploadSuccess(false);
    } else {
      setFile(null);
    }
  };

  const handleUpload = async () => {
    if (!file) {
      setError("Please select a file first.");
      return;
    }

    setIsUploading(true);
    setUploadProgress(0);
    setError(null);
    setUploadSuccess(false);

    try {
      const signedUrlResponse = await generatePresignedUrl(
        file.type,
        file.size
      );

      if (signedUrlResponse.failure) {
        throw new Error(signedUrlResponse.failure);
      }

      const { url, storagePath } = signedUrlResponse.success!;

      const xhr = new XMLHttpRequest();
      xhr.open("PUT", url, true);
      xhr.setRequestHeader("Content-Type", file.type);

      xhr.upload.onprogress = (event) => {
        if (event.lengthComputable) {
          const progress = (event.loaded / event.total) * 100;
          setUploadProgress(progress);
        }
      };

      xhr.onload = () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          console.log("File uploaded successfully!");
          console.log("Storage Path:", storagePath);

          setUploadSuccess(true);

          // Reset the component after a short delay
          setTimeout(() => {
            setFile(null);
            setIsUploading(false);
            setUploadSuccess(false);
            setUploadProgress(0);
          }, 5000);
        } else {
          throw new Error(
            `Upload failed with status: ${xhr.status} ${xhr.statusText}`
          );
        }
      };

      xhr.onerror = () => {
        throw new Error("An error occurred during the upload.");
      };

      xhr.send(file);
    } catch (err: any) {
      setError(err.message || "An unknown error occurred.");
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <Card>
        <CardHeader>
          <CardTitle>Upload Your Video</CardTitle>
          <CardDescription>
            Select a video file from your computer to upload (max 500MB).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {!isUploading && !uploadSuccess && (
              <VideoDropzone onFileAccepted={handleFileAccepted} />
            )}

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}

            {file && !isUploading && !uploadSuccess && (
              <div className="text-center">
                <Button onClick={handleUpload} size="lg">
                  Upload Video
                </Button>
              </div>
            )}

            {isUploading && !uploadSuccess && (
              <div className="space-y-2 text-center">
                <p className="text-sm">Uploading: {file?.name}</p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  {Math.round(uploadProgress)}% complete
                </p>
              </div>
            )}

            {/* ---  SUCCESS MESSAGE --- */}
            {uploadSuccess && (
              <div className="flex flex-col items-center justify-center text-center p-6 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold">Upload Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  Your video is now being processed.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
