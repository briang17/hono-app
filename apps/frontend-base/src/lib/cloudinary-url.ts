const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME

interface TransformOptions {
    width?: number
    height?: number
    crop?: string
    quality?: string | number
    format?: string
    radius?: number | string
    gravity?: string
}

interface ImageLike {
    isMain: boolean
    publicId: string
}

export function cloudinaryUrl(publicId: string, options: TransformOptions = {}): string {
    const {
        width,
        height,
        crop = 'fill',
        quality = 'auto',
        format = 'auto',
        radius,
        gravity = 'auto',
    } = options

    const transforms: string[] = []

    if (width) transforms.push(`w_${width}`)
    if (height) transforms.push(`h_${height}`)
    if (crop) transforms.push(`c_${crop}`)
    if (quality) transforms.push(`q_${quality}`)
    if (format) transforms.push(`f_${format}`)
    if (radius) transforms.push(`r_${radius}`)
    if (gravity && (width || height)) transforms.push(`g_${gravity}`)

    const transformStr = transforms.join(',')

    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/${transformStr}/${publicId}`
}

export function getMainImage<T extends ImageLike>(images: T[]): T | undefined {
    if (images.length === 0) return undefined
    const main = images.find((img) => img.isMain)
    return main ?? images[0]
}

export function mainImageUrl<T extends ImageLike>(
    images: T[],
    options: TransformOptions = {},
): string | undefined {
    const main = getMainImage(images)
    if (!main) return undefined
    return cloudinaryUrl(main.publicId, options)
}

export const imagePresets = {
    card: { width: 400, height: 300, crop: 'fill' },
    heroLarge: { width: 1200, height: 600, crop: 'fill' },
    heroSmall: { width: 800, height: 400, crop: 'fill' },
    thumbnail: { width: 100, height: 100, crop: 'fill', radius: '8' },
    flyer: { width: 600, height: 400, crop: 'fill' },
    flyerThumb: { width: 300, height: 200, crop: 'fill' },
    headshot: { width: 200, height: 200, crop: 'thumb', gravity: 'face', radius: 'max' },
    flyerHeadshot: { width: 160, height: 160, crop: 'thumb', gravity: 'face', radius: 'max' },
    orgLogo: { width: 320, height: 100, crop: 'fit', gravity: '' },
    flyerOrgLogo: { width: 120, height: 40, crop: 'fit', gravity: '' },
} as const
