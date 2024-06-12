import { apiClient } from '~/lib/api-client';

import { EditProfileData } from '~/types/schema';

export async function editProfile(data: EditProfileData) {
  await apiClient.put('/api/profile', {
    first_name: data.firstName,
    last_name: data.lastName,
    middle_name: data.middleName,
    email: data.email,
    is_admin: data.isAdmin,
    new_password: data.newPassword,
    current_password: data.currentPassword,
    current_password_confirmation: data.currentPasswordConfirmation,
  });
}
