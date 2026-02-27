import { useState, useRef } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { supabase } from "@/integrations/supabase/client";
import { Upload, X, Move, RotateCcw } from "lucide-react";

interface ImagePosition {
  x: number;
  y: number;
  scale: number;
}

interface ImageUploadWithPositioningProps {
  currentImageUrl?: string;
  onImageChange: (url: string, position?: ImagePosition) => void;
  className?: string;
}

const ImageUploadWithPositioning = ({
  currentImageUrl,
  onImageChange,
  className = ""
}: ImageUploadWithPositioningProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);


  const [isUploading, setIsUploading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [position, setPosition] = useState<ImagePosition>({ x: 0, y: 0, scale: 1 });
  const [imageElement, setImageElement] = useState<HTMLImageElement | null>(null);

  const handleFileSelect = async (file: File) => {
    if (file.size > 15 * 1024 * 1024) {
      console.error("File too large. Please select an image under 15MB.");
      return;
    }

    setIsUploading(true);
    console.log("Starting guest image upload", { fileName: file.name, size: file.size });

    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `guest-${Date.now()}.${fileExt}`;
      const filePath = `${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('guest-images')
        .upload(filePath, file);

      if (uploadError) {
        throw uploadError;
      }

      const { data: { publicUrl } } = supabase.storage
        .from('guest-images')
        .getPublicUrl(filePath);

      // Load image for positioning
      const img = new Image();
      img.onload = () => {
        setImageElement(img);
        drawImageOnCanvas(img);
      };
      img.src = publicUrl;

      onImageChange(publicUrl, position);
      console.log("Guest image uploaded successfully", { url: publicUrl });

    } catch (error) {
      console.error("Failed to upload guest image", error);
    } finally {
      setIsUploading(false);
    }
  };

  const drawImageOnCanvas = (img: HTMLImageElement) => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const canvasSize = 300;
    canvas.width = canvasSize;
    canvas.height = canvasSize;

    // Clear canvas
    ctx.clearRect(0, 0, canvasSize, canvasSize);

    // Calculate image dimensions to fit in canvas while maintaining aspect ratio
    const scale = Math.min(canvasSize / img.width, canvasSize / img.height) * position.scale;
    const width = img.width * scale;
    const height = img.height * scale;

    const x = (canvasSize - width) / 2 + position.x;
    const y = (canvasSize - height) / 2 + position.y;

    ctx.drawImage(img, x, y, width, height);
  };

  const handleMouseDown = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!imageElement) return;
    setIsDragging(true);
  };

  const handleMouseMove = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDragging || !imageElement) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const rect = canvas.getBoundingClientRect();
    const newX = position.x + (e.clientX - rect.left - rect.width / 2) * 0.1;
    const newY = position.y + (e.clientY - rect.top - rect.height / 2) * 0.1;

    const newPosition = { ...position, x: newX, y: newY };
    setPosition(newPosition);
    drawImageOnCanvas(imageElement);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const handleScaleChange = (newScale: number) => {
    if (!imageElement) return;

    const newPosition = { ...position, scale: newScale };
    setPosition(newPosition);
    drawImageOnCanvas(imageElement);
  };

  const resetPosition = () => {
    const newPosition = { x: 0, y: 0, scale: 1 };
    setPosition(newPosition);
    if (imageElement) {
      drawImageOnCanvas(imageElement);
    }
  };

  const handleRemoveImage = () => {
    setImageElement(null);
    setPosition({ x: 0, y: 0, scale: 1 });
    onImageChange('');
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext('2d');
      ctx?.clearRect(0, 0, 300, 300);
    }
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  return (
    <div className={`space-y-4 ${className}`}>
      <div className="flex items-center justify-between">
        <Label>Guest Image</Label>
        {currentImageUrl && (
          <Button
            size="sm"
            variant="outline"
            onClick={handleRemoveImage}
          >
            <X className="h-4 w-4 mr-1" />
            Remove
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Upload Area */}
        <div className="space-y-3">
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) handleFileSelect(file);
            }}
            className="hidden"
          />

          <Button
            type="button"
            variant="outline"
            onClick={() => fileInputRef.current?.click()}
            disabled={isUploading}
            className="w-full"
          >
            {isUploading ? (
              <>
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary mr-2" />
                Uploading...
              </>
            ) : (
              <>
                <Upload className="mr-2 h-4 w-4" />
                Select Image
              </>
            )}
          </Button>

          {imageElement && (
            <div className="space-y-3">
              <div className="space-y-2">
                <Label>Image Scale: {position.scale.toFixed(1)}</Label>
                <Input
                  type="range"
                  min="0.5"
                  max="2"
                  step="0.1"
                  value={position.scale}
                  onChange={(e) => handleScaleChange(parseFloat(e.target.value))}
                />
              </div>

              <Button
                size="sm"
                variant="outline"
                onClick={resetPosition}
                className="w-full"
              >
                <RotateCcw className="h-4 w-4 mr-1" />
                Reset Position
              </Button>
            </div>
          )}
        </div>

        {/* Preview Canvas */}
        <div className="flex flex-col items-center space-y-2">
          <Label>Preview & Position</Label>
          <div className="relative">
            <canvas
              ref={canvasRef}
              width={300}
              height={300}
              className="border border-border rounded-lg cursor-move bg-muted/30"
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
            {imageElement && (
              <div className="absolute top-2 right-2 bg-background/80 backdrop-blur-sm rounded px-2 py-1 text-xs">
                <Move className="h-3 w-3 inline mr-1" />
                Drag to position
              </div>
            )}
          </div>
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        Upload an image (max 15MB), then drag to position and use the scale slider to adjust size.
      </p>
    </div>
  );
};

export default ImageUploadWithPositioning;