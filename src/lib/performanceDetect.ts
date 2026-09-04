export function getPerformanceTier() {
  if (typeof window === "undefined") return "high"; // Default for SSR

  let score = 0;

  // 1. Hardware Concurrency (Cores)
  if (navigator.hardwareConcurrency) {
    if (navigator.hardwareConcurrency >= 8) score += 3;
    else if (navigator.hardwareConcurrency >= 4) score += 2;
    else score += 1;
  } else {
    score += 2; // Assume medium if unknown
  }

  // 2. Device Pixel Ratio
  if (window.devicePixelRatio) {
    if (window.devicePixelRatio > 2) score -= 1; // High DPI means more pixels to push
  }

  // 3. Screen Width
  if (window.innerWidth < 768) {
    score -= 1; // Mobile devices often have less powerful GPUs despite high core counts
  }

  // 4. Reduced Motion Preference
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
    return "low"; // Strictly enforce low motion if requested
  }

  // Evaluate Score
  if (score >= 4) return "high";
  if (score >= 2) return "medium";
  return "low";
}
