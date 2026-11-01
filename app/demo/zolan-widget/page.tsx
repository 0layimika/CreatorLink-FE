"use client";

import { useEffect, useRef, useState } from "react";

type ZolanWidgetInstance = { open: () => Promise<void>; destroy: () => void };
type ZolanWidgetSdk = { mount: (container: HTMLElement, options: Record<string, unknown>) => ZolanWidgetInstance };

declare global {
  interface Window { ZolanWidget?: ZolanWidgetSdk }
}

const widgetUrl = process.env.NEXT_PUBLIC_ZOLAN_WIDGET_URL ?? "http://localhost:8080";

export default function ZolanWidgetDemoPage() {
  const container = useRef<HTMLDivElement>(null);
  const instance = useRef<ZolanWidgetInstance | null>(null);
  const [status, setStatus] = useState("");
  const [sdkLoaded, setSdkLoaded] = useState(false);
  const [amount, setAmount] = useState("1000.00");
  const [currency, setCurrency] = useState("CNY");
  const [publicKey, setPublicKey] = useState("");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const key = params.get("publicKey") ?? process.env.NEXT_PUBLIC_ZOLAN_PUBLIC_KEY ?? "";
    requestAnimationFrame(() => setPublicKey(key));
    const existing = document.querySelector<HTMLScriptElement>("script[data-zolan-sdk]");
    if (window.ZolanWidget) {
      requestAnimationFrame(() => setSdkLoaded(true));
      return;
    }
    const script = existing ?? document.createElement("script");
    script.src = `${widgetUrl}/sdk/zolan-widget.umd.js`;
    script.async = true;
    script.dataset.zolanSdk = "true";
    script.onload = () => { setSdkLoaded(true); setStatus(""); };
    script.onerror = () => setStatus(`Could not load the widget SDK from ${widgetUrl}.`);
    if (!existing) document.head.appendChild(script);
  }, []);

  useEffect(() => {
    if (!container.current || !sdkLoaded || !window.ZolanWidget || !publicKey) return;
    instance.current?.destroy();
    try {
      instance.current = window.ZolanWidget.mount(container.current, {
        publicKey,
        widgetUrl,
        variant: "STANDARD",
        selection: { amount, currency },
        integrationSource: "creatorlink-local-demo",
        createBootstrap: async (selection: unknown, signal: AbortSignal) => {
          const response = await fetch("/api/zolan/widget-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ selection }),
            signal,
          });
          const result = await response.json();
          if (!response.ok) throw new Error(result.message ?? "Could not create widget session.");
          return result.data;
        },
        onEvent: (event: { name: string }) => setStatus(`Widget event: ${event.name}`),
      });
    } catch (error) {
      const message = error instanceof Error ? error.message : "Could not initialize the widget.";
      requestAnimationFrame(() => setStatus(message));
    }
    return () => { instance.current?.destroy(); instance.current = null; };
  }, [sdkLoaded, publicKey, amount, currency]);

  return (
    <main style={{ minHeight: "100vh", background: "#f5f7fb", color: "#151a2d", fontFamily: "Arial, sans-serif", padding: "48px 20px" }}>
      <section style={{ maxWidth: 760, margin: "0 auto" }}>
        <p style={{ color: "#536dfe", fontWeight: 700, letterSpacing: 1 }}>CREATOR LINK × ZOLAN</p>
        <h1 style={{ fontSize: 36, marginBottom: 10 }}>Embedded RMB widget demo</h1>
        <p style={{ color: "#5b6478", lineHeight: 1.6 }}>A local Creator Link page loading the live Zolan widget SDK. Choose an initial amount, then launch the calculator.</p>
        <div style={{ display: "flex", gap: 12, alignItems: "end", flexWrap: "wrap", margin: "28px 0" }}>
          <label>Amount<br /><input value={amount} onChange={(event) => setAmount(event.target.value)} inputMode="decimal" style={{ marginTop: 6, padding: 12, border: "1px solid #d8deeb", borderRadius: 8 }} /></label>
          <label>Receive currency<br /><select value={currency} onChange={(event) => setCurrency(event.target.value)} style={{ marginTop: 6, padding: 12, border: "1px solid #d8deeb", borderRadius: 8 }}><option value="CNY">CNY</option><option value="NGN">NGN</option></select></label>
          <button onClick={() => { void instance.current?.open(); }}  style={{ padding: "13px 22px", border: 0, borderRadius: 8, color: "white", background: "#536dfe", fontWeight: 700, cursor: "pointer" }}>Open widget</button>
        </div>
        <div ref={container} />
        {status && <p role="status" style={{ color: "#5b6478", marginTop: 18 }}>{status}</p>}
        {!publicKey && <p style={{ color: "#a04c00" }}>Add the merchant public integration key as <code>?publicKey=zpk_…</code> to this URL.</p>}
      </section>
    </main>
  );
}
