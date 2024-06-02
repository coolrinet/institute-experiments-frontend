import { z } from 'zod';

export const loginSchema = z.object({
  email: z.string().min(1, 'Данное поле является обязательным').email('Введите корректный email'),
  password: z.string().min(1, 'Данное поле является обязательным'),
  shouldRemember: z.boolean().default(false),
});
export type LoginData = z.infer<typeof loginSchema>;

export const forgotPasswordSchema = loginSchema.pick({ email: true });
export type ForgotPasswordData = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
  .object({
    password: z.string().min(8, 'Длина пароля должна быть не менее 8 символов'),
    passwordConfirmation: z.string(),
  })
  .refine(({ password, passwordConfirmation }) => password === passwordConfirmation, {
    message: 'Пароли не совпадают',
    path: ['passwordConfirmation'],
  });
export type ResetPasswordData = z.infer<typeof resetPasswordSchema> & {
  token: string;
  email: string;
};
