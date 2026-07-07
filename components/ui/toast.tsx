"use client";

import React from "react";

type ToastType = "default" | "success" | "error";

export function showToast(message: string, type: ToastType = "default", ms = 3500) {
  if (typeof window === "undefined") return;
  const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  const container = document.createElement("div");
  container.id = id;
  container.className = `fixed right-4 top-4 z-[9999] max-w-sm`;

  const bg = type === "success" ? "#16a34a" : type === "error" ? "#dc2626" : "#334155";
  const el = document.createElement("div");
  el.style.background = bg;
  el.style.color = "white";
  el.style.padding = "10px 14px";
  el.style.borderRadius = "8px";
  el.style.boxShadow = "0 6px 18px rgba(0,0,0,0.12)";
  el.style.marginTop = "8px";
  el.style.fontSize = "14px";
  el.innerText = message;

  container.appendChild(el);
  document.body.appendChild(container);

  setTimeout(() => {
    try {
      container.style.transition = "opacity 250ms";
      container.style.opacity = "0";
      setTimeout(() => container.remove(), 300);
    } catch {}
  }, ms);
}

export default showToast;
