/** Inventario de ofrendas (máximo 2), visible como íconos. */
import { MAX_OFFERINGS, OFFERINGS } from "@/data/story";
import type { OfferingId } from "@/lib/types";
import { OFFERING_ICONS } from "./illustrations/icons";

export default function Inventory({ items }: { items: OfferingId[] }) {
  const slots = Array.from({ length: MAX_OFFERINGS }, (_, i) => items[i] ?? null);
  const label = items.length
    ? `Ofrendas: ${items.map((id) => OFFERINGS[id].name).join(", ")}`
    : "Sin ofrendas";

  return (
    <div
      className="comic-shadow flex items-center gap-1 rounded-full border-[3px] border-tinta bg-papel px-2 py-1"
      role="img"
      aria-label={label}
      title={label}
    >
      {slots.map((id, i) => {
        const Icon = id ? OFFERING_ICONS[id] : null;
        return (
          <span
            key={id ?? `vacio-${i}`}
            className={`flex h-9 w-9 items-center justify-center rounded-full ${
              Icon ? "animate-rise bg-ocre-claro" : "border-2 border-dashed border-tinta/30"
            }`}
          >
            {Icon && <Icon className="h-7 w-7" />}
          </span>
        );
      })}
    </div>
  );
}
