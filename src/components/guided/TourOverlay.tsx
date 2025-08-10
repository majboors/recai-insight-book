import React, { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

export type TourStep = {
  selector: string; // CSS selector for element to highlight
  title: string;
  description?: string;
  navigateTo?: string; // optional route to navigate for this step
};

export function TourOverlay({ open, steps, onClose }: { open: boolean; steps: TourStep[]; onClose: () => void; }) {
  const [index, setIndex] = useState(0);
  const [reflow, setReflow] = useState(0);
  const [lastNavIndex, setLastNavIndex] = useState<number>(-1);
  const navigate = useNavigate();
  useEffect(() => { if (!open) setIndex(0); }, [open]);

  // Allow page scroll during tour so targets can come into view
  useEffect(() => {
    // intentionally do not lock scroll
  }, [open]);

  // Recalculate positions on resize/scroll while open
  useEffect(() => {
    if (!open) return;
    const handler = () => setReflow((r) => r + 1);
    window.addEventListener("resize", handler);
    window.addEventListener("scroll", handler, true);
    return () => {
      window.removeEventListener("resize", handler);
      window.removeEventListener("scroll", handler, true);
    };
  }, [open]);

  // Nudge reflow when step changes or overlay opens (handles late-rendered DOM)
  useEffect(() => {
    if (!open) return;
    const id = requestAnimationFrame(() => setReflow((r) => r + 1));
    const t = setTimeout(() => setReflow((r) => r + 1), 60);
    return () => { cancelAnimationFrame(id); clearTimeout(t); };
  }, [open, index]);

  // Observe DOM mutations while open to reposition highlight when targets appear
  useEffect(() => {
    if (!open) return;
    const observer = new MutationObserver(() => setReflow((r) => r + 1));
    try { observer.observe(document.body, { childList: true, subtree: true, attributes: true }); } catch {}
    return () => observer.disconnect();
  }, [open]);
  // Ensure target is visible and handle cross-page steps
  useEffect(() => {
    if (!open) return;
    const sel = steps[index]?.selector;
    const navTo = steps[index]?.navigateTo;
    if (!sel) return;
    const el = document.querySelector(sel) as HTMLElement | null;
    if (el) {
      try { el.scrollIntoView({ block: "center", inline: "center", behavior: "smooth" }); } catch {}
      return;
    }
    // If element not found and step declares a route, navigate once
    if (navTo && lastNavIndex !== index) {
      setLastNavIndex(index);
      try { navigate(navTo); } catch {}
      // allow layout to render before next reflow
      setTimeout(() => setReflow((r) => r + 1), 50);
    }
  }, [open, index, steps, navigate, lastNavIndex]);

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
  }, [open, steps, index, reflow]);

  if (!open) return null;

  const step = steps[index];
  const next = () => {
    if (index < steps.length - 1) setIndex(index + 1);
    else onClose();
  };

  return (
    <div role="dialog" aria-modal="true" className="fixed inset-0 z-[1000]">
      {/* Dim background */}
      <div className="absolute inset-0 bg-background/70 backdrop-blur-[2px] z-0 pointer-events-none" />

      {/* Highlight box */}
      {targetRect && (
        <div
          className="absolute z-10 rounded-lg ring-2 ring-primary shadow-[0_0_0_9999px_rgba(0,0,0,0.5)] pulse"
          style={{ top: targetRect.top, left: targetRect.left, width: targetRect.width, height: targetRect.height, pointerEvents: "none" }}
        />
      )}

      {/* Tooltip card */}
      <div
        className="absolute z-20 max-w-sm p-4 rounded-lg bg-card border shadow-xl animate-fade-in pointer-events-auto"
        style={{
          top: (() => {
            const desired = (targetRect?.top ?? 24) + (targetRect ? targetRect.height + 12 : 0);
            const est = 180; // estimated tooltip height
            if (targetRect && desired + est > window.innerHeight - 8) {
              return Math.max(targetRect.top - (est + 12), 8);
            }
            return desired;
          })(),
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
