// http-client.ts — the null→undefined normalisation boundary.
// This is one of two sanctioned files where null may appear (per ADR-8).
// All responses are normalised before leaving this module.
import axios from 'axios';

export const httpClient = axios.create({
    baseURL: '/api',
    headers: {
        'Content-Type': 'application/json',
    },
});

// Type guard: narrows `unknown` to a plain object. Excludes null and arrays.
const isPlainObject = (value: unknown): value is Record<string, unknown> =>
    typeof value === 'object' && value !== null && !Array.isArray(value);

// Recursively normalise null → undefined at the HTTP boundary.
// Only this file is sanctioned to handle null (ADR-8).
const normaliseNulls = (value: unknown): unknown => {
    if (value === null) return undefined;
    if (Array.isArray(value)) return value.map(normaliseNulls);
    if (isPlainObject(value)) {
        return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, normaliseNulls(v)]));
    }
    return value;
};

httpClient.interceptors.response.use((response) => {
    // Axios types response.data as `any` — safe to assign here at the null-normalisation boundary.
    response.data = normaliseNulls(response.data);
    return response;
});
