export interface PasswordRule {
    /** Unique key for this rule */
    key: string;
    /** Human-readable label shown next to the indicator */
    label: string;
    /** Returns true when the rule passes for the given value */
    test: (value: string) => boolean;
}

export const defaultPasswordRules: PasswordRule[] = [
    {
        key: "min-length",
        label: "At least 8 characters",
        test: (v) => v.length >= 8,
    },
    {
        key: "uppercase",
        label: "One uppercase letter",
        test: (v) => /[A-Z]/.test(v),
    },
    {
        key: "lowercase",
        label: "One lowercase letter",
        test: (v) => /[a-z]/.test(v),
    },
    {
        key: "number",
        label: "One number",
        test: (v) => /\d/.test(v),
    },
    {
        key: "special",
        label: "One special character (!@#$...)",
        test: (v) => /[^A-Za-z0-9]/.test(v),
    },
];
