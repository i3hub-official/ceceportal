// lib/util/device-fingerprint.ts
import { NetworkInfo } from "./network-info";
import {
  DeviceFingerprintComponents,
  DeviceFingerprint as DeviceFingerprintType,
  WebGLVendorInfo,
} from "../types/device-fingerprint";

export class DeviceFingerprint {
  // ---------------- Schema validation ----------------
  static validateFingerprintSchema(
    fingerprint: unknown
  ): DeviceFingerprintType | null {
    if (!fingerprint || typeof fingerprint !== "object") return null;

    const f = fingerprint as Partial<DeviceFingerprintType>;
    if (typeof f.fingerprint !== "string" || typeof f.timestamp !== "string") {
      return null;
    }

    const c = f.components as Partial<DeviceFingerprintComponents>;
    if (!c || typeof c !== "object") return null;

    const normalized: DeviceFingerprintComponents = {
      userAgent: c.userAgent || "",
      language: c.language || "",
      languages: Array.isArray(c.languages)
        ? c.languages
        : typeof c.languages === "string"
        ? [c.languages]
        : [],
      platform: c.platform || "",
      platformLanguage: c.platformLanguage || "",
      doNotTrack: c.doNotTrack ?? undefined,
      screenResolution: c.screenResolution || "",
      colorDepth: c.colorDepth ?? 0,
      pixelRatio: typeof c.pixelRatio === "number" ? c.pixelRatio : Number(c.pixelRatio) || 0,
      timezone: c.timezone || "",
      hardwareConcurrency: typeof c.hardwareConcurrency === "number"
        ? c.hardwareConcurrency
        : Number(c.hardwareConcurrency) || 0,
      deviceMemory: typeof c.deviceMemory === "number" ? c.deviceMemory : Number(c.deviceMemory) || 0,
      localIPs: c.localIPs || [],
      networkInfo: c.networkInfo ?? undefined,
      publicIP: c.publicIP ?? undefined,
      // ipProvider: c.ipProvider || null, // Removed because it's not part of DeviceFingerprintComponents
      hasLocalStorage: c.hasLocalStorage ?? false,
      hasSessionStorage: c.hasSessionStorage ?? false,
      hasIndexedDB: c.hasIndexedDB ?? false,
      touchSupport: c.touchSupport ?? false,
      cookiesEnabled: c.cookiesEnabled ?? false,
      webglVendor: c.webglVendor ?? undefined,
      audioFingerprint: c.audioFingerprint || "not_supported",
      fonts: Array.isArray(c.fonts)
        ? c.fonts
        : typeof c.fonts === "string"
        ? [c.fonts]
        : [],
    };

    return {
      fingerprint: f.fingerprint,
      components: normalized,
      timestamp: f.timestamp,
    };
  }

