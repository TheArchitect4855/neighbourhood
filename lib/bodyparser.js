export function parseBody(body) {
	const s = body.toString();
	const pairs = s.split("&");
	console.dir(pairs);

	const data = {};
	for(const pair of pairs) {
		const kv = pair.split("=");
		const key = decodeURIComponent(kv[0]);
		const value = decodeURIComponent(kv[1]);
		data[key] = value;
	}

	return data;
}