import Cookies from "cookies";
import { validateToken } from "../../../lib/backend";

export default function handler(req, res) {
	if(req.method != "POST") {
		res.status(400).send();
		return;
	}

	const cookies = new Cookies(req, res);
	const userToken = cookies.get("userToken");
	if(!userToken || !validateToken(userToken)) {
		res.writeHead(302, {
			Location: "/login"
		});

		res.end();
		return;
	}

	const { reason, postId } = req.body;
	if(!reason || !postId) {
		res.status(400).end();
	}

	// TODO: Validate that the target post is in this user's neighbourhood
	// TODO: Send report
	console.log(`REPORT ${reason}`);

	res.writeHead(302, {
		Location: `/#${encodeURIComponent(postId)}`
	});

	res.end();
}