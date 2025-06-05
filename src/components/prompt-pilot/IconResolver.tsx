"use client";
import React from 'react';
import * as LucideIcons from 'lucide-react';

type IconName = keyof typeof LucideIcons;

interface IconResolverProps extends LucideIcons.LucideProps {
  name?: string;
  fallback?: React.ElementType;
}

const IconResolver: React.FC<IconResolverProps> = ({ name, fallback: FallbackIcon, ...props }) => {
  if (!name || !(name in LucideIcons)) {
    if (FallbackIcon) {
      return <FallbackIcon {...props} />;
    }
    return <LucideIcons.FileQuestion {...props} />; // Default fallback
  }
  
  const IconComponent = LucideIcons[name as IconName] as React.ElementType;
  return <IconComponent {...props} />;
};

export default IconResolver;
