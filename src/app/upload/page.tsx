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

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);

  const handleFileAccepted = (acceptedFile: File | null) => {
    setFile(acceptedFile);
  };

  const handleUpload = async () => {
    if (!file) {
      alert("Please select a file first.");
      return;
    }
    console.log("Uploading file:", file.name);
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
          <VideoDropzone onFileAccepted={handleFileAccepted} />

          {file && (
            <div className="text-center mt-6">
              <Button onClick={handleUpload} size="lg">
                Upload Video
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
