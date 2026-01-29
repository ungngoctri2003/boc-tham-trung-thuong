// 45 giải cố định: May mắn 100k x15, May mắn ghê 200k x25, Đặc biệt may mắn 500k x5
// Thứ tự trên vòng: 100k (0–14), 200k (15–39), 500k (40–44)
export const WHEEL_SEGMENTS: number[] = [
  ...Array(15).fill(100000),
  ...Array(25).fill(200000),
  ...Array(5).fill(500000),
];

export function pickRandomAmount(): number {
  const idx = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
  return WHEEL_SEGMENTS[idx];
}

/** Chọn ngẫu nhiên một ô và trả về cả amount + index (để animation dừng đúng ô). Dùng khi không dùng pool. */
export function pickRandomAmountWithIndex(): { amount: number; segmentIndex: number } {
  const segmentIndex = Math.floor(Math.random() * WHEEL_SEGMENTS.length);
  const amount = WHEEL_SEGMENTS[segmentIndex];
  return { amount, segmentIndex };
}

/** Tạo pool 45 giải đã shuffle: 15x100k, 25x200k, 5x500k. Mỗi phần tử là { amount, segmentIndex }. */
export function buildShuffledPool(): { amount: number; segmentIndex: number }[] {
  const pool: { amount: number; segmentIndex: number }[] = [];
  for (let i = 0; i < WHEEL_SEGMENTS.length; i++) {
    pool.push({ amount: WHEEL_SEGMENTS[i], segmentIndex: i });
  }
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }
  return pool;
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
