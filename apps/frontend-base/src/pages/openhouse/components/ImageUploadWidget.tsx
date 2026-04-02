import { ArrowDown, ArrowUp, ImageIcon, Star, Trash2 } from 'lucide-react'
import { useCallback } from 'react'
import { Button } from '@/components/ui/button'
import { cloudinaryUrl, imagePresets } from '@/lib/cloudinary-url'
import { openCloudinaryUploadWidget } from '@/lib/cloudinary-widget'
import type { NewOpenHouseImageInput } from '@/lib/schemas/openhouse.schema'
import { cn } from '@/lib/utils'

interface UploadedImage {
    url: string
    publicId: string
}

interface ImageUploadWidgetProps {
    images: NewOpenHouseImageInput[]
    onChange: (images: NewOpenHouseImageInput[]) => void
}

export function ImageUploadWidget({ images, onChange }: ImageUploadWidgetProps) {
    const handleUpload = useCallback(async () => {
        await openCloudinaryUploadWidget(
            (results: UploadedImage[]) => {
                const startIndex = images.length
                const newImages: NewOpenHouseImageInput[] = results.map((r, i) => ({
                    url: r.url,
                    publicId: r.publicId,
                    isMain: images.length === 0 && i === 0,
                    orderIndex: startIndex + i,
                }))
                onChange([...images, ...newImages])
            },
            (error) => {
                console.error('Upload failed:', error)
            },
        )
    }, [images, onChange])

    const handleRemove = (index: number) => {
        const updated = images
            .filter((_, i) => i !== index)
            .map((img, i) => ({
                ...img,
                orderIndex: i,
                isMain: index === 0 ? i === 0 : img.isMain,
            }))
        onChange(updated)
    }

    const handleSetMain = (index: number) => {
        const updated = images.map((img, i) => ({
            ...img,
            isMain: i === index,
        }))
        onChange(updated)
    }

    const handleMoveUp = (index: number) => {
        if (index === 0) return
        const updated = [...images]
        ;[updated[index - 1], updated[index]] = [updated[index], updated[index - 1]]
        const reordered = updated.map((img, i) => ({ ...img, orderIndex: i }))
        onChange(reordered)
    }

    const handleMoveDown = (index: number) => {
        if (index === images.length - 1) return
        const updated = [...images]
        ;[updated[index], updated[index + 1]] = [updated[index + 1], updated[index]]
        const reordered = updated.map((img, i) => ({ ...img, orderIndex: i }))
        onChange(reordered)
    }

    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium">Images ({images.length})</label>
                <Button type="button" variant="outline" size="sm" onClick={handleUpload}>
                    <ImageIcon className="h-4 w-4 mr-2" />
                    Add Images
                </Button>
            </div>

            {images.length === 0 && (
                <div className="border-2 border-dashed rounded-lg p-8 text-center text-muted-foreground">
                    <ImageIcon className="h-10 w-10 mx-auto mb-2 opacity-40" />
                    <p className="text-sm">No images added yet</p>
                    <p className="text-xs mt-1">Click "Add Images" to upload</p>
                </div>
            )}

            {images.length > 0 && (
                <div className="space-y-2">
                    {images.map((image, index) => (
                        <div
                            key={image.publicId}
                            className={cn(
                                'flex items-center gap-3 p-2 rounded-lg border',
                                image.isMain && 'border-re-gold/50 bg-re-gold/5',
                            )}
                        >
                            <img
                                src={cloudinaryUrl(image.publicId, imagePresets.thumbnail)}
                                alt={`Image ${index + 1}`}
                                className="w-16 h-16 object-cover rounded-md"
                            />

                            <div className="flex-1 min-w-0">
                                <p className="text-xs text-muted-foreground truncate">
                                    {image.publicId}
                                </p>
                                {image.isMain && (
                                    <span className="text-xs text-re-gold font-medium">
                                        Main Image
                                    </span>
                                )}
                            </div>

                            <div className="flex items-center gap-1">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleSetMain(index)}
                                    title={image.isMain ? 'Main image' : 'Set as main'}
                                >
                                    <Star
                                        className={cn(
                                            'h-4 w-4',
                                            image.isMain
                                                ? 'fill-re-gold text-re-gold'
                                                : 'text-muted-foreground',
                                        )}
                                    />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleMoveUp(index)}
                                    disabled={index === 0}
                                    title="Move up"
                                >
                                    <ArrowUp className="h-3 w-3" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7"
                                    onClick={() => handleMoveDown(index)}
                                    disabled={index === images.length - 1}
                                    title="Move down"
                                >
                                    <ArrowDown className="h-3 w-3" />
                                </Button>
                                <Button
                                    type="button"
                                    variant="ghost"
                                    size="icon"
                                    className="h-7 w-7 text-destructive hover:text-destructive"
                                    onClick={() => handleRemove(index)}
                                    title="Remove"
                                >
                                    <Trash2 className="h-4 w-4" />
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
