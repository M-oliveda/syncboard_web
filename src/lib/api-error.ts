import { isAxiosError } from "axios";

import type { ApiProblem } from "@/types/api";

/** Extracts a user-facing message from an RFC 7807 `application/problem+json` error
 * response, falling back to a generic message for network failures or anything else
 * unexpected. */
export function getApiErrorMessage(error: unknown, fallback: string): string {
    if (isAxiosError<ApiProblem>(error) && error.response?.data.detail) {
        return error.response.data.detail;
    }

    return fallback;
}
