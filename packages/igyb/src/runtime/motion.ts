function matches(query: string): boolean {
	return typeof window !== 'undefined' && window.matchMedia?.(query).matches === true;
}

/** Whether the user has requested reduced motion. */
export function prefersReducedMotion(): boolean {
	return matches('(prefers-reduced-motion: reduce)');
}

/** Whether the primary pointer is fine (mouse/trackpad) rather than coarse (touch). */
export function hasFinePointer(): boolean {
	return matches('(pointer: fine)');
}
