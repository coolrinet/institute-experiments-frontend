import { apiClient } from '~/lib/api-client';

import { AddUserData } from '~/types/schema';

export async function addUser(data: AddUserData) {
  await apiClient.post('/api/users', {
    first_name: data.firstName,
    last_name: data.lastName,
    middle_name: data.middleName,
    email: data.email,
    is_admin: data.isAdmin,
  });
}
