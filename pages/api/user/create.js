import { createAccount, getInviteCodeData, useInviteCode } from "../../../lib/backend";

export default async function handler(req, res) {
	if(req.method != "POST") {
		res.status(400).end();
		return;
	}

	const { code } = req.query;
	const { email, nickname, dob, fname, lname, tos } = req.body;
	if(!email || !nickname || !dob || tos != "on") {
		res.writeHead(302, {
			Location: `/invite/${code}?msg=${encodeURIComponent("Missing required parameters!")}`
		}).end();
		return;
	}

	try {
		const { valid, neighbourhood } = await getInviteCodeData(code);
		if(!valid) {
			res.status(400).send("Invalid code.");
			return;
		}

		await createAccount(email, nickname, dob, fname, lname, neighbourhood);
		useInviteCode(code);
		res.writeHead(302, {
			Location: `/login?msg=${encodeURIComponent("Account successfully created.")}`
		}).end();
	} catch(e) {
		console.error(e);

		let message = e.message;
		if(e.errno == 19) {
			message = "Email is already in use"
		}

		res.writeHead(302, {
			Location: `/invite/${code}?msg=${encodeURIComponent(`Error creating account: ${message}.`)}`
		}).end();
	}
}