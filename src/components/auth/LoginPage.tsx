import { zodResolver } from "@hookform/resolvers/zod";
import { Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Kanban, Mail } from "lucide-react";
import { Controller, useForm } from "react-hook-form";

import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OriginInputPassword } from "@/components/ui/input-password";
import { Label } from "@/components/ui/label";
import { useLoginMutation } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/api-error";
import { type LoginFormValues, loginSchema } from "@/lib/auth-schemas";

export function LoginPage() {
    const navigate = useNavigate();
    const loginMutation = useLoginMutation();
    const {
        control,
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<LoginFormValues>({ resolver: zodResolver(loginSchema) });

    async function onSubmit(values: LoginFormValues) {
        try {
            await loginMutation.mutateAsync(values);
        } catch {
            return;
        }
        await navigate({ to: "/app" });
    }

    return (
        <AuthCard
            icon={
                <div className="bg-primary text-on-primary flex size-14 items-center justify-center rounded-2xl shadow-md">
                    <Kanban className="size-7" aria-hidden="true" />
                </div>
            }
            title="Welcome back"
            description="Log in to continue to SyncBoard"
            footer={
                <>
                    Don&rsquo;t have an account?{" "}
                    <Link
                        to="/register"
                        className="text-on-secondary-container hover:text-primary font-medium transition-colors"
                    >
                        Sign up for free
                    </Link>
                </>
            }
        >
            <form
                noValidate
                className="gap-stack-md flex flex-col"
                onSubmit={(event) => void handleSubmit(onSubmit)(event)}
            >
                <div className="flex flex-col gap-1.5">
                    <Label htmlFor="email">Email</Label>
                    <div className="relative">
                        <Mail
                            className="text-muted-foreground absolute top-1/2 left-3 size-4 -translate-y-1/2"
                            aria-hidden="true"
                        />
                        <Input
                            id="email"
                            type="email"
                            placeholder="name@company.com"
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

                <div className="flex flex-col gap-1.5">
                    <div className="flex items-center justify-between">
                        <Label htmlFor="password">Password</Label>
                        <Link
                            to="/forgot-password"
                            className="text-body-sm text-on-secondary-container hover:text-primary transition-colors"
                        >
                            Forgot password?
                        </Link>
                    </div>
                    <Controller
                        control={control}
                        name="password"
                        render={({ field }) => (
                            <OriginInputPassword
                                id="password"
                                label=""
                                rules={[]}
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
                        <p className="text-error text-body-sm">
                            {errors.password.message}
                        </p>
                    )}
                </div>

                {loginMutation.isError && (
                    <p className="text-error text-body-sm" role="alert">
                        {getApiErrorMessage(
                            loginMutation.error,
                            "Something went wrong. Please try again.",
                        )}
                    </p>
                )}

                <Button
                    type="submit"
                    size="lg"
                    className="group mt-2"
                    disabled={loginMutation.isPending}
                >
                    {loginMutation.isPending ? "Logging in…" : "Log in"}
                    <ArrowRight
                        className="size-4 transition-transform group-hover:translate-x-1"
                        aria-hidden="true"
                    />
                </Button>
            </form>
        </AuthCard>
    );
}
