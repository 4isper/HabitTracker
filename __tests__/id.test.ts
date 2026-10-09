/**
 * @format
 */

import { createId } from '../src/utils/id';

describe('createId', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('returns a non-empty string', () => {
    expect(createId().length).toBeGreaterThan(0);
  });

  it('never repeats, even when the clock and randomness both stall', () => {
    jest.spyOn(Date, 'now').mockReturnValue(1767225600000);
    jest.spyOn(Math, 'random').mockReturnValue(0.5);

    const ids = Array.from({ length: 1000 }, () => createId());
    const unique = new Set(ids);

    expect(unique.size).toBe(ids.length);
  });

  it('does not collide when the clock jumps backwards', () => {
    const now = jest.spyOn(Date, 'now');
    const ids = new Set<string>();

    for (let i = 0; i < 100; i++) {
      now.mockReturnValue(1767225600000 - i * 1000);
      ids.add(createId());
    }

    expect(ids.size).toBe(100);
  });

  it('produces unique ids across concurrent bursts', () => {
    const ids = new Set(Array.from({ length: 5000 }, () => createId()));

    expect(ids.size).toBe(5000);
  });
});