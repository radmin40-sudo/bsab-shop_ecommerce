export type ImageResizeOptions = {
    maxWidth: number;
    maxHeight: number;
    quality?: number;
};

function isRasterImage(file: File) {
    return ['image/jpeg', 'image/png', 'image/webp'].includes(file.type);
}

export async function optimizeImage(file: File, options: ImageResizeOptions): Promise<File> {
    if (!isRasterImage(file) || file.size === 0) return file;

    try {
        const bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
        const scale = Math.min(1, options.maxWidth / bitmap.width, options.maxHeight / bitmap.height);
        const width = Math.max(1, Math.round(bitmap.width * scale));
        const height = Math.max(1, Math.round(bitmap.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        canvas.getContext('2d')?.drawImage(bitmap, 0, 0, width, height);
        bitmap.close();

        const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, 'image/webp', options.quality ?? 0.82));
        if (!blob || blob.size >= file.size) return file;

        const name = `${file.name.replace(/\.[^.]+$/, '') || 'image'}.webp`;
        return new File([blob], name, { type: 'image/webp', lastModified: Date.now() });
    } catch {
        return file;
    }
}

export async function optimizeImages(files: File[], options: ImageResizeOptions): Promise<File[]> {
    const results: File[] = [];
    let nextIndex = 0;
    const worker = async () => {
        while (nextIndex < files.length) {
            const index = nextIndex++;
            results[index] = await optimizeImage(files[index], options);
        }
    };
    await Promise.all(Array.from({ length: Math.min(3, files.length) }, worker));

    return results;
}
