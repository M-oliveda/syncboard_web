import { z } from "zod";

/** Mirrors the backend's PasswordPolicySchema (`api/src/routes/v1/auth.schema.ts`) —
 * at least 8 chars, at most 72 (bcrypt truncates beyond that), one letter and one
 * digit. Deliberately looser than `defaultPasswordRules`' UI strength indicator, which
 * is only cosmetic — this is what the server actually accepts or rejects. */
const passwordPolicySchema = z
    .string()
    .min(8, "At least 8 characters")
    .max(72, "72 characters or fewer")
    .regex(/(?=.*[A-Za-z])(?=.*\d)/, "Must contain a letter and a number");

const emailSchema = z.string().trim().toLowerCase().email("Enter a valid email");

export const loginSchema = z.object({
    email: emailSchema,
    password: z.string().min(1, "Password is required"),
});
export type LoginFormValues = z.infer<typeof loginSchema>;

export const registerSchema = z
    .object({
        fullName: z.string().trim().min(1, "Full name is required"),
        email: emailSchema,
        password: passwordPolicySchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.password === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });
export type RegisterFormValues = z.infer<typeof registerSchema>;

export const forgotPasswordSchema = z.object({
    email: emailSchema,
});
export type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

export const resetPasswordSchema = z
    .object({
        newPassword: passwordPolicySchema,
        confirmPassword: z.string(),
    })
    .refine((data) => data.newPassword === data.confirmPassword, {
        message: "Passwords do not match",
        path: ["confirmPassword"],
    });
export type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>;