  // ---------------- Main generator ----------------
  static async generate(): Promise<DeviceFingerprintType | null> {
    if (typeof window === "undefined" || typeof navigator === "undefined") {
      return null;
    }

    try {
      const networkData = await NetworkInfo.getAllNetworkInfo();

      const components: DeviceFingerprintComponents = {
        userAgent: navigator.userAgent,
        language: navigator.language,
        languages: navigator.languages ? Array.from(navigator.languages) : [],
        platform: navigator.platform,
        platformLanguage: (navigator as Navigator & { userLanguage?: string }).userLanguage || "",
        doNotTrack: navigator.doNotTrack ?? undefined,
        screenResolution: `${screen.width}x${screen.height}`,
        colorDepth: screen.colorDepth,
        pixelRatio: typeof window.devicePixelRatio === "number" ? window.devicePixelRatio : 0,
        timezone: Intl.DateTimeFormat().resolvedOptions().timeZone,
        hardwareConcurrency: typeof navigator.hardwareConcurrency === "number"
          ? navigator.hardwareConcurrency
          : Number(navigator.hardwareConcurrency) || 0,
        deviceMemory: typeof (navigator as Navigator & { deviceMemory?: number }).deviceMemory === "number"
          ? (navigator as Navigator & { deviceMemory?: number }).deviceMemory!
          : 0,
        localIPs: networkData.localIPs,
        networkInfo: networkData.networkInfo ?? undefined,
        publicIP: networkData.publicIP ?? undefined,
        hasLocalStorage: this.checkStorage("localStorage"),
        hasSessionStorage: this.checkStorage("sessionStorage"),
        hasIndexedDB: typeof indexedDB !== "undefined",
        touchSupport:
          "ontouchstart" in window ||
          ((navigator as Navigator).maxTouchPoints ?? 0) > 0,
        cookiesEnabled: navigator.cookieEnabled,
        webglVendor: this.getWebGLVendor(),
        audioFingerprint: this.getAudioFingerprint(),
        fonts: this.getFonts(),
      };

      // Exclude volatile fields from hash
      const { localIPs, publicIP, networkInfo, ...stable } =
        components;

      const fingerprintString = Object.values(stable)
        .map((v) => (Array.isArray(v) ? v.join(",") : String(v)))
        .join("|");

      const fingerprintHash = await this.hashString(fingerprintString);

      return {
        fingerprint: fingerprintHash,
        components,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      console.error("Failed to generate fingerprint:", error);
      return null;
    }
  }

  // ---------------- Helpers ----------------
  private static checkStorage(
    type: "localStorage" | "sessionStorage"
  ): boolean {
    try {
      const testKey = "__test__";
      const storage: Storage =
        type === "localStorage" ? window.localStorage : window.sessionStorage;
      storage.setItem(testKey, "1");
      storage.removeItem(testKey);
      return true;
    } catch {
      return false;
    }
  }

  private static async hashString(str: string): Promise<string> {
    if (crypto?.subtle) {
      const encoder = new TextEncoder();
      const data = encoder.encode(str);
      const hash = await crypto.subtle.digest("SHA-256", data);
      return Array.from(new Uint8Array(hash))
        .map((b) => b.toString(16).padStart(2, "0"))
        .join("");
    }
    // fallback hash
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return Math.abs(hash).toString(16);
  }

  private static getWebGLVendor(): WebGLVendorInfo | undefined {
    try {
      const canvas = document.createElement("canvas");
      const gl = (canvas.getContext("webgl") ||
        canvas.getContext(
          "experimental-webgl"
        )) as WebGLRenderingContext | null;

      if (!gl) return undefined;

      const dbgInfo = gl.getExtension("WEBGL_debug_renderer_info") as {
        UNMASKED_VENDOR_WEBGL: number;
        UNMASKED_RENDERER_WEBGL: number;
      } | null;

      return dbgInfo
        ? {
            vendor: gl.getParameter(
              dbgInfo.UNMASKED_VENDOR_WEBGL
            ) as string,
            renderer: gl.getParameter(
              dbgInfo.UNMASKED_RENDERER_WEBGL
            ) as string,
          }
        : undefined;
    } catch {
      return undefined;
    }
  }

  private static getCanvasFingerprint(): string | null {
    try {
      const canvas = document.createElement("canvas");
      const ctx = canvas.getContext("2d");
      if (!ctx) return null;

      ctx.textBaseline = "top";
      ctx.font = "14px 'Arial'";
      ctx.fillText("DeviceFingerprint", 2, 2);

      return canvas.toDataURL();
    } catch {
      return null;
    }
  }

  private static getAudioFingerprint(): string {
    try {
      const ctx = new (
        window.AudioContext ||
        (window as typeof window & { webkitAudioContext?: typeof AudioContext }).webkitAudioContext!
      )();
      const oscillator = ctx.createOscillator();
      const analyser = ctx.createAnalyser();
      const gain = ctx.createGain();
      oscillator.type = "triangle";
      oscillator.connect(gain);
      gain.connect(analyser);
      oscillator.start(0);

      const array = new Float32Array(analyser.frequencyBinCount);
      analyser.getFloatFrequencyData(array);

      oscillator.stop();
      ctx.close();
      return array.slice(0, 10).join(",");
    } catch {
      return "not_supported";
    }
  }

  private static getFonts(): string[] {
    // placeholder - extend with real font detection later
    return ["Arial", "Verdana", "Times New Roman"];
  }

  // ---------------- Quick ID ----------------
  static async getQuickFingerprint(): Promise<string> {
    const keyComponents = [
      navigator.userAgent,
      navigator.platform,
      screen.width,
      screen.height,
      navigator.language,
      Intl.DateTimeFormat().resolvedOptions().timeZone,
    ].join("|");

    return await this.hashString(keyComponents);
  }
}
