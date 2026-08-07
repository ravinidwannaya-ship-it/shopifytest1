import { useRef, useState } from "react";
import { Check, ImageUp } from "lucide-react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { fileToImageUrl } from "@/lib/upload-image";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { IMAGES } from "@/data/catalog-data";
import { cn } from "@/lib/utils";

const LIBRARY = Object.entries(IMAGES);

export function ImagePicker({
  label,
  value,
  onChange,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
}) {
  const [url, setUrl] = useState(value);
  const fileRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);

  return (
    <div className="grid gap-2">
      <Label>{label}</Label>
      <div className="grid grid-cols-6 gap-2">
        {LIBRARY.map(([key, src]) => (
          <button
            key={key}
            type="button"
            title={key}
            onClick={() => {
              onChange(src);
              setUrl(src);
            }}
            className={cn(
              "relative aspect-square overflow-hidden rounded-xs border-2",
              value === src ? "border-primary" : "border-transparent hover:border-border",
            )}
          >
            <img src={src} alt={key} className="h-full w-full object-cover" />
            {value === src ? (
              <span className="absolute inset-0 grid place-items-center bg-primary/25">
                <Check className="h-4 w-4 text-primary-foreground" />
              </span>
            ) : null}
          </button>
        ))}
      </div>
      <div className="flex gap-2">
        <Button
          type="button"
          variant="outline"
          size="sm"
          disabled={busy}
          onClick={() => fileRef.current?.click()}
        >
          <ImageUp className="mr-2 h-4 w-4" />
          {busy ? "Uploading…" : "Upload from device"}
        </Button>
        <input
          ref={fileRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={async (e) => {
            const file = e.target.files?.[0];
            if (!file) return;
            setBusy(true);
            try {
              const next = await fileToImageUrl(file);
              onChange(next);
              setUrl(next);
              toast.success("Image uploaded");
            } catch (err) {
              toast.error(err instanceof Error ? err.message : "Upload failed");
            } finally {
              setBusy(false);
              e.target.value = "";
            }
          }}
        />
      </div>
      <Input
        value={url.startsWith("data:") ? "" : url}
        onChange={(e) => {
          setUrl(e.target.value);
          onChange(e.target.value);
        }}
        placeholder="…or paste an image URL"
        aria-label={`${label} URL`}
      />
    </div>
  );
}
