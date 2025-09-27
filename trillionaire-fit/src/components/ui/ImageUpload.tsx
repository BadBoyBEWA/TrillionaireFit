"use client";

import { useState } from "react";
import { Upload, X, FileImage, Loader2 } from "lucide-react";

export default function ImageUpload() {
  const [files, setFiles] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [uploadedUrls, setUploadedUrls] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  // Convert FormData -> plain object for debugging (removed structuredClone)
  function toCloneableData(formData: FormData) {
    const data: Record<string, any[]> = {};
    for (const [key, value] of formData.entries()) {
      if (!data[key]) data[key] = [];
      data[key].push(value instanceof File ? `File: ${value.name}` : value);
    }
    return data; // ✅ Safe for logging
  }

  // Handle file selection
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files) return;
    const selected = Array.from(e.target.files);
    setFiles(selected);

    // Clean up previous preview URLs
    previewUrls.forEach(url => URL.revokeObjectURL(url));

    // Show local previews
    const previews = selected.map((file) => URL.createObjectURL(file));
    setPreviewUrls(previews);
  };

  // Remove file from selection
  const removeFile = (index: number) => {
    const newFiles = files.filter((_, i) => i !== index);
    const newPreviews = previewUrls.filter((_, i) => i !== index);
    
    // Clean up the removed preview URL
    URL.revokeObjectURL(previewUrls[index]);
    
    setFiles(newFiles);
    setPreviewUrls(newPreviews);
  };

  // Handle upload - Fixed to avoid FormData cloning issues
  const handleUpload = async () => {
    if (files.length === 0) return;

    setLoading(true);
    try {
      // Upload each file individually to avoid FormData cloning issues
      const uploadPromises = files.map(async (file) => {
        const formData = new FormData();
        formData.append("file", file);
        
        // Debug log without cloning
        console.log(`🚀 Uploading file: ${file.name}, size: ${file.size} bytes`);
        
        const res = await fetch("/api/upload/cloudinary", {
          method: "POST",
          body: formData,
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || `Failed to upload ${file.name}`);
        
        return data.url || data.urls?.[0]; // Handle both single and multiple URL responses
      });

      const urls = await Promise.all(uploadPromises);
      setUploadedUrls(urls.filter(Boolean)); // Filter out any null/undefined URLs
      
      // Clear the form after successful upload
      setFiles([]);
      setPreviewUrls([]);
      
    } catch (err: any) {
      console.error("Upload error:", err.message);
      alert(`Upload failed: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Clear all selections
  const clearAll = () => {
    previewUrls.forEach(url => URL.revokeObjectURL(url));
    setFiles([]);
    setPreviewUrls([]);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 bg-white rounded-lg shadow-lg">
      <div className="space-y-6">
        {/* Header */}
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Image Upload</h2>
          <p className="text-gray-600">Select multiple images to upload to Cloudinary</p>
        </div>

        {/* File Input Section */}
        <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-400 transition-colors">
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleFileChange}
            className="hidden"
            id="file-input"
          />
          <label 
            htmlFor="file-input" 
            className="cursor-pointer flex flex-col items-center space-y-3"
          >
            <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center">
              <Upload className="w-8 h-8 text-blue-500" />
            </div>
            <div>
              <p className="text-lg font-medium text-gray-700">
                Click to select images
              </p>
              <p className="text-sm text-gray-500">
                PNG, JPG, GIF up to 10MB each
              </p>
            </div>
          </label>
        </div>

        {/* Selected Files Count */}
        {files.length > 0 && (
          <div className="flex items-center justify-between bg-blue-50 p-4 rounded-lg">
            <div className="flex items-center space-x-2">
              <FileImage className="w-5 h-5 text-blue-600" />
              <span className="text-blue-800 font-medium">
                {files.length} image{files.length > 1 ? 's' : ''} selected
              </span>
            </div>
            <button
              onClick={clearAll}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium"
            >
              Clear all
            </button>
          </div>
        )}

        {/* Preview Section */}
        {previewUrls.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Preview</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {previewUrls.map((src, idx) => (
                <div key={idx} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <img
                      src={src}
                      alt={`preview-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <button
                    onClick={() => removeFile(idx)}
                    className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <X className="w-4 h-4" />
                  </button>
                  <div className="mt-1 text-xs text-gray-500 truncate">
                    {files[idx]?.name}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Upload Button */}
        <div className="flex justify-center">
          <button
            onClick={handleUpload}
            disabled={loading || files.length === 0}
            className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-medium py-3 px-8 rounded-lg transition-colors"
          >
            {loading ? (
              <>
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Uploading...</span>
              </>
            ) : (
              <>
                <Upload className="w-5 h-5" />
                <span>Upload {files.length} Image{files.length > 1 ? 's' : ''}</span>
              </>
            )}
          </button>
        </div>

        {/* Uploaded Images Section */}
        {uploadedUrls.length > 0 && (
          <div className="border-t pt-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
              <span>Successfully Uploaded</span>
              <span className="bg-green-100 text-green-800 text-sm font-medium px-2 py-1 rounded-full">
                {uploadedUrls.length}
              </span>
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {uploadedUrls.map((url, idx) => (
                <div key={idx} className="group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100 border-2 border-green-200">
                    <img
                      src={url}
                      alt={`uploaded-${idx}`}
                      className="w-full h-full object-cover"
                    />
                  </div>
                  <div className="mt-2 text-xs text-gray-500">
                    <a 
                      href={url} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 truncate block"
                    >
                      View full size
                    </a>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}