import { createLoginCode } from "../../../lib/backend";

export default async function handler(req, res) {
	if(req.method != "POST") {
		res.status(400).end();
		return;
	}

	const { email } = req.body;
	if(!email) {
		res.send(JSON.stringify({
			ok: false,
			msg: "Missing email!"
		}));
		return;
	}

	try {
		const { expiresIn } = await createLoginCode(email);
		res.send(JSON.stringify({
			ok: true,
			msg: `Code created. It expires in ${expiresIn} minutes.`
		}));
	} catch(e) {
		console.error(e);
		res.send(JSON.stringify({
			ok: false,
			msg: e.message,
		}));
	}
}