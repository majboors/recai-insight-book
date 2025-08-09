import React, { useEffect, useMemo, useState } from "react";

export type TourStep = {
  selector: string; // CSS selector for element to highlight
  title: string;
  description?: string;
};

export function TourOverlay({ open, steps, onClose }: { open: boolean; steps: TourStep[]; onClose: () => void; }) {
  const [index, setIndex] = useState(0);
  useEffect(() => { if (!open) setIndex(0); }, [open]);

  // Lock scroll only while tour is open
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  // Ensure target is visible and reflow on step changes
  useEffect(() => {
    if (!open) return;
    const sel = steps[index]?.selector;
    if (!sel) return;
    const el = document.querySelector(sel) as HTMLElement | null;
    if (el) {
      try { el.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" }); } catch {}
    }
  }, [open, index, steps]);

  const targetRect = useMemo(() => {
    if (!open) return null;
    const sel = steps[index]?.selector;
    if (!sel) return null;
    const el = document.querySelector(sel) as HTMLElement | null;
    if (!el) return null;
    const rect = el.getBoundingClientRect();
    return {
      top: Math.max(rect.top - 8, 8),
      left: Math.max(rect.left - 8, 8),
      width: rect.width + 16,
      height: rect.height + 16,
    };
  }, [open, steps, index]);

  if (!open) return null;

  const step = steps[index];
  const next = () => {
    if (index < steps.length - 1) setIndex(index + 1);
    else onClose();
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000]">
      {/* Dim background */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px]" />

      {/* Highlight box */}
      {targetRect && (
        <div
          className="absolute rounded-lg ring-2 ring-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]"
          style={{ top: targetRect.top, left: targetRect.left, width: targetRect.width, height: targetRect.height, pointerEvents: "none" }}
        />
      )}

      {/* Tooltip card */}
      <div
        className="absolute max-w-sm p-4 rounded-lg bg-card border shadow-xl animate-fade-in"
        style={{
          top: (targetRect?.top ?? 24) + (targetRect ? targetRect.height + 12 : 0),
          left: targetRect ? Math.min(targetRect.left, window.innerWidth - 360) : 24,
        }}
      >
        <div className="text-sm font-medium heading-zen mb-1">{step?.title}</div>
        {step?.description && <p className="text-xs text-muted-foreground mb-3">{step.description}</p>}
        <div className="flex items-center justify-between gap-2">
          <button className="text-xs underline text-muted-foreground hover:text-foreground" onClick={onClose}>Skip</button>
          <div className="text-xs text-muted-foreground">{index + 1} / {steps.length}</div>
          <button className="px-3 py-1 rounded bg-primary text-primary-foreground text-xs hover:opacity-90" onClick={next}>
            {index < steps.length - 1 ? "Next" : "Done"}
          </button>
        </div>
      </div>
    </div>
  );
}
