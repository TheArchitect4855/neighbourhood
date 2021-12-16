import { createLoginCode } from "../../../lib/backend";

const crypto = require("crypto");

export default async function handler(req, res) {
	const { email } = req.body;
	if(!email) {
		res.status(400).end();
		return;
	}

	const code = crypto.randomBytes(3).toString("hex").substring(0, 5);
	// TODO: Email code to user
	const body = await createLoginCode(email, code);
	console.log(`LOGIN CODE: ${code}`);

	res.status(200).send(JSON.stringify(body));
}