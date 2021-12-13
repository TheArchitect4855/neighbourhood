import { marked } from "marked";

export function parseMd(md) {	
	const sanitized = md.trim()
		.replace("<", "&#60;")
		.replace(">", "&#62;")
		.replace(/\s+/g, " ");
	
	let html = marked.parse(sanitized);
	console.log(html);
	html = parseMentions(html);

	return (
		<div dangerouslySetInnerHTML={{ __html: html }}></div>
	);
}

function parseMentions(s) {
	const mentionPattern = /\s@[\w\d]+/g;
	for(const mention of s.matchAll(mentionPattern)) {
		// TODO: Link to user
		const name = mention[0].trim();
		s = s.replace(name, `<a href="#" class="mention">${name}</a>`);
	}

	return s;
}