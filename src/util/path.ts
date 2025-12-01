/**
 * Extracts just the filename (without extension) from a path or textureLocation.
 * @param pathOrLocation A file path or textureLocation string.
 * @returns The filename without extension, lowercase.
 */
export function extractFilename(pathOrLocation: string): string {
    if (!pathOrLocation) return '';
    const normalized = pathOrLocation.replace(/\\/g, '/');
    const lastSegment = normalized.split('/').pop() || '';
    return lastSegment.replace(/\.[^.]+$/, '').toLowerCase();
}
