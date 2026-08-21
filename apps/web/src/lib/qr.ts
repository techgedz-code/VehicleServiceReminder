import QRCode from 'qrcode';

export async function generateQRCodeDataURL(text: string): Promise<string> {
  return QRCode.toDataURL(text, {
    width: 256,
    margin: 2,
    color: {
      dark: '#1f2937',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  });
}

export async function generateQRCodeSVG(text: string): Promise<string> {
  return QRCode.toString(text, {
    type: 'svg',
    width: 256,
    margin: 2,
    color: {
      dark: '#1f2937',
      light: '#ffffff',
    },
    errorCorrectionLevel: 'M',
  });
}