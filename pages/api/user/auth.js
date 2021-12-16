import Cookies from "cookies";
import { useLoginCode } from "../../../lib/backend";

export default function handler(req, res) {
	if(req.method == "POST") {
		const { email, code, remember } = req.body;
		if(email && code) {
			const { ok, msg } = useLoginCode(email, code);
			if(ok) {
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
			} else {
				res.writeHead(302, {
					Location: `/login?msg=${encodeURIComponent(msg)}`
				});

				res.end();
			}
		}
	}

	res.writeHead(302, {
		Location: "/login"
	});

	res.end();
}