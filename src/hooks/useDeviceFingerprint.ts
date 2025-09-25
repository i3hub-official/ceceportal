// hooks/useDeviceFingerprint.ts
"use client";

import { useState, useEffect, useCallback } from "react";
import {
  DeviceFingerprint as DeviceFingerprintUtil,
 } from "@/lib/utils/client-device-fingerprint";

import type {
  DeviceFingerprint,
  DeviceFingerprintComponents,
} from "@/lib/types/device-fingerprint";

export function useDeviceFingerprint() {
  const [fingerprint, setFingerprint] = useState<DeviceFingerprint | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // ✅ ensure we always return { fingerprint, components, timestamp }
  const normalize = (raw: DeviceFingerprint): DeviceFingerprint => {
    const components: DeviceFingerprintComponents =
      (raw as DeviceFingerprint).components || ({} as DeviceFingerprintComponents);

    return {
      fingerprint: raw.fingerprint,
      components,
      timestamp: new Date().toISOString(),
    };
  };

  const generateFingerprint = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const result = await DeviceFingerprintUtil.generate();

      if (result) {
        const validated =
          DeviceFingerprintUtil.validateFingerprintSchema(result);
        if (validated) {
          setFingerprint(normalize(validated));
        } else {
          setError("Generated fingerprint failed validation");
        }
      } else {
        setError("Failed to generate fingerprint");
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    generateFingerprint();
  }, [generateFingerprint]);

  return {
    fingerprint,
    loading,
    error,
    refreshFingerprint: generateFingerprint,
  };
}
