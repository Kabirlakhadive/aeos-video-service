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
import { createVideoRecord, generatePresignedUrl } from "./actions";
import { CheckCircle2, ArrowLeft } from "lucide-react";
import Link from "next/link";
import { formatBytes } from "@/lib/utils";

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

      xhr.onload = async () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          const dbResponse = await createVideoRecord(
            file.name,
            file.size,
            storagePath
          );

          if (dbResponse.failure) {
            throw new Error(dbResponse.failure);
          }

          console.log("Successfully created video record:", dbResponse.success);
          setUploadSuccess(true);

          setTimeout(() => {
            setFile(null);
            setIsUploading(false);
            setUploadSuccess(false);
            setUploadProgress(0);
          }, 3000);
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
    } catch (err) {
      const errorMessage =
        err instanceof Error ? err.message : "An unknown error occurred.";
      setError(errorMessage);
      setIsUploading(false);
      setUploadProgress(0);
    }
  };

  return (
    <div className="space-y-4">
      <Button asChild variant="ghost" className="pl-0">
        <Link href="/dashboard">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to Dashboard
        </Link>
      </Button>

      <Card className="w-full max-w-2xl mx-auto">
        <CardHeader>
          <CardTitle>Upload Your Video</CardTitle>
          <CardDescription>
            Select a video file from your computer to upload (max 500MB).
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {!file && !isUploading && !uploadSuccess && (
              <VideoDropzone onFileAccepted={handleFileAccepted} />
            )}

            {file && !isUploading && !uploadSuccess && (
              <div className="text-center space-y-4">
                <p>
                  Ready to upload:{" "}
                  <span className="font-bold">{file.name}</span> (
                  {formatBytes(file.size)})
                </p>
                <Button onClick={handleUpload} size="lg">
                  Upload Video
                </Button>
              </div>
            )}

            {isUploading && (
              <div className="space-y-2 text-center">
                <p className="text-sm font-semibold truncate">
                  Uploading: {file?.name}
                </p>
                <Progress value={uploadProgress} className="w-full" />
                <p className="text-xs text-muted-foreground">
                  {Math.round(uploadProgress)}% complete
                </p>
              </div>
            )}

            {uploadSuccess && (
              <div className="flex flex-col items-center justify-center text-center p-6 bg-green-500/10 rounded-lg">
                <CheckCircle2 className="w-12 h-12 text-green-500 mb-4" />
                <h3 className="text-lg font-semibold">Upload Successful!</h3>
                <p className="text-sm text-muted-foreground">
                  Your video is now being processed and will appear on your
                  dashboard.
                </p>
              </div>
            )}

            {error && (
              <p className="text-red-500 text-sm text-center">{error}</p>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
