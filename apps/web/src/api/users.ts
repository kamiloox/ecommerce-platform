import wretch from 'wretch';
import { CurrentUser } from '@repo/cms-types'; // Import types as needed
import { getBaseUrl } from '@/utils/url';
import authService from './auth';

export const getCurrentUser = async () => {
  const baseUrl = getBaseUrl();
  const result = await wretch(`${baseUrl}/cms/users/me`)
    .headers(authService.getAuthHeaders())
    .get()
    .json<CurrentUser>();

  return result;
};
