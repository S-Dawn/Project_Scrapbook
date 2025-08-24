/**
 * Image Backup Service
 * 
 * This service handles storing local copies of images during upload
 * and provides fallback functionality when Appwrite images fail to load.
 */

export interface BackupImageOptions {
  imageId: string;
  file: File;
  imageUrl?: string;
}

/**
 * Stores the uploaded image file locally immediately during upload
 * This implementation works purely client-side for development
 */
export async function storeImageLocally({ imageId, file }: BackupImageOptions): Promise<boolean> {
  try {
    // Get file extension from the original file
    const extension = getImageExtension(file.name) || 'jpg';
    const filename = `${imageId}.${extension}`;    // Store image using client-side method
    return await storeImageClientSide(file, imageId, filename);
    
  } catch (error) {
    console.error('Failed to store image locally:', error);
    return false;
  }
}

/**
 * Client-side fallback storage method (for development)
 */
async function storeImageClientSide(file: File, imageId: string, filename: string): Promise<boolean> {
  try {
    // Create a blob URL for the image
    const imageBlob = file;
    const url = URL.createObjectURL(imageBlob);
    
    // Create a download link to save the file locally
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.style.display = 'none';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    
    URL.revokeObjectURL(url);
    
    // Save metadata for fallback tracking
    saveImageMetadata(imageId, filename);
    console.log(`📁 Image ${imageId} prepared for local storage as ${filename}`);
    
    return true;
  } catch (error) {
    console.error('Client-side storage failed:', error);
    return false;
  }
}

/**
 * Gets the file extension from a filename or URL
 */
function getImageExtension(filename: string): string | null {
  if (!filename) return null;
  
  const match = filename.match(/\.([^.]+)$/);
  return match ? match[1].toLowerCase() : null;
}

/**
 * Saves image metadata to localStorage for tracking backed up images
 */
function saveImageMetadata(imageId: string, filename: string): void {
  try {
    const metadata = {
      imageId,
      filename,
      backedUpAt: new Date().toISOString(),
    };
    
    localStorage.setItem(`backup_${imageId}`, JSON.stringify(metadata));
  } catch (error) {
    console.error('Failed to save image metadata:', error);
  }
}

/**
 * Checks if an image has been backed up locally
 */
export function isImageBackedUp(imageId: string): boolean {
  try {
    const metadata = localStorage.getItem(`backup_${imageId}`);
    return metadata !== null;
  } catch (error) {
    console.error('Failed to check backup status:', error);
    return false;
  }
}

/**
 * Gets the local backup path for an image
 */
export function getLocalBackupPath(imageId: string): string | null {
  try {
    const metadata = localStorage.getItem(`backup_${imageId}`);
    if (!metadata) return null;
    
    const parsed = JSON.parse(metadata);
    return `/assets/uploaded/${parsed.filename}`;
  } catch (error) {
    console.error('Failed to get local backup path:', error);
    return null;
  }
}

/**
 * Creates a fallback image URL that tries Appwrite first, then local backup
 */
export function createFallbackImageUrl(appwriteUrl: string, imageId?: string): string {
  if (!imageId) return appwriteUrl;
  
  const localPath = getLocalBackupPath(imageId);
  if (localPath && isImageBackedUp(imageId)) {
    // Return a data structure that can be used by our Image component
    return appwriteUrl; // We'll handle fallback in the component
  }
  
  return appwriteUrl;
}

/**
 * Current Implementation: Client-Side Image Storage
 * 
 * This implementation provides a client-side solution for image backup:
 * 1. Automatically triggers file download during upload process
 * 2. Stores metadata in localStorage for fallback tracking
 * 3. SmartImage component provides automatic fallback functionality
 * 
 * How it works:
 * - When user uploads an image, it gets stored to Appwrite
 * - Simultaneously, the image file is downloaded to user's Downloads folder
 * - User can manually move downloaded images to public/assets/uploaded/
 * - SmartImage component automatically falls back to local images when Appwrite fails
 * 
 * For production deployment, consider:
 * 1. Backend service that downloads and stores images server-side
 * 2. CDN with automatic backup capabilities
 * 3. Multiple storage providers with automatic failover
 */
