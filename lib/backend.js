import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { validateDOB, validateEmail, validateNickname } from "./datavalidator";

const jwt = require("jsonwebtoken");

export async function createAccount(email, nickname, dob, fname, lname) {
	if(!validateEmail(email)) {
		return {
			ok: false,
			msg: "Invalid email address"
		}
	}

	if(!validateNickname(nickname)) {
		return {
			ok: false,
			msg: "Invalid nickname"
		}
	}

	if(!validateDOB(dob)) {
		return {
			ok: false,
			msg: "You must be 18 years or older to join Neighbourhood"
		}
	}

	// If names are too long, just truncate them
	if(fname && fname.length > 30) {
		fname = fname.substring(0, 30);
	}

	if(lname && lname.length > 30) {
		lname = lname.substring(0, 30);
	}

	const db = await open({
		filename: "data/main.db",
		driver: sqlite3.Database,
	});

	try {
		const statement = await db.prepare(
			"INSERT INTO users (email, nickname, dob, fname, lname, joined_on) VALUES (?, ?, ?, ?, ?, ?)"
		);
	
		await statement.get(email, nickname, dob, fname ?? null, lname ?? null, Date.now());
		statement.finalize();

		await db.close();

		return {
			ok: true,
			msg: "Account successfully created",
		};
	} catch(e) {
		let msg = "Internal server error. Please try again later";
		if(e.errno == 19) {
			msg = "Email is already in use"
		}

		return {
			ok: false,
			msg,
		}
	}
}

export function getPostsFor(neighbourhood) {
	// TODO
	return [
		{
			author: {
				name: "salsaastronaut",
				rank: 2,
			},
			content: `
				big peepee

				https://kurtisknodel.com
			`,
			id: "abcd",
		},

		{
			author: {
				name: "TheArchitect",
				rank: 1,
			},
			content: `
				8==============================================================================================D
				@salsaastronaut
			`,
			id: "efgh",
		}
	];
}

export function getNotificationsFor(user) {
	// TODO
	return [
		"Welcome to your neighbourhood! <a href='#'>Go here</a> to get started."
	];
}

export function getMessagesFor(user) {
	// TODO
	return [
		{
			to: {
				name: "salsaastronaut",
				rank: 2,
			},
			preview: "<b>You:</b> lol",
		}
	];
}

export async function getUserData(user) {
	try {
		const payload = jwt.verify(user, "supersecret");
		const { email } = payload;

		const db = await open({
			filename: "data/main.db",
			driver: sqlite3.Database,
		});

		const getUserData = await db.prepare(
			"SELECT * FROM users WHERE email=?"
		);

		const userData = await getUserData.get(email);
		await getUserData.finalize();

		if(!userData) {
			return {
				displayName: "User does not exist"
			}
		}

		const { nickname, position, fname, lname, dob, bio, neighbourhood, rank } = userData;
		
		let fullPosition = "Resident";
		if(position == "M") fullPosition = "Moderator";
		if(position == "A") fullPosition = "Administrator";

		return {
			displayName: nickname,
			rank,
			position: fullPosition,
			neighbourhood,
			fname,
			lname,
			dob,
			bio
		}

	} catch(e) {
		console.error(e);
		return {
			displayName: "Invalid login token"
		}
	}
}

export function getInvite(code) {
	return {
		valid: true,
		neighbourhood: 1,
	}
}

export function validateToken(token) {
	console.log("VALIDATING JWT");
	try {
		const payload = jwt.verify(token, "supersecret");
		console.dir(payload);
		return true;
	} catch(e) {
		console.error(e);
		return false;
	}
}

export async function createLoginCode(email) {
	try {
		const db = await open({
			filename: "data/main.db",
			driver: sqlite3.Database,
		});

		const verifyUser = await db.prepare(
			"SELECT uid FROM users WHERE email=?"
		);

		const verifiedUser = await verifyUser.get(email);
		await verifyUser.finalize();

		if(!verifiedUser) {
			return {
				body: {
					ok: false,
					msg: "User does not exist"
				}
			}
		}

		const verifyCode = await db.prepare(
			"SELECT code, expires FROM login_codes WHERE uid=?"
		);

		const verifiedCode = await verifyCode.get(verifiedUser.uid);
		await verifyCode.finalize();

		const now = Date.now();
		if(verifiedCode && verifiedCode.expires > now) {
			const minutes = Math.floor(verifiedCode.expires / 60000);
			return {
				body: {
					ok: true,
					msg: `Code created. It expires in ${minutes} minutes`,
				},
				code: verifiedCode.code,
			}
		} else {
			if(verifiedCode && verifiedCode.expires < now) {
				const deleteCode = await db.prepare(
					"DELETE FROM login_codes WHERE uid=?"
				);

				await deleteCode.run(verifiedUser.uid);
				await deleteCode.finalize();
			}

			const crypto = require("crypto");
			const newCode = crypto.randomBytes(3)
				.toString("hex")
				.substring(0, 5);
			
			console.log(`GENERATED LOGIN CODE: ${newCode}`);
			const newExpires = Date.now() + 300000;

			const registerCode = await db.prepare(
				"INSERT INTO login_codes (uid, code, expires) VALUES (?, ?, ?)"
			);

			await registerCode.run(verifiedUser.uid, newCode, newExpires);
			await registerCode.finalize();

			return {
				body: {
					ok: true,
					msg: "Code created. It expires in 5 minutes"
				},
				code: newCode
			}
		}

	} catch(e) {
		console.error(e);
		return {
			body: {
				ok: false,
				msg: "Internal server error. Please try again later"
			}
		}
	}
}

export async function useLoginCode(email, code) {	
	try {
		const db = await open({
			filename: "data/main.db",
			driver: sqlite3.Database,
		});

		const verifyCode = await db.prepare(
			"SELECT code, expires, uid FROM (SELECT email, code, expires, users.uid FROM users INNER JOIN login_codes ON users.uid = login_codes.uid) WHERE email=?"
		);

		const verify = await verifyCode.get(email);
		await verifyCode.finalize();

		if(!verify) {
			return {
				ok: false,
				msg: "Code is invalid"
			}
		}

		if(verify.expires < Date.now() || code != verify.code) {
			return {
				ok: false,
				msg: "Code is invalid"
			}
		}

		const deleteCode = await db.prepare("DELETE FROM login_codes WHERE uid=?");
		await deleteCode.run(verify.uid);
		await deleteCode.finalize();
		
		await db.close();

		return {
			ok: true,
			msg: "Successfully logged in",
		};
	} catch(e) {
		console.dir(e);
		return {
			ok: false,
			msg: "Internal server error. Please try again later",
		}
	}
}

export async function updateProfile(user, nickname, fname, lname, bio) {
	try {
		const payload = jwt.verify(user, "supersecret");
		const { email } = payload;

		const db = await open({
			filename: "data/main.db",
			driver: sqlite3.Database,
		});

		const updateStatement = await db.prepare(
			"UPDATE users SET nickname=?, fname=?, lname=?, bio=? WHERE email=?"
		);

		await updateStatement.run(nickname, fname, lname, bio, email);
		return true;
	} catch(e) {
		console.error(e);
		return false;
	}
}