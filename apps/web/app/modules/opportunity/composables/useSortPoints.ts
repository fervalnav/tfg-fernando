type Sortable = { sortPoints: number };

export function calculateSortPoints(items: Sortable[], targetIndex: number): number {
  const predecessor = items[targetIndex - 1];
  const successor = items[targetIndex + 1];

  if (!predecessor && !successor) return 1000;
  if (!predecessor) return successor.sortPoints - 1000; // prepend: stay 1000 below current first
  if (!successor) return predecessor.sortPoints + 1000; // append: stay 1000 above current last
  return (predecessor.sortPoints + successor.sortPoints) / 2;
}
