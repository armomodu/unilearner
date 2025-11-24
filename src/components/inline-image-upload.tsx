'use client';

import { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Image, Upload, X, Loader2, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import { resizeImage, isImageFile } from '@/lib/image-utils';

interface InlineImageUploadProps {
    blogId: string;
    onImageInsert: (markdown: string, imageUrl: string) => void;
    className?: string;
}

interface UploadedImage {
    id: string;
    imageUrl: string;
    fileName: string;
    fileSize: number;
    markdown: string;
}

export function InlineImageUpload({ blogId, onImageInsert, className }: InlineImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [dragActive, setDragActive] = useState(false);
    const [recentImages, setRecentImages] = useState<UploadedImage[]>([]);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const handleImageUpload = useCallback(async (file: File) => {
        if (!isImageFile(file)) {
            toast.error('Please select a valid image file');
            return;
        }

        if (file.size > 10 * 1024 * 1024) {
            toast.error('Image must be smaller than 10MB');
            return;
        }

        setIsUploading(true);
        
        try {
            // Auto-resize large images
            let processedFile = file;
            if (file.size > 1024 * 1024) { // 1MB threshold
                toast.loading('Optimizing image...', { id: 'resize' });
                processedFile = await resizeImage(file, {
                    maxWidth: 1200,
                    maxHeight: 800,
                    quality: 0.85,
                    format: 'jpeg'
                });
                toast.success('Image optimized', { id: 'resize' });
            }

            const formData = new FormData();
            formData.append('image', processedFile);

            const response = await fetch(`/api/blogs/${blogId}/upload-inline-image`, {
                method: 'POST',
                body: formData,
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Upload failed');
            }

            const uploadedImage: UploadedImage = {
                id: Date.now().toString(),
                imageUrl: result.imageUrl,
                fileName: result.fileName,
                fileSize: processedFile.size, // Use processed file size
                markdown: result.markdown
            };

            // Add to recent images
            setRecentImages(prev => [uploadedImage, ...prev.slice(0, 4)]);

            // Insert into editor
            onImageInsert(result.markdown, result.imageUrl);

            toast.success(`Image uploaded successfully${processedFile.size !== file.size ? ' (optimized)' : ''}`);
        } catch (error) {
            console.error('Upload error:', error);
            toast.error(error instanceof Error ? error.message : 'Failed to upload image');
        } finally {
            setIsUploading(false);
        }
    }, [blogId, onImageInsert]);

    const handleFileSelect = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            handleImageUpload(file);
        }
        // Clear input value to allow re-uploading same file
        if (fileInputRef.current) {
            fileInputRef.current.value = '';
        }
    }, [handleImageUpload]);

    const handleDrag = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        if (e.type === 'dragenter' || e.type === 'dragover') {
            setDragActive(true);
        } else if (e.type === 'dragleave') {
            setDragActive(false);
        }
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setDragActive(false);

        const files = Array.from(e.dataTransfer.files);
        const imageFile = files.find(file => file.type.startsWith('image/'));
        
        if (imageFile) {
            handleImageUpload(imageFile);
        } else {
            toast.error('Please drop an image file');
        }
    }, [handleImageUpload]);

    const insertRecentImage = useCallback((image: UploadedImage) => {
        onImageInsert(image.markdown, image.imageUrl);
        toast.success('Image inserted');
    }, [onImageInsert]);

    const formatFileSize = (bytes: number) => {
        if (bytes < 1024) return `${bytes} B`;
        if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    };

    return (
        <div className={className}>
            <Card className="border-dashed border-2">
                <CardContent className="p-4">
                    <div className="space-y-4">
                        {/* Upload Area */}
                        <div
                            className={`relative border-2 border-dashed rounded-lg p-6 transition-colors ${
                                dragActive 
                                    ? 'border-primary bg-primary/5' 
                                    : 'border-muted-foreground/25 hover:border-muted-foreground/50'
                            }`}
                            onDragEnter={handleDrag}
                            onDragLeave={handleDrag}
                            onDragOver={handleDrag}
                            onDrop={handleDrop}
                        >
                            <input
                                ref={fileInputRef}
                                type="file"
                                accept="image/*"
                                onChange={handleFileSelect}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                disabled={isUploading}
                            />
                            
                            <div className="text-center space-y-2">
                                {isUploading ? (
                                    <>
                                        <Loader2 className="w-8 h-8 mx-auto animate-spin text-primary" />
                                        <p className="text-sm text-muted-foreground">Uploading image...</p>
                                    </>
                                ) : (
                                    <>
                                        <Image className="w-8 h-8 mx-auto text-muted-foreground" />
                                        <div className="space-y-1">
                                            <p className="text-sm font-medium">
                                                Drop an image here, or click to select
                                            </p>
                                            <p className="text-xs text-muted-foreground">
                                                Supports JPG, PNG, GIF up to 5MB
                                            </p>
                                        </div>
                                    </>
                                )}
                            </div>
                        </div>

                        {/* Upload Button */}
                        <Button
                            onClick={() => fileInputRef.current?.click()}
                            variant="outline"
                            size="sm"
                            disabled={isUploading}
                            className="w-full gap-2"
                        >
                            {isUploading ? (
                                <Loader2 className="w-4 h-4 animate-spin" />
                            ) : (
                                <Upload className="w-4 h-4" />
                            )}
                            Upload Image
                        </Button>

                        {/* Recent Images */}
                        {recentImages.length > 0 && (
                            <div className="space-y-2">
                                <h4 className="text-sm font-medium text-muted-foreground">Recent Uploads</h4>
                                <div className="space-y-2 max-h-32 overflow-y-auto">
                                    {recentImages.map((image) => (
                                        <div
                                            key={image.id}
                                            className="flex items-center gap-3 p-2 rounded-lg border bg-muted/30 hover:bg-muted/50 transition-colors cursor-pointer"
                                            onClick={() => insertRecentImage(image)}
                                        >
                                            <img
                                                src={image.imageUrl}
                                                alt={image.fileName}
                                                className="w-8 h-8 object-cover rounded"
                                            />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-medium truncate">
                                                    {image.fileName}
                                                </p>
                                                <p className="text-xs text-muted-foreground">
                                                    {formatFileSize(image.fileSize)}
                                                </p>
                                            </div>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                className="h-6 w-6 p-0 text-primary hover:text-primary-foreground hover:bg-primary"
                                            >
                                                <Upload className="w-3 h-3" />
                                            </Button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Usage Tip */}
                        <div className="flex items-start gap-2 p-2 rounded bg-blue-50 dark:bg-blue-950/20 border border-blue-200 dark:border-blue-800">
                            <AlertCircle className="w-4 h-4 text-blue-600 dark:text-blue-400 mt-0.5" />
                            <div className="text-xs text-blue-600 dark:text-blue-400">
                                <p className="font-medium mb-1">Pro tip:</p>
                                <p>Images are automatically resized and optimized. You can also paste images directly in the editor with Ctrl+V.</p>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}