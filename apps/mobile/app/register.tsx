import React, { useState } from 'react';
import { View, ScrollView, KeyboardAvoidingView, Platform } from 'react-native';
import {
  Card,
  Text,
  TextInput,
  Button,
  ActivityIndicator,
  Avatar,
  Snackbar,
} from 'react-native-paper';
import { router, Stack } from 'expo-router';
import { useAuth } from '../src/contexts/AuthContext';

export default function RegisterScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const { register } = useAuth();

  const handleRegister = async () => {
    if (!email || !password || !confirmPassword) {
      setErrorMessage('Please fill in all fields');
      setShowError(true);
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match');
      setShowError(true);
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters');
      setShowError(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await register({
        email: email.trim(),
        password,
        passwordConfirm: confirmPassword,
      });

      if (response.success) {
        // Navigation will be handled by the auth state change
        router.replace('/(tabs)');
      } else {
        setErrorMessage(response.message || 'Registration failed');
        setShowError(true);
      }
    } catch {
      setErrorMessage('An unexpected error occurred');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const goToLogin = () => {
    router.push('/login');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Sign Up',
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTitleStyle: {
            fontWeight: 'bold',
            fontSize: 18,
          },
          headerTintColor: '#000',
          headerShadowVisible: true,
        }}
      />

      <View style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
            <ScrollView
              contentContainerStyle={{
                flexGrow: 1,
                justifyContent: 'center',
                padding: 16,
              }}
            >
              {/* Welcome Section */}
              <View style={{ alignItems: 'center', marginBottom: 32 }}>
                <Avatar.Icon
                  size={80}
                  icon="account-plus"
                  style={{ backgroundColor: '#1976d2', marginBottom: 16 }}
                />
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                  Join Us!
                </Text>
                <Text variant="bodyLarge" style={{ textAlign: 'center', color: '#666' }}>
                  Create your account to start shopping
                </Text>
              </View>

              {/* Register Form */}
              <Card style={{ padding: 24, elevation: 4 }}>
                <Text variant="titleLarge" style={{ marginBottom: 24, fontWeight: 'bold' }}>
                  Sign Up
                </Text>

                <TextInput
                  label="Email"
                  value={email}
                  onChangeText={setEmail}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoComplete="email"
                  left={<TextInput.Icon icon="email" />}
                  style={{ marginBottom: 16 }}
                  disabled={isLoading}
                />

                <TextInput
                  label="Password"
                  value={password}
                  onChangeText={setPassword}
                  secureTextEntry={!showPassword}
                  autoComplete="password-new"
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  style={{ marginBottom: 16 }}
                  disabled={isLoading}
                />

                <TextInput
                  label="Confirm Password"
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  secureTextEntry={!showConfirmPassword}
                  autoComplete="password-new"
                  left={<TextInput.Icon icon="lock-check" />}
                  right={
                    <TextInput.Icon
                      icon={showConfirmPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                    />
                  }
                  style={{ marginBottom: 24 }}
                  disabled={isLoading}
                />

                <Button
                  mode="contained"
                  onPress={handleRegister}
                  loading={isLoading}
                  disabled={isLoading || !email || !password || !confirmPassword}
                  style={{ marginBottom: 16 }}
                  contentStyle={{ paddingVertical: 8 }}
                >
                  {isLoading ? 'Creating Account...' : 'Sign Up'}
                </Button>

                {/* Login Link */}
                <View style={{ alignItems: 'center' }}>
                  <Text variant="bodyMedium" style={{ color: '#666' }}>
                    Already have an account?{' '}
                    <Text
                      variant="bodyMedium"
                      style={{ color: '#1976d2', fontWeight: 'bold' }}
                      onPress={goToLogin}
                    >
                      Sign in here
                    </Text>
                  </Text>
                </View>
              </Card>

              {/* Loading State */}
              {isLoading && (
                <View style={{ alignItems: 'center', marginTop: 24 }}>
                  <ActivityIndicator size="small" />
                  <Text variant="bodyMedium" style={{ marginTop: 8, color: '#666' }}>
                    Creating your account...
                  </Text>
                </View>
              )}
            </ScrollView>
          </KeyboardAvoidingView>

          {/* Error Snackbar */}
          <Snackbar
            visible={showError}
            onDismiss={() => setShowError(false)}
            duration={4000}
            action={{
              label: 'Dismiss',
              onPress: () => setShowError(false),
            }}
          >
            {errorMessage}
          </Snackbar>
        </View>
    </>
  );
}
