# API Usage Examples

This document provides examples of how to use the new Cloudinary-based image upload APIs.

## 🚀 Image Upload APIs

### Single Image Upload

```javascript
// Upload a single image
const formData = new FormData();
formData.append('image', fileInput.files[0]);

const response = await fetch('/api/upload/cloudinary', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Uploaded image URL:', result.secure_url);
console.log('Optimized URLs:', result.urls);
```

### Multiple Image Upload

```javascript
// Upload multiple images
const formData = new FormData();
files.forEach(file => {
  formData.append('images', file);
});

const response = await fetch('/api/upload/cloudinary', {
  method: 'PUT',
  body: formData
});

const result = await response.json();
console.log('Uploaded images:', result.images);
```

## 🛍️ Product Creation with Images

### Complete Product Creation

```javascript
// Create a product with images in a single request
const formData = new FormData();

// Add product fields
formData.append('name', 'Amazing T-Shirt');
formData.append('description', 'A comfortable and stylish t-shirt');
formData.append('designer', 'Fashion Brand');
formData.append('price', '29.99');
formData.append('gender', 'unisex');
formData.append('category', 'Tops');
formData.append('sizes', 'S,M,L,XL');
formData.append('colors', 'Black,White,Blue');
formData.append('materials', 'Cotton');
formData.append('isActive', 'true');
formData.append('isFeatured', 'false');
formData.append('isOnSale', 'false');
formData.append('isPreowned', 'false');
formData.append('totalStock', '50');

// Add images
files.forEach(file => {
  formData.append('images', file);
});

const response = await fetch('/api/products/with-images', {
  method: 'POST',
  body: formData
});

const result = await response.json();
console.log('Product created:', result.product);
```

## 🎨 Using Optimized Image URLs

### Display Different Image Sizes

```javascript
// After uploading, use the optimized URLs
const imageUrls = result.urls;

// Display thumbnail (150x150)
<img src={imageUrls.thumbnail} alt="Product thumbnail" />

// Display medium size (600x600)
<img src={imageUrls.medium} alt="Product image" />

// Display large size (1200x1200)
<img src={imageUrls.large} alt="Product large image" />
```

### Responsive Images

```javascript
// Use different sizes for different screen sizes
const ResponsiveImage = ({ publicId, alt }) => {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME;
  const baseUrl = `https://res.cloudinary.com/${cloudName}/image/upload`;
  
  return (
    <img
      src={`${baseUrl}/w_300,h_300,c_fit,f_auto,q_auto/${publicId}`}
      srcSet={`
        ${baseUrl}/w_300,h_300,c_fit,f_auto,q_auto/${publicId} 300w,
        ${baseUrl}/w_600,h_600,c_fit,f_auto,q_auto/${publicId} 600w,
        ${baseUrl}/w_1200,h_1200,c_fit,f_auto,q_auto/${publicId} 1200w
      `}
      sizes="(max-width: 600px) 300px, (max-width: 1200px) 600px, 1200px"
      alt={alt}
    />
  );
};
```

## 🔧 Error Handling

### Proper Error Handling

```javascript
try {
  const formData = new FormData();
  formData.append('image', file);
  
  const response = await fetch('/api/upload/cloudinary', {
    method: 'POST',
    body: formData
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Upload failed');
  }
  
  const result = await response.json();
  console.log('Upload successful:', result);
  
} catch (error) {
  console.error('Upload failed:', error.message);
  // Handle error appropriately
}
```

## 📱 Frontend Integration

### React Component Example

```jsx
import { useState } from 'react';

const ImageUpload = ({ onImagesChange }) => {
  const [uploading, setUploading] = useState(false);
  
  const handleFileChange = async (event) => {
    const files = Array.from(event.target.files);
    if (files.length === 0) return;
    
    setUploading(true);
    
    try {
      const formData = new FormData();
      files.forEach(file => {
        formData.append('images', file);
      });
      
      const response = await fetch('/api/upload/cloudinary', {
        method: 'PUT',
        body: formData
      });
      
      if (!response.ok) {
        throw new Error('Upload failed');
      }
      
      const result = await response.json();
      onImagesChange(result.images.map(img => img.secure_url));
      
    } catch (error) {
      console.error('Upload error:', error);
      alert('Upload failed. Please try again.');
    } finally {
      setUploading(false);
    }
  };
  
  return (
    <div>
      <input
        type="file"
        multiple
        accept="image/*"
        onChange={handleFileChange}
        disabled={uploading}
      />
      {uploading && <p>Uploading...</p>}
    </div>
  );
};
```

## 🚀 Performance Tips

### 1. Use Appropriate Image Sizes

```javascript
// Use thumbnail for lists
const thumbnailUrl = `${baseUrl}/w_150,h_150,c_fill,f_auto,q_auto/${publicId}`;

// Use medium for product pages
const mediumUrl = `${baseUrl}/w_600,h_600,c_fit,f_auto,q_auto/${publicId}`;

// Use large for hero images
const largeUrl = `${baseUrl}/w_1200,h_1200,c_fit,f_auto,q_auto/${publicId}`;
```

### 2. Lazy Loading

```javascript
// Implement lazy loading for better performance
<img
  src={thumbnailUrl}
  loading="lazy"
  alt="Product image"
/>
```

### 3. Progressive Loading

```javascript
// Show thumbnail while loading full image
const [imageLoaded, setImageLoaded] = useState(false);

<img
  src={imageLoaded ? fullImageUrl : thumbnailUrl}
  onLoad={() => setImageLoaded(true)}
  alt="Product image"
/>
```

## 🔒 Security Considerations

### File Validation

The API automatically validates:
- File type (images only)
- File size (max 10MB)
- File count (max 10 files)

### Environment Variables

Make sure these are set in your environment:

```bash
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

## 📊 Monitoring

### Check Upload Status

```javascript
// Monitor upload progress
const uploadWithProgress = async (file, onProgress) => {
  const formData = new FormData();
  formData.append('image', file);
  
  const xhr = new XMLHttpRequest();
  
  xhr.upload.addEventListener('progress', (event) => {
    if (event.lengthComputable) {
      const percentComplete = (event.loaded / event.total) * 100;
      onProgress(percentComplete);
    }
  });
  
  xhr.open('POST', '/api/upload/cloudinary');
  xhr.send(formData);
  
  return new Promise((resolve, reject) => {
    xhr.onload = () => {
      if (xhr.status === 200) {
        resolve(JSON.parse(xhr.responseText));
      } else {
        reject(new Error('Upload failed'));
      }
    };
    xhr.onerror = () => reject(new Error('Upload failed'));
  });
};
```

This new API system provides a robust, production-ready solution for image uploads with Cloudinary integration.
