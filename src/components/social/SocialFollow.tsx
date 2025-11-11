'use client';

import { FacebookIcon, InstagramIcon, TwitterIcon, YoutubeIcon, WhatsAppIcon } from '@/components/ui/SocialIcons';

interface SocialFollowProps {
  className?: string;
}

export default function SocialFollow({ className = '' }: SocialFollowProps) {
  const socialLinks = [
    // {
    //   name: 'Facebook',
    //   url: 'https://facebook.com/trillionairefit',
    //   color: 'hover:text-blue-600',
    //   icon: FacebookIcon
    // },
    {
      name: 'Instagram',
      url: 'https://instagram.com/TRILLIONAIREFIT_STORE',
      color: 'hover:text-pink-600',
      icon: InstagramIcon
    },
    // {
    //   name: 'Twitter',
    //   url: 'https://twitter.com/trillionairefit',
    //   color: 'hover:text-blue-400',
    //   icon: TwitterIcon
    // },
    // {
    //   name: 'YouTube',
    //   url: 'https://youtube.com/@trillionairefit',
    //   color: 'hover:text-red-600',
    //   icon: YoutubeIcon
    // },
    {
      name: 'WhatsApp',
      url: 'https://wa.link/ejkgxf',
      color: 'hover:text-red-600',
      icon: WhatsAppIcon
    }
  ];

  return (
    <div className={`flex space-x-4 ${className}`}>
      {socialLinks.map((social) => (
        <a
          key={social.name}
          href={social.url}
          target="_blank"
          rel="noopener noreferrer"
          className={`text-gray-400 transition-colors ${social.color}`}
          title={`Follow us on ${social.name}`}
        >
          <social.icon className="h-6 w-6" />
        </a>
      ))}
    </div>
  );
}
