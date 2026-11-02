// Simple custom implementation of React's useRef in plain TypeScript
// This is a teaching/demo utility – it does **not** integrate with real React.

// Shared hook cursor used by all custom hooks in this folder (useState, useEffect, useRef, ...)
let cursor: number = 0;

// Separate storage for ref objects – we keep a simple array indexed by hook order.
const refs: { current: unknown }[] = [];

/**
 * myUseRef mimics the behaviour of React's useRef.
 * It returns a mutable object with a single `current` property.
 * The same object is returned on every render for a given hook position.
 */
export function myUseRef<T>(initialValue: T): { current: T } {
  const hookIndex = cursor; // capture the position of this hook call

  // Initialise the ref object on the first render (when the slot is empty).
  if (!(hookIndex in refs)) {
    refs[hookIndex] = { current: initialValue } as { current: unknown };
  }

  // Move the cursor forward so the next hook gets its own slot.
  cursor++;

  // Typescript knows that refs[hookIndex] has a `current` field.
  return refs[hookIndex] as { current: T };
}

/**
 * Helper to reset the cursor before a simulated render.
 * In a real React environment this is handled by the framework.
 */
export function resetHookCursor(): void {
  cursor = 0;
}

// Example usage – can be executed with `npm run run:file -- ./react/hoooks/useRef.ts`
function demo(): void {
  // Simulate a component render
  resetHookCursor();

  const countRef = myUseRef(0);
  const nameRef = myUseRef('Alice');

  console.log('First render ->', countRef.current, nameRef.current);

  // Mutate the refs – this would persist across renders because the same object is reused.
  countRef.current = 42;
  nameRef.current = 'Bob';

  // Simulate a second render
  resetHookCursor();
  const countRef2 = myUseRef(0); // gets the same slot as before
  const nameRef2 = myUseRef(''); // same slot

  console.log('Second render ->', countRef2.current, nameRef2.current);
}

demo();
