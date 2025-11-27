import { createClient } from '@supabase/supabase-js';

const GRAPHICS_BUCKET_NAME = 'blog-graphics';

/**
 * Creates a Supabase client with service role key for server-side operations
 * This is used by the graphics agent to upload generated images
 */
function createServiceClient() {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
        throw new Error('Supabase URL or Service Role Key is not configured');
    }

    return createClient(supabaseUrl, serviceRoleKey, {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    });
}

export interface GraphicsUploadResult {
    success: boolean;
    publicUrl?: string;
    storagePath?: string;
    error?: string;
}

/**
 * Upload a generated graphic (base64 or buffer) to Supabase Storage
 *
 * @param imageData - Base64 string or Buffer containing image data
 * @param blogId - Blog ID for organizing storage
 * @param filename - Filename (e.g., 'infographic.png')
 * @returns Upload result with public URL
 */
export async function uploadGeneratedGraphic(
    imageData: Buffer | string,
    blogId: string,
    filename: string
): Promise<GraphicsUploadResult> {
    try {
        const supabase = createServiceClient();

        // Convert base64 to buffer if necessary
        let buffer: Buffer;
        if (typeof imageData === 'string') {
            // Remove data URL prefix if present (e.g., "data:image/png;base64,")
            const base64Data = imageData.replace(/^data:image\/\w+;base64,/, '');
            buffer = Buffer.from(base64Data, 'base64');
        } else {
            buffer = imageData;
        }

        // Create storage path
        const storagePath = `${blogId}/${filename}`;

        console.log(`Uploading graphic to ${GRAPHICS_BUCKET_NAME}/${storagePath}...`);

        // Upload to Supabase Storage
        const { data, error: uploadError } = await supabase.storage
            .from(GRAPHICS_BUCKET_NAME)
            .upload(storagePath, buffer, {
                contentType: 'image/png',
                cacheControl: '3600',
                upsert: true, // Allow overwriting if re-generating
            });

        if (uploadError) {
            console.error('Graphics upload error:', uploadError);
            return {
                success: false,
                error: `Failed to upload graphic: ${uploadError.message}`,
            };
        }

        // Get public URL
        const { data: urlData } = supabase.storage
            .from(GRAPHICS_BUCKET_NAME)
            .getPublicUrl(storagePath);

        if (!urlData?.publicUrl) {
            return {
                success: false,
                error: 'Failed to get public URL for uploaded graphic',
            };
        }

        console.log(`Graphic uploaded successfully: ${urlData.publicUrl}`);

        return {
            success: true,
            publicUrl: urlData.publicUrl,
            storagePath,
        };
    } catch (error) {
        console.error('Graphics upload exception:', error);
        return {
            success: false,
            error: error instanceof Error ? error.message : 'Unknown upload error',
        };
    }
}

/**
 * Delete a generated graphic from storage
 *
 * @param storagePath - Path to the file in storage (e.g., "blogId/infographic.png")
 * @returns True if deleted successfully
 */
export async function deleteGeneratedGraphic(storagePath: string): Promise<boolean> {
    try {
        const supabase = createServiceClient();

        const { error } = await supabase.storage
            .from(GRAPHICS_BUCKET_NAME)
            .remove([storagePath]);

        if (error) {
            console.error('Graphics delete error:', error);
            return false;
        }

        console.log(`Graphic deleted: ${storagePath}`);
        return true;
    } catch (error) {
        console.error('Graphics delete exception:', error);
        return false;
    }
}

/**
 * Delete all graphics for a specific blog
 *
 * @param blogId - Blog ID
 * @returns Number of files deleted
 */
export async function deleteAllBlogGraphics(blogId: string): Promise<number> {
    try {
        const supabase = createServiceClient();

        // List all files in the blog's folder
        const { data: files, error: listError } = await supabase.storage
            .from(GRAPHICS_BUCKET_NAME)
            .list(blogId);

        if (listError || !files || files.length === 0) {
            return 0;
        }

        // Delete all files
        const filePaths = files.map(file => `${blogId}/${file.name}`);
        const { error: deleteError } = await supabase.storage
            .from(GRAPHICS_BUCKET_NAME)
            .remove(filePaths);

        if (deleteError) {
            console.error('Bulk delete error:', deleteError);
            return 0;
        }

        console.log(`Deleted ${filePaths.length} graphics for blog ${blogId}`);
        return filePaths.length;
    } catch (error) {
        console.error('Bulk delete exception:', error);
        return 0;
    }
}

/**
 * Check if the blog-graphics bucket exists and is accessible
 *
 * @returns True if bucket is accessible
 */
export async function checkGraphicsBucketExists(): Promise<boolean> {
    try {
        const supabase = createServiceClient();

        const { data, error } = await supabase.storage
            .from(GRAPHICS_BUCKET_NAME)
            .list('', { limit: 1 });

        if (error) {
            console.error('Bucket check error:', error);
            return false;
        }

        return true;
    } catch (error) {
        console.error('Bucket check exception:', error);
        return false;
    }
}
