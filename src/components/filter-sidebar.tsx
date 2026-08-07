import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Button } from "@/components/ui/button";
import {
  FINISHES,
  HEIGHT_BUCKETS,
  MATERIALS,
  PRICE_MAX,
  formatINR,
  listFigures,
  type Finish,
  type Material,
} from "@/lib/catalog";

export interface FilterState {
  figures: string[];
  materials: Material[];
  finishes: Finish[];
  maxHeight: number | undefined;
  priceMax: number;
}

export const emptyFilters: FilterState = {
  figures: [],
  materials: [],
  finishes: [],
  maxHeight: undefined,
  priceMax: PRICE_MAX,
};

function toggle<T>(list: T[], value: T): T[] {
  return list.includes(value) ? list.filter((v) => v !== value) : [...list, value];
}

function Group({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="border-b border-border py-5 first:pt-0">
      <h3 className="eyebrow mb-3.5">{title}</h3>
      <div className="grid gap-2.5">{children}</div>
    </div>
  );
}

function Row({
  id,
  label,
  checked,
  onChange,
}: {
  id: string;
  label: string;
  checked: boolean;
  onChange: () => void;
}) {
  return (
    <div className="flex items-center gap-2.5">
      <Checkbox id={id} checked={checked} onCheckedChange={onChange} />
      <Label htmlFor={id} className="cursor-pointer text-sm font-normal">
        {label}
      </Label>
    </div>
  );
}

export function FilterSidebar({
  value,
  onChange,
}: {
  value: FilterState;
  onChange: (next: FilterState) => void;
}) {
  const figures = listFigures();

  return (
    <div className="min-w-0">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-border pb-4">
        <h2 className="truncate font-serif text-xl">Filters</h2>
        <Button
          variant="ghost"
          size="sm"
          className="shrink-0 text-xs"
          onClick={() => onChange(emptyFilters)}
        >
          Clear all
        </Button>
      </div>

      <Group title="Deity / Figure">
        {figures.map((f) => (
          <Row
            key={f}
            id={`fig-${f}`}
            label={f}
            checked={value.figures.includes(f)}
            onChange={() => onChange({ ...value, figures: toggle(value.figures, f) })}
          />
        ))}
      </Group>

      <Group title="Material">
        {MATERIALS.map((m) => (
          <Row
            key={m}
            id={`mat-${m}`}
            label={m}
            checked={value.materials.includes(m)}
            onChange={() => onChange({ ...value, materials: toggle(value.materials, m) })}
          />
        ))}
      </Group>

      <Group title="Height">
        {HEIGHT_BUCKETS.map((b) => (
          <Row
            key={b.label}
            id={`h-${b.max}`}
            label={b.label}
            checked={value.maxHeight === b.max}
            onChange={() =>
              onChange({ ...value, maxHeight: value.maxHeight === b.max ? undefined : b.max })
            }
          />
        ))}
      </Group>

      <Group title="Finish">
        {FINISHES.map((f) => (
          <Row
            key={f}
            id={`fin-${f}`}
            label={f}
            checked={value.finishes.includes(f)}
            onChange={() => onChange({ ...value, finishes: toggle(value.finishes, f) })}
          />
        ))}
      </Group>

      <Group title="Price">
        <Slider
          value={[value.priceMax]}
          min={2000}
          max={PRICE_MAX}
          step={1000}
          onValueChange={(v) => onChange({ ...value, priceMax: v[0] ?? PRICE_MAX })}
        />
        <p className="text-xs text-muted-foreground">Up to {formatINR(value.priceMax)}</p>
      </Group>
    </div>
  );
}
