let sequence = 0;

/**
 * Collision-resistant id for a habit.
 *
 * `Date.now()` alone resolves to 1ms and the spec does not guarantee it is
 * monotonic or unique, so it is not sufficient as an identity source: every
 * mutation matches on `id`, so a duplicate silently edits or deletes the wrong
 * records. The monotonic sequence guarantees uniqueness within a session even
 * when the clock and `Math.random()` both repeat themselves.
 */
export function createId(): string {
  sequence += 1;

  return [
    Date.now().toString(36),
    sequence.toString(36),
    Math.random().toString(36).slice(2, 10),
  ].join('-');
}