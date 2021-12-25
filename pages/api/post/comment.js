import Cookies from "cookies";
import { decode } from "jsonwebtoken";
import { createComment, getPostData, validateToken } from "../../../lib/backend";
import Notification from "../../../lib/notifications";
import { config } from "dotenv";

config();

export default async function handler(req, res) {
	if(req.method != "POST") {
		res.status(400).end();
		return;
	}

	const { comment } = req.body;
	const { ret } = req.query;

	if(!ret) {
		res.writeHead(302, {
			Location: "/",
		}).end();
		return;
	}

	if(!comment) {
		res.writeHead(302, {
			Location: `/post/view?id=${ret}&msg=${encodeURIComponent("Missing required parameters")}`,
		}).end();
		return;
	}

	const cookies = new Cookies(req, res);
	const userToken = cookies.get("userToken");
	if(!userToken || !validateToken(userToken)) {
		res.status(403).end();
		return;
	}

	const userDataToken = cookies.get("userData");
	if(!userDataToken || !validateToken(userDataToken)) {
		res.writeHead(302, {
			Location: "/api/user/logout"
		}).end();
		return;
	}

	const { uid } = decode(userToken);
	const { nickname } = decode(userDataToken);
	try {
		const { author } = await getPostData(ret);
		await createComment(uid, ret, comment);

		const notification = Notification.user(
			`User ${nickname} commented on [your post](${process.env.HOST}/post/view?id=${ret})!`,
			author
		);

		notification.send();

		res.writeHead(302, {
			Location: `/post/view?id=${ret}`
		}).end();
	} catch(e) {
		console.error(e);
		res.writeHead(302, {
			Location: `/post/view?id=${ret}&msg=${encodeURIComponent(e.message)}`
		}).end();
	}
}