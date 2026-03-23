import { format } from 'date-fns'
import { Download, Printer } from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import type { OpenHouse } from '@/lib/schemas/openhouse.schema'
import { formatCurrency } from '@/lib/utils'

interface QRCodeDisplayProps {
    url: string
    openHouse: OpenHouse
}

export function QRCodeDisplay({ url, openHouse }: QRCodeDisplayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [_qrDataUrl, setQrDataUrl] = useState<string>('')

    useEffect(() => {
        const generateQR = async () => {
            if (canvasRef.current) {
                try {
                    const _dataUrl = await QRCode.toCanvas(canvasRef.current, url, {
                        width: 256,
                        margin: 2,
                        color: {
                            dark: '#000000',
                            light: '#FFFFFF',
                        },
                    })
                    if (canvasRef.current) {
                        setQrDataUrl(canvasRef.current.toDataURL())
                    }
                } catch (error) {
                    console.error('Failed to generate QR code:', error)
                }
            }
        }

        generateQR()
    }, [url])

    const handleDownload = () => {
        if (!canvasRef.current) return
        const link = document.createElement('a')
        link.download = `openhouse-qr-${openHouse.id}.png`
        link.href = canvasRef.current.toDataURL()
        link.click()
    }

    const handlePrint = () => {
        if (!canvasRef.current) return
        const printWindow = window.open('', '_blank')
        if (printWindow) {
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Open House Flyer - ${openHouse.propertyAddress}</title>
                        <style>
                            body { font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 40px 20px; }
                            h1 { text-align: center; margin-bottom: 10px; }
                            .address { text-align: center; font-size: 18px; margin-bottom: 20px; }
                            .details { display: flex; justify-content: space-around; margin-bottom: 30px; }
                            .detail { text-align: center; }
                            .price { font-size: 28px; font-weight: bold; }
                            .qr-container { text-align: center; margin-top: 40px; }
                            .qr-label { margin-top: 10px; font-size: 14px; color: #666; }
                        </style>
                    </head>
                    <body>
                        <h1>Open House</h1>
                        <div class="address">${openHouse.propertyAddress}</div>
                        <div class="details">
                            <div class="detail">
                                <strong>Date</strong><br/>
                                ${format(new Date(openHouse.date), 'MMMM d, yyyy')}
                            </div>
                            <div class="detail">
                                <strong>Time</strong><br/>
                                ${openHouse.startTime} - ${openHouse.endTime}
                            </div>
                            <div class="detail">
                                <strong>Price</strong><br/>
                                <span class="price">${formatCurrency(openHouse.listingPrice)}</span>
                            </div>
                        </div>
                        <div class="qr-container">
                            <img src="${canvasRef.current.toDataURL()}" width="256" height="256" />
                            <div class="qr-label">Scan to sign in</div>
                        </div>
                    </body>
                </html>
            `)
            printWindow.document.close()
            printWindow.onload = () => {
                printWindow.print()
            }
        }
    }

    return (
        <div className="space-y-6">
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
                <Button onClick={handleDownload} variant="outline">
                    <Download className="mr-2 h-4 w-4" />
                    Download QR Code
                </Button>
                <Button onClick={handlePrint} variant="outline">
                    <Printer className="mr-2 h-4 w-4" />
                    Print Flyer
                </Button>
            </div>

            <div className="flex flex-col items-center space-y-4">
                <div className="p-4 bg-white rounded-lg border">
                    <canvas ref={canvasRef} className="w-64 h-64" />
                </div>
                <p className="text-sm text-muted-foreground">
                    Scan this QR code to sign in as a visitor
                </p>
            </div>
        </div>
    )
}
