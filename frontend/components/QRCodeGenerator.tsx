import React, { useEffect, useRef, useState } from 'react';
import QRCode from 'qrcode';

interface QRCodeGeneratorProps {
  value: string;
  size?: number;
  fgColor?: string;
  bgColor?: string;
}

const QRCodeGenerator: React.FC<QRCodeGeneratorProps> = ({
  value,
  size = 256, // Default size of the QR code (256x256 pixels)
  fgColor = '#000000',
  bgColor = '#ffffff',
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);  // Use a canvas to render the QR code
  const [error, setError] = useState<string | null>(null);     // To handle potential errors

  useEffect(() => {
    // Generate the QR code when the component mounts or when the 'value' prop changes
    const generateQRCode = async () => {
      if (canvasRef.current) {
        try {
          await QRCode.toCanvas(canvasRef.current, value, {
            width: size,       // Set the QR code size
            color: {
              dark: fgColor,   // Set the QR code color
              light: bgColor,  // Set the background color
            },
          });
          setError(null);  // Reset any previous errors
        } catch (err) {
          setError('Failed to generate QR code');
          console.error('Error generating QR code:', err);
        }
      }
    };

    generateQRCode();  // Call the function to generate the QR code

  }, [value, size, fgColor, bgColor]);  // Re-run when props change

  return (
    <div className="">
      {error && <p className="text-red-500">{error}</p>}
      <canvas ref={canvasRef}></canvas>  {/* Render the QR code inside a canvas */}
    </div>
  );
};

export default QRCodeGenerator;
