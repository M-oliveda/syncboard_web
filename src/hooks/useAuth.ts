import { useMutation, useQueryClient } from "@tanstack/react-query";
import type { AxiosError } from "axios";

import { api } from "@/lib/api";
import { authSession } from "@/lib/auth-session";
import type { ApiProblem, ApiSuccess, ApiUser } from "@/types/api";

export interface LoginInput {
    email: string;
    password: string;
}

export interface RegisterInput {
    email: string;
    password: string;
}

export interface ForgotPasswordInput {
    email: string;
}

export interface ResetPasswordInput {
    token: string;
    newPassword: string;
}

export type AuthApiError = AxiosError<ApiProblem>;

export function useLoginMutation() {
    return useMutation<
        { user: ApiUser; accessToken: string },
        AuthApiError,
        LoginInput
    >({
        mutationFn: async (input) => {
            const response = await api.post<
                ApiSuccess<{ user: ApiUser; accessToken: string }>
            >("/auth/login", input);
            return response.data.data;
        },
        onSuccess: ({ accessToken }) => {
            authSession.setAccessToken(accessToken);
        },
    });
}

export function useRegisterMutation() {
    return useMutation<
        { user: ApiUser; accessToken: string },
        AuthApiError,
        RegisterInput
    >({
        mutationFn: async (input) => {
            const response = await api.post<
                ApiSuccess<{ user: ApiUser; accessToken: string }>
            >("/auth/register", input);
            return response.data.data;
        },
        onSuccess: ({ accessToken }) => {
            authSession.setAccessToken(accessToken);
        },
    });
}

export function useForgotPasswordMutation() {
    return useMutation<void, AuthApiError, ForgotPasswordInput>({
        mutationFn: async (input) => {
            await api.post("/auth/forgot-password", input);
        },
    });
}

export function useResetPasswordMutation() {
    return useMutation<void, AuthApiError, ResetPasswordInput>({
        mutationFn: async (input) => {
            await api.post("/auth/reset-password", input);
        },
    });
}

export function useLogoutMutation() {
    const queryClient = useQueryClient();

    return useMutation<void, AuthApiError, void>({
        mutationFn: async () => {
            await api.post("/auth/logout");
        },
        onSettled: () => {
            authSession.clearAccessToken();
            queryClient.clear();
        },
    });
}
