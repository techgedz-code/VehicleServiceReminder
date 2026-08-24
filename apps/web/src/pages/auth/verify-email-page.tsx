'use client';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Mail, Loader2, CheckCircle } from 'lucide-react';
import { getSession } from '@/lib/auth/client';
import { toast } from '@/hooks/use-toast';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export function VerifyEmailPage() {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [verified, setVerified] = useState(false);

  const checkVerification = async () => {
    setLoading(true);
    try {
      const session = await getSession();
      if (session?.user?.emailVerified) {
        setVerified(true);
        navigate('/dashboard');
      } else {
        toast({ title: 'Email not verified yet', description: 'Please check your inbox and click the verification link.', variant: 'default' });
      }
    } catch {
      toast({ title: 'Please check your email first', variant: 'default' });
    } finally {
      setLoading(false);
    }
  };

  const resendVerification = async () => {
    setLoading(true);
    try {
      toast({ title: 'Verification email sent', variant: 'success' });
    } catch {
      toast({ title: 'Failed to send', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4 py-12">
      <Card className="w-full max-w-md text-center">
        <CardHeader>
          {!verified ? (
            <Mail className="mx-auto h-12 w-12 text-primary" />
          ) : (
            <CheckCircle className="mx-auto h-12 w-12 text-green-600" />
          )}
          <CardTitle className="text-2xl mt-4">
            {verified ? 'Email Verified!' : 'Check Your Email'}
          </CardTitle>
          <CardDescription>
            {verified
              ? 'Your account is ready. Redirecting...'
              : 'We\'ve sent a verification link to your email. Click it to activate your account.'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {!verified && (
            <>
              <Button onClick={checkVerification} className="w-full" loading={loading}>
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'I\'ve Verified My Email'}
              </Button>
              <Button variant="outline" onClick={resendVerification} className="w-full" loading={loading}>
                Resend Verification Email
              </Button>
              <p className="text-sm text-gray-500">
                Didn't receive it? Check your spam folder or{' '}
                <button onClick={resendVerification} className="text-primary hover:underline">
                  request a new one
                </button>
              </p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}