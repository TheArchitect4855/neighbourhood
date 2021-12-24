import Cookies from "cookies";
import { decode } from "jsonwebtoken";
import { createInviteCodeFor, validateToken } from "../../../lib/backend";

export default async function handler(req, res) {
	const cookies = new Cookies(req, res);
	const userToken = cookies.get("userToken");
	if(!userToken || !validateToken(userToken)) {
		res.status(401).end();
		return;
	}

	const userDataToken = cookies.get("userData");
	if(!userDataToken || !validateToken(userDataToken)) {
		res.status(400).end();
		return;
	}

	const { position, neighbourhood } = decode(userDataToken);
	if(position != "Administrator") {
		res.status(403).end();
		return;
	}

	const code = await createInviteCodeFor(neighbourhood);
	res.status(200).send(`${req.headers.host}/invite/${code}`);
}