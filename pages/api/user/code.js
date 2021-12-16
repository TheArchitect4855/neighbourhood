import { createLoginCode } from "../../../lib/backend";

export default async function handler(req, res) {
	const { email } = req.body;
	if(!email) {
		res.status(400).end();
		return;
	}

	// TODO: Email code to user
	const { body, code } = await createLoginCode(email);
	res.status(200).send(JSON.stringify(body));
}