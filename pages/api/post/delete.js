import Cookies from "cookies";
import { deletePost, getPostData, validateToken } from "../../../lib/backend";
import * as jwt from "jsonwebtoken";

export default async function handler(req, res) {
	if(req.method != "POST") {
		res.status(400).end();
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

	const { uid, position, neighbourhood } = jwt.decode(userDataToken);

	// Verify that the user can delete the post
	const { postId } = req.body;
	const postData = await getPostData(postId);
	if(!postData || postData.neighbourhood != neighbourhood) {
		res.status(404).send("Post not found.");
		return;
	}

	let canDelete = false;
	if(position == "Administrator" || position == "Moderator") {
		canDelete = true;
	} else {
		canDelete = postData.author == uid;
	}

	if(!canDelete) {
		res.status(403).send("You cannot delete this post.");
		return;
	}

	deletePost(postId);
	res.writeHead(302, {
		Location: "/",
	}).end();
}