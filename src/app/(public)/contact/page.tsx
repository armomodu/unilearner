'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Mail, MessageSquare, Phone, MapPin, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';
import Link from 'next/link';

interface FormData {
    name: string;
    email: string;
    subject: string;
    message: string;
    honeypot: string; // Spam protection
}

interface FormErrors {
    [key: string]: string;
}

export default function ContactPage() {
    const [formData, setFormData] = useState<FormData>({
        name: '',
        email: '',
        subject: '',
        message: '',
        honeypot: '', // Hidden field for spam protection
    });

    const [errors, setErrors] = useState<FormErrors>({});
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
        
        // Clear error when user starts typing
        if (errors[name]) {
            setErrors(prev => ({ ...prev, [name]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: FormErrors = {};

        if (!formData.name.trim()) {
            newErrors.name = 'Name is required';
        } else if (formData.name.length < 2) {
            newErrors.name = 'Name must be at least 2 characters';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.subject.trim()) {
            newErrors.subject = 'Subject is required';
        } else if (formData.subject.length < 5) {
            newErrors.subject = 'Subject must be at least 5 characters';
        }

        if (!formData.message.trim()) {
            newErrors.message = 'Message is required';
        } else if (formData.message.length < 20) {
            newErrors.message = 'Message must be at least 20 characters';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!validateForm()) {
            toast.error('Please fix the form errors');
            return;
        }

        setIsSubmitting(true);

        try {
            const response = await fetch('/api/contact', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            const data = await response.json();

            if (response.ok) {
                setIsSubmitted(true);
                toast.success('Message sent successfully!');
                // Reset form
                setFormData({
                    name: '',
                    email: '',
                    subject: '',
                    message: '',
                    honeypot: '',
                });
            } else {
                throw new Error(data.error || 'Failed to send message');
            }
        } catch (error) {
            console.error('Contact form error:', error);
            toast.error(error instanceof Error ? error.message : 'Something went wrong');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (isSubmitted) {
        return (
            <div className="min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-green-950/20 dark:to-blue-950/20">
                <div className="container mx-auto px-4 py-24">
                    <div className="max-w-2xl mx-auto text-center">
                        <div className="w-20 h-20 mx-auto mb-8 rounded-full bg-green-500/10 flex items-center justify-center">
                            <CheckCircle className="w-10 h-10 text-green-500" />
                        </div>
                        <h1 className="text-4xl font-bold mb-4">Message Sent Successfully!</h1>
                        <p className="text-xl text-muted-foreground mb-8">
                            Thank you for reaching out. We&apos;ll get back to you within 24 hours.
                        </p>
                        <div className="flex gap-4 justify-center">
                            <Link href="/">
                                <Button variant="outline" className="gap-2">
                                    Back to Home
                                </Button>
                            </Link>
                            <Link href="/blog">
                                <Button className="gap-2">
                                    Read Our Blog
                                </Button>
                            </Link>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-slate-950 dark:to-slate-900">
            <div className="container mx-auto px-4 py-24">
                {/* Header */}
                <div className="text-center mb-16">
                    <Badge className="px-4 py-2 bg-gradient-to-r from-primary/10 to-purple-500/10 border-primary/20 text-primary mb-6">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Get In Touch
                    </Badge>
                    <h1 className="text-4xl md:text-5xl font-bold tracking-tight mb-4">
                        <span className="bg-gradient-to-r from-slate-900 to-slate-600 dark:from-slate-100 dark:to-slate-400 bg-clip-text text-transparent">
                            Contact Our Team
                        </span>
                    </h1>
                        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
                            Have questions about UniLearner? Need help with your account? 
                            We&apos;d love to hear from you and help you succeed.
                    </p>
                </div>

                <div className="max-w-6xl mx-auto grid lg:grid-cols-3 gap-8">
                    {/* Contact Info */}
                    <div className="lg:col-span-1 space-y-6">
                        <Card className="border-0 shadow-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Mail className="w-5 h-5 text-primary" />
                                    Email Us
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-2">For general inquiries</p>
                                <a href="mailto:hello@unilearner.com" className="text-primary hover:underline">
                                    hello@unilearner.com
                                </a>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <MessageSquare className="w-5 h-5 text-primary" />
                                    Support
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground mb-2">Technical help & account issues</p>
                                <a href="mailto:support@unilearner.com" className="text-primary hover:underline">
                                    support@unilearner.com
                                </a>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <AlertCircle className="w-5 h-5 text-primary" />
                                    Response Time
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-muted-foreground">
                                    We typically respond within <strong>24 hours</strong> during business days.
                                    For urgent issues, please mark your subject with &quot;URGENT&quot;.
                                </p>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Contact Form */}
                    <div className="lg:col-span-2">
                        <Card className="border-0 shadow-sm bg-white/50 dark:bg-slate-800/50 backdrop-blur-sm">
                            <CardHeader>
                                <CardTitle className="text-2xl">Send us a message</CardTitle>
                                <p className="text-muted-foreground">
                                    Fill out the form below and we&apos;ll get back to you as soon as possible.
                                </p>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    {/* Honeypot field - hidden from users */}
                                    <input
                                        type="text"
                                        name="honeypot"
                                        value={formData.honeypot}
                                        onChange={handleInputChange}
                                        className="absolute left-[-9999px] opacity-0"
                                        tabIndex={-1}
                                        autoComplete="off"
                                    />

                                    <div className="grid md:grid-cols-2 gap-4">
                                        <div>
                                            <Label htmlFor="name">Name *</Label>
                                            <Input
                                                id="name"
                                                name="name"
                                                value={formData.name}
                                                onChange={handleInputChange}
                                                placeholder="Your full name"
                                                className={errors.name ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                                disabled={isSubmitting}
                                            />
                                            {errors.name && (
                                                <p className="text-sm text-red-500 mt-1">{errors.name}</p>
                                            )}
                                        </div>

                                        <div>
                                            <Label htmlFor="email">Email *</Label>
                                            <Input
                                                id="email"
                                                name="email"
                                                type="email"
                                                value={formData.email}
                                                onChange={handleInputChange}
                                                placeholder="your.email@example.com"
                                                className={errors.email ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                                disabled={isSubmitting}
                                            />
                                            {errors.email && (
                                                <p className="text-sm text-red-500 mt-1">{errors.email}</p>
                                            )}
                                        </div>
                                    </div>

                                    <div>
                                        <Label htmlFor="subject">Subject *</Label>
                                        <Input
                                            id="subject"
                                            name="subject"
                                            value={formData.subject}
                                            onChange={handleInputChange}
                                            placeholder="What&apos;s this about?"
                                            className={errors.subject ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                            disabled={isSubmitting}
                                        />
                                        {errors.subject && (
                                            <p className="text-sm text-red-500 mt-1">{errors.subject}</p>
                                        )}
                                    </div>

                                    <div>
                                        <Label htmlFor="message">Message *</Label>
                                        <Textarea
                                            id="message"
                                            name="message"
                                            value={formData.message}
                                            onChange={handleInputChange}
                                            placeholder="Tell us more about your question or feedback..."
                                            rows={6}
                                            className={errors.message ? 'border-red-500 focus-visible:ring-red-500' : ''}
                                            disabled={isSubmitting}
                                        />
                                        {errors.message && (
                                            <p className="text-sm text-red-500 mt-1">{errors.message}</p>
                                        )}
                                        <p className="text-xs text-muted-foreground mt-1">
                                            {formData.message.length}/2000 characters
                                        </p>
                                    </div>

                                    <Button
                                        type="submit"
                                        size="lg"
                                        disabled={isSubmitting}
                                        className="w-full gap-2 bg-gradient-to-r from-primary to-purple-600 hover:from-primary/90 hover:to-purple-600/90"
                                    >
                                        {isSubmitting ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Sending Message...
                                            </>
                                        ) : (
                                            <>
                                                <Send className="w-4 h-4" />
                                                Send Message
                                            </>
                                        )}
                                    </Button>

                                    <p className="text-xs text-muted-foreground">
                                        By submitting this form, you agree to our privacy policy. 
                                        We&apos;ll never share your information with third parties.
                                    </p>
                                </form>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
}
