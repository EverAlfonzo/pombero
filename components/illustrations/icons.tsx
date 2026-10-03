/** Íconos SVG simples de las ofrendas y de la interfaz. */
import type { OfferingId } from "@/lib/types";

type IconProps = { className?: string };

export function MielIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <rect x="9" y="5" width="14" height="4" rx="1.5" fill="#8a5a2b" />
      <path d="M8 10 H24 C26 14 26 24 22 27 H10 C6 24 6 14 8 10 Z" fill="#e8a317" />
      <path d="M10 15 H22" stroke="#ffd36b" strokeWidth="2" strokeLinecap="round" />
      <path d="M14 10 V14 C14 16 16 16 16 14 V10 Z" fill="#c4840e" />
    </svg>
  );
}

export function HuevoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <path d="M16 4 C23 4 26 15 26 20 C26 25.5 21.5 29 16 29 C10.5 29 6 25.5 6 20 C6 15 9 4 16 4 Z" fill="#f2e6cf" />
      <path d="M11 12 C12 9 13.5 7.5 15 7" stroke="#ffffff" strokeWidth="2" strokeLinecap="round" fill="none" />
    </svg>
  );
}

export function NacoIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 32 32" className={className} aria-hidden="true">
      <g transform="rotate(-35 16 16)">
        <rect x="5" y="12" width="22" height="8" rx="4" fill="#6b3f1f" />
        <path d="M9 12 L11 20 M15 12 L17 20 M21 12 L23 20" stroke="#4a2a12" strokeWidth="1.5" />
        <rect x="13" y="11" width="3" height="10" fill="#c9a35a" />
      </g>
    </svg>
  );
}

export const OFFERING_ICONS: Record<OfferingId, (p: IconProps) => React.ReactElement> = {
  miel: MielIcon,
  huevo: HuevoIcon,
  naco: NacoIcon,
};

export function SpeakerOnIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill="currentColor" />
      <path d="M16.5 8.5 C18 10 18 14 16.5 15.5" />
      <path d="M19 6 C22 9 22 15 19 18" />
    </svg>
  );
}

export function SpeakerOffIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <path d="M4 9 H8 L13 5 V19 L8 15 H4 Z" fill="currentColor" />
      <path d="M17 9 L22 14 M22 9 L17 14" />
    </svg>
  );
}

export function LockIcon({ className }: IconProps) {
  return (
    <svg viewBox="0 0 24 24" className={className} aria-hidden="true" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="5" y="11" width="14" height="10" rx="2" fill="currentColor" fillOpacity="0.15" />
      <path d="M8 11 V8 A4 4 0 0 1 16 8 V11" />
    </svg>
  );
}
