import sqlite3 from "sqlite3";
import { open } from "sqlite";
import { validateDOB, validateEmail, validateNickname } from "./datavalidator";

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

export function getUserData(user) {
	// TODO
	return {
		displayName: "TheArchitect",
		rank: 1,
		position: "Administrator",
		neighbourhood: 1,
		fname: "Kurtis",
		lname: "Knodel",
		dob: "12 May 2002",
		bio: `I'm Kurtis! This is the prototype for Neighbourhood, a social media app that's built around sharing and being a part of a community instead of getting internet points.`,
	}
}

export function getInvite(code) {
	return {
		valid: true,
		neighbourhood: 1,
	}
}

export function validateToken(token) {
	// TODO
	return true;
}

export function useLoginCode(email, code) {
	// TODO
	return {
		ok: true,
		msg: "Successfully logged in",
	}
}