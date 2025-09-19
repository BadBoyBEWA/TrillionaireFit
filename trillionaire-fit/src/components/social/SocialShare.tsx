'use client';

import { useState } from 'react';
import { ShareIcon, FacebookIcon, TwitterIcon, InstagramIcon, PinterestIcon, LinkIcon } from '@/components/ui/SocialIcons';

interface SocialShareProps {
  url: string;
  title: string;
  description?: string;
  image?: string;
  className?: string;
}

export default function SocialShare({ 
  url, 
  title, 
  description = '', 
  image = '',
  className = ''
}: SocialShareProps) {
  const [showShareMenu, setShowShareMenu] = useState(false);

  const shareData = {
    url,
    title,
    text: description,
    image
  };

  const socialPlatforms = [
    {
      name: 'Facebook',
      icon: FacebookIcon,
      color: 'bg-blue-600 hover:bg-blue-700',
      shareUrl: `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
    },
    {
      name: 'Twitter',
      icon: TwitterIcon,
      color: 'bg-blue-400 hover:bg-blue-500',
      shareUrl: `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(title)}`
    },
    {
      name: 'Pinterest',
      icon: PinterestIcon,
      color: 'bg-red-600 hover:bg-red-700',
      shareUrl: `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&media=${encodeURIComponent(image)}&description=${encodeURIComponent(title)}`
    },
    {
      name: 'Instagram',
      icon: InstagramIcon,
      color: 'bg-gradient-to-r from-purple-500 to-pink-500 hover:from-purple-600 hover:to-pink-600',
      shareUrl: `https://www.instagram.com/`
    }
  ];

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share(shareData);
        setShowShareMenu(false);
      } catch (error) {
        console.error('Error sharing:', error);
        fallbackCopyToClipboard();
      }
    } else {
      fallbackCopyToClipboard();
    }
  };

  const fallbackCopyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(url);
      // You could show a toast notification here
      console.log('Link copied to clipboard');
      setShowShareMenu(false);
    } catch (error) {
      console.error('Failed to copy to clipboard:', error);
    }
  };

  const handleSocialShare = (shareUrl: string) => {
    window.open(shareUrl, '_blank', 'width=600,height=400');
    setShowShareMenu(false);
  };

  return (
    <div className={`relative ${className}`}>
      <button
        onClick={() => setShowShareMenu(!showShareMenu)}
        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors font-luxury-elegant"
      >
        <ShareIcon className="h-4 w-4" />
        <span>Share</span>
      </button>

      {showShareMenu && (
        <>
          {/* Backdrop */}
          <div 
            className="fixed inset-0 z-10" 
            onClick={() => setShowShareMenu(false)}
          />
          
          {/* Share Menu */}
          <div className="absolute top-full left-0 mt-2 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 min-w-[200px]">
            {/* Native Share */}
            <button
              onClick={handleNativeShare}
              className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 font-luxury-elegant"
            >
              <LinkIcon className="h-4 w-4" />
              <span>Copy Link</span>
            </button>

            <div className="border-t border-gray-100 my-1"></div>

            {/* Social Platforms */}
            {socialPlatforms.map((platform) => (
              <button
                key={platform.name}
                onClick={() => handleSocialShare(platform.shareUrl)}
                className="w-full px-4 py-2 text-left hover:bg-gray-50 flex items-center space-x-3 font-luxury-elegant"
              >
                <div className={`w-6 h-6 rounded flex items-center justify-center ${platform.color} text-white`}>
                  <platform.icon className="h-4 w-4" />
                </div>
                <span>Share on {platform.name}</span>
              </button>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

