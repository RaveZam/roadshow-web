import { CameraView } from "expo-camera";
import { useRef, useState } from "react";
import { useScanner } from "../hooks/useScanner";

export default function Scanner() {
  const lastScanAtRef = useRef(0);

  return (
    <CameraView
      style={{ flex: 1 }}
      barcodeScannerSettings={{
        barcodeTypes: ["qr"],
      }}
      onBarcodeScanned={(result) => {
        const now = Date.now();
        if (now - lastScanAtRef.current < 1000) return;
        lastScanAtRef.current = now;
        useScanner(result.data);
      }}
    />
  );
}
