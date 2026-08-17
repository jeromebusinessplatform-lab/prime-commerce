import { cn } from "@/lib/utils.ts";

/**
 * Official PRIME wordmark.
 * Uses mix-blend-mode: multiply to visually remove white background without altering artwork.
 * Must be placed on a white/light surface.
 */
export default function PrimeLogo({
  className,
  alt = "PRIME",
}: {
  className?: string;
  alt?: string;
}) {
  return (
    <img
      src="/logo/prime-official.jpg"
      alt={alt}
      draggable={false}
      className={cn("w-auto select-none object-contain mix-blend-multiply", className)}
    />
  );
}
