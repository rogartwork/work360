"use client";

import { useEffect } from "react";

export const STORAGE_KEY = "nexus_crm_zoom";
export const ZOOM_LEVELS = [70, 75, 80, 85, 90, 95, 100];

export function applyZoom(zoom: number) {
  const scale = zoom / 100;
  // Aplica o zoom ao body (proporcional, como o zoom do navegador)
  document.body.style.zoom = `${zoom}%`;
  // Atualiza o CSS variable para compensar o h-screen
  // Isso faz com que elementos com h-screen usem calc(100vh / scale)
  // garantindo que preencham o viewport visual corretamente
  document.documentElement.style.setProperty("--nexus-zoom", String(scale));
  // Remove qualquer minHeight residual de versões anteriores
  document.documentElement.style.minHeight = "";
}

// Componente invisível: aplica o zoom salvo ao carregar qualquer página
export default function ZoomApplier() {
  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY);
    const zoom = saved ? parseInt(saved, 10) : 100;
    applyZoom(zoom);
  }, []);

  return null;
}
