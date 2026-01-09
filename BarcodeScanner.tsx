
import React, { useEffect, useRef } from 'react';
import { Html5QrcodeScanner } from 'html5-qrcode';
import { X } from 'lucide-react';

interface BarcodeScannerProps {
  onScan: (decodedText: string) => void;
  onClose: () => void;
  title?: string;
}

const BarcodeScanner: React.FC<BarcodeScannerProps> = ({ onScan, onClose, title = "Scan Barcode / QR Code" }) => {
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    // Small delay to ensure the DOM element #reader is fully rendered
    const timeoutId = setTimeout(() => {
      try {
        if (!document.getElementById("reader")) return;

        scannerRef.current = new Html5QrcodeScanner(
          "reader",
          { fps: 10, qrbox: { width: 250, height: 250 } },
          /* verbose= */ false
        );

        scannerRef.current.render(
          (decodedText) => {
            onScan(decodedText);
            if (scannerRef.current) {
              scannerRef.current.clear().catch(err => console.debug("Scanner clear error:", err));
            }
          },
          (error) => {
            // Silently ignore standard camera scanning errors
          }
        );
      } catch (err) {
        console.error("Failed to initialize scanner:", err);
      }
    }, 100);

    return () => {
      clearTimeout(timeoutId);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.debug("Scanner cleanup clear error:", err));
      }
    };
  }, [onScan]);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden relative">
        <div className="p-4 border-b border-slate-100 flex justify-between items-center">
          <h3 className="font-bold text-slate-800">{title}</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full transition-colors">
            <X size={24} className="text-slate-500" />
          </button>
        </div>
        <div className="p-4">
          <div id="reader" className="overflow-hidden rounded-xl"></div>
          <p className="mt-4 text-center text-xs text-slate-400">
            Center the code within the viewfinder to scan automatically.
          </p>
        </div>
      </div>
    </div>
  );
};

export default BarcodeScanner;
