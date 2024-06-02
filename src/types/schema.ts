import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Данное поле является обязательным').email('Введите корректный email'),
  password: z.string().min(1, 'Данное поле является обязательным'),
  shouldRemember: z.boolean().default(false),
});

export type LoginData = z.infer<typeof loginSchema>;
