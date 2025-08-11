import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Mail, CheckCircle, AlertCircle, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const EmailConfirmation: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();
  const [isResending, setIsResending] = useState(false);
  const [email, setEmail] = useState('');
  const [userType, setUserType] = useState<'buyer' | 'seller'>('buyer');

  useEffect(() => {
    // Get email and userType from URL params or localStorage
    const emailParam = searchParams.get('email');
    const userTypeParam = searchParams.get('userType') as 'buyer' | 'seller';
    
    if (emailParam) {
      setEmail(emailParam);
    } else {
      // Try to get from localStorage (set during signup)
      const storedEmail = localStorage.getItem('pending_confirmation_email');
      if (storedEmail) {
        setEmail(storedEmail);
      }
    }

    if (userTypeParam) {
      setUserType(userTypeParam);
    } else {
      // Try to get from localStorage
      const storedUserType = localStorage.getItem('pending_confirmation_userType') as 'buyer' | 'seller';
      if (storedUserType) {
        setUserType(storedUserType);
      }
    }
  }, [searchParams]);

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        title: "Error",
        description: "Email address not found. Please try signing up again.",
        variant: "destructive",
      });
      return;
    }

    setIsResending(true);
    try {
      const { error } = await supabase.auth.resend({
        type: 'signup',
        email: email,
        options: {
          emailRedirectTo: `${window.location.origin}/auth/callback?userType=${userType}`
        }
      });

      if (error) throw error;

      toast({
        title: "Confirmation email sent",
        description: "Please check your email for the confirmation link.",
      });
    } catch (error: any) {
      console.error('Resend confirmation error:', error);
      toast({
        title: "Failed to resend email",
        description: error.message || "Please try again later.",
        variant: "destructive",
      });
    } finally {
      setIsResending(false);
    }
  };

  const handleBackToSignup = () => {
    // Clear stored data
    localStorage.removeItem('pending_confirmation_email');
    localStorage.removeItem('pending_confirmation_userType');
    navigate('/signup');
  };

  return (
    <div className="min-h-screen bg-gradient-warm flex items-center justify-center p-4">
      <Card className="w-full max-w-md p-8 glass-card">
        <div className="text-center space-y-6">
          {/* Icon */}
          <div className="w-16 h-16 bg-gradient-matcha rounded-2xl flex items-center justify-center mx-auto shadow-glow">
            <Mail className="w-8 h-8 text-white" />
          </div>

          {/* Title */}
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Check Your Email
            </h1>
            <p className="text-muted-foreground">
              We've sent a confirmation link to
            </p>
            {email && (
              <p className="font-semibold text-foreground mt-1">
                {email}
              </p>
            )}
          </div>

          {/* Instructions */}
          <div className="space-y-4 text-sm text-muted-foreground">
            <div className="flex items-start gap-3 p-4 bg-muted/20 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-foreground mb-1">Next Steps:</p>
                <ol className="list-decimal list-inside space-y-1">
                  <li>Check your email inbox (and spam folder)</li>
                  <li>Click the confirmation link</li>
                  <li>You'll be redirected to sign in as a {userType}</li>
                  {userType === 'seller' && (
                    <li>Complete your seller profile to start selling</li>
                  )}
                </ol>
              </div>
            </div>

            <div className="flex items-start gap-3 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
              <AlertCircle className="w-5 h-5 text-yellow-600 mt-0.5 flex-shrink-0" />
              <div className="text-left">
                <p className="font-medium text-yellow-800 mb-1">Important:</p>
                <p className="text-yellow-700">
                  Don't try to sign in before confirming your email. 
                  The confirmation link will automatically sign you in.
                </p>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <Button
              onClick={handleResendConfirmation}
              disabled={isResending || !email}
              variant="outline"
              className="w-full"
            >
              {isResending ? (
                <>
                  <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                  Sending...
                </>
              ) : (
                <>
                  <Mail className="w-4 h-4 mr-2" />
                  Resend Confirmation Email
                </>
              )}
            </Button>

            <Button
              onClick={handleBackToSignup}
              variant="ghost"
              className="w-full text-muted-foreground"
            >
              Back to Sign Up
            </Button>
          </div>

          {/* Help */}
          <div className="text-xs text-muted-foreground">
            <p>
              Having trouble? The confirmation link is valid for 24 hours.
              If you still can't access your account, try signing up again.
            </p>
          </div>
        </div>
      </Card>
    </div>
  );
};

export default EmailConfirmation;
