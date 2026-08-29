import axios, { type AxiosError, type InternalAxiosRequestConfig } from "axios";

import { authSession } from "@/lib/auth-session";
import { router } from "@/router";

/** Endpoints that either don't need a token or issue/rotate one themselves — a 401
 * from any of these means "bad credentials"/"bad token", not "access token expired",
 * so they must never trigger the refresh-and-retry flow below. */
const AUTH_ENDPOINTS_EXEMPT_FROM_REFRESH = [
    "/auth/login",
    "/auth/register",
    "/auth/refresh",
    "/auth/forgot-password",
    "/auth/reset-password",
];

export const api = axios.create({
    baseURL: import.meta.env.VITE_API_BASE_URL,
    withCredentials: true,
});

api.interceptors.request.use((config) => {
    const token = authSession.getAccessToken();

    if (token) {
        config.headers.set("Authorization", `Bearer ${token}`);
    }

    return config;
});

interface RetriableConfig extends InternalAxiosRequestConfig {
    _retry?: boolean;
}

/** Coalesces concurrent 401s into a single refresh call instead of racing multiple
 * POST /auth/refresh requests (each of which would rotate the cookie and invalidate
 * the others in flight). */
let refreshPromise: Promise<string> | null = null;

/** Exported so the `/app` route's `beforeLoad` guard can attempt a silent session
 * restore on a hard reload, reusing the same call the 401 interceptor makes. */
export const refreshAccessToken = async (): Promise<string> => {
    const response = await axios.post<{ data: { accessToken: string } }>(
        "/auth/refresh",
        undefined,
        { baseURL: import.meta.env.VITE_API_BASE_URL, withCredentials: true },
    );
    const { accessToken } = response.data.data;
    authSession.setAccessToken(accessToken);
    return accessToken;
};

api.interceptors.response.use(
    (response) => response,
    async (error: AxiosError) => {
        const config = error.config as RetriableConfig | undefined;
        const isExemptEndpoint = AUTH_ENDPOINTS_EXEMPT_FROM_REFRESH.some((path) =>
            config?.url?.includes(path),
        );

        if (
            error.response?.status !== 401 ||
            !config ||
            config._retry ||
            isExemptEndpoint
        ) {
            throw error;
        }

        config._retry = true;

        try {
            refreshPromise ??= refreshAccessToken().finally(() => {
                refreshPromise = null;
            });
            const accessToken = await refreshPromise;
            config.headers.set("Authorization", `Bearer ${accessToken}`);
            return await api(config);
        } catch (refreshError) {
            authSession.clearAccessToken();
            await router.navigate({ to: "/login" });
            throw refreshError;
        }
    },
);
