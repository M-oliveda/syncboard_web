/** Module-level store for the in-memory access token — never component state or
 * localStorage, so the Axios interceptor can read it outside of React. There is no
 * `/auth/me` endpoint, so this is the only source of truth for "is there a session";
 * components that need to react to it call the Axios-backed hooks in `useAuth.ts`
 * rather than reading this module's state reactively. */
let accessToken: string | null = null;

export const authSession = {
    getAccessToken: (): string | null => accessToken,
    setAccessToken: (token: string): void => {
        accessToken = token;
    },
    clearAccessToken: (): void => {
        accessToken = null;
    },
};
