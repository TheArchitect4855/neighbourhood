import Cookies from "cookies";
import { decode } from "jsonwebtoken";
import { getUserData, promoteUser, validateToken } from "../../../lib/backend";
import Notification from "../../../lib/notifications";

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

	const { uid } = req.body;
	if(!uid) {
		res.status(400).send("Missing required parameters.");
		return;
	}

	try {
		const promoterUid = decode(userToken).uid;
		const promoterData = await getUserData(promoterUid);
		if(promoterData.position != "Administrator") {
			res.status(403).send("You must be an administrator to promote a user.");
			return;
		}

		const userData = await getUserData(uid);
		if(promoterData.neighbourhood != userData.neighbourhood) {
			res.status(404).send("User not found.");
			return;
		}
		
		if(userData.position == "Administrator" || userData.position == "Moderator") {
			res.status(403).send("This user cannot be promoted.");
			return;
		}

		const notification = Notification.all(`User ${userData.nickname} has been promoted to a Moderator.`);
		notification.send(userData.neighbourhood);

		await promoteUser(userData.uid);

		res.writeHead(302, {
			Location: `/profile/${userData.uid}`
		}).end();
	} catch(e) {
		console.error(e);
		res.status(500).send(`Error promoting user: ${e.message}.`);
	}
}