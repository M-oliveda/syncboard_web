import { AxiosError, AxiosHeaders } from "axios";
import { describe, expect, it } from "vitest";

import { getApiErrorMessage } from "@/lib/api-error";

describe("getApiErrorMessage", () => {
    it("returns the RFC 7807 detail from an Axios error response", () => {
        const error = new AxiosError(
            "Request failed",
            "ERR_BAD_REQUEST",
            undefined,
            undefined,
            {
                status: 400,
                statusText: "Bad Request",
                headers: {},
                config: { headers: new AxiosHeaders() },
                data: {
                    type: "https://syncboard.dev/errors/validation-error",
                    title: "Validation Error",
                    status: 400,
                    detail: "title is required",
                    instance: "/api/v1/cards/c1",
                },
            },
        );

        expect(getApiErrorMessage(error, "fallback")).toBe("title is required");
    });

    it("falls back for a non-Axios error", () => {
        expect(getApiErrorMessage(new Error("network down"), "fallback")).toBe(
            "fallback",
        );
    });

    it("falls back when the Axios error has no response", () => {
        const error = new AxiosError("Network Error", "ERR_NETWORK");
        expect(getApiErrorMessage(error, "fallback")).toBe("fallback");
    });
});
