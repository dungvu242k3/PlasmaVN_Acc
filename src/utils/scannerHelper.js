/**
 * Fix iOS Safari: prevent native fullscreen video player.
 * iOS auto-fullscreens <video> elements without `playsinline`.
 * This uses a MutationObserver to catch the video element
 * the moment html5-qrcode creates it — BEFORE it starts playing.
 *
 * @param {string} containerId - The scanner container element ID
 * @returns {function} cleanup - Call to disconnect the observer
 */
export function patchIOSVideoPlaysinline(containerId) {
    const container = document.getElementById(containerId);
    if (!container) return () => { };

    // Also patch any video already present (edge case)
    const existing = container.querySelector('video');
    if (existing) {
        existing.setAttribute('playsinline', '');
        existing.setAttribute('webkit-playsinline', '');
        existing.playsInline = true;
    }

    // Watch for dynamically added video elements
    const observer = new MutationObserver(() => {
        const video = container.querySelector('video');
        if (video) {
            video.setAttribute('playsinline', '');
            video.setAttribute('webkit-playsinline', '');
            video.playsInline = true;
            observer.disconnect();
        }
    });

    observer.observe(container, { childList: true, subtree: true });

    return () => observer.disconnect();
}
