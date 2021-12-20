import Cookies from "cookies";
import { createPost, validateToken } from "../../../lib/backend";
import * as multipart from "parse-multipart-data";
import { writeFile } from "fs";
import { createHash } from "crypto";
import * as jwt from "jsonwebtoken";

export default function handler(req, res) {
	if(req.method != "POST") {
		res.status(400).end();
		return;
	}

	const cookies = new Cookies(req, res);
	const userToken = cookies.get("userToken");
	const userDataToken = cookies.get("userData");
	if(!userToken || !validateToken(userToken) || !userDataToken || !validateToken(userDataToken)) {
		res.writeHead(302, {
			Location: "/login"
		});

		res.end();
		return;
	}

	const { boundary } = parseContentType(req.headers["content-type"]);
	const buffer = [];
	req.on("data", (data) => {
		for(const byte of data) {
			buffer.push(byte);
		}
	});

	req.on("end", async () => {
		const { uid, neighbourhood } = jwt.decode(userDataToken);

		try {
			const parts = multipart.parse(Buffer.from(buffer), boundary);
			await handleParts(parts, uid, neighbourhood);
			res.writeHead(302, {
				Location: "/",
			}).end();
		} catch(e) {
			console.error(e);
			res.writeHead(302, {
				Location: `/post/create?msg=${encodeURIComponent(`Error creating post: ${e.message}`)}`
			}).end();
		}
	});
}

export const config = {
	api: {
		bodyParser: false,
	},
}

function parseContentType(data) {
	const parts = data.split(";");
	const parsed = {};

	let idx = 0;
	for(const part of parts) {
		const pair = part.split("=");
		if(pair.length == 1) {
			parsed[idx++] = part;
		} else {
			const key = pair[0];
			const value = part.substring(key.length + 1);
			parsed[key.trim()] = value.trim();
		}
	}

	return parsed;
}

async function handleParts(parts, authorUid, neighbourhood) {
	let content = null;
	let attachment = null;
	for(const part of parts) {
		if(part.name == "content" && part.data.length > 0) {
			content = part.data.toString("utf8").trim();
		} else if("filename" in part && part.filename != "") {
			attachment = part;
		}
	}

	if(!content && !attachment) throw new Error("Missing required parameters");

	let filename = null;
	if(attachment) {
		// TODO: Resize if image
		if(attachment.data.length > 8e+6) throw new Error("Attachment cannot be larger than 8MB");

		const ext = attachment.type.split("/")[1];
		filename = createHash("md5").update(attachment.data).digest("base64url") + `.${ext}`;
		const path = `${process.cwd()}/public/uploads/${filename}`;
		writeFile(path, attachment.data, (err) => { if(err) console.error(err) });

		const metadata = {
			originalName: attachment.filename,
			type: attachment.type,
		};

		writeFile(`${path}.meta`, JSON.stringify(metadata), (err) => { if(err) console.error(err) });
	}

	await createPost(authorUid, neighbourhood, content, filename);
}