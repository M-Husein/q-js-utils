export default function cached(fn){
	let cache = Object.create(null);
	return (function cachedFn(s){
		let hit = cache[s];
		return hit || (cache[s] = fn(s))
	});
}
