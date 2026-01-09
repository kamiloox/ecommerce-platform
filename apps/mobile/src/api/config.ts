import { Platform } from 'react-native';
import { getApiBaseUrl } from '@repo/shared-utils/api';

const rawApiBaseUrl = getApiBaseUrl();

// Fix for Android emulator to access localhost
export const API_BASE_URL = Platform.OS === 'android' 
  ? rawApiBaseUrl.replace('localhost', '10.0.2.2') 
  : rawApiBaseUrl;

export const API_ROOT_URL = API_BASE_URL.replace(/\/api$/, '');
