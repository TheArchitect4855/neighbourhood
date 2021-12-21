import Cookies from "cookies";
import { decode } from "jsonwebtoken";
import { getUserData, removeUserFromNeighbourhood, validateToken } from "../../../lib/backend";

export default async function handler(req, res) {
	if(req.method != "POST") {
		res.status(400).end();
		return;
	}

	const cookies = new Cookies(req, res);
	const userToken = cookies.get("userToken");
	if(!userToken || !validateToken(userToken)) {
		res.writeHead(302, {
			Location: "/api/user/logout"
		}).end();

		return;
	}

	const { reason, uid } = req.body;
	if(!reason || !uid) {
		res.status(400).send("Missing required parameters.");
		return;
	}

	try {
		const kickerUid = decode(userToken).uid;
		const kickerData = await getUserData(kickerUid);
		if(kickerData.position != "Administrator" && kickerData.position != "Moderator") {
			res.status(403).send("You must be an administrator or moderator to kick a user.");
			return;
		}

		const userData = await getUserData(uid);
		if(kickerData.neighbourhood != userData.neighbourhood) {
			res.status(404).send("User not found.");
			return;
		}
		
		if(userData.position == "Administrator" || (userData.position == "Moderator" && kickerData.positon != "Administrator")) {
			res.status(403).send("You do not have the permissions to kick this user.");
			return;
		}

		await removeUserFromNeighbourhood(uid);

		res.writeHead(302, {
			Location: "/residents"
		}).end();
	} catch(e) {
		console.error(e);
		res.status(500).send(`Error kicking user: ${e.message}.`);
	}
}