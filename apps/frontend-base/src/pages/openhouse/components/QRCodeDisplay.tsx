import { format } from 'date-fns'
import { Download, Printer } from 'lucide-react'
import QRCode from 'qrcode'
import { useEffect, useRef, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { cloudinaryUrl, imagePresets } from '@/lib/cloudinary-url'
import type { OpenHouse } from '@/lib/schemas/openhouse.schema'
import { formatCurrency } from '@/lib/utils'

const MAX_FEATURES = 8

interface QRCodeDisplayProps {
    url: string
    openHouse: OpenHouse
}

interface FlyerOrgInfo {
    name: string
    smallLogoPublicId?: string | null
}

function formatTime(time: string): string {
    const [h, m] = time.split(':')
    const hour = Number.parseInt(h, 10)
    const ampm = hour >= 12 ? 'PM' : 'AM'
    const displayHour = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour
    return `${displayHour}:${m} ${ampm}`
}

function buildFlyerHTML(openHouse: OpenHouse, qrDataUrl: string): string {
    const navy = '#1C2A52'
    const gold = '#D0AC61'
    const images = openHouse.images ?? []
    const hasImages = images.length > 0
    const features = (openHouse.features ?? []).slice(0, MAX_FEATURES)
    const hasFeatures = features.length > 0
    const agent = openHouse.agent
    const hasAgent = agent && (agent.firstName || agent.email)
    const org: FlyerOrgInfo = openHouse.organization ?? { name: '' }

    const mainImg = images.find((img) => img.isMain) ?? images[0]
    const subImages = images.filter((img) => img.publicId !== (mainImg?.publicId ?? '')).slice(0, 2)

    const mainImgUrl = mainImg ? cloudinaryUrl(mainImg.publicId, imagePresets.flyer) : ''
    const sub1Url = subImages[0]
        ? cloudinaryUrl(subImages[0].publicId, imagePresets.flyerThumb)
        : ''
    const sub2Url = subImages[1]
        ? cloudinaryUrl(subImages[1].publicId, imagePresets.flyerThumb)
        : ''

    const imageGalleryBlock = hasImages
        ? `
        <div style="display:grid; grid-template-columns:2fr 1fr; grid-template-rows:1fr 1fr; gap:12px; margin-bottom:28px; height:340px;">
            <div style="grid-row:1/span 2; overflow:hidden;">
                <img src="${mainImgUrl}" style="width:100%; height:100%; object-fit:cover; display:block;" alt="Property">
            </div>
            ${
                sub1Url
                    ? `<div style="overflow:hidden;"><img src="${sub1Url}" style="width:100%; height:100%; object-fit:cover; display:block;" alt="Property interior"></div>`
                    : `<div style="background-color:#e8e8e8;"></div>`
            }
            ${
                sub2Url
                    ? `<div style="overflow:hidden;"><img src="${sub2Url}" style="width:100%; height:100%; object-fit:cover; display:block;" alt="Property interior"></div>`
                    : `<div style="background-color:#e8e8e8;"></div>`
            }
        </div>`
        : ''

    const bedBathParts: string[] = []
    if (openHouse.bedrooms) bedBathParts.push(`${openHouse.bedrooms} Bed`)
    if (openHouse.bathrooms) bedBathParts.push(`${openHouse.bathrooms} Bath`)
    const bedBathStr = bedBathParts.join(' / ')

    const qrImg = `<img src="${qrDataUrl}" width="120" height="120" style="display:block;" alt="QR Code">`

    const featuresSection = hasFeatures
        ? `
        <div style="display:flex; justify-content:center; align-items:flex-start; margin-bottom:32px; gap:40px;">
            <div style="text-align:center;">
                <div style="font-size:1.3rem; color:${navy}; margin-bottom:12px; text-transform:uppercase; font-weight:400; letter-spacing:1px;">Features</div>
                <div style="display:grid; grid-template-columns:1fr 1fr; gap:8px 32px; text-align:left; font-size:1rem; color:${navy};">
                    ${features.map((f) => `<div>&#8226; ${f}</div>`).join('\n                    ')}
                </div>
            </div>
            <div style="text-align:center; margin-top:10px;">
                <div style="border:2px solid ${gold}; padding:12px; display:inline-block;">
                    ${qrImg}
                </div>
                <div style="color:${gold}; font-size:0.8rem; font-weight:600; letter-spacing:1px; margin-top:6px; text-transform:uppercase;">Scan to Sign In</div>
            </div>
        </div>`
        : `
        <div style="text-align:center; margin-bottom:32px;">
            <div style="border:2px solid ${gold}; padding:12px; display:inline-block;">
                ${qrImg}
            </div>
            <div style="color:${gold}; font-size:0.8rem; font-weight:600; letter-spacing:1px; margin-top:6px; text-transform:uppercase;">Scan to Sign In</div>
        </div>`

    const agentHeadshotUrl = agent?.imagePublicId
        ? cloudinaryUrl(agent.imagePublicId, imagePresets.flyerHeadshot)
        : ''

    const agentBanner = hasAgent
        ? `
        <div style="display:flex; border:1px solid ${navy};">
            <div style="background-color:${navy}; color:white; display:flex; align-items:center; padding:15px 30px; flex:1; gap:20px;">
                ${
                    agentHeadshotUrl
                        ? `<img src="${agentHeadshotUrl}" style="width:80px; height:80px; border-radius:50%; object-fit:cover; flex-shrink:0; border:2px solid white;" alt="${agent.firstName ?? ''}">`
                        : ''
                }
                <div>
                    <div style="font-size:1.2rem; margin-bottom:3px;">${agent.firstName ?? ''} ${agent.lastName ?? ''}</div>
                    <div style="font-size:0.85rem; text-transform:uppercase; letter-spacing:1px; opacity:0.85;">Realtor</div>
                </div>
            </div>
            <div style="background-color:white; color:${navy}; display:flex; flex-direction:column; justify-content:center; padding:15px 30px; flex:1; text-align:right;">
                ${
                    agent.phone
                        ? `<div style="font-size:1.3rem; font-weight:bold; margin-bottom:3px;">${agent.phone}</div>`
                        : ''
                }
                ${agent.email ? `<div style="font-size:0.85rem;">${agent.email}</div>` : ''}
            </div>
        </div>`
        : ''

    const orgLogoHtml = org.smallLogoPublicId
        ? `<img src="${cloudinaryUrl(org.smallLogoPublicId, imagePresets.flyerOrgLogo)}" style="max-height:28px; object-fit:contain;" alt="${org.name}">`
        : `<div class="logos">${org.name}</div>`

    return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <title>Open House Flyer - ${openHouse.propertyAddress}</title>
    <style>
        * { margin:0; padding:0; box-sizing:border-box; -webkit-print-color-adjust:exact; print-color-adjust:exact; }
        body {
            font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
            background-color: #f4f4f4;
            display: flex;
            justify-content: center;
            padding: 20px;
            color: #333;
        }
        .flyer-container {
            background-color: #ffffff;
            width: 100%;
            max-width: 800px;
            padding: 40px;
        }
        .top-bar {
            display: flex;
            align-items: center;
            justify-content: flex-end;
            margin-bottom: 16px;
        }
        .top-bar hr {
            flex-grow: 1;
            border: none;
            border-top: 1px solid #bbb;
            margin-right: 16px;
        }
        .logos {
            font-weight: bold;
            color: ${navy};
            font-size: 0.85rem;
            letter-spacing: 1px;
        }
        .main-title {
            display: flex;
            align-items: center;
            font-size: 3.5rem;
            font-weight: 300;
            letter-spacing: 2px;
            margin-bottom: 24px;
        }
        .title-open {
            background-color: ${navy};
            color: white;
            padding: 8px 20px;
            margin-right: 12px;
        }
        .title-house {
            color: ${navy};
        }
        .details-bar {
            display: flex;
            justify-content: space-between;
            align-items: flex-end;
            margin-bottom: 28px;
        }
        .datetime-address { flex: 1; }
        .datetime {
            font-size: 1.2rem;
            color: ${navy};
            margin-bottom: 4px;
            text-transform: uppercase;
            font-weight: 600;
        }
        .address {
            font-size: 1rem;
            text-transform: uppercase;
            color: #555;
        }
        .bed-bath {
            font-size: 0.9rem;
            color: ${navy};
            margin-top: 4px;
        }
        .price-tag {
            background-color: ${gold};
            color: white;
            font-size: 2rem;
            padding: 10px 20px;
            font-weight: 700;
        }
        @media print {
            body { padding: 0; background: white; }
            .flyer-container { padding: 24px; box-shadow: none; }
            .main-title { font-size: 2.8rem; }
        }
    </style>
</head>
<body>
    <div class="flyer-container">
        <header>
            <div class="top-bar">
                <hr>
                ${orgLogoHtml}
            </div>
            <div class="main-title">
                <span class="title-open">OPEN</span>
                <span class="title-house">HOUSE</span>
            </div>
        </header>

        ${imageGalleryBlock}

        <div class="details-bar">
            <div class="datetime-address">
                <div class="datetime">${format(new Date(openHouse.date), 'EEEE, MMMM d')} | ${formatTime(openHouse.startTime)} - ${formatTime(openHouse.endTime)}</div>
                <div class="address">${openHouse.propertyAddress}</div>
                ${bedBathStr ? `<div class="bed-bath">${bedBathStr}</div>` : ''}
            </div>
            <div class="price-tag">${formatCurrency(openHouse.listingPrice)}</div>
        </div>

        ${featuresSection}

        ${agentBanner}
    </div>
</body>
</html>`
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
                            dark: '#1C2A52',
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
        const qrDataUrl = canvasRef.current.toDataURL('image/png')
        const printWindow = window.open('', '_blank')
        if (!printWindow) return

        const flyerHTML = buildFlyerHTML(openHouse, qrDataUrl)
        printWindow.document.write(flyerHTML)
        printWindow.document.close()

        printWindow.onload = () => {
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
