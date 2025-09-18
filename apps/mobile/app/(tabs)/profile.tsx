import React from 'react';
import { ScrollView, View, Alert } from 'react-native';
import { Card, Text, Button, Avatar, Surface, Divider } from 'react-native-paper';
import { SafeAreaProvider, SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { router } from 'expo-router';
import { useAuth } from '../../src/contexts/AuthContext';

export default function ProfileScreen() {
  const { user, logout, isAuthenticated, isLoading } = useAuth();
  const insets = useSafeAreaInsets();

  const handleLogout = async () => {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Logout',
        style: 'destructive',
        onPress: async () => {
          await logout();
          // Don't redirect to login - let users continue browsing
          Alert.alert(
            '👋 Logged Out',
            'You have been logged out successfully. You can still browse products!',
            [
              { text: 'Browse Products', onPress: () => router.navigate('/(tabs)') },
              { text: 'OK', style: 'default' },
            ],
          );
        },
      },
    ]);
  };

  if (isLoading) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
          <Text variant="bodyMedium">Loading...</Text>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  if (!isAuthenticated || !user) {
    return (
      <SafeAreaProvider>
        <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
          <Surface
            style={{
              paddingHorizontal: 16,
              paddingVertical: 8,
              paddingTop: Math.max(8, insets.top),
              elevation: 2,
            }}
          >
            <Text variant="headlineSmall" style={{ marginBottom: 8, textAlign: 'center' }}>
              Profile
            </Text>
          </Surface>

          <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 32 }}>
            <Avatar.Icon
              size={64}
              icon="account-circle"
              style={{ backgroundColor: '#e0e0e0', marginBottom: 16 }}
            />
            <Text variant="headlineSmall" style={{ marginBottom: 8 }}>
              Welcome!
            </Text>
            <Text
              variant="bodyMedium"
              style={{ textAlign: 'center', color: '#666', marginBottom: 24 }}
            >
              Login to access your profile and manage your account
            </Text>
            <View style={{ flexDirection: 'column', gap: 12, width: '100%' }}>
              <Button mode="contained" onPress={() => router.push('/login')} icon="login">
                Login
              </Button>
              <Button mode="outlined" onPress={() => router.push('/register')} icon="account-plus">
                Create Account
              </Button>
              <Button mode="text" onPress={() => router.navigate('/(tabs)')} icon="shopping">
                Continue Browsing
              </Button>
            </View>
          </View>
        </SafeAreaView>
      </SafeAreaProvider>
    );
  }

  return (
    <SafeAreaProvider>
      <SafeAreaView style={{ flex: 1, backgroundColor: '#f5f5f5' }}>
        <Surface
          style={{
            paddingHorizontal: 16,
            paddingVertical: 8,
            paddingTop: Math.max(8, insets.top),
            elevation: 2,
          }}
        >
          <Text variant="headlineSmall" style={{ marginBottom: 8, textAlign: 'center' }}>
            Profile
          </Text>
        </Surface>

        <ScrollView contentContainerStyle={{ padding: 16, paddingBottom: 100 }}>
          {/* User Info Card */}
          <Card style={{ marginBottom: 16, elevation: 4, borderRadius: 12 }} mode="elevated">
            <Card.Content style={{ alignItems: 'center', paddingVertical: 24 }}>
              <Avatar.Icon
                size={80}
                icon="account"
                style={{ backgroundColor: '#1976d2', marginBottom: 16 }}
              />
              <Text variant="headlineSmall" style={{ marginBottom: 4 }}>
                Welcome Back!
              </Text>
              <Text variant="bodyLarge" style={{ color: '#1976d2', fontWeight: 'bold' }}>
                {user.email}
              </Text>
            </Card.Content>
          </Card>

          {/* Account Details Card */}
          <Card style={{ marginBottom: 16, elevation: 4, borderRadius: 12 }} mode="elevated">
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 16 }}>
                Account Details
              </Text>

              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}
              >
                <Text variant="bodyMedium" style={{ color: '#666' }}>
                  User ID:
                </Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  {user.id}
                </Text>
              </View>

              <Divider style={{ marginVertical: 8 }} />

              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}
              >
                <Text variant="bodyMedium" style={{ color: '#666' }}>
                  Email:
                </Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  {user.email}
                </Text>
              </View>

              <Divider style={{ marginVertical: 8 }} />

              <View
                style={{ flexDirection: 'row', justifyContent: 'space-between', marginBottom: 12 }}
              >
                <Text variant="bodyMedium" style={{ color: '#666' }}>
                  Account Type:
                </Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  User
                </Text>
              </View>

              <Divider style={{ marginVertical: 8 }} />

              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text variant="bodyMedium" style={{ color: '#666' }}>
                  Member Since:
                </Text>
                <Text variant="bodyMedium" style={{ fontWeight: 'bold' }}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </View>
            </Card.Content>
          </Card>

          {/* Actions Card */}
          <Card style={{ marginBottom: 16, elevation: 4, borderRadius: 12 }} mode="elevated">
            <Card.Content>
              <Text variant="titleMedium" style={{ marginBottom: 16 }}>
                Account Actions
              </Text>

              <Button
                mode="outlined"
                icon="account-edit"
                style={{ marginBottom: 12 }}
                onPress={() => {
                  // TODO: Implement edit profile
                  Alert.alert('Coming Soon', 'Profile editing will be available soon!');
                }}
              >
                Edit Profile
              </Button>

              <Button
                mode="outlined"
                icon="history"
                style={{ marginBottom: 12 }}
                onPress={() => router.push('/orders')}
              >
                Order History
              </Button>

              <Button
                mode="outlined"
                icon="cog"
                style={{ marginBottom: 12 }}
                onPress={() => {
                  // TODO: Implement settings
                  Alert.alert('Coming Soon', 'Settings will be available soon!');
                }}
              >
                Settings
              </Button>
            </Card.Content>
          </Card>

          {/* Logout Card */}
          <Card
            style={{ elevation: 4, borderRadius: 12, borderColor: '#f44336', borderWidth: 1 }}
            mode="elevated"
          >
            <Card.Content>
              <Button
                mode="contained"
                icon="logout"
                buttonColor="#f44336"
                textColor="white"
                onPress={handleLogout}
              >
                Logout
              </Button>
            </Card.Content>
          </Card>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
}
