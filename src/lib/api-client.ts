import axios from 'axios';

import { ENV } from '~/config/env';

export const apiClient = axios.create({
  baseURL: ENV.API_URL,
  headers: {
    Accept: 'application/json',
  },
  withCredentials: true,
  withXSRFToken: true,
});
