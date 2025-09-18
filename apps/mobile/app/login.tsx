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

export default function LoginScreen() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [showError, setShowError] = useState(false);

  const { login } = useAuth();

  const handleLogin = async () => {
    if (!email || !password) {
      setErrorMessage('Please enter both email and password');
      setShowError(true);
      return;
    }

    setIsLoading(true);
    setErrorMessage('');

    try {
      const response = await login({ email: email.trim(), password });

      if (response.success) {
        // Navigation will be handled by the auth state change
        router.replace('/(tabs)');
      } else {
        setErrorMessage(response.message || 'Login failed');
        setShowError(true);
      }
    } catch {
      setErrorMessage('An unexpected error occurred');
      setShowError(true);
    } finally {
      setIsLoading(false);
    }
  };

  const goToRegister = () => {
    router.push('/register');
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Sign In',
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
                  icon="account-circle"
                  style={{ backgroundColor: '#1976d2', marginBottom: 16 }}
                />
                <Text variant="headlineMedium" style={{ fontWeight: 'bold', marginBottom: 8 }}>
                  Welcome Back!
                </Text>
                <Text variant="bodyLarge" style={{ textAlign: 'center', color: '#666' }}>
                  Sign in to your account to continue shopping
                </Text>
              </View>

              {/* Login Form */}
              <Card style={{ padding: 24, elevation: 4 }}>
                <Text variant="titleLarge" style={{ marginBottom: 24, fontWeight: 'bold' }}>
                  Sign In
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
                  autoComplete="password"
                  left={<TextInput.Icon icon="lock" />}
                  right={
                    <TextInput.Icon
                      icon={showPassword ? 'eye-off' : 'eye'}
                      onPress={() => setShowPassword(!showPassword)}
                    />
                  }
                  style={{ marginBottom: 24 }}
                  disabled={isLoading}
                />

                <Button
                  mode="contained"
                  onPress={handleLogin}
                  loading={isLoading}
                  disabled={isLoading || !email || !password}
                  style={{ marginBottom: 16 }}
                  contentStyle={{ paddingVertical: 8 }}
                >
                  {isLoading ? 'Signing In...' : 'Sign In'}
                </Button>

                {/* Register Link */}
                <View style={{ alignItems: 'center' }}>
                  <Text variant="bodyMedium" style={{ color: '#666' }}>
                    Don't have an account?{' '}
                    <Text
                      variant="bodyMedium"
                      style={{ color: '#1976d2', fontWeight: 'bold' }}
                      onPress={goToRegister}
                    >
                      Sign up here
                    </Text>
                  </Text>
                </View>
              </Card>

              {/* Loading State */}
              {isLoading && (
                <View style={{ alignItems: 'center', marginTop: 24 }}>
                  <ActivityIndicator size="small" />
                  <Text variant="bodyMedium" style={{ marginTop: 8, color: '#666' }}>
                    Signing you in...
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
