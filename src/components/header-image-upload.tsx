'use client';

import { useState, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Image, Upload, X, ImageOff } from 'lucide-react';
import { toast } from 'sonner';
import { useRouter } from 'next/navigation';
import { validateImageFile } from '@/lib/supabase/storage';

interface HeaderImageUploadProps {
    blogId: string;
    currentImageUrl?: string | null;
}

export function HeaderImageUpload({ blogId, currentImageUrl }: HeaderImageUploadProps) {
    const [isUploading, setIsUploading] = useState(false);
    const [isRemoving, setIsRemoving] = useState(false);
    const [previewUrl, setPreviewUrl] = useState<string | null>(currentImageUrl || null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const router = useRouter();

    const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        // Validate file
        const validation = validateImageFile(file);
        if (!validation.isValid) {
            toast.error(validation.error);
            return;
        }

        // Create preview
        const reader = new FileReader();
        reader.onload = (e) => {
            setPreviewUrl(e.target?.result as string);
        };
        reader.readAsDataURL(file);

        // Upload file
        handleUpload(file);
    };

    const handleUpload = async (file: File) => {
        setIsUploading(true);
        try {
            const formData = new FormData();
            formData.append('image', file);

            const response = await fetch(`/api/blogs/${blogId}/upload-image`, {
                method: 'POST',
                body: formData,
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Header image uploaded successfully');
                setPreviewUrl(data.blog.headerImageUrl);
                router.refresh();
            } else {
                toast.error(data.error || 'Failed to upload image');
                setPreviewUrl(currentImageUrl || null);
            }
        } catch (error) {
            console.error('Upload error:', error);
            toast.error('Failed to upload image');
            setPreviewUrl(currentImageUrl || null);
        } finally {
            setIsUploading(false);
            if (fileInputRef.current) {
                fileInputRef.current.value = '';
            }
        }
    };

    const handleRemove = async () => {
        setIsRemoving(true);
        try {
            const response = await fetch(`/api/blogs/${blogId}/upload-image`, {
                method: 'DELETE',
            });

            const data = await response.json();

            if (response.ok) {
                toast.success('Header image removed successfully');
                setPreviewUrl(null);
                router.refresh();
            } else {
                toast.error(data.error || 'Failed to remove image');
            }
        } catch (error) {
            console.error('Remove error:', error);
            toast.error('Failed to remove image');
        } finally {
            setIsRemoving(false);
        }
    };

    const triggerFileSelect = () => {
        fileInputRef.current?.click();
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                    <Image className="w-5 h-5" />
                    Header Image
                </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Image Preview */}
                <div className="aspect-video bg-muted rounded-lg border-2 border-dashed border-border overflow-hidden relative">
                    {previewUrl ? (
                        <>
                            <img
                                src={previewUrl}
                                alt="Blog header preview"
                                className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 right-2">
                                <Button
                                    variant="destructive"
                                    size="sm"
                                    onClick={handleRemove}
                                    disabled={isRemoving || isUploading}
                                    className="shadow-lg"
                                >
                                    {isRemoving ? (
                                        'Removing...'
                                    ) : (
                                        <>
                                            <X className="w-4 h-4 mr-1" />
                                            Remove
                                        </>
                                    )}
                                </Button>
                            </div>
                        </>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full text-muted-foreground">
                            <ImageOff className="w-12 h-12 mb-2" />
                            <p className="text-sm font-medium">No header image</p>
                            <p className="text-xs">Upload an image to make your blog more engaging</p>
                        </div>
                    )}
                </div>

                {/* Upload Controls */}
                <div className="flex gap-2">
                    <Input
                        ref={fileInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp,image/gif"
                        onChange={handleFileSelect}
                        className="hidden"
                    />
                    
                    <Button
                        onClick={triggerFileSelect}
                        disabled={isUploading || isRemoving}
                        className="flex-1 gap-2"
                        variant="outline"
                    >
                        <Upload className="w-4 h-4" />
                        {isUploading ? 'Uploading...' : previewUrl ? 'Change Image' : 'Upload Image'}
                    </Button>
                </div>

                {/* Guidelines */}
                <div className="text-xs text-muted-foreground space-y-1">
                    <p>• Recommended size: 1200×630px for best results</p>
                    <p>• Supported formats: JPEG, PNG, WebP, GIF</p>
                    <p>• Maximum file size: 5MB</p>
                </div>
            </CardContent>
        </Card>
    );
}