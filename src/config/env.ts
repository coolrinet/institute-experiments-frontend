import { z } from 'zod';

function prepareEnv() {
  const EnvSchema = z.object({
    API_URL: z.string().url(),
  });

  const envVars = Object.entries(import.meta.env).reduce<Record<string, string>>(
    (acc, [key, value]) => {
      if (key.startsWith('VITE_')) {
        acc[key.replace('VITE_', '')] = value;
      } else {
        acc[key] = value;
      }

      return acc;
    },
    {}
  );

  const parsedEnv = EnvSchema.safeParse(envVars);

  if (!parsedEnv.success) {
    throw parsedEnv.error;
  }

  return parsedEnv.data;
}

export const ENV = prepareEnv();
