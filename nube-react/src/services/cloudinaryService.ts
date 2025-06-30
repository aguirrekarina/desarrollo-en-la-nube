interface CloudinaryResponse {
    secure_url: string;
    public_id: string;
    [key: string]: any;
}

export class CloudinaryService {
    private cloudName: string;
    private uploadPreset: string;

    constructor() {
        this.cloudName = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
        this.uploadPreset = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

        if (!this.cloudName || !this.uploadPreset) {
            throw new Error('Cloudinary credentials are missing from environment variables');
        }
    }

    async uploadImage(file: File): Promise<string> {
        const formData = new FormData();
        formData.append('file', file);
        formData.append('upload_preset', this.uploadPreset);

        try {
            const response = await fetch(
                `https://api.cloudinary.com/v1_1/${this.cloudName}/image/upload`,
                {
                    method: 'POST',
                    body: formData,
                }
            );

            if (!response.ok) {
                const errorData = await response.text();
                console.error('Cloudinary error response:', errorData);
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            const data: CloudinaryResponse = await response.json();
            return data.secure_url;
        } catch (error) {
            console.error('Error uploading to Cloudinary:', error);
            throw new Error('Failed to upload image to Cloudinary');
        }
    }

    getOptimizedUrl(imageUrl: string, options: {
        width?: number;
        height?: number;
        quality?: 'auto' | number;
        format?: 'auto' | 'webp' | 'jpg' | 'png';
    } = {}): string {
        if (!imageUrl.includes('cloudinary.com')) {
            return imageUrl;
        }

        const { width, height, quality = 'auto', format = 'auto' } = options;

        // Construir transformaciones
        const transformations = [];
        if (width) transformations.push(`w_${width}`);
        if (height) transformations.push(`h_${height}`);
        if (quality) transformations.push(`q_${quality}`);
        if (format) transformations.push(`f_${format}`);

        if (transformations.length === 0) {
            return imageUrl;
        }

        const urlParts = imageUrl.split('/upload/');
        if (urlParts.length !== 2) {
            return imageUrl;
        }

        return `${urlParts[0]}/upload/${transformations.join(',')}/${urlParts[1]}`;
    }
}

export const cloudinaryService = new CloudinaryService();