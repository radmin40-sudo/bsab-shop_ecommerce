export function informationalPageImage(path?: string | null): string | null {
    if (!path) return null;
    if (/^(https?:)?\/\//i.test(path) || path.startsWith('/')) return path;
    return `/storage/${path}`;
}
