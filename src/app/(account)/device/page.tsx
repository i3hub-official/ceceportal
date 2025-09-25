"use client";
import { useState } from "react";
import { useDeviceFingerprint } from "@/hooks/useDeviceFingerprint";
import {
  Copy,
  Check,
  RefreshCw,
  Smartphone,
  Cpu,
  Globe,
  Monitor,
  Fingerprint,
  Webhook,
  Type,
  Touchpad,
  Shield,
  Home,
  ArrowLeft,
  Wifi,
} from "lucide-react";
import Link from "next/link";

export default function DeviceFingerprintPage() {
  const { fingerprint, loading, error, refreshFingerprint } =
    useDeviceFingerprint();
  const [copied, setCopied] = useState<boolean>(false);

  const copyToClipboard = async () => {
    if (fingerprint) {
      try {
        await navigator.clipboard.writeText(fingerprint.fingerprint);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error("Failed to copy:", err);
      }
    }
  };

  // Add this function inside your component
  const getConnectionQualityLabel = (effectiveType: string) => {
    const labels: { [key: string]: string } = {
      "slow-2g": "Very Slow (2G)",
      "2g": "Slow (2G)",
      "3g": "Moderate (3G)",
      "4g": "Fast (4G)",
      "5g": "Very Fast (5G)",
    };
    return labels[effectiveType] || effectiveType;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-foreground/70">Detecting network information...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-red-500">Error: {error}</div>
      </div>
    );
  }

  if (!fingerprint) {
    return (
      <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
        <div className="text-foreground/70">Unable to generate fingerprint</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground p-4 py-8 pt-15">
      <div className="max-w-6xl mx-auto">
        {/* Header Section */}
        <div className="bg-gradient-to-br from-primary/10 to-primary/5 p-6 rounded-2xl mb-8">
          <div className="flex justify-between items-start mb-6">
            <div>
              <div className="flex items-center mb-2">
                <Shield className="w-8 h-8 text-primary mr-2" />
                <h1 className="text-2xl font-bold">SecureID</h1>
              </div>
              <p className="text-sm text-foreground/70">
                Government-compliant identity verification
              </p>
            </div>

            {/* Mobile-only back to home button */}
            <Link
              href="/"
              className="md:hidden text-primary hover:underline flex items-center text-sm"
            >
              <Home className="w-4 h-4 mr-1" /> Home
            </Link>
          </div>

          <div className="bg-primary/5 rounded-lg p-4 border border-primary/10">
            <div className="flex items-center mb-2">
              <Fingerprint className="w-4 h-4 text-primary mr-2" />
              <h3 className="font-medium text-sm">Device Fingerprint</h3>
            </div>
            <p className="text-foreground/70 text-xs">
              Unique identifier generated from your device&apos;s hardware and
              software characteristics
            </p>
          </div>
        </div>

        <div className="mb-6">
          <h2 className="text-2xl font-bold text-foreground flex items-center gap-3">
            <Fingerprint className="w-8 h-8" />
            Device Fingerprint
          </h2>
          <p className="text-foreground/70 mt-2 max-w-2xl">
            This unique identifier is generated based on your device&apos;s
            hardware and software characteristics. It remains consistent as long
            as your device configuration doesn&apos;t change.
          </p>
        </div>

        {/* Fingerprint Card */}
        <div className="bg-card rounded-xl shadow-lg p-6 border border-border mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-xl font-semibold text-foreground flex items-center gap-2">
              <Fingerprint className="w-5 h-5" />
              Device Identifier
            </h3>
            <div className="flex gap-2">
              <button
                onClick={copyToClipboard}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-primary/10 hover:bg-primary/20 text-primary rounded-md transition-colors"
              >
                {copied ? (
                  <Check className="w-4 h-4" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
                {copied ? "Copied!" : "Copy"}
              </button>
              <button
                onClick={refreshFingerprint}
                className="flex items-center gap-1 px-3 py-1 text-sm bg-foreground/5 hover:bg-foreground/10 text-foreground rounded-md transition-colors"
              >
                <RefreshCw className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          <div className="bg-foreground/5 p-4 rounded-lg mb-4">
            <code className="text-foreground break-all font-mono text-sm">
              {fingerprint.fingerprint}
            </code>
          </div>

          <p className="text-sm text-foreground/70">
            This fingerprint is generated from your device&apos;s hardware and
            software characteristics. It will remain consistent unless your
            device configuration changes significantly.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {/* Browser & OS Info */}
          <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Globe className="w-5 h-5" />
              Browser & OS
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-foreground/70">
                  User Agent
                </dt>
                <dd
                  className="text-sm text-foreground truncate"
                  title={fingerprint.components.userAgent}
                >
                  {fingerprint.components.userAgent}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-foreground/70">
                  Platform
                </dt>
                <dd className="text-sm text-foreground">
                  {fingerprint.components.platform}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-foreground/70">
                  Language
                </dt>
                <dd className="text-sm text-foreground">
                  {fingerprint.components.language}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-foreground/70">
                  Languages
                </dt>
                <dd className="text-sm text-foreground">
                  {fingerprint.components.languages}
                </dd>
              </div>
            </dl>
          </div>

          {/* Hardware Info */}
          <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Cpu className="w-5 h-5" />
              Hardware
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-foreground/70">
                  Screen Resolution
                </dt>
                <dd className="text-sm text-foreground">
                  {fingerprint.components.screenResolution}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-foreground/70">
                  Color Depth
                </dt>
                <dd className="text-sm text-foreground">
                  {fingerprint.components.colorDepth} bits
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-foreground/70">
                  Pixel Ratio
                </dt>
                <dd className="text-sm text-foreground">
                  {fingerprint.components.pixelRatio}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-foreground/70">
                  CPU Cores
                </dt>
                <dd className="text-sm text-foreground">
                  {fingerprint.components.hardwareConcurrency}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-foreground/70">
                  Device Memory
                </dt>
                <dd className="text-sm text-foreground">
                  {fingerprint.components.deviceMemory} GB
                </dd>
              </div>
            </dl>
          </div>

          {/* System Info */}
          <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Monitor className="w-5 h-5" />
              System
            </h3>
            <dl className="space-y-3">
              <div>
                <dt className="text-sm font-medium text-foreground/70">
                  Timezone
                </dt>
                <dd className="text-sm text-foreground">
                  {fingerprint.components.timezone}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-foreground/70">
                  Platform Language
                </dt>
                <dd className="text-sm text-foreground">
                  {fingerprint.components.platformLanguage}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-foreground/70">
                  Do Not Track
                </dt>
                <dd className="text-sm text-foreground">
                  {fingerprint.components.doNotTrack || "Not set"}
                </dd>
              </div>
              <div>
                <dt className="text-sm font-medium text-foreground/70">
                  Cookies Enabled
                </dt>
                <dd className="text-sm text-foreground">
                  {fingerprint.components.cookiesEnabled ? "Yes" : "No"}
                </dd>
              </div>
            </dl>
          </div>

          {/* WebGL Info */}
          {fingerprint.components.webglVendor && (
            <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
              <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
                <Webhook className="w-5 h-5" />
                WebGL (GPU)
              </h3>
              <dl className="space-y-3">
                <div>
                  <dt className="text-sm font-medium text-foreground/70">
                    Vendor
                  </dt>
                  <dd className="text-sm text-foreground">
                    {fingerprint.components.webglVendor.vendor}
                  </dd>
                </div>
                <div>
                  <dt className="text-sm font-medium text-foreground/70">
                    Renderer
                  </dt>
                  <dd className="text-sm text-foreground">
                    {fingerprint.components.webglVendor.renderer}
                  </dd>
                </div>
              </dl>
            </div>
          )}

          {/* Fonts */}
          <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Type className="w-5 h-5" />
              Available Fonts
            </h3>
            <div className="flex flex-wrap gap-2">
              {fingerprint.components.fonts?.map((font, index) => (
                <span
                  key={index}
                  className="px-2 py-1 bg-primary/10 text-primary text-xs rounded"
                >
                  {font}
                </span>
              ))}
            </div>
          </div>

          {/* Capabilities */}
          <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Touchpad className="w-5 h-5" />
              Capabilities
            </h3>
            <dl className="space-y-3">
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-foreground/70">
                  Touch Support
                </dt>
                <dd className="text-sm text-foreground">
                  {fingerprint.components.touchSupport ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-red-600">No</span>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-foreground/70">
                  Local Storage
                </dt>
                <dd className="text-sm text-foreground">
                  {fingerprint.components.hasLocalStorage ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-red-600">No</span>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-foreground/70">
                  Session Storage
                </dt>
                <dd className="text-sm text-foreground">
                  {fingerprint.components.hasSessionStorage ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-red-600">No</span>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-foreground/70">
                  IndexedDB
                </dt>
                <dd className="text-sm text-foreground">
                  {fingerprint.components.hasIndexedDB ? (
                    <span className="text-green-600">Yes</span>
                  ) : (
                    <span className="text-red-600">No</span>
                  )}
                </dd>
              </div>
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-foreground/70">
                  Audio Context
                </dt>
                <dd className="text-sm text-foreground">
                  {fingerprint.components.audioFingerprint === "supported" ? (
                    <span className="text-green-600">Supported</span>
                  ) : (
                    <span className="text-red-600">Not Supported</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>

          {/* Network Information Card */}
          <div className="bg-card rounded-xl shadow-lg p-6 border border-border">
            <h3 className="text-lg font-semibold text-foreground mb-4 flex items-center gap-2">
              <Wifi className="w-5 h-5" />
              Network Information
            </h3>
            <dl className="space-y-3">
              {/* Public IP */}
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-foreground/70">
                  Public IP
                </dt>
                <dd className="text-sm text-foreground font-mono">
                  {fingerprint.components.publicIP ?? "Unavailable"}
                </dd>
              </div>

              {/* Local IPs */}
              <div>
                <dt className="text-sm font-medium text-foreground/70 mb-2">
                  Local IPs
                </dt>
                <dd className="text-sm">
                  {fingerprint.components.localIPs?.length ? (
                    <div className="flex flex-wrap gap-1">
                      {fingerprint.components.localIPs.map((ip, index) => (
                        <span
                          key={index}
                          className="px-2 py-1 bg-primary/10 text-primary text-xs rounded font-mono"
                        >
                          {ip}
                        </span>
                      ))}
                    </div>
                  ) : (
                    <span className="text-foreground/70">Unavailable</span>
                  )}
                </dd>
              </div>

              {/* Network Interface */}
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-foreground/70">
                  Interface
                </dt>
                <dd className="text-sm text-foreground">
                  {fingerprint.components.networkInfo?.type ? (
                    <span className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                      {fingerprint.components.networkInfo.type.toUpperCase()}
                    </span>
                  ) : (
                    "Unknown"
                  )}
                </dd>
              </div>

              {/* Connection Quality */}
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-foreground/70">
                  Quality
                </dt>
                <dd className="text-sm">
                  {fingerprint.components.networkInfo?.effectiveType ? (
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        fingerprint.components.networkInfo.effectiveType.includes(
                          "4g"
                        ) ||
                        fingerprint.components.networkInfo.effectiveType.includes(
                          "5g"
                        )
                          ? "bg-green-100 text-green-800"
                          : fingerprint.components.networkInfo.effectiveType.includes(
                              "3g"
                            )
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }`}
                    >
                      {getConnectionQualityLabel(
                        fingerprint.components.networkInfo.effectiveType
                      )}
                    </span>
                  ) : (
                    <span className="text-foreground/70">Unavailable</span>
                  )}
                </dd>
              </div>

              {/* Downlink Speed */}
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-foreground/70">
                  Download Speed
                </dt>
                <dd className="text-sm text-foreground">
                  {typeof fingerprint.components.networkInfo?.downlink ===
                  "number"
                    ? `${fingerprint.components.networkInfo.downlink} Mbps`
                    : "Unavailable"}
                </dd>
              </div>

              {/* Round-Trip Time */}
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-foreground/70">
                  Latency
                </dt>
                <dd className="text-sm text-foreground">
                  {typeof fingerprint.components.networkInfo?.rtt === "number"
                    ? `${fingerprint.components.networkInfo.rtt} ms`
                    : "Unavailable"}
                </dd>
              </div>

              {/* Data Saver */}
              <div className="flex items-center justify-between">
                <dt className="text-sm font-medium text-foreground/70">
                  Data Saver
                </dt>
                <dd className="text-sm">
                  {typeof fingerprint.components.networkInfo?.saveData ===
                  "boolean" ? (
                    <span
                      className={`px-2 py-1 text-xs rounded ${
                        fingerprint.components.networkInfo.saveData
                          ? "bg-orange-100 text-orange-800"
                          : "bg-gray-100 text-gray-800"
                      }`}
                    >
                      {fingerprint.components.networkInfo.saveData
                        ? "Enabled"
                        : "Disabled"}
                    </span>
                  ) : (
                    <span className="text-foreground/70">Unavailable</span>
                  )}
                </dd>
              </div>
            </dl>
          </div>
        </div>

        <div className="mt-8 text-center">
          <p className="text-foreground/70 text-sm">
            This information is generated locally on your device and is not
            transmitted to any server. The fingerprint will remain consistent as
            long as your device configuration doesn&apos;t change.
          </p>
        </div>
      </div>
    </div>
  );
}
