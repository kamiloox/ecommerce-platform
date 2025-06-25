'use client';
import { FormEvent, useState } from 'react';
import { Card, CardBody, CardHeader, Input, Button, Link, addToast } from '@heroui/react';
import { LockIcon, MailIcon, KeyIcon } from 'lucide-react';
import wretch from 'wretch';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    wretch('/cms/users/login')
      .headers({ 'Content-Type': 'application/json' })
      .post({ email, password })
      .res(() => addToast({ title: 'Login successful', color: 'success' }))
      .catch(() => addToast({ title: 'Login failed', color: 'danger' }));
  };

  return (
    // <div className="min-h-screen flex items-center justify-center bg-background p-4">
    <div className="flex grow items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader className="flex gap-3">
          <LockIcon size={20} className="text-sky-600" />
          <p className="text-xl font-semibold">Login</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              type="email"
              label="Email"
              placeholder="Enter your email"
              value={email}
              onValueChange={setEmail}
              startContent={<MailIcon size={16} className="text-gray-400" />}
            />
            <Input
              type="password"
              label="Password"
              placeholder="Enter your password"
              value={password}
              onValueChange={setPassword}
              startContent={<KeyIcon size={16} className="text-gray-400" />}
            />
            <div className="flex justify-between items-center">
              <Link href="#" size="sm" className="text-primary">
                Forgot password?
              </Link>
              <Button type="submit" color="primary">
                Sign In
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
};

export default Login;
