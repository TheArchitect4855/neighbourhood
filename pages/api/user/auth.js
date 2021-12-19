import Cookies from "cookies";
import { getUserData, useLoginCode } from "../../../lib/backend";
import * as jwt from "jsonwebtoken";

export default async function handler(req, res) {
	if(req.method != "POST") {
		res.status(400).end();
		return;
	}

	const { email, code, remember } = req.body;
	if(!email || !code) {
		res.writeHead(302, {
			Location: `/login?msg=${encodeURIComponent("Missing required parameters.")}`
		}).end();
		return;
	}

	try {
		const uid = await useLoginCode(email, code);
		const userData = await getUserData(uid);

		const jwtOptions = {
			expiresIn: "30d",
		};

		const userToken = jwt.sign({
			uid,
			email
		}, "supersecret", jwtOptions);

		const userDataToken = jwt.sign(userData, "supersecret");

		const cookieOptions = {};
		if(remember == "on") cookieOptions.maxAge = 30 * 86400000;

		const cookies = new Cookies(req, res);
		cookies.set("userToken", userToken, cookieOptions);
		cookies.set("userData", userDataToken);

		res.writeHead(302, {
			Location: "/"
		}).end();
	} catch(e) {
		console.error(e);
		res.writeHead(302, {
			Location: `/login?msg=${encodeURIComponent(e.message)}`
		}).end();
	}
}