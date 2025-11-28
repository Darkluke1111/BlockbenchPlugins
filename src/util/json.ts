
/**
 * Removes trailing commas from JSON strings to fix common syntax errors.
 * This handles cases like: `},]` or `},}` which are invalid in strict JSON.
 * @param jsonString The JSON string to clean.
 * @returns Cleaned JSON string.
 */
export function cleanJSONString(jsonString: string): string {
    return jsonString.replace(/,(\s*[\]}])/g, '$1');
}
