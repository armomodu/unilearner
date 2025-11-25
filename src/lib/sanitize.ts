/**
 * Recursively remove null characters from strings within a data structure.
 * Prevents Postgres JSON/Text columns from rejecting data that contains \u0000.
 */
export function stripNullsDeep<T>(value: T): T {
    if (value === null || value === undefined) {
        return value;
    }

    if (typeof value === 'string') {
        return value.includes('\u0000') ? value.replace(/\u0000/g, '') as T : value;
    }

    if (Array.isArray(value)) {
        let mutated = false;
        const result = value.map(item => {
            const sanitized = stripNullsDeep(item);
            if (sanitized !== item) {
                mutated = true;
            }
            return sanitized;
        });
        return mutated ? result as unknown as T : value;
    }

    if (typeof value === 'object') {
        if (value instanceof Date) {
            return value;
        }

        let mutated = false;
        const entries = Object.entries(value as Record<string, unknown>);
        const result: Record<string, unknown> = {};

        for (const [key, val] of entries) {
            const sanitized = stripNullsDeep(val);
            result[key] = sanitized;
            if (sanitized !== val) {
                mutated = true;
            }
        }

        return mutated ? result as T : value;
    }

    return value;
}
