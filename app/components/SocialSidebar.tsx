"use client";

import React from "react"

import { motion } from "framer-motion";
import { Youtube, Facebook, Instagram } from "lucide-react";
import { useSettings } from "@/app/contexts/SettingsContext";
import { useMemo } from "react";

// Discord logo SVG
function DiscordIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.317 4.37a19.791 19.791 0 0 0-4.885-1.515.074.074 0 0 0-.079.037c-.21.375-.444.864-.608 1.25a18.27 18.27 0 0 0-5.487 0 12.64 12.64 0 0 0-.617-1.25.077.077 0 0 0-.079-.037A19.736 19.736 0 0 0 3.677 4.37a.07.07 0 0 0-.032.027C.533 9.046-.32 13.58.099 18.057a.082.082 0 0 0 .031.057 19.9 19.9 0 0 0 5.993 3.03.078.078 0 0 0 .084-.028 14.09 14.09 0 0 0 1.226-1.994.076.076 0 0 0-.041-.106 13.107 13.107 0 0 1-1.872-.892.077.077 0 0 1-.008-.128 10.2 10.2 0 0 0 .372-.292.074.074 0 0 1 .077-.01c3.928 1.793 8.18 1.793 12.062 0a.074.074 0 0 1 .078.01c.12.098.246.198.373.292a.077.077 0 0 1-.006.127 12.299 12.299 0 0 1-1.873.892.077.077 0 0 0-.041.107c.36.698.772 1.362 1.225 1.993a.076.076 0 0 0 .084.028 19.839 19.839 0 0 0 6.002-3.03.077.077 0 0 0 .032-.054c.5-5.177-.838-9.674-3.549-13.66a.061.061 0 0 0-.031-.03zM8.02 15.33c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.956-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.956 2.418-2.157 2.418zm7.975 0c-1.183 0-2.157-1.085-2.157-2.419 0-1.333.955-2.419 2.157-2.419 1.21 0 2.176 1.096 2.157 2.42 0 1.333-.946 2.418-2.157 2.418z"/>
    </svg>
  );
}

// X (Twitter) logo SVG
function XIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
    </svg>
  );
}

type SocialLinkConfig = {
  icon: React.ComponentType<{ className?: string }>;
  key: "youtubeUrl" | "discordUrl" | "facebookUrl" | "twitterUrl" | "instagramUrl";
  label: string;
  hoverColor: string;
};

const socialLinksConfig: SocialLinkConfig[] = [
  { 
    icon: Youtube, 
    key: "youtubeUrl",
    label: "YouTube",
    hoverColor: "hover:bg-red-600 hover:text-white"
  },
  { 
    icon: DiscordIcon, 
    key: "discordUrl",
    label: "Discord",
    hoverColor: "hover:bg-[#5865F2] hover:text-white"
  },
  { 
    icon: Facebook, 
    key: "facebookUrl",
    label: "Facebook",
    hoverColor: "hover:bg-[#1877F2] hover:text-white"
  },
  { 
    icon: XIcon, 
    key: "twitterUrl",
    label: "X (Twitter)",
    hoverColor: "hover:bg-black hover:text-white"
  },
  { 
    icon: Instagram, 
    key: "instagramUrl",
    label: "Instagram",
    hoverColor: "hover:bg-gradient-to-br hover:from-purple-600 hover:to-pink-500 hover:text-white"
  },
];

export function SocialSidebar() {
  const { settings } = useSettings();

  // Build social links dynamically from settings
  const socialLinks = useMemo(() => {
    if (!settings) return [];
    
    return socialLinksConfig
      .filter((config) => {
        const url = settings[config.key];
        return url && url.trim().length > 0;
      })
      .map((config) => ({
        ...config,
        href: settings[config.key] as string,
      }));
  }, [settings]);

  if (socialLinks.length === 0) return null;

  return (
    <motion.div
      initial={{ opacity: 0, x: 50 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 1, duration: 0.5 }}
      className="fixed right-0 top-1/2 -translate-y-1/2 z-40 hidden lg:flex flex-col"
    >
      {socialLinks.map((social, index) => {
        const Icon = social.icon;
        return (
          <motion.a
            key={social.label}
            href={social.href}
            target="_blank"
            rel="noopener noreferrer"
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 1.2 + index * 0.1 }}
            className={`
              w-12 h-12 flex items-center justify-center
              bg-[#1a1a24]/90 backdrop-blur-sm
              text-gray-400 transition-all duration-300
              ${social.hoverColor}
              border-l border-b border-white/5
              first:rounded-tl-lg first:border-t
              last:rounded-bl-lg
            `}
            aria-label={social.label}
          >
            <Icon className="w-5 h-5" />
          </motion.a>
        );
      })}
    </motion.div>
  );
}
