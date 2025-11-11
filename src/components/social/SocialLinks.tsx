'use client';

import { 
  FacebookIcon,
  TwitterIcon,
  InstagramIcon,
  YoutubeIcon,
  EnvelopeIcon
} from '@heroicons/react/24/outline';

interface SocialLinksProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  variant?: 'default' | 'minimal' | 'colored';
}

const socialLinks = [
  {
    name: 'Facebook',
    icon: FacebookIcon,
    url: 'https://facebook.com/trillionairefit',
    color: 'hover:text-blue-600'
  },
  {
    name: 'Twitter',
    icon: TwitterIcon,
    url: 'https://twitter.com/trillionairefit',
    color: 'hover:text-blue-400'
  },
  {
    name: 'Instagram',
    icon: InstagramIcon,
    url: 'https://instagram.com/trillionairefit',
    color: 'hover:text-pink-600'
  },
  {
    name: 'YouTube',
    icon: YoutubeIcon,
    url: 'https://youtube.com/trillionairefit',
    color: 'hover:text-red-600'
  },
  {
    name: 'Email',
    icon: EnvelopeIcon,
    url: 'mailto:info@trillionairefit.com',
    color: 'hover:text-gray-600'
  }
];

export default function SocialLinks({ 
  className = '', 
  size = 'md',
  variant = 'default'
}: SocialLinksProps) {
  const sizeClasses = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6'
  };

  const getVariantClasses = () => {
    switch (variant) {
      case 'minimal':
        return 'text-gray-400 hover:text-gray-600';
      case 'colored':
        return 'text-gray-600 hover:text-white';
      default:
        return 'text-gray-600 hover:text-black';
    }
  };

  return (
    <div className={`flex items-center space-x-4 ${className}`}>
      {socialLinks.map((social) => (
        <a
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`transition-colors duration-200 ${getVariantClasses()} ${social.color}`}
          aria-label={`Follow us on ${social.name}`}
        >
          <social.icon className={sizeClasses[size]} />
        </a>
      ))}
    </div>
  );
}
