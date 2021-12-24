import Cookies from "cookies";
import { updateUserData, validateToken } from "../../../lib/backend";
import * as jwt from "jsonwebtoken";

export default async function handler(req, res) {
	if(req.method != "POST") {
		res.status(400).end();
	}

	const cookies = new Cookies(req, res);
	const userToken = cookies.get("userToken");
	if(!userToken || !validateToken(userToken)) {
		res.writeHead(302, {
			Location: "/api/user/logout"
		}).end();

		return;
	}

	const userDataToken = cookies.get("userData");
	if(!userDataToken || !validateToken(userDataToken)) {
		res.writeHead(302, {
			Location: "/api/user/logout"
		}).end();

		return;
	}

	const { email_notifications } = req.body;
	try {
		const { uid } = jwt.decode(userToken);
		const { nickname, fname, lname, bio } = jwt.decode(userDataToken);
		await updateUserData(uid, nickname, fname, lname, bio, email_notifications == "on");
		cookies.set("userData");
		res.writeHead(302, {
			Location: "/profile"
		}).end();
	} catch(e) {
		console.error(e);
		res.writeHead(302, {
			Location: `/profile/edit?msg=${encodeURIComponent(`Failed to update preferences: ${e.message}`)}`
		}).end();
	}
}