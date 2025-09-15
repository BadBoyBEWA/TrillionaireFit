'use client';

import { useState, useRef, useCallback } from 'react';

interface ImageUploadProps {
  images: string[];
  onImagesChange: (images: string[]) => void;
  maxImages?: number;
  className?: string;
  onError?: (message: string) => void;
}

export default function ImageUpload({ 
  images, 
  onImagesChange, 
  maxImages = 10,
  className = '',
  onError
}: ImageUploadProps) {
  const [isDragOver, setIsDragOver] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  }, []);

  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    handleFiles(files);
  }, []);

  const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    handleFiles(files);
  }, []);

  const handleFiles = useCallback(async (files: File[]) => {
    if (files.length === 0) return;
    
    // Check if adding these files would exceed maxImages
    if (images.length + files.length > maxImages) {
      const message = `You can only upload up to ${maxImages} images. You currently have ${images.length} images.`;
      if (onError) {
        onError(message);
      } else {
        alert(message);
      }
      return;
    }

    setUploading(true);

    try {
      // For now, we'll convert files to data URLs
      // In a real app, you'd upload to a cloud service like Cloudinary, AWS S3, etc.
      const newImageUrls: string[] = [];
      
      for (const file of files) {
        // Validate file type
        if (!file.type.startsWith('image/')) {
          const message = `${file.name} is not an image file.`;
          if (onError) {
            onError(message);
          } else {
            alert(message);
          }
          continue;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
          const message = `${file.name} is too large. Maximum size is 5MB.`;
          if (onError) {
            onError(message);
          } else {
            alert(message);
          }
          continue;
        }

        // Convert to data URL for preview
        const dataUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => resolve(reader.result as string);
          reader.readAsDataURL(file);
        });

        newImageUrls.push(dataUrl);
      }

      // Add new images to existing ones
      onImagesChange([...images, ...newImageUrls]);
      
    } catch (error) {
      console.error('Error processing files:', error);
      const message = 'Error processing files. Please try again.';
      if (onError) {
        onError(message);
      } else {
        alert(message);
      }
    } finally {
      setUploading(false);
    }
  }, [images, maxImages, onImagesChange]);

  const removeImage = useCallback((index: number) => {
    const newImages = images.filter((_, i) => i !== index);
    onImagesChange(newImages);
  }, [images, onImagesChange]);

  const openFileDialog = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className={`space-y-4 ${className}`}>
      {/* Upload Area */}
      <div
        className={`relative border-2 border-dashed rounded-lg p-6 text-center transition-colors ${
          isDragOver
            ? 'border-black bg-gray-50'
            : 'border-gray-300 hover:border-gray-400'
        } ${uploading ? 'opacity-50 pointer-events-none' : ''}`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        <input
          ref={fileInputRef}
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileSelect}
          className="hidden"
        />
        
        <div className="space-y-2">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            stroke="currentColor"
            fill="none"
            viewBox="0 0 48 48"
          >
            <path
              d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
              strokeWidth={2}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          
          <div className="text-sm text-gray-600">
            <button
              type="button"
              onClick={openFileDialog}
              className="font-medium text-black hover:text-gray-700 focus:outline-none focus:underline"
            >
              Click to upload
            </button>
            {' '}or drag and drop
          </div>
          
          <p className="text-xs text-gray-500">
            PNG, JPG, GIF up to 5MB each (max {maxImages} images)
          </p>
          
          {uploading && (
            <div className="flex items-center justify-center space-x-2 text-sm text-gray-600">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-600"></div>
              <span>Uploading...</span>
            </div>
          )}
        </div>
      </div>

      {/* Image Preview Grid */}
      {images.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {images.map((image, index) => (
            <div key={index} className="relative group">
              <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                <img
                  src={image}
                  alt={`Upload ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
              
              {/* Remove button */}
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute -top-2 -right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-700"
                title="Remove image"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              
              {/* Image number badge */}
              <div className="absolute bottom-2 left-2 bg-black bg-opacity-75 text-white text-xs px-2 py-1 rounded">
                {index + 1}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* URL Input Section */}
      <div className="border-t pt-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Or add image URLs:</h4>
        <div className="space-y-2">
          {images.map((url, index) => (
            <div key={index} className="flex items-center space-x-2">
              <input
                type="url"
                value={url}
                onChange={(e) => {
                  const newImages = [...images];
                  newImages[index] = e.target.value;
                  onImagesChange(newImages);
                }}
                placeholder="https://example.com/image.jpg"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-black text-sm"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="text-red-600 hover:text-red-800 text-sm font-medium px-2 py-1"
              >
                Remove
              </button>
            </div>
          ))}
          
          {images.length < maxImages && (
            <button
              type="button"
              onClick={() => onImagesChange([...images, ''])}
              className="text-black hover:text-gray-600 text-sm font-medium"
            >
              + Add Image URL
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
