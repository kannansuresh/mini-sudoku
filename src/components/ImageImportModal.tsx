import { useState, useCallback, useRef } from 'react';
import Cropper, { type Area } from 'react-easy-crop';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Slider } from "@/components/ui/slider";
import { Loader2, Upload, ScanLine } from "lucide-react";
import { scanGrid } from "@/lib/scanGrid";

interface ImageImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  onScanComplete: (grid: (number | null)[][]) => void;
}

export function ImageImportModal({ isOpen, onClose, onScanComplete }: ImageImportModalProps) {
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
  const [isScanning, setIsScanning] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const onCropComplete = useCallback((_croppedArea: Area, croppedAreaPixels: Area) => {
    setCroppedAreaPixels(croppedAreaPixels);
  }, []);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const file = e.target.files[0];
      setImageFile(file);
      const reader = new FileReader();
      reader.addEventListener('load', () => setImageSrc(reader.result as string));
      reader.readAsDataURL(file);
    }
  };

  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    if (e.clipboardData.files && e.clipboardData.files.length > 0) {
      const file = e.clipboardData.files[0];
      if (file.type.startsWith('image/')) {
        setImageFile(file);
        const reader = new FileReader();
        reader.addEventListener('load', () => setImageSrc(reader.result as string));
        reader.readAsDataURL(file);
      }
    }
  }, []);

  const handleScan = async () => {
    if (!imageFile || !croppedAreaPixels) return;

    setIsScanning(true);
    try {
      const grid = await scanGrid(imageFile, croppedAreaPixels);
      onScanComplete(grid);
      onClose();
    } catch (error) {
      console.error("Scan failed:", error);
      // Ideally show error toast here
    } finally {
      setIsScanning(false);
    }
  };

  const reset = () => {
    setImageSrc(null);
    setImageFile(null);
    setZoom(1);
    setCrop({ x: 0, y: 0 });
  };

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="sm:max-w-md" onPaste={handlePaste}>
        <DialogHeader>
          <DialogTitle>Import from Image</DialogTitle>
          <DialogDescription>
            Upload or paste a screenshot of the Sudoku grid. Crop it to the edges for best results.
          </DialogDescription>
        </DialogHeader>

        {!imageSrc ? (
          <div
            className="flex flex-col items-center justify-center h-[300px] border-2 border-dashed border-neutral-300 rounded-lg bg-neutral-50 dark:border-neutral-700 dark:bg-neutral-900 cursor-pointer hover:bg-neutral-100 dark:hover:bg-neutral-800 transition-colors"
            onClick={() => fileInputRef.current?.click()}
          >
            <Upload className="h-10 w-10 text-neutral-400 mb-4" />
            <p className="text-sm text-neutral-600 dark:text-neutral-400 font-medium">
              Click to upload or paste image (Ctrl+V)
            </p>
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept="image/*"
              className="hidden"
            />
          </div>
        ) : (
          <div className="space-y-4">
            <div className="relative h-[300px] w-full overflow-hidden rounded-lg bg-black">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>

            <div className="flex items-center gap-2">
              <span className="text-xs text-neutral-500 w-12">Zoom</span>
              <Slider
                value={[zoom]}
                min={1}
                max={3}
                step={0.1}
                onValueChange={(value) => setZoom(value[0])}
                className="flex-1"
              />
            </div>
          </div>
        )}

        <DialogFooter className="flex gap-2 sm:justify-between">
          <Button variant="ghost" onClick={imageSrc ? reset : onClose}>
            {imageSrc ? "Back" : "Cancel"}
          </Button>
          {imageSrc && (
            <Button onClick={handleScan} disabled={isScanning}>
              {isScanning ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Scanning...
                </>
              ) : (
                <>
                  <ScanLine className="mr-2 h-4 w-4" />
                  Scan Grid
                </>
              )}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
