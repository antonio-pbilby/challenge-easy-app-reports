export function errorAsValue<T, E = Error>(
	callback: () => T,
): [null, T] | [E, null] {
	try {
		const value = callback();

		return [null, value];
	} catch (err) {
		return [err as E, null];
	}
}
