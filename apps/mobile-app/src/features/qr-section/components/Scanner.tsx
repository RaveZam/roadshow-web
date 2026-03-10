import { CameraView } from "expo-camera";
import { useState } from "react";

export default function Scanner() {
  const [scanned, setScanned] = useState(false);

  return (
    <CameraView
      style={{ flex: 1 }}
      barcodeScannerSettings={{
        barcodeTypes: ["qr"],
      }}
      onBarcodeScanned={(result) => {
        if (!scanned) {
          setScanned(true);
          console.log("QR:", result.data);
        }
      }}
    />
  );
}
