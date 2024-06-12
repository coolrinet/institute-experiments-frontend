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
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
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
  middleName: z.string().max(255, 'Длина данного поля не должна превышать 255 символов').nullish(),
  email: z
    .string()
    .min(1, 'Данное поле является обязательным')
    .email('Введите корректный email')
    .max(255, 'Длина данного поля не должна превышать 255 символов'),
  isAdmin: z.boolean().default(false),
});
export type AddUserData = z.infer<typeof addUserSchema>;

export const editProfileSchema = addUserSchema
  .extend({
    newPassword: z.string().min(8, 'Длина пароля должна быть не менее 8 символов').nullish(),
    currentPassword: z.string().min(1, 'Введите текущий пароль для изменения данных'),
    currentPasswordConfirmation: z.string().min(1, 'Данное поле является обязательным'),
  })
  .refine(
    ({ currentPassword, currentPasswordConfirmation }) =>
      currentPassword === currentPasswordConfirmation,
    {
      message: 'Пароли не совпадают',
      path: ['newPassword', 'currentPasswordConfirmation'],
    }
  );
export type EditProfileData = z.infer<typeof editProfileSchema>;

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

const researchBaseSchema = z.object({
  name: z
    .string()
    .min(1, 'Данное поле является обязательным')
    .max(255, 'Длина данного поля не должна превышать 255 символов'),
  description: z.string().nullable(),
  machineryId: z.coerce
    .number()
    .nullable()
    .transform((value, ctx): number => {
      if (value === null) {
        ctx.addIssue({
          code: 'invalid_type',
          message: 'Данное поле является обязательным',
          expected: 'number',
          received: 'null',
        });
        return z.NEVER;
      }
      return value;
    }),
});
const privateResearchSchema = z.object({
  isPublic: z.literal(false),
  participants: z.array(z.coerce.number()).optional(),
});
const publicResearchSchema = z.object({
  isPublic: z.literal(true),
});
export const researchSchema = z
  .discriminatedUnion('isPublic', [publicResearchSchema, privateResearchSchema])
  .and(researchBaseSchema);
export type ResearchData = z.infer<typeof researchSchema>;

const parameterValuesBaseSchema = z.object({
  parameterId: z.number(),
});
const quantitativeValuesSchema = parameterValuesBaseSchema
  .merge(
    z.object({
      value: z.number({
        required_error: 'Данное поле является обязательным',
        invalid_type_error: 'Некорректное значение',
      }),
    })
  )
  .array();
const qualityValuesSchema = parameterValuesBaseSchema
  .merge(
    z.object({
      value: z
        .string()
        .min(1, 'Данное поле является обязательным')
        .max(255, 'Длина данного поля не должна превышать 255 символов'),
    })
  )
  .array();

export const experimentSchema = z.object({
  name: z
    .string()
    .min(1, 'Данное поле является обязательным')
    .max(255, 'Длина данного поля не должна превышать 255 символов'),
  date: z.date({
    required_error: 'Данное поле является обязательным',
    invalid_type_error: 'Некорректная дата',
  }),
  quantitativeInputs: quantitativeValuesSchema,
  qualityInputs: qualityValuesSchema,
  quantitativeOutputs: quantitativeValuesSchema,
  qualityOutputs: qualityValuesSchema,
});
export type ExperimentData = z.infer<typeof experimentSchema>;
