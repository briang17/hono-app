import { format } from 'date-fns'
import { Download, Printer } from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { imagePresets, mainImageUrl } from '@/lib/cloudinary-url'
import type { OpenHouse } from '@/lib/schemas/openhouse.schema'
import { formatCurrency } from '@/lib/utils'

interface QRCodeDisplayProps {
    url: string
    openHouse: OpenHouse
}

export function QRCodeDisplay({ url, openHouse }: QRCodeDisplayProps) {
    const canvasRef = useRef<HTMLCanvasElement>(null)
    const [qrGenerated, setQrGenerated] = useState(false)

    useEffect(() => {
        const generateQR = async () => {
            if (canvasRef.current) {
                try {
                    await QRCode.toCanvas(canvasRef.current, url, {
                        width: 256,
                        margin: 2,
                        color: {
                            dark: '#0F2B5B',
                            light: '#ffffff',
                        },
                    })
                    setQrGenerated(true)
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
            const flyerHTML = `
                <!DOCTYPE html>
                <html>
                  <head>
                    <title>Open House Flyer - ${openHouse.propertyAddress}</title>
                    <style>
                      * {
                        margin: 0;
                        padding: 0;
                        box-sizing: border-box;
                      }
                      body {
                        font-family: 'Helvetica Neue', Arial, sans-serif;
                        padding: 60px;
                        max-width: 800px;
                        margin: 0 auto;
                        text-align: center;
                        background-color: #f8f8f8;
                      }
                      .flyer-container {
                        background: white;
                        border: 3px solid #0F2B5B;
                        border-radius: 8px;
                        padding: 40px;
                        box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                      }
                      .header {
                        border-bottom: 3px solid #D0AC61;
                        padding-bottom: 30px;
                        margin-bottom: 30px;
                      }
                      h1 {
                        color: #0F2B5B;
                        font-size: 48px;
                        font-weight: 700;
                        letter-spacing: -1px;
                        margin-bottom: 10px;
                      }
                      .address {
                        color: #0F2B5B;
                        font-size: 24px;
                        font-weight: 500;
                      }
                      .details-grid {
                        display: grid;
                        grid-template-columns: repeat(3, 1fr);
                        gap: 20px;
                        margin-bottom: 30px;
                      }
                      .detail-item {
                        padding: 15px;
                        background: #f5f5f5;
                        border-radius: 4px;
                      }
                      .detail-label {
                        color: #666;
                        font-size: 14px;
                        text-transform: uppercase;
                        letter-spacing: 1px;
                        margin-bottom: 8px;
                      }
                      .detail-value {
                        color: #0F2B5B;
                        font-size: 20px;
                        font-weight: 600;
                      }
                      .price-value {
                        color: #D0AC61;
                        font-size: 24px;
                        font-weight: 700;
                      }
                      .qr-container {
                        margin: 40px auto;
                        padding: 20px;
                        border: 2px solid #D0AC61;
                        border-radius: 8px;
                        background: white;
                        display: inline-block;
                      }
                      .scan-text {
                        color: #D0AC61;
                        font-size: 28px;
                        font-weight: 600;
                        margin: 40px 0 20px;
                        letter-spacing: 2px;
                        text-transform: uppercase;
                      }
                      .footer {
                        margin-top: 50px;
                        color: #0F2B5B;
                        font-size: 18px;
                        font-weight: 500;
                      }
                      @media print {
                        body {
                          padding: 20px;
                        }
                        .flyer-container {
                          padding: 20px;
                        }
                        h1 {
                          font-size: 36px;
                        }
                        .details-grid {
                          grid-template-columns: 1fr;
                          gap: 10px;
                        }
                      }
                    </style>
                  </head>
                  <body>
                    <div class="flyer-container">
                      <div class="header">
                        <h1>OPEN HOUSE</h1>
                        <p class="address">${openHouse.propertyAddress}</p>
                      </div>
                      <div class="details-grid">
                        <div class="detail-item">
                          <div class="detail-label">Date</div>
                          <div class="detail-value">${format(new Date(openHouse.date), 'MMMM d, yyyy')}</div>
                        </div>
                        <div class="detail-item">
                          <div class="detail-label">Time</div>
                          <div class="detail-value">${openHouse.startTime} - ${openHouse.endTime}</div>
                        </div>
                        <div class="detail-item">
                          <div class="detail-label">Price</div>
                          <div class="detail-value price-value">${formatCurrency(openHouse.listingPrice)}</div>
                        </div>
                      </div>
                      <div class="qr-container">
                        <canvas id="qr-code" width="300" height="300"></canvas>
                      </div>
                      <p class="scan-text">SCAN TO SIGN IN</p>
                      <div class="footer">
                        Paperless Sign-In
                      </div>
                    </div>
                    <script src="https://cdn.jsdelivr.net/npm/qrcode@1.5.3/build/qrcode.min.js"></script>
                    <script>
                      const canvas = document.getElementById('qr-code');
                      QRCode.toCanvas(canvas, '${url}', {
                        width: 300,
                        margin: 2,
                        color: {
                          dark: '#0F2B5B',
                          light: '#ffffff'
                        }
                      });
                    </script>
                  </body>
                </html>
              `
            printWindow.document.write(flyerHTML)
            printWindow.document.close()
            setTimeout(() => {
                printWindow.print()
            }, 500)
        }
    }

    return (
        <div className="space-y-6">
            <Card>
                <CardHeader>
                    <CardTitle className="text-lg text-re-navy">QR Code</CardTitle>
                </CardHeader>
                <CardContent className="space-y-6">
                    <div className="flex justify-center">
                        <div className="border-2 border-re-gold rounded-lg p-4">
                            <canvas ref={canvasRef} className="block" width={256} height={256} />
                        </div>
                    </div>
                    <div className="text-center text-sm text-muted-foreground">
                        Visitors can scan this code to sign in
                    </div>
                </CardContent>
            </Card>

            <Card>
                <CardHeader>
                    <CardTitle className="text-lg text-re-navy">Export Options</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex flex-col sm:flex-row gap-3 justify-center">
                        <Button
                            onClick={handleDownload}
                            disabled={!qrGenerated}
                            className="flex-1 sm:flex-none"
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download QR
                        </Button>
                        <Button
                            onClick={handlePrint}
                            disabled={!qrGenerated}
                            variant="outline"
                            className="flex-1 sm:flex-none"
                        >
                            <Printer className="w-4 h-4 mr-2" />
                            Print Flyer
                        </Button>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
