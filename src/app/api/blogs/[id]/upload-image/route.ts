import { NextRequest, NextResponse } from 'next/server';
import { createServerClient } from '@/lib/supabase/server';
import { prisma } from '@/lib/prisma';
import { uploadHeaderImage, deleteHeaderImage } from '@/lib/supabase/storage';

export async function POST(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: blogId } = await params;
    
    try {
        // Authenticate user
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user from database
        const dbUser = await prisma.user.findUnique({
            where: { supabaseId: user.id },
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get blog and verify ownership
        const blog = await prisma.blog.findUnique({
            where: { id: blogId },
        });

        if (!blog) {
            return NextResponse.json(
                { error: 'Blog not found' },
                { status: 404 }
            );
        }

        if (blog.userId !== dbUser.id) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Parse form data
        const formData = await request.formData();
        const file = formData.get('image') as File;

        if (!file) {
            return NextResponse.json(
                { error: 'No image file provided' },
                { status: 400 }
            );
        }

        // Delete existing header image if it exists
        // TODO: Re-enable when headerImagePath field is added to schema
        // if (blog.headerImagePath) {
        //     await deleteHeaderImage(blog.headerImagePath);
        // }

        // Upload new image
        const uploadResult = await uploadHeaderImage(file, blogId, dbUser.id);

        if (!uploadResult.success) {
            return NextResponse.json(
                { error: uploadResult.error || 'Failed to upload image' },
                { status: 400 }
            );
        }

        // Update blog with new image info
        // TODO: Re-enable when header image fields are added to schema
        const updatedBlog = await prisma.blog.update({
            where: { id: blogId },
            data: {
                // headerImageUrl: uploadResult.imageUrl,
                // headerImagePath: uploadResult.imagePath,
                updatedAt: new Date(),
            },
            include: {
                generation: true,
                sources: true,
            },
        });

        return NextResponse.json({
            blog: updatedBlog,
            message: 'Header image uploaded successfully',
        });

    } catch (error) {
        console.error('Image upload API error:', error);
        return NextResponse.json(
            { error: 'Failed to upload image' },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: Promise<{ id: string }> }
) {
    const { id: blogId } = await params;
    
    try {
        // Authenticate user
        const supabase = await createServerClient();
        const { data: { user }, error: authError } = await supabase.auth.getUser();

        if (authError || !user) {
            return NextResponse.json(
                { error: 'Unauthorized' },
                { status: 401 }
            );
        }

        // Get user from database
        const dbUser = await prisma.user.findUnique({
            where: { supabaseId: user.id },
        });

        if (!dbUser) {
            return NextResponse.json(
                { error: 'User not found' },
                { status: 404 }
            );
        }

        // Get blog and verify ownership
        const blog = await prisma.blog.findUnique({
            where: { id: blogId },
        });

        if (!blog) {
            return NextResponse.json(
                { error: 'Blog not found' },
                { status: 404 }
            );
        }

        if (blog.userId !== dbUser.id) {
            return NextResponse.json(
                { error: 'Forbidden' },
                { status: 403 }
            );
        }

        // Delete header image if it exists
        // TODO: Re-enable when headerImagePath field is added to schema
        // if (blog.headerImagePath) {
        //     await deleteHeaderImage(blog.headerImagePath);
        // }

        // Update blog to remove image references
        // TODO: Re-enable when header image fields are added to schema
        const updatedBlog = await prisma.blog.update({
            where: { id: blogId },
            data: {
                // headerImageUrl: null,
                // headerImagePath: null,
                updatedAt: new Date(),
            },
            include: {
                generation: true,
                sources: true,
            },
        });

        return NextResponse.json({
            blog: updatedBlog,
            message: 'Header image removed successfully',
        });

    } catch (error) {
        console.error('Image delete API error:', error);
        return NextResponse.json(
            { error: 'Failed to remove image' },
            { status: 500 }
        );
    }
}