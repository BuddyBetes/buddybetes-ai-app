
import React from 'react';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { cn } from '@/lib/utils';

interface LogoProps {
  className?: string;
  size?: 'sm' | 'md' | 'lg';
}

export function Logo({ className, size = 'md' }: LogoProps) {
  const sizeClasses = {
    sm: 'w-12 h-12',
    md: 'w-16 h-16',
    lg: 'w-24 h-24'
  };

  return (
    <div className={cn(sizeClasses[size], className)}>
      <AspectRatio ratio={1}>
        <img 
          src="/logo.png" 
          alt="BuddyBetes Logo" 
          className="w-full h-full object-contain" 
        />
      </AspectRatio>
    </div>
  );
}
