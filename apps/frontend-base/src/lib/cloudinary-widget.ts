import type { CloudinaryConfig } from '@/lib/api/cloudinary.api'
import { cloudinaryApi } from '@/lib/api/cloudinary.api'

interface CloudinaryUploadResult {
    url: string
    publicId: string
}

let scriptLoaded = false
let scriptLoadPromise: Promise<void> | null = null

function loadScript(): Promise<void> {
    if (scriptLoaded) return Promise.resolve()
    if (scriptLoadPromise) return scriptLoadPromise

    scriptLoadPromise = new Promise((resolve, reject) => {
        const existing = document.querySelector('script[src*="upload-widget.cloudinary.com"]')
        if (existing) {
            scriptLoaded = true
            resolve()
            return
        }
        const script = document.createElement('script')
        script.src = 'https://upload-widget.cloudinary.com/latest/global/all.js'
        script.type = 'text/javascript'
        script.onload = () => {
            scriptLoaded = true
            resolve()
        }
        script.onerror = () => reject(new Error('Failed to load Cloudinary widget'))
        document.head.appendChild(script)
    })

    return scriptLoadPromise
}

export async function openCloudinaryUploadWidget(
    onUpload: (results: CloudinaryUploadResult[]) => void,
    onError?: (error: unknown) => void,
): Promise<() => void> {
    await loadScript()

    let config: CloudinaryConfig
    try {
        config = await cloudinaryApi.getConfig()
    } catch (err) {
        onError?.(err)
        return () => {}
    }

    const uploaded: CloudinaryUploadResult[] = []

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const widget = (window as any).cloudinary.createUploadWidget(
        {
            cloudName: config.cloudName,
            apiKey: config.apiKey,
            folder: config.folder,
            prepareUploadParams: (
                cb: (result: Record<string, unknown> | Record<string, unknown>[]) => void,
                params: Record<string, unknown> | Record<string, unknown>[],
            ) => {
                const paramsList = Array.isArray(params) ? params : [params]
                Promise.all(
                    paramsList.map(async (req) => {
                        const signature = await cloudinaryApi.getSignature(req)
                        return {
                            signature: signature.signature,
                            apiKey: signature.apiKey,
                            uploadSignatureTimestamp: signature.timestamp,
                        }
                    }),
                ).then((results) => {
                    cb(results.length === 1 ? results[0] : results)
                })
            },
            sources: ['local', 'url', 'camera'],
            multiple: true,
            maxFiles: 10,
            maxFileSize: 10_000_000,
            clientAllowedFormats: ['jpg', 'jpeg', 'png', 'webp', 'gif'],
            styles: {
                palette: {
                    window: '#FFFFFF',
                    windowBorder: '#90A0B3',
                    tabIcon: '#0E2F5A',
                    menuIcons: '#5A616A',
                    textDark: '#000000',
                    textLight: '#FFFFFF',
                    link: '#0078FF',
                    action: '#FF620C',
                    inactiveTabIcon: '#0E2F5A',
                    error: '#F44235',
                    inProgress: '#0078FF',
                    complete: '#20B832',
                    sourceBg: '#E4EBF1',
                },
            },
        },
        (
            error: unknown,
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            result: any,
        ) => {
            if (error) {
                onError?.(error)
                return
            }
            if (result.event === 'success') {
                uploaded.push({
                    url: result.info.url,
                    publicId: result.info.public_id,
                })
            }
            if (result.event === 'queues-end' && uploaded.length > 0) {
                onUpload(uploaded)
            }
        },
    )

    widget.open()

    return () => widget.close()
}
