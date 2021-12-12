export function parseMd(md) {	
	let html = "<p>";
	const lines = md
		.replace("<", "&#60;")
		.replace(">", "&#62;")
		.split("\n");
	
	for(let line of lines) {
		if(line == "") { // Newline
			html += "</p><p>"
		} else {
			const mentionPattern = /\s@[\w\d]+/g;
			for(const mention of line.matchAll(mentionPattern)) {
				// TODO: Link to user
				const name = mention[0].trim();
				line = line.replace(name, `<a href="#" class="mention">${name}</a>`);
			}

			const linkPattern = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
			for(const link of line.matchAll(linkPattern)) {
				const url = link[0].trim();
				line = line.replace(url, `<a href="${url}" target="_blank" noreferrer>${url}</a>`);
			}
			
			html += line;
		}
	}

	html += "</p>"

	return (
		<div dangerouslySetInnerHTML={{ __html: html }}></div>
	);
}