import Cookies from "cookies";
import { createAccount, validateToken } from "../../../lib/backend";

export default function handler(req, res) {
	if(req.method == "POST") {
		const cookies = new Cookies(req, res);
		const userToken = cookies.get("userToken");
		if(!userToken || !validateToken(userToken)) {
			const { code } = req.query;
			if(code) {
				const { email, nickname, dob, fname, lname, tos } = req.body;
				if(email && nickname && dob && tos) {
					const { ok, msg } = createAccount(email, nickname, dob, fname, lname);
					if(ok) {
						res.writeHead(302, {
							Location: `/login?msg=${encodeURIComponent(msg)}`
						});

						res.end();
					} else {
						res.writeHead(302, {
							Location: `/invite/${code}?msg=${encodeURIComponent(msg)}`
						});

						res.end();
					}

					return;
				} else {
					res.writeHead(302, {
						Location: `/invite/${code}?msg=${encodeURIComponent("Missing required parameters")}`
					});

					res.end();
					return;
				}
			}
		}
	}

	res.writeHead(302, {
		Location: "/"
	});

	res.end();
}