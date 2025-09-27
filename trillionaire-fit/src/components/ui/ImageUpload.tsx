"use client";

import { useState } from "react";

export default function ImageUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;

    const selectedFiles = Array.from(e.target.files);
    setFiles(selectedFiles);

    const previewUrls = selectedFiles.map((file) => URL.createObjectURL(file));
    setPreviews(previewUrls);
    setUploadedUrls([]);
    setError(null);
  };

  // Handle upload to backend
  const handleUpload = async () => {
    if (files.length === 0) {
      setError("Please select at least one file.");
      return;
    }

    setLoading(true);
    setError(null);

    const formData = new FormData();
    files.forEach((file) => formData.append("file", file)); // Always append as "file"

    try {
      const res = await fetch("/api/upload/cloudinary", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();

      if (!res.ok || !data.success) throw new Error(data.error || "Upload failed");

      setUploadedUrls(data.urls);
      setPreviews([]); // clear local previews after success
    } catch (err: any) {
      console.error("Upload error:", err);
      setError(err.message || "Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 border rounded-lg max-w-md mx-auto space-y-4">
      <h2 className="text-lg font-semibold">Upload Images</h2>

      <input type="file" multiple onChange={handleFileChange} className="block w-full" />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="px-4 py-2 bg-blue-600 text-white rounded-lg disabled:opacity-50"
      >
        {loading ? "Uploading..." : "Upload"}
      </button>

      {error && <p className="text-red-600">{error}</p>}

      {/* Previews */}
      {previews.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {previews.map((src, idx) => (
            <img key={idx} src={src} alt={`preview-${idx}`} className="w-full h-32 object-cover rounded-lg" />
          ))}
        </div>
      )}

      {/* Uploaded images */}
      {uploadedUrls.length > 0 && (
        <div className="grid grid-cols-2 gap-2">
          {uploadedUrls.map((url, idx) => (
            <img key={idx} src={url} alt={`uploaded-${idx}`} className="w-full h-32 object-cover rounded-lg border-2 border-green-500" />
          ))}
        </div>
      )}
    </div>
  );
}
