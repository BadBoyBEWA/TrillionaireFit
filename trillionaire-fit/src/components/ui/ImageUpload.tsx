"use client";

import { useState } from "react";

// Universal uploader (single or multiple)
async function uploadToCloudinary(files: File[] | File) {
  try {
    const formData = new FormData();

    if (files instanceof File) {
      formData.append("images", files);
    } else {
      files.forEach((file) => {
        formData.append("images", file);
      });
    }

    const res = await fetch("/api/upload/cloudinary", {
      method: "POST",
      body: formData,
    });

    if (!res.ok) {
      const error = await res.json();
      throw new Error(error.error || "Upload failed");
    }

    return await res.json(); // { success: true, urls: [...] }
  } catch (err: any) {
    console.error("❌ Upload error:", err.message);
    throw err;
  }
}

export default function ImageUpload() {
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    // Preview images locally before upload
    const previews = Array.from(files).map((file) => URL.createObjectURL(file));
    setPreviewUrls(previews);

    try {
      setIsUploading(true);
      const result = await uploadToCloudinary(Array.from(files));
      console.log("✅ Uploaded:", result.urls);
    } catch (err) {
      console.error("❌ Upload failed:", err);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="space-y-4">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="block w-full text-sm text-gray-700"
      />

      {isUploading && <p className="text-blue-500">Uploading...</p>}

      <div className="flex flex-wrap gap-2">
        {previewUrls.map((url, i) => (
          <img
            key={i}
            src={url}
            alt={`preview-${i}`}
            className="w-24 h-24 object-cover rounded-md border"
          />
        ))}
      </div>
    </div>
  );
}
