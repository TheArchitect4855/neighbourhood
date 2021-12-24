import Cookies from "cookies";
import { decode } from "jsonwebtoken";
import { removeUserFromNeighbourhood, validateToken } from "../../../lib/backend";
import Notification from "../../../lib/notifications";

export default async function handler(req, res) {
	if(req.method != "POST") {
		res.status(400).end();
		return;
	}
	
	const cookies = new Cookies(req, res);
	const userToken = cookies.get("userToken");
	const userDataToken = cookies.get("userData");
	if(!userToken || !validateToken(userToken) || !userDataToken || !validateToken(userDataToken)) {
		res.status(401).end();
		return;
	}

	const { uid } = decode(userToken);
	await removeUserFromNeighbourhood(uid);

	const { nickname, neighbourhood } = decode(userDataToken);
	const notification = Notification.all(`User ${nickname} has left the neighbourhood.`);
	await notification.send(neighbourhood);

	cookies.set("userToken");
	cookies.set("userData");

	res.writeHead(302, {
		Location: "/login"
	}).end();
}