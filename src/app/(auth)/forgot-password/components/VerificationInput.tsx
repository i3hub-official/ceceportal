"use client";

import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function VerificationInput({
  length = 6,
  value,
  onChange,
  verified = false,
  error = false, // 🔴 new prop for shake animation
}: {
  length?: number;
  value: string;
  onChange: (val: string) => void;
  verified?: boolean;
  error?: boolean;
}) {
  const [values, setValues] = useState<string[]>(Array(length).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>([]);

  // Autofocus on mount
  useEffect(() => {
    inputs.current[0]?.focus();
  }, []);

  useEffect(() => {
    if (!value) {
      setValues(Array(length).fill(""));
    } else if (value.length === length) {
      setValues(value.split(""));
    }
  }, [value, length]);

  const handleChange = (index: number, val: string) => {
    val = val.trim();
    if (!/^[0-9]?$/.test(val)) return;

    const newValues = [...values];
    newValues[index] = val;
    setValues(newValues);

    const code = newValues.join("").trim();
    onChange(code);

    // ✅ always move forward
    if (val && index < length - 1) {
      inputs.current[index + 1]?.focus();
    }
    // ✅ blur if last digit is filled
    if (val && index === length - 1) {
      inputs.current[index]?.blur();
    }
  };

  const handleKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !values[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault();
    const pasteData = e.clipboardData.getData("text").slice(0, length);

    if (/^\d+$/.test(pasteData)) {
      const newValues = pasteData.split("");
      setValues(newValues);

      const code = newValues.join("").trim();
      onChange(code);

      const nextIndex = Math.min(newValues.length, length - 1);
      inputs.current[nextIndex]?.focus();
    }
  };

  return (
    <motion.div
      className="flex gap-2 justify-center"
      animate={error ? { x: [0, -6, 6, -6, 6, 0] } : { x: 0 }}
      transition={{ duration: 0.4 }}
    >
      {values.map((val, idx) => (
        <input
          key={idx}
          ref={(el) => {
            inputs.current[idx] = el;
          }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={val}
          onChange={(e) => handleChange(idx, e.target.value)}
          onKeyDown={(e) => handleKeyDown(idx, e)}
          onPaste={handlePaste}
          className={`w-12 h-12 border rounded-lg text-center text-xl font-mono 
            focus:ring-2 focus:ring-primary focus:border-transparent transition-all duration-300
            ${
              verified
                ? "border-green-500 ring-2 ring-green-500 bg-green-50 cursor-not-allowed"
                : error
                ? "border-red-500 ring-2 ring-red-500 bg-red-50"
                : "border-border"
            }`}
          disabled={verified}
        />
      ))}
    </motion.div>
  );
}
