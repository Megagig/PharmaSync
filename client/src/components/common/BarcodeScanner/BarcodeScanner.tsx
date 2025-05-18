import React, { useState, useEffect, useRef } from 'react';
import Button from '../Button/Button';
import Input from '../Input/Input';
import { FaBarcode, FaCamera, FaTimes } from 'react-icons/fa';

interface BarcodeScannerProps {
  onBarcodeDetected: (barcode: string) => void;
  placeholder?: string;
  buttonText?: string;
  className?: string;
  disabled?: boolean;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({
  onBarcodeDetected,
  placeholder = 'Scan or enter barcode',
  buttonText = 'Scan',
  className = '',
  disabled = false,
}) => {
  const [barcode, setBarcode] = useState('');
  const [isScanning, setIsScanning] = useState(false);
  const [hasCameraPermission, setHasCameraPermission] = useState<boolean | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  // Handle manual barcode input
  const handleBarcodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setBarcode(e.target.value);
  };

  const handleBarcodeSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (barcode.trim()) {
      onBarcodeDetected(barcode.trim());
      setBarcode('');
    }
  };

  // Handle barcode scanning with camera
  const startScanning = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
      });
      
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        setIsScanning(true);
        setHasCameraPermission(true);
      }
    } catch (error) {
      console.error('Error accessing camera:', error);
      setHasCameraPermission(false);
      // Fall back to manual input
      if (inputRef.current) {
        inputRef.current.focus();
      }
    }
  };

  const stopScanning = () => {
    if (videoRef.current && videoRef.current.srcObject) {
      const stream = videoRef.current.srcObject as MediaStream;
      const tracks = stream.getTracks();
      tracks.forEach(track => track.stop());
      videoRef.current.srcObject = null;
    }
    setIsScanning(false);
  };

  // Handle keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Alt+B to focus barcode input
      if (e.altKey && e.key === 'b' && inputRef.current) {
        e.preventDefault();
        inputRef.current.focus();
      }
      
      // Escape to stop scanning
      if (e.key === 'Escape' && isScanning) {
        stopScanning();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      // Clean up camera if component unmounts while scanning
      if (isScanning) {
        stopScanning();
      }
    };
  }, [isScanning]);

  // This would be where we'd integrate a barcode detection library
  // For now, we'll just simulate barcode detection with a timeout
  useEffect(() => {
    if (isScanning) {
      // In a real implementation, we would use a library like quagga.js or zxing
      // to detect barcodes from the video stream
      const simulateDetection = setTimeout(() => {
        // This is just a placeholder - in a real app, we'd detect actual barcodes
        const mockBarcode = Math.floor(Math.random() * 1000000000000).toString();
        onBarcodeDetected(mockBarcode);
        stopScanning();
      }, 3000);

      return () => clearTimeout(simulateDetection);
    }
  }, [isScanning, onBarcodeDetected]);

  return (
    <div className={`barcode-scanner ${className}`}>
      {isScanning ? (
        <div className="relative">
          <video
            ref={videoRef}
            className="w-full h-64 bg-gray-900 rounded-lg"
            autoPlay
            playsInline
            muted
          />
          <canvas ref={canvasRef} className="hidden" />
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="w-64 h-1 bg-red-500 animate-pulse" />
          </div>
          <Button
            variant="danger"
            size="sm"
            className="absolute top-2 right-2"
            onClick={stopScanning}
          >
            <FaTimes />
          </Button>
          <div className="text-center mt-2 text-sm text-gray-600">
            Position barcode in the center of the screen
          </div>
        </div>
      ) : (
        <form onSubmit={handleBarcodeSubmit} className="flex items-center gap-2">
          <div className="flex-1">
            <Input
              ref={inputRef}
              type="text"
              value={barcode}
              onChange={handleBarcodeChange}
              placeholder={placeholder}
              disabled={disabled}
              className="w-full"
              autoComplete="off"
            />
          </div>
          <Button
            type="submit"
            variant="primary"
            disabled={!barcode.trim() || disabled}
          >
            <FaBarcode className="mr-1" />
            Enter
          </Button>
          {hasCameraPermission !== false && (
            <Button
              type="button"
              variant="secondary"
              onClick={startScanning}
              disabled={disabled}
            >
              <FaCamera className="mr-1" />
              {buttonText}
            </Button>
          )}
        </form>
      )}
    </div>
  );
};

export default BarcodeScanner;
