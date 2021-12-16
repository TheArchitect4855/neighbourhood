import Cookies from "cookies";
import { useLoginCode } from "../../../lib/backend";

export default async function handler(req, res) {
	if(req.method != "POST") {
		res.status(400).end();
		return;
	}

	const { email, code, remember } = req.body;
	if(!email || !code) {
		res.writeHead(302, {
			Location: `/login?msg=${encodeURIComponent("Missing required parameters")}`
		});

		res.end();
		return;
	}

	const { ok, msg } = await useLoginCode(email, code);
	if(!ok) {
		res.writeHead(302, {
			Location: `/login?msg=${encodeURIComponent(msg)}`
		});

		res.end();
		return;
	}

	const options = {};
	if(remember && remember == "on") {
		options.maxAge = 30 * 86400000;
	}

	const cookies = new Cookies(req, res);
	cookies.set("userToken", email, options); // TODO: Create actual token
	res.writeHead(302, {
		Location: "/"
	});

	res.end();
}