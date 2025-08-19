'use client';

import React from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useAuthNavigation } from '@/hooks/useAuthNavigation';
import { AuthLoading } from '@/components/auth/AuthLoading';
import { Card, CardBody, Button, Avatar, Divider, addToast } from '@heroui/react';
import { UserIcon, HistoryIcon, SettingsIcon, LogOutIcon, EditIcon } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { User } from '@repo/cms-types';

// Separate component for authenticated profile view to prevent flashing
interface AuthenticatedProfileViewProps {
  user: User;
  onLogout: () => void;
  onComingSoon: (feature: string) => void;
  router: ReturnType<typeof useRouter>;
}

const AuthenticatedProfileView: React.FC<AuthenticatedProfileViewProps> = ({
  user,
  onLogout,
  onComingSoon,
  router,
}) => {
  return (
    <div className="w-full pb-6">
      <div className="space-y-4 px-4 max-w-4xl mx-auto pt-8">
        {/* User Info Card */}
        <Card className="shadow-lg">
          <CardBody className="text-center py-8">
            <Avatar icon={<UserIcon />} className="w-20 h-20 bg-blue-600 text-white mx-auto mb-4" />
            <h2 className="text-xl font-semibold mb-1">Welcome Back!</h2>
            <p className="text-blue-600 font-semibold">{user.email}</p>
          </CardBody>
        </Card>

        {/* Account Details Card */}
        <Card className="shadow-lg">
          <CardBody className="p-6">
            <h3 className="text-lg font-semibold mb-4">Account Details</h3>

            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-gray-600">User ID:</span>
                <span className="font-semibold">{user.id}</span>
              </div>

              <Divider />

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Email:</span>
                <span className="font-semibold">{user.email}</span>
              </div>

              <Divider />

              <div className="flex justify-between items-center">
                <span className="text-gray-600">Member Since:</span>
                <span className="font-semibold">
                  {user.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                </span>
              </div>
            </div>
          </CardBody>
        </Card>

        {/* Action Menu Cards */}
        <div className="space-y-3">
          {/* Profile Settings */}
          <Card className="shadow-lg">
            <CardBody className="p-4">
              <Button
                variant="light"
                className="w-full justify-start text-left p-3"
                startContent={<EditIcon size={20} className="text-gray-600" />}
                onPress={() => onComingSoon('Profile Settings')}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">Edit Profile</span>
                  <span className="text-sm text-gray-600">Update your personal information</span>
                </div>
              </Button>
            </CardBody>
          </Card>

          {/* Order History */}
          <Card className="shadow-lg">
            <CardBody className="p-4">
              <Button
                variant="light"
                className="w-full justify-start text-left p-3"
                startContent={<HistoryIcon size={20} className="text-gray-600" />}
                onPress={() => router.push('/orders')}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">Order History</span>
                  <span className="text-sm text-gray-600">View your past orders and tracking</span>
                </div>
              </Button>
            </CardBody>
          </Card>

          {/* Settings */}
          <Card className="shadow-lg">
            <CardBody className="p-4">
              <Button
                variant="light"
                className="w-full justify-start text-left p-3"
                startContent={<SettingsIcon size={20} className="text-gray-600" />}
                onPress={() => onComingSoon('Settings')}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">Settings</span>
                  <span className="text-sm text-gray-600">Manage your account preferences</span>
                </div>
              </Button>
            </CardBody>
          </Card>

          {/* Logout */}
          <Card className="shadow-lg">
            <CardBody className="p-4">
              <Button
                variant="light"
                className="w-full justify-start text-left p-3 text-red-600"
                startContent={<LogOutIcon size={20} className="text-red-600" />}
                onPress={onLogout}
              >
                <div className="flex flex-col items-start">
                  <span className="font-medium">Logout</span>
                  <span className="text-sm text-red-500">Sign out of your account</span>
                </div>
              </Button>
            </CardBody>
          </Card>
        </div>
      </div>
    </div>
  );
};

const ProfilePage = () => {
  const { user, isAuthenticated, isLoading, logout } = useAuth();
  const { navigateToAuth } = useAuthNavigation();
  const router = useRouter();

  // Immediate client-side auth check to prevent flash
  const hasStoredAuth =
    typeof window !== 'undefined' &&
    localStorage.getItem('auth_token') &&
    localStorage.getItem('auth_user');

  const handleLogout = async () => {
    const confirmed = window.confirm('Are you sure you want to logout?');
    if (confirmed) {
      await logout();
      addToast({
        title: '👋 Logged Out',
        description: 'You have been logged out successfully. You can still browse products!',
        color: 'success',
      });
      router.push('/');
    }
  };

  const handleComingSoon = (feature: string) => {
    addToast({
      title: 'Coming Soon',
      description: `${feature} will be available soon!`,
      color: 'warning',
    });
  };

  // Show loading only if we're truly initializing and don't have stored auth
  if (isLoading && !hasStoredAuth) {
    return <AuthLoading title="Profile" />;
  }

  // If we have stored auth data but context isn't ready yet, show authenticated view
  if (hasStoredAuth && !isAuthenticated && isLoading) {
    // Parse stored user for immediate display
    const storedUserString = localStorage.getItem('auth_user');
    if (storedUserString) {
      try {
        const storedUser = JSON.parse(storedUserString);
        return (
          <AuthenticatedProfileView
            user={storedUser}
            onLogout={handleLogout}
            onComingSoon={handleComingSoon}
            router={router}
          />
        );
      } catch (error) {
        console.error('Error parsing stored user:', error);
      }
    }
  }

  // Authenticated view - use context user
  if (isAuthenticated && user) {
    return (
      <AuthenticatedProfileView
        user={user}
        onLogout={handleLogout}
        onComingSoon={handleComingSoon}
        router={router}
      />
    );
  }

  // Safety check - show loading if authenticated but no user
  if (isAuthenticated && !user) {
    return <AuthLoading title="Profile" />;
  }

  // Default: show unauthenticated view
  return (
    <div className="w-full">
      <div className="px-4 py-8">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gray-200 rounded-full mx-auto mb-4 flex items-center justify-center">
            <svg className="w-6 h-6 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
              <path
                fillRule="evenodd"
                d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h2 className="text-xl font-medium mb-2">Welcome!</h2>
          <p className="text-gray-600 mb-6">
            Create an account or sign in to access your profile, view orders, and more.
          </p>
        </div>

        <div className="space-y-4 max-w-sm mx-auto">
          <Button onPress={() => navigateToAuth('login')} color="primary" className="w-full">
            Sign In
          </Button>
          <Button onPress={() => navigateToAuth('register')} variant="bordered" className="w-full">
            Create Account
          </Button>
        </div>
      </div>
    </div>
  );
};
export default ProfilePage;
