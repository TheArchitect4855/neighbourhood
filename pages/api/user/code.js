import { createLoginCode } from "../../../lib/backend";
import { config } from "dotenv";
import { createTransport } from "nodemailer";

config();

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
		const { code, expiresIn } = await createLoginCode(email);
		emailCode(code, expiresIn, email);

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

function emailCode(code, expiresIn, to) {
	const message = {
		from: process.env.MAIL_FROM,
		to,
		subject: "Your Neighbourhood Login Code",
		text: `Your login code is ${code}. It expires in ${expiresIn} minutes.`,
	};

	const transporter = createTransport(process.env.EMAIL_TRANSPORT);
	transporter.sendMail(message, (err, info) => {
		if(err) console.error(err);
		else console.dir(info);
	});
}