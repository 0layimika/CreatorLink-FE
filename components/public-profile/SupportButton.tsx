'use client';

import { useState } from 'react';
import { Heart, X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { giftApi } from '@/lib/api';

interface SupportButtonProps {
  username: string;
}

export function SupportButton({ username }: SupportButtonProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [amount, setAmount] = useState('');
  const [senderName, setSenderName] = useState('');
  const [senderEmail, setSenderEmail] = useState('');
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const presetAmounts = [500, 1000, 2500, 5000];

  const handleSendTip = async () => {
    if (!amount || parseInt(amount) < 100) return;
    if (!senderEmail || !senderEmail.includes('@')) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await giftApi.sendGift({
        creatorUsername: username,
        amount: parseInt(amount),
        sender_email: senderEmail,
        sender_name: senderName || undefined,
        description: message || undefined,
      });

      if (response.success && response.data?.authorization_url) {
        // Navigate to checkout page
        window.location.href = response.data.authorization_url;
      } else {
        setError('Failed to initialize payment');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to send tip');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      <Button
        onClick={() => setIsOpen(true)}
        className="bg-gradient-primary text-white shadow-soft hover:shadow-medium"
      >
        <Heart className="h-4 w-4 mr-2" />
        Support me
      </Button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setIsOpen(false)}
          />
          <div className="relative bg-card border border-border rounded-2xl p-6 w-full max-w-sm shadow-medium">
            <button
              onClick={() => setIsOpen(false)}
              className="absolute top-4 right-4 text-text-secondary hover:text-foreground transition-colors"
            >
              <X className="h-5 w-5" />
            </button>

            {success ? (
              <div className="text-center py-8">
                <div className="h-16 w-16 rounded-full bg-success/10 flex items-center justify-center mx-auto mb-4">
                  <Heart className="h-8 w-8 text-success" />
                </div>
                <h2 className="text-lg font-semibold text-foreground">
                  Thank you!
                </h2>
                <p className="text-sm text-text-secondary mt-1">
                  Your tip has been sent successfully
                </p>
              </div>
            ) : (
              <>
                <div className="text-center mb-6">
                  <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
                    <Heart className="h-6 w-6 text-primary" />
                  </div>
                  <h2 className="text-lg font-semibold text-foreground">
                    Support @{username}
                  </h2>
                  <p className="text-sm text-text-secondary mt-1">
                    Show your appreciation with a tip
                  </p>
                </div>

                {error && (
                  <div className="p-3 rounded-lg bg-error/10 border border-error/20 text-error text-sm mb-4">
                    {error}
                  </div>
                )}

                <div className="grid grid-cols-2 gap-3 mb-4">
                  {presetAmounts.map((preset) => (
                    <button
                      key={preset}
                      onClick={() => setAmount(preset.toString())}
                      className={`p-3 rounded-lg border text-center font-medium transition-all ${amount === preset.toString()
                        ? 'border-primary bg-primary/10 text-primary shadow-soft'
                        : 'border-border text-foreground hover:border-primary/50'
                        }`}
                    >
                      ₦{preset.toLocaleString()}
                    </button>
                  ))}
                </div>

                <div className="mb-4">
                  <Input
                    type="number"
                    placeholder="Enter custom amount"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className="text-center"
                  />
                </div>

                <div className="mb-4">
                  <Input
                    type="text"
                    label="Your Name"
                    placeholder="Enter your name (optional)"
                    value={senderName}
                    onChange={(e) => setSenderName(e.target.value)}
                  />
                </div>

                <div className="mb-4">
                  <Input
                    type="email"
                    label="Your Email"
                    placeholder="Enter your email"
                    value={senderEmail}
                    onChange={(e) => setSenderEmail(e.target.value)}
                    required
                  />
                </div>

                <div className="mb-6">
                  <Input
                    type="text"
                    placeholder="Add a message (optional)"
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                  />
                </div>

                <Button
                  onClick={handleSendTip}
                  className="w-full shadow-soft"
                  disabled={!amount || parseInt(amount) < 100 || !senderEmail || isLoading}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Sending...
                    </>
                  ) : (
                    `Send ₦${amount ? parseInt(amount).toLocaleString() : '0'}`
                  )}
                </Button>

                <p className="text-xs text-text-secondary text-center mt-4">
                  Minimum tip: ₦100
                </p>
              </>
            )}
          </div>
        </div>
      )}
    </>
  );
}
