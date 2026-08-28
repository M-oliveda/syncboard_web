import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowRight, KeyRound } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { OriginInputPassword } from "@/components/ui/input-password";
import { useResetPasswordMutation } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/api-error";
import { type ResetPasswordFormValues, resetPasswordSchema } from "@/lib/auth-schemas";

export function ResetPasswordPage() {
    const { token } = useSearch({ from: "/reset-password" });
    const navigate = useNavigate();
    const resetPasswordMutation = useResetPasswordMutation();
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
    });

    async function onSubmit(values: ResetPasswordFormValues) {
        try {
            await resetPasswordMutation.mutateAsync({
                token,
                newPassword: values.newPassword,
            });
        } catch {
            return;
        }
        await navigate({ to: "/login" });
    }

    return (
        <AuthCard
            icon={
                <div className="bg-primary text-on-primary flex size-12 items-center justify-center rounded-full shadow-md">
                    <KeyRound className="size-5" aria-hidden="true" />
                </div>
            }
            title="Choose a new password"
            description="Set a new password for your SyncBoard account."
            footer={
                <>
                    Remembered your password?{" "}
                    <Link
                        to="/login"
                        className="text-primary font-medium underline-offset-4 hover:underline"
                    >
                        Log in here
                    </Link>
                </>
            }
        >
            <form
                noValidate
                className="gap-stack-md flex flex-col"
                onSubmit={(event) => void handleSubmit(onSubmit)(event)}
            >
                <Controller
                    control={control}
                    name="newPassword"
                    render={({ field }) => (
                        <OriginInputPassword
                            id="newPassword"
                            label="New password"
                            placeholder="••••••••"
                            required
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            aria-invalid={errors.newPassword ? true : undefined}
                        />
                    )}
                />
                {errors.newPassword && (
                    <p className="text-error text-body-sm">
                        {errors.newPassword.message}
                    </p>
                )}

                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="confirmPassword">Confirm new password</Label>
                    <Input
                        id="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        required
                        aria-invalid={errors.confirmPassword ? true : undefined}
                        {...register("confirmPassword")}
                    />
                    {errors.confirmPassword && (
                        <p className="text-error text-body-sm">
                            {errors.confirmPassword.message}
                        </p>
                    )}
                </div>

                {resetPasswordMutation.isError && (
                    <p className="text-error text-body-sm" role="alert">
                        {getApiErrorMessage(
                            resetPasswordMutation.error,
                            "This reset link is invalid or has expired.",
                        )}
                    </p>
                )}

                <Button
                    type="submit"
                    size="lg"
                    className="group mt-2"
                    disabled={resetPasswordMutation.isPending}
                >
                    {resetPasswordMutation.isPending ? "Resetting…" : "Reset password"}
                    <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                    />
                </Button>
            </form>
        </AuthCard>
    );
}
