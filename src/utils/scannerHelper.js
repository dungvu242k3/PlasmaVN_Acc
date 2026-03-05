let isVideoPatched = false;

function patchGlobalVideoPlaysinline() {
    if (typeof HTMLVideoElement !== 'undefined' && !isVideoPatched) {
        const originalPlay = HTMLVideoElement.prototype.play;
        HTMLVideoElement.prototype.play = function () {
            this.setAttribute('playsinline', '');
            this.setAttribute('webkit-playsinline', '');
            this.playsInline = true;
            return originalPlay.apply(this, arguments);
        };
        isVideoPatched = true;
    }
}

/**
 * Fix iOS Safari: prevent native fullscreen video player.
 * iOS auto-fullscreens <video> elements without `playsinline`.
 * We use a global monkey-patch for immediate effect BEFORE play() is called.
 * We also keep the MutationObserver as a fallback.
 *
 * @param {string} containerId - The scanner container element ID
 * @returns {function} cleanup - Call to disconnect the observer
 */
export function patchIOSVideoPlaysinline(containerId) {
    if (typeof window !== 'undefined') {
        patchGlobalVideoPlaysinline();
    }

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
