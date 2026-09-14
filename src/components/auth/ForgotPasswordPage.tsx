import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "@tanstack/react-router";
import { ArrowRight, KeyRound, Mail, MailCheck } from "lucide-react";
import { useForm } from "react-hook-form";

import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useForgotPasswordMutation } from "@/hooks/useAuth";
import { getApiErrorMessage } from "@/lib/api-error";
import {
    type ForgotPasswordFormValues,
    forgotPasswordSchema,
} from "@/lib/auth-schemas";

export function ForgotPasswordPage() {
    const forgotPasswordMutation = useForgotPasswordMutation();
    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
    });

    async function onSubmit(values: ForgotPasswordFormValues) {
        try {
            await forgotPasswordMutation.mutateAsync(values);
        } catch {
            // handled via forgotPasswordMutation.isError below
        }
    }

    return (
        <AuthCard
            icon={
                <div className="bg-primary text-on-primary flex size-12 items-center justify-center rounded-full shadow-md">
                    <KeyRound className="size-5" aria-hidden="true" />
                </div>
            }
            title="Reset your password"
            description="Enter your email and we'll send you a link to reset your password."
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
            {forgotPasswordMutation.isSuccess ? (
                <div className="gap-stack-sm text-body-base text-on-surface-variant flex flex-col items-center text-center">
                    <MailCheck className="text-primary size-8" aria-hidden="true" />
                    <p role="status">
                        If that email exists, a reset link has been sent — check your
                        inbox.
                    </p>
                    <Button
                        type="button"
                        variant="outline"
                        className="mt-2"
                        onClick={() => forgotPasswordMutation.reset()}
                    >
                        Try a different email
                    </Button>
                </div>
            ) : (
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

                    {forgotPasswordMutation.isError && (
                        <p className="text-error text-body-sm" role="alert">
                            {getApiErrorMessage(
                                forgotPasswordMutation.error,
                                "Something went wrong. Please try again.",
                            )}
                        </p>
                    )}

                    <Button
                        type="submit"
                        size="lg"
                        className="group mt-2"
                        disabled={forgotPasswordMutation.isPending}
                    >
                        {forgotPasswordMutation.isPending
                            ? "Sending…"
                            : "Send reset link"}
                        <ArrowRight
                            className="size-4 transition-transform group-hover:translate-x-1"
                            aria-hidden="true"
                        />
                    </Button>
                </form>
            )}
        </AuthCard>
    );
}
