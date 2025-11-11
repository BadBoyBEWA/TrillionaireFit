# Cloudinary Setup Guide

This guide will help you set up Cloudinary for image uploads in Trillionaire Fit.

## 🚀 Quick Setup

### 1. Create a Cloudinary Account

1. Go to [cloudinary.com](https://cloudinary.com)
2. Sign up for a free account
3. Verify your email address

### 2. Get Your Credentials

1. Log into your Cloudinary dashboard
2. Go to the "Dashboard" section
3. Copy the following values:
   - **Cloud Name** (e.g., `your-cloud-name`)
   - **API Key** (e.g., `123456789012345`)
   - **API Secret** (e.g., `abcdefghijklmnopqrstuvwxyz123456`)

### 3. Configure Environment Variables

Add these to your `.env.local` file:

```bash
# Cloudinary Configuration
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Test the Setup

Run the test script to verify everything is working:

```bash
# Make sure your Next.js app is running
npm run dev

# In another terminal, run the test
node test-cloudinary-upload.js
```

## 🔧 Configuration Details

### Cloudinary Settings

The following settings are configured for optimal performance:

- **Folder**: `trillionaire-fit/products` (all images are organized in this folder)
- **Quality**: `auto` (Cloudinary automatically optimizes quality)
- **Format**: `auto` (Cloudinary serves the best format for each browser)
- **Transformations**: Multiple sizes generated on-demand

### Image Sizes Generated

- **Thumbnail**: 150x150px (fill crop)
- **Small**: 300x300px (fit)
- **Medium**: 600x600px (fit)
- **Large**: 1200x1200px (fit)
- **Original**: Full resolution with auto optimization

## 🛠️ Troubleshooting

### Common Issues

1. **"Cloudinary configuration missing"**
   - Make sure all three environment variables are set
   - Restart your development server after adding them

2. **"Upload failed"**
   - Check your API credentials
   - Ensure your Cloudinary account is active
   - Check the console for detailed error messages

3. **"Images not displaying"**
   - Verify the Cloudinary URLs are correct
   - Check if the images exist in your Cloudinary dashboard
   - Ensure your domain is not blocked by CORS

### Debug Mode

To enable debug logging, add this to your `.env.local`:

```bash
CLOUDINARY_DEBUG=true
```

## 📊 Monitoring

### Cloudinary Dashboard

1. Log into your Cloudinary dashboard
2. Go to "Media Library" to see uploaded images
3. Check "Analytics" for usage statistics
4. Monitor "Transformations" for optimization metrics

### Usage Limits

- **Free Plan**: 25 GB storage, 25 GB bandwidth/month
- **Pro Plan**: 100 GB storage, 100 GB bandwidth/month
- **Advanced Plans**: Custom limits and features

## 🔒 Security

### Best Practices

1. **Never expose API Secret** in client-side code
2. **Use signed uploads** for sensitive content
3. **Set up upload presets** for consistent settings
4. **Enable access controls** if needed

### Upload Presets (Optional)

You can create upload presets in your Cloudinary dashboard for consistent settings:

1. Go to "Settings" > "Upload"
2. Click "Add upload preset"
3. Configure your settings:
   - Folder: `trillionaire-fit/products`
   - Quality: `auto`
   - Format: `auto`
   - Transformations: As needed

## 🚀 Production Deployment

### Environment Variables

Make sure to set these in your production environment:

```bash
CLOUDINARY_CLOUD_NAME=your-production-cloud-name
CLOUDINARY_API_KEY=your-production-api-key
CLOUDINARY_API_SECRET=your-production-api-secret
```

### CDN Configuration

Cloudinary automatically provides global CDN delivery, but you can optimize further:

1. **Custom Domain**: Set up a custom domain for your images
2. **HTTP/2**: Automatically enabled
3. **Compression**: Automatic gzip/brotli compression
4. **Caching**: Intelligent caching based on transformations

## 📈 Performance Optimization

### Image Optimization

- **Auto Quality**: Cloudinary automatically selects the best quality
- **Auto Format**: Serves WebP/AVIF when supported by the browser
- **Lazy Loading**: Implement lazy loading for better performance
- **Responsive Images**: Use the generated responsive URLs

### Example Usage

```javascript
// Get optimized image URLs
import { getOptimizedImageUrls } from '@/lib/cloudinary-optimization';

const urls = getOptimizedImageUrls('trillionaire-fit/products/image-id');
console.log(urls.thumbnail); // 150x150 optimized image
console.log(urls.medium);    // 600x600 optimized image
```

## 🆘 Support

If you encounter issues:

1. Check the [Cloudinary Documentation](https://cloudinary.com/documentation)
2. Review the [Cloudinary Community Forum](https://support.cloudinary.com/hc/en-us/community/topics)
3. Contact Cloudinary Support for account-specific issues

## 📝 Migration from Local Uploads

If you're migrating from local file uploads:

1. **Backup existing images** before migration
2. **Upload existing images** to Cloudinary
3. **Update image URLs** in your database
4. **Test thoroughly** before going live
5. **Remove old upload code** once confirmed working

The new system is designed to be a drop-in replacement for the old local upload system.
