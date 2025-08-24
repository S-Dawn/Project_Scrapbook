import React, { useState, useEffect } from 'react';
import { getLocalBackupPath, isImageBackedUp } from '@/lib/imageBackup';

interface SmartImageProps {
  src: string;
  alt: string;
  imageId?: string;
  className?: string;
  width?: number | string;
  height?: number | string;
  fallbackSrc?: string;
  onError?: () => void;
  onLoad?: () => void;
}

/**
 * SmartImage component that automatically falls back to local backup
 * when the primary image source fails to load
 */
const SmartImage: React.FC<SmartImageProps> = ({
  src,
  alt,
  imageId,
  className,
  width,
  height,
  fallbackSrc = "/assets/icons/profile-placeholder.svg",
  onError,
  onLoad,
}) => {
  const [currentSrc, setCurrentSrc] = useState(src);
  const [fallbackAttempted, setFallbackAttempted] = useState(false);
  // Reset state when src changes
  useEffect(() => {
    setCurrentSrc(src);
    setFallbackAttempted(false);
  }, [src]);

  const handleError = () => {
    // Try local backup if available and not already attempted
    if (imageId && !fallbackAttempted && isImageBackedUp(imageId)) {
      const localPath = getLocalBackupPath(imageId);
      if (localPath) {
        setCurrentSrc(localPath);
        setFallbackAttempted(true);
        return;
      }
    }
    
    // Fall back to default placeholder
    if (currentSrc !== fallbackSrc) {
      setCurrentSrc(fallbackSrc);
    }
    
    onError?.();
  };

  const handleLoad = () => {
    onLoad?.();
  };

  return (
    <img
      src={currentSrc}
      alt={alt}
      className={className}
      width={width}
      height={height}
      onError={handleError}
      onLoad={handleLoad}
      loading="lazy"
    />
  );
};

export default SmartImage;
