import { User } from '~/types/api';

export function getUserFullName(user: User['data']) {
  let result = `${user.lastName} ${user.firstName[0]}.`;

  if (user.middleName) {
    result += ` ${user.middleName[0]}.`;
  }

  return result;
}
