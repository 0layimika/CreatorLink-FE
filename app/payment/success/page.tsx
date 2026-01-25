'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, Heart } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { giftApi } from '@/lib/api';

function PaymentSuccessContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const [status, setStatus] = useState<'loading' | 'success' | 'failed' | 'pending'>('loading');
    const [error, setError] = useState<string | null>(null);
    const reference = searchParams.get('reference') || searchParams.get('trxref');

    useEffect(() => {
        const verifyPayment = async () => {
            if (!reference) {
                setError('No payment reference found');
                setStatus('failed');
                return;
            }

            try {
                const response = await giftApi.verifyGift(reference);

                if (response.success && response.data) {
                    if (response.data.status === 'completed') {
                        setStatus('success');
                    } else if (response.data.status === 'failed') {
                        setStatus('failed');
                        setError('Payment was not successful');
                    } else {
                        setStatus('pending');
                    }
                } else {
                    setStatus('failed');
                    setError(response.message || 'Failed to verify payment');
                }
            } catch (err) {
                setStatus('failed');
                setError(err instanceof Error ? err.message : 'Failed to verify payment');
            }
        };

        verifyPayment();
    }, [reference]);

    return (
        <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-secondary/5">
            <Card className="w-full max-w-md shadow-medium">
                <CardContent className="p-8">
                    {status === 'loading' && (
                        <div className="text-center py-8">
                            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-foreground mb-2">
                                Verifying Payment
                            </h2>
                            <p className="text-sm text-text-secondary">
                                Please wait while we confirm your payment...
                            </p>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="text-center py-8">
                            <div className="h-20 w-20 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-6">
                                <CheckCircle className="h-12 w-12 text-success" />
                            </div>
                            <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                                <Heart className="h-8 w-8 text-primary" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">
                                Thank You!
                            </h2>
                            <p className="text-lg text-text-secondary mb-6">
                                Your tip has been sent successfully
                            </p>
                            <p className="text-sm text-text-secondary mb-8">
                                The creator will receive your support shortly. We appreciate your generosity!
                            </p>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => router.push('/')}
                                    className="w-full shadow-soft"
                                >
                                    Go to Homepage
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="w-full"
                                >
                                    Go Back
                                </Button>
                            </div>
                        </div>
                    )}

                    {status === 'failed' && (
                        <div className="text-center py-8">
                            <div className="h-20 w-20 rounded-full bg-error/10 flex items-center justify-center mx-auto mb-6">
                                <XCircle className="h-12 w-12 text-error" />
                            </div>
                            <h2 className="text-2xl font-bold text-foreground mb-2">
                                Payment Failed
                            </h2>
                            <p className="text-text-secondary mb-6">
                                {error || 'Your payment could not be processed. Please try again.'}
                            </p>
                            <div className="space-y-3">
                                <Button
                                    onClick={() => router.push('/')}
                                    className="w-full shadow-soft"
                                >
                                    Go to Homepage
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => router.back()}
                                    className="w-full"
                                >
                                    Try Again
                                </Button>
                            </div>
                        </div>
                    )}

                    {status === 'pending' && (
                        <div className="text-center py-8">
                            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-foreground mb-2">
                                Payment Pending
                            </h2>
                            <p className="text-text-secondary mb-6">
                                Your payment is being processed. Please check back in a few moments.
                            </p>
                            <Button
                                onClick={() => router.push('/')}
                                className="w-full shadow-soft"
                            >
                                Go to Homepage
                            </Button>
                        </div>
                    )}

                    {reference && (
                        <div className="mt-6 pt-6 border-t border-border">
                            <p className="text-xs text-text-secondary text-center">
                                Reference: <span className="font-mono">{reference}</span>
                            </p>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}

export default function PaymentSuccessPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-primary/5 to-secondary/5">
                <Card className="w-full max-w-md shadow-medium">
                    <CardContent className="p-8">
                        <div className="text-center py-8">
                            <Loader2 className="h-16 w-16 animate-spin text-primary mx-auto mb-4" />
                            <h2 className="text-xl font-semibold text-foreground mb-2">
                                Loading...
                            </h2>
                        </div>
                    </CardContent>
                </Card>
            </div>
        }>
            <PaymentSuccessContent />
        </Suspense>
    );
}

