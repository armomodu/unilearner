/**
 * Image utility functions for resizing and optimization
 */

export interface ResizeOptions {
    maxWidth?: number;
    maxHeight?: number;
    quality?: number; // 0.1 to 1.0
    format?: 'jpeg' | 'png' | 'webp';
}

/**
 * Resize an image file on the client side
 */
export async function resizeImage(file: File, options: ResizeOptions = {}): Promise<File> {
    const {
        maxWidth = 1200,
        maxHeight = 800,
        quality = 0.85,
        format = 'jpeg'
    } = options;

    return new Promise((resolve, reject) => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
        const img = new Image();

        if (!ctx) {
            reject(new Error('Could not get canvas context'));
            return;
        }

        img.onload = () => {
            let { width, height } = img;

            // Calculate new dimensions while maintaining aspect ratio
            if (width > maxWidth || height > maxHeight) {
                const aspectRatio = width / height;
                
                if (width / maxWidth > height / maxHeight) {
                    width = maxWidth;
                    height = width / aspectRatio;
                } else {
                    height = maxHeight;
                    width = height * aspectRatio;
                }
            }

            canvas.width = width;
            canvas.height = height;

            // Draw the image with the new dimensions
            ctx.drawImage(img, 0, 0, width, height);

            // Convert canvas to blob
            canvas.toBlob(
                (blob) => {
                    if (!blob) {
                        reject(new Error('Failed to create blob from canvas'));
                        return;
                    }

                    // Create a new File from the blob
                    const fileName = file.name.replace(/\.[^/.]+$/, `.${format === 'jpeg' ? 'jpg' : format}`);
                    const resizedFile = new File([blob], fileName, {
                        type: `image/${format}`,
                        lastModified: Date.now(),
                    });

                    resolve(resizedFile);
                },
                `image/${format}`,
                quality
            );
        };

        img.onerror = () => {
            reject(new Error('Failed to load image'));
        };

        // Convert file to data URL and load into image
        const reader = new FileReader();
        reader.onload = (e) => {
            if (e.target?.result) {
                img.src = e.target.result as string;
            }
        };
        reader.onerror = () => {
            reject(new Error('Failed to read file'));
        };
        reader.readAsDataURL(file);
    });
}

/**
 * Check if a file is an image
 */
export function isImageFile(file: File): boolean {
    return file.type.startsWith('image/');
}

/**
 * Format file size for display
 */
export function formatFileSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/**
 * Generate a unique filename for uploads
 */
export function generateImageFileName(originalName: string, prefix: string = 'image'): string {
    const timestamp = Date.now();
    const random = Math.random().toString(36).substring(2, 8);
    const extension = originalName.split('.').pop() || 'jpg';
    return `${prefix}-${timestamp}-${random}.${extension}`;
}

/**
 * Create a thumbnail preview from a file
 */
export function createImagePreview(file: File): Promise<string> {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        
        reader.onload = (e) => {
            if (e.target?.result) {
                resolve(e.target.result as string);
            } else {
                reject(new Error('Failed to create preview'));
            }
        };
        
        reader.onerror = () => {
            reject(new Error('Failed to read file for preview'));
        };
        
        reader.readAsDataURL(file);
    });
}