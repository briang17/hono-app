import { useEffect, useRef, useState } from "react";
import QRCode from "qrcode";
import { Button } from "../ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Download } from "lucide-react";

interface QRCodeDisplayProps {
  url: string;
  address: string;
}

export default function QRCodeDisplay({ url, address }: QRCodeDisplayProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [qrGenerated, setQrGenerated] = useState(false);

  useEffect(() => {
    const generateQR = async () => {
      if (canvasRef.current) {
        await QRCode.toCanvas(canvasRef.current, url, {
          width: 256,
          margin: 2,
          color: {
            dark: "#1C2A52",
            light: "#ffffff",
          },
        });
        setQrGenerated(true);
      }
    };
    generateQR();
  }, [url]);

  const downloadQR = () => {
    if (canvasRef.current) {
      const link = document.createElement("a");
      link.download = `qr-${address.replace(/\s+/g, "-").replace(/[^a-zA-Z0-9-]/g, "")}.png`;
      link.href = canvasRef.current.toDataURL("image/png");
      link.click();
    }
  };

  const printFlyer = () => {
    const printWindow = window.open("", "_blank");
    if (printWindow) {
      const flyerHTML = `
        <!DOCTYPE html>
        <html>
          <head>
            <title>Open House Flyer - ${address}</title>
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
              }
              .flyer-container {
                border: 3px solid #1C2A52;
                border-radius: 8px;
                padding: 40px;
              }
              .header {
                border-bottom: 2px solid #D0AC61;
                padding-bottom: 30px;
                margin-bottom: 30px;
              }
              h1 {
                color: #1C2A52;
                font-size: 48px;
                font-weight: 700;
                letter-spacing: -1px;
                margin-bottom: 10px;
              }
              .address {
                color: #1C2A52;
                font-size: 24px;
                font-weight: 500;
              }
              .scan-text {
                color: #D0AC61;
                font-size: 28px;
                font-weight: 600;
                margin: 40px 0 20px;
                letter-spacing: 2px;
              }
              .qr-container {
                margin: 40px auto;
              }
              .footer {
                margin-top: 50px;
                color: #1C2A52;
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
                .address {
                  font-size: 20px;
                }
              }
            </style>
          </head>
          <body>
            <div class="flyer-container">
              <div class="header">
                <h1>Open House</h1>
                <p class="address">${address}</p>
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
                  dark: '#1C2A52',
                  light: '#ffffff',
                }
              });
            </script>
          </body>
        </html>
      `;
      printWindow.document.write(flyerHTML);
      printWindow.document.close();
      setTimeout(() => {
        printWindow.print();
      }, 500);
    }
  };

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-[#1C2A52]">QR Code</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="flex justify-center">
            <div className="border-2 border-[#D0AC61] rounded-lg p-4">
              <canvas ref={canvasRef} className="block" width={256} height={256} />
            </div>
          </div>
          <div className="text-center text-sm text-gray-500">
            Visitors can scan this code to sign in
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-lg text-[#1C2A52]">Export Options</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button onClick={downloadQR} disabled={!qrGenerated} className="flex-1 sm:flex-none">
              <Download className="w-4 h-4 mr-2" />
              Download QR
            </Button>
            <Button onClick={printFlyer} disabled={!qrGenerated} variant="outline" className="flex-1 sm:flex-none">
              Print Flyer
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
