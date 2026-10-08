import Image from "next/image";
import { ImageOff } from "lucide-react";
import { cn } from "@/lib/cn";

interface ProductImageProps {
  src: string;
  alt: string;
  sizes: string;
  className?: string;
  preload?: boolean;
}

export function ProductImage({
  src,
  alt,
  sizes,
  className,
  preload,
}: ProductImageProps) {
  if (!src) {
    return (
      <div className="absolute inset-0 flex items-center justify-center text-slate-400">
        <ImageOff className="h-8 w-8" aria-hidden />
        <span className="sr-only">{alt}</span>
      </div>
    );
  }

  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      preload={preload}
      className={cn("object-contain", className)}
    />
  );
}
