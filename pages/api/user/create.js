import Cookies from "cookies";
import { createAccount, validateToken } from "../../../lib/backend";

export default async function handler(req, res) {
	if(req.method != "POST") {
		res.status(400).end();
		return;
	}

	const cookies = new Cookies(req, res);
	const userToken = cookies.get("userToken");
	if(userToken && validateToken(userToken)) {
		res.writeHead(302, {
			Location: "/"
		});

		res.end();
		return;
	}

	const { code } = req.query;
	if(!code) {
		res.status(400).end();
		return;
	}
	 
	const { email, nickname, dob, fname, lname, tos } = req.body;
	if(!email || !nickname || !dob || tos != "on") {
		res.writeHead(302, {
			Location: `/invite/${code}?msg=${encodeURIComponent("Missing required parameters")}`
		});

		res.end();
		return;
	}

	const { ok, msg } = await createAccount(email, nickname, dob, fname, lname);
	if(!ok) {
		res.writeHead(302, {
			Location: `/invite/${code}?msg=${encodeURIComponent(msg)}`
		});

		res.end();
		return;
	}

	res.writeHead(302, {
		Location: `/login?msg=${encodeURIComponent(msg)}`
	});

	res.end();
}