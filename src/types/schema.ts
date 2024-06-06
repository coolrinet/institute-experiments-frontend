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

export const addUserSchema = z.object({
  lastName: z
    .string()
    .min(1, 'Данное поле является обязательным')
    .max(255, 'Длина данного поля не должна превышать 255 символов'),
  firstName: z
    .string()
    .min(1, 'Данное поле является обязательным')
    .max(255, 'Длина данного поля не должна превышать 255 символов'),
  middleName: z.string().max(255, 'Длина данного поля не должна превышать 255 символов').optional(),
  email: z
    .string()
    .min(1, 'Данное поле является обязательным')
    .email('Введите корректный email')
    .max(255, 'Длина данного поля не должна превышать 255 символов'),
  isAdmin: z.boolean().default(false),
});
export type AddUserData = z.infer<typeof addUserSchema>;

export const machinerySchema = z.object({
  name: z
    .string()
    .min(1, 'Данное поле является обязательным')
    .max(255, 'Длина данного поля не должна превышать 255 символов'),
  description: z.string().nullable(),
});
export type MachineryData = z.infer<typeof machinerySchema>;

export const machineryParameterSchema = z.object({
  name: z
    .string()
    .min(1, 'Данное поле является обязательным')
    .max(255, 'Длина данного поля не должна превышать 255 символов'),
  parameterType: z.enum(['input', 'output'], {
    required_error: 'Данное поле является обязательным',
  }),
  valueType: z.enum(['quantitative', 'quality'], {
    required_error: 'Данное поле является обязательным',
  }),
  machineryId: z.coerce.number().nullable(),
});
export type MachineryParameterData = z.infer<typeof machineryParameterSchema>;
