import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate, useSearch } from "@tanstack/react-router";
import { ArrowRight, Mail, User, UserPlus } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OriginInputPassword } from "@/components/ui/input-password";
import { Label } from "@/components/ui/label";
import { useRegisterMutation } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/api-error";
import { type RegisterFormValues, registerSchema } from "@/lib/auth-schemas";

export function RegisterPage() {
    const { email } = useSearch({ from: "/register" });
    const navigate = useNavigate();
    const registerMutation = useRegisterMutation();
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<RegisterFormValues>({
        resolver: zodResolver(registerSchema),
        defaultValues: { email: email ?? "" },
    });

    async function onSubmit(values: RegisterFormValues) {
        try {
            await registerMutation.mutateAsync({
                email: values.email,
                password: values.password,
            });
        } catch {
            return;
        }
        await navigate({ to: "/app" });
    }

    return (
        <AuthCard
            icon={
                <div className="bg-primary text-on-primary flex size-12 items-center justify-center rounded-full shadow-md">
                    <UserPlus className="size-5" aria-hidden="true" />
                </div>
            }
            title="Create your account"
            description="Join SyncBoard and streamline your workflow today."
            footer={
                <>
                    Already have an account?{" "}
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
                className="flex flex-col gap-3"
                onSubmit={(event) => void handleSubmit(onSubmit)(event)}
            >
                <div className="flex flex-col gap-1">
                    <Label htmlFor="fullName">Full name</Label>
                    <div className="relative">
                        <User
                            className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
                            aria-hidden="true"
                        />
                        <Input
                            id="fullName"
                            type="text"
                            placeholder="Jane Doe"
                            required
                            aria-invalid={errors.fullName ? true : undefined}
                            className="pl-9"
                            {...register("fullName")}
                        />
                    </div>
                    {errors.fullName && (
                        <p className="text-error text-body-sm">
                            {errors.fullName.message}
                        </p>
                    )}
                </div>

                <div className="flex flex-col gap-1">
                    <Label htmlFor="email">Work email</Label>
                    <div className="relative">
                        <Mail
                            className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
                            aria-hidden="true"
                        />
                        <Input
                            id="email"
                            type="email"
                            placeholder="jane@company.com"
                            required
                            aria-invalid={errors.email ? true : undefined}
                            className="pl-9"
                            {...register("email")}
                        />
                    </div>
                    {errors.email && (
                        <p className="text-error text-body-sm">
                            {errors.email.message}
                        </p>
                    )}
                </div>

                <Controller
                    control={control}
                    name="password"
                    render={({ field }) => (
                        <OriginInputPassword
                            id="password"
                            placeholder="••••••••"
                            required
                            value={field.value ?? ""}
                            onChange={field.onChange}
                            onBlur={field.onBlur}
                            aria-invalid={errors.password ? true : undefined}
                        />
                    )}
                />
                {errors.password && (
                    <p className="text-error text-body-sm">{errors.password.message}</p>
                )}

                <div className="flex flex-col gap-1">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
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

                {registerMutation.isError && (
                    <p className="text-error text-body-sm" role="alert">
                        {getApiErrorMessage(
                            registerMutation.error,
                            "Something went wrong. Please try again.",
                        )}
                    </p>
                )}

                <Button
                    type="submit"
                    size="lg"
                    className="group mt-1"
                    disabled={registerMutation.isPending}
                >
                    {registerMutation.isPending
                        ? "Creating account…"
                        : "Create account"}
                    <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                    />
                </Button>

                <p className="text-body-sm text-on-surface-variant text-center">
                    By creating an account, you agree to our{" "}
                    <Link
                        to="/terms"
                        className="text-primary underline-offset-2 hover:underline"
                    >
                        Terms of Service
                    </Link>{" "}
                    and{" "}
                    <Link
                        to="/privacy"
                        className="text-primary underline-offset-2 hover:underline"
                    >
                        Privacy Policy
                    </Link>
                    .
                </p>
            </form>
        </AuthCard>
    );
}
