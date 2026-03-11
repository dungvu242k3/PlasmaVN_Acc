/**
 * Scanner configuration for html5-qrcode.
 * Uses native BarcodeDetector API when available (faster on mobile),
 * falls back to ZXing JS decoder on desktop/unsupported browsers.
 * No format restrictions — scans ALL barcode types for maximum compatibility.
 */
export const SCANNER_CONFIG = {
    // Native API: faster & more accurate on Android Chrome & iOS Safari
    useBarCodeDetectorIfSupported: true,
    verbose: false
};
