import Cookies from "cookies";
import { validateToken, updateProfile } from "../../../lib/backend";

export default async function handler(req, res) {
	if(req.method != "POST") {
		res.status(400).end();
		return;
	}

	const cookies = new Cookies(req, res);
	const userToken = cookies.get("userToken");
	if(!userToken || !validateToken(userToken)) {
		res.writeHead(302, {
			Location: "/profile"
		});

		res.end();
		return;
	}
	 
	const { nickname, fname, lname, bio } = req.body;
	if(!nickname) {
		res.writeHead(302, {
			Location: "/profile"
		});

		res.end();
		return;
	}

	const ok = await updateProfile(userToken, nickname, fname, lname, bio);
	if(!ok) {
		res.writeHead(302, {
			Location: "/profile"
		});

		res.end();
		return;
	}

	res.writeHead(302, {
		Location: "/profile"
	});

	res.end();
}