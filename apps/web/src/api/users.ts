import wretch from 'wretch';
import { CurrentUser } from '@repo/cms-types'; // Import types as needed
import { getBaseUrl } from '@/utils/url';

export const getCurrentUser = async () => {
  const baseUrl = getBaseUrl();
  const result = await wretch(`${baseUrl}/cms/users/me`).get().json<CurrentUser>();

  return result;
};
