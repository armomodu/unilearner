import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';

// Contact form validation schema
const contactSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(100, 'Name must be less than 100 characters'),
    email: z.string().email('Please enter a valid email address'),
    subject: z.string().min(5, 'Subject must be at least 5 characters').max(200, 'Subject must be less than 200 characters'),
    message: z.string().min(20, 'Message must be at least 20 characters').max(2000, 'Message must be less than 2000 characters'),
    honeypot: z.string().optional(), // Spam protection honeypot field
});

// Simple rate limiting store (in production, use Redis)
const rateLimitStore = new Map<string, { count: number; resetTime: number }>();

function checkRateLimit(ip: string): boolean {
    const now = Date.now();
    const windowMs = 15 * 60 * 1000; // 15 minutes
    const maxRequests = 5; // Max 5 requests per window

    const record = rateLimitStore.get(ip);
    
    if (!record || now > record.resetTime) {
        rateLimitStore.set(ip, { count: 1, resetTime: now + windowMs });
        return true;
    }
    
    if (record.count >= maxRequests) {
        return false;
    }
    
    record.count++;
    return true;
}

export async function POST(request: NextRequest) {
    try {
        // Get client IP for rate limiting
        const forwarded = request.headers.get('x-forwarded-for');
        const ip = forwarded ? forwarded.split(',')[0] : 'unknown';
        
        // Check rate limit
        if (!checkRateLimit(ip)) {
            return NextResponse.json(
                { 
                    error: 'Too many requests. Please wait 15 minutes before trying again.',
                    rateLimited: true 
                },
                { status: 429 }
            );
        }

        // Parse and validate request body
        const body = await request.json();
        const validatedData = contactSchema.parse(body);

        // Honeypot spam protection - if honeypot field is filled, it's likely spam
        if (validatedData.honeypot && validatedData.honeypot.trim() !== '') {
            console.log('Spam detected via honeypot:', { ip, honeypot: validatedData.honeypot });
            // Return success to not reveal spam detection
            return NextResponse.json({ success: true, message: 'Message sent successfully!' });
        }

        // Additional spam checks
        const spamKeywords = ['viagra', 'casino', 'lottery', 'investment opportunity', 'make money fast'];
        const messageText = `${validatedData.subject} ${validatedData.message}`.toLowerCase();
        
        if (spamKeywords.some(keyword => messageText.includes(keyword))) {
            console.log('Spam detected via keywords:', { ip, subject: validatedData.subject });
            // Return success to not reveal spam detection
            return NextResponse.json({ success: true, message: 'Message sent successfully!' });
        }

        // Log the contact form submission (in production, save to database or send email)
        console.log('Contact form submission:', {
            name: validatedData.name,
            email: validatedData.email,
            subject: validatedData.subject,
            message: validatedData.message,
            ip,
            timestamp: new Date().toISOString(),
        });

        // Here you would typically:
        // 1. Save to database
        // 2. Send email notification
        // 3. Add to CRM/support system
        
        // For now, we'll just log it and return success
        // TODO: Integrate with email service (SendGrid, AWS SES, etc.)
        
        return NextResponse.json({
            success: true,
            message: 'Thank you for your message! We\'ll get back to you within 24 hours.'
        });

    } catch (error) {
        console.error('Contact form error:', error);

        // Handle validation errors
        if (error instanceof z.ZodError) {
            const firstError = error.issues[0];
            return NextResponse.json(
                { 
                    error: firstError.message,
                    field: firstError.path[0],
                    validationErrors: error.issues
                },
                { status: 400 }
            );
        }

        // Handle other errors
        return NextResponse.json(
            { error: 'Something went wrong. Please try again later.' },
            { status: 500 }
        );
    }
}

// Handle OPTIONS for CORS
export async function OPTIONS() {
    return new NextResponse(null, {
        status: 200,
        headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'POST, OPTIONS',
            'Access-Control-Allow-Headers': 'Content-Type',
        },
    });
}