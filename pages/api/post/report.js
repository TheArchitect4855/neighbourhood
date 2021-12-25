import Cookies from "cookies";
import { getPostData, validateToken } from "../../../lib/backend";
import { decode } from "jsonwebtoken";
import Notification from "../../../lib/notifications";
import { config } from "dotenv";

config();

export default async function handler(req, res) {
	if(req.method != "POST") {
		res.status(400).send();
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

	const userData = decode(userDataToken);

	const { reason, postId } = req.body;
	if(!reason || !postId) {
		res.status(400).end();
		return;
	}

	const { neighbourhood }	= await getPostData(postId);
	if(!neighbourhood || neighbourhood != userData.neighbourhood) {
		res.status(404).send("Post not found.");
		return;
	}

	const content = `User ${userData.nickname} reported [this post](${process.env.HOST}/post/view?id=${postId}). Reason:\n\n`
		+ "```" + reason + "```";
	const notification = Notification.moderators(content);
	await notification.send(neighbourhood);

	res.writeHead(302, {
		Location: `/#${encodeURIComponent(postId)}`
	});

	res.end();
}