import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    try {
        const { id: blogId } = await params;
        const supabase = await createServerClient();

        // Check authentication
        const { data: { session } } = await supabase.auth.getSession();
        if (!session) {
            return NextResponse.json(
                { error: 'Authentication required' },
                { status: 401 }
            );
        }

        // Get form data
        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            );
        }

        // Validate file type
        if (!file.type.startsWith('image/')) {
            return NextResponse.json(
                { error: 'File must be an image' },
                { status: 400 }
            );
        }

        // Validate file size (5MB max)
        const maxSize = 5 * 1024 * 1024; // 5MB
        if (file.size > maxSize) {
            return NextResponse.json(
                { error: 'Image must be smaller than 5MB' },
                { status: 400 }
            );
        }

        // Verify blog ownership
        const blog = await prisma.blog.findUnique({
            where: { id: blogId },
            include: { user: true }
        });

        if (!blog) {
            return NextResponse.json(
                { error: 'Blog not found' },
                { status: 404 }
            );
        }

        if (blog.user.supabaseId !== session.user.id) {
            return NextResponse.json(
                { error: 'Access denied' },
                { status: 403 }
            );
        }

        // Generate unique filename
        const timestamp = Date.now();
        const fileExtension = file.name.split('.').pop() || 'jpg';
        const fileName = `inline-${blogId}-${timestamp}.${fileExtension}`;
        const filePath = `blog-content-images/${fileName}`;

        // Upload to Supabase Storage
        const fileBuffer = await file.arrayBuffer();
        const { data: uploadData, error: uploadError } = await supabase.storage
            .from('blog-images')
            .upload(filePath, fileBuffer, {
                contentType: file.type,
                cacheControl: '3600',
                upsert: false
            });

        if (uploadError) {
            console.error('Upload error:', uploadError);
            return NextResponse.json(
                { error: 'Failed to upload image' },
                { status: 500 }
            );
        }

        // Get public URL
        const { data: { publicUrl } } = supabase.storage
            .from('blog-images')
            .getPublicUrl(filePath);

        // Return image URL and metadata
        return NextResponse.json({
            success: true,
            imageUrl: publicUrl,
            fileName: file.name,
            fileSize: file.size,
            filePath: filePath,
            alt: `Image uploaded to ${blog.title}`,
            markdown: `![${file.name}](${publicUrl})`
        });

    } catch (error) {
        console.error('Inline image upload error:', error);
        return NextResponse.json(
            { error: 'Internal server error' },
            { status: 500 }
        );
    }
}