import { describe, expect, it } from 'vitest';
import { cn } from './utils';

describe('cn', () => {
  it('combines classes and keeps the last conflicting Tailwind utility', () => {
    expect(cn('px-2 text-sm', 'px-4')).toBe('text-sm px-4');
  });
});
