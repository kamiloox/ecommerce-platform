'use client';

import { FormEvent, useState } from 'react';
import { Card, CardBody, Input, Button, Link, addToast } from '@heroui/react';
import { UserPlusIcon, MailIcon, KeyIcon } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import { useRouter } from 'next/navigation';

const Register = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const { register } = useAuth();
  const router = useRouter();

  // This will automatically redirect if already authenticated
  useAuthNavigation();

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();

    if (password !== passwordConfirm) {
      addToast({ title: 'Passwords do not match', color: 'danger' });
      return;
    }

    setIsLoading(true);

    try {
      const result = await register({ email, password, passwordConfirm });

      if (result.success) {
        addToast({ title: 'Registration successful', color: 'success' });
        router.push('/profile');
      } else {
        addToast({ title: result.message || 'Registration failed', color: 'danger' });
      }
    } catch {
      addToast({ title: 'An unexpected error occurred', color: 'danger' });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full">
      <div className="px-4 py-8 max-w-md mx-auto">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-green-600 rounded-full mx-auto mb-4 flex items-center justify-center">
            <UserPlusIcon size={24} className="text-white" />
          </div>
          <h1 className="text-xl font-bold mb-2">Create Account</h1>
          <p className="text-gray-600 text-sm">Join us to start shopping and get exclusive deals</p>
        </div>

        <Card className="shadow-lg">
          <CardBody className="p-6">
            <form onSubmit={handleSubmit} className="space-y-4">
              <Input
                type="email"
                label="Email"
                placeholder="Enter your email"
                value={email}
                onValueChange={setEmail}
                startContent={<MailIcon size={16} className="text-gray-400" />}
                isRequired
              />
              <Input
                type="password"
                label="Password"
                placeholder="Enter your password"
                value={password}
                onValueChange={setPassword}
                startContent={<KeyIcon size={16} className="text-gray-400" />}
                isRequired
              />
              <Input
                type="password"
                label="Confirm Password"
                placeholder="Confirm your password"
                value={passwordConfirm}
                onValueChange={setPasswordConfirm}
                startContent={<KeyIcon size={16} className="text-gray-400" />}
                isRequired
              />

              <div className="space-y-3 pt-2">
                <Button
                  type="submit"
                  color="primary"
                  className="w-full"
                  isLoading={isLoading}
                  disabled={isLoading}
                >
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Button>

                <div className="text-center pt-2">
                  <p className="text-sm text-gray-600">
                    Already have an account?{' '}
                    <Link href="/login" className="text-primary hover:underline font-medium">
                      Sign In
                    </Link>
                  </p>
                </div>
              </div>
            </form>
          </CardBody>
        </Card>
      </div>
    </div>
  );
};

export default Register;
