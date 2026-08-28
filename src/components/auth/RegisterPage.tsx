import { Link, useSearch } from "@tanstack/react-router";
import { ArrowRight, Mail, User, UserPlus } from "lucide-react";

import { AuthCard } from "@/components/auth/AuthCard";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { OriginInputPassword } from "@/components/ui/input-password";
import { Label } from "@/components/ui/label";

export function RegisterPage() {
    const { email } = useSearch({ from: "/register" });

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
                className="flex flex-col gap-3"
                onSubmit={(event) => event.preventDefault()}
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
                            name="fullName"
                            type="text"
                            placeholder="Jane Doe"
                            required
                            className="pl-9"
                        />
                    </div>
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
                            name="email"
                            type="email"
                            placeholder="jane@company.com"
                            defaultValue={email}
                            required
                            className="pl-9"
                        />
                    </div>
                </div>

                <OriginInputPassword
                    id="password"
                    name="password"
                    required
                    placeholder="••••••••"
                />

                <div className="flex flex-col gap-1">
                    <Label htmlFor="confirmPassword">Confirm password</Label>
                    <Input
                        id="confirmPassword"
                        name="confirmPassword"
                        type="password"
                        placeholder="••••••••"
                        required
                    />
                </div>

                <Button type="submit" size="lg" className="group mt-1">
                    Create account
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
