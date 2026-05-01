import type { ViewId } from "../types/state";
import { VIEW_LABELS_DE } from "./constants";

export const DEFAULT_VIEW: ViewId = "overview";

const VALID_VIEWS: ReadonlySet<string> = new Set(Object.keys(VIEW_LABELS_DE));

export function parseHash(raw: string): ViewId {
  if (!raw) return DEFAULT_VIEW;
  let cleaned = raw.startsWith("#") ? raw.slice(1) : raw;
  if (cleaned.startsWith("/")) cleaned = cleaned.slice(1);
  if (cleaned.endsWith("/")) cleaned = cleaned.slice(0, -1);
  return VALID_VIEWS.has(cleaned) ? (cleaned as ViewId) : DEFAULT_VIEW;
}

export function viewToHash(view: ViewId): string {
  return `#/${view}`;
}

export function setHash(view: ViewId): void {
  window.location.hash = viewToHash(view);
}
