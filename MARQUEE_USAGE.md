# Marquee Component Usage Guide

## Overview
The Marquee component provides smooth scrolling text animations for announcements, logos, and other content.

## Basic Usage

### 1. Simple Text Marquee
```tsx
import { MarqueeText } from '@/components/ui/Marquee';

<MarqueeText text="Your scrolling text here" />
```

### 2. Announcement Marquee
```tsx
import { MarqueeAnnouncement } from '@/components/ui/Marquee';

<MarqueeAnnouncement 
  announcements={[
    "Free Shipping Nationwide",
    "New Collection Available", 
    "Limited Time Offers"
  ]} 
/>
```

### 3. Logo Marquee
```tsx
import { MarqueeLogos } from '@/components/ui/Marquee';

<MarqueeLogos 
  logos={[
    "/logo1.png",
    "/logo2.png", 
    "/logo3.png"
  ]} 
/>
```

### 4. Custom Marquee
```tsx
import Marquee from '@/components/ui/Marquee';

<Marquee speed={20} direction="right" pauseOnHover={true}>
  <div className="flex items-center space-x-8">
    <span>Custom Content 1</span>
    <span>Custom Content 2</span>
    <span>Custom Content 3</span>
  </div>
</Marquee>
```

## Props

### Marquee Component
- `children`: React.ReactNode - Content to scroll
- `speed`: number (default: 20) - Animation speed in seconds
- `direction`: 'left' | 'right' (default: 'left') - Scroll direction
- `pauseOnHover`: boolean (default: true) - Pause animation on hover
- `className`: string - Additional CSS classes

### MarqueeText Component
- `text`: string - Text to display
- `className`: string - Additional CSS classes

### MarqueeAnnouncement Component
- `announcements`: string[] - Array of announcement texts
- `className`: string - Additional CSS classes

### MarqueeLogos Component
- `logos`: string[] - Array of logo image paths
- `className`: string - Additional CSS classes

## Examples

### Homepage Banner
```tsx
<div className="bg-black text-white py-4">
  <MarqueeText text="✨ New Arrivals Every Week ✨ Free Shipping ✨ Exclusive Collections ✨" />
</div>
```

### Footer Announcements
```tsx
<div className="bg-gray-100 py-2">
  <MarqueeAnnouncement 
    announcements={[
      "Free Shipping Nationwide",
      "Premium Quality Guaranteed",
      "Exclusive Designer Pieces"
    ]} 
  />
</div>
```

### Partner Logos
```tsx
<div className="bg-white py-6">
  <MarqueeLogos 
    logos={[
      "/partners/brand1.png",
      "/partners/brand2.png",
      "/partners/brand3.png"
    ]} 
  />
</div>
```

## Customization

### Speed Control
- Faster: `speed={10}` (10 seconds)
- Slower: `speed={30}` (30 seconds)

### Direction Control
- Left to Right: `direction="left"`
- Right to Left: `direction="right"`

### Hover Behavior
- Pause on hover: `pauseOnHover={true}` (default)
- Continue on hover: `pauseOnHover={false}`

## CSS Classes
The component uses these CSS classes:
- `.animate-marquee` - Main animation
- `.hover\:pause:hover` - Pause on hover
- Custom classes can be added via `className` prop

## Performance Notes
- Uses CSS animations for smooth performance
- Automatically duplicates content for seamless looping
- Responsive and mobile-friendly
- No JavaScript animations for better performance
