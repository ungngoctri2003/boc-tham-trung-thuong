// Mệnh giá (VND) và số lần lặp = xác suất tương đối
// Ví dụ: 2x500k, 3x200k, 4x100k => 500k ít nhất, 100k nhiều nhất
export const WHEEL_SEGMENTS: number[] = [
  500000, 500000,
  200000, 200000, 200000,
  100000, 100000, 100000, 100000,
];

export function pickRandomAmount(): number {
  const idx = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
  return WHEEL_SEGMENTS[idx];
}

/** Chọn ngẫu nhiên một ô và trả về cả amount + index (để animation dừng đúng ô). */
export function pickRandomAmountWithIndex(): { amount: number; segmentIndex: number } {
  const segmentIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
  const amount = WHEEL_SEGMENTS[segmentIndex];
  return { amount, segmentIndex };
}

/** Index of segment that corresponds to the given amount (for wheel animation). */
export function getSegmentIndexForAmount(amount: number): number {
  let found = -1;
  for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
    if (WHEEL_SEGMENTS[i] === amount) {
      found = i;
      break;
    }
  }
  return found >= 0 ? found : 0;
}

/** Format giống popup và bảng kết quả: 500.000, 200.000, 100.000 */
export function formatAmount(amount: number): string {
  return amount >= 1000 ? `${(amount / 1000).toFixed(0)}.000` : String(amount);
}

export function getSegmentsForDisplay(): { value: number; label: string }[] {
  return WHEEL_SEGMENTS.map((value) => ({
    value,
    label: formatAmount(value),
  }));
}
