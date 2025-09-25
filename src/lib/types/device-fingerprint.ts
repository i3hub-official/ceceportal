// src/types/device-fingerprint.ts

export interface DeviceFingerprintComponents {
  userAgent: string;
  platform: string;
  language: string;
  languages: string[];
  screenResolution: string;
  colorDepth: number;
  pixelRatio: number;
  hardwareConcurrency: number;
  deviceMemory: number;
  timezone: string;
  platformLanguage: string;
  doNotTrack?: string;
  cookiesEnabled: boolean;
  webglVendor?: {
    vendor: string;
    renderer: string;
  };
  fonts?: string[];
  touchSupport: boolean;
  hasLocalStorage: boolean;
  hasSessionStorage: boolean;
  hasIndexedDB: boolean;
  audioFingerprint: string;
  publicIP?: string;
  localIPs?: string[];
  networkInfo?: {
    type?: string;
    effectiveType?: string;
    downlink?: number;
    rtt?: number;
    saveData?: boolean;
  };
}

export interface WebGLVendorInfo {
  vendor: string;
  renderer: string;
}

// Matches the browser's `NetworkInformation` interface
export interface NetworkInformation {
  effectiveType: string;
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  type?: string; // Added network interface type
}

export interface DeviceFingerprint {
  fingerprint: string;
  components: DeviceFingerprintComponents;
  timestamp: Date | string;
}

export interface FingerprintValidation {
  matches: boolean;
  clientFingerprint: string;
  serverFingerprint: string;
}
