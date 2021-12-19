import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { randomBytes } from "crypto";
import { validateDOB, validateEmail, validateNickname } from "./datavalidator";
import * as jwt from "jsonwebtoken";

const database = open({
	filename: "data/main.db",
	driver: sqlite3.Database,
});

export async function createAccount(email, nickname, dob, fname, lname, neighbourhood) {
	const db = await database;

	if(!validateEmail(email)) throw new Error("Please enter a valid email");
	if(!validateNickname(nickname)) throw new Error("Please enter a valid nickname (it must be no more than 30 characters, and contain only letters, numbers, underscores, dashes, and spaces)");
	if(!validateDOB(dob)) throw new Error("You must be at least 18 years old to use neighbourhood");

	// TODO: Get rank for neighbourhood, get user position
	const createStatement = await db.prepare(
		"INSERT INTO users (email, nickname, dob, fname, lname, neighbourhood, rank, position) VALUES (?, ?, ?, ?, ?, ?, 0, 'R')"
	);

	await createStatement.run(email, nickname, dob, fname, lname, neighbourhood);
	createStatement.finalize();
}

export async function createLoginCode(email) {
	const db = await database;

	// Make sure the user exists
	const getUserStatement = await db.prepare(
		"SELECT uid FROM users WHERE email=?"
	);

	const userRes = await getUserStatement.get(email);
	if(!userRes) throw new Error("User does not exist");

	// Delete code if it already exists
	const deleteCodeStatement = await db.prepare(
		"DELETE FROM login_codes WHERE email=?"
	);

	await deleteCodeStatement.run(email);
	await deleteCodeStatement.finalize();


	// Create a new code
	const code = randomBytes(4).toString("base64url").substring(0, 5);
	console.log(`GENERATED CODE: ${code}`);
	const expires = Date.now() + 300000;

	const createStatement = await db.prepare(
		"INSERT INTO login_codes (email, code, expires) VALUES (?, ?, ?)"
	);
	
	await createStatement.run(email, code, expires);
	createStatement.finalize();

	return {
		code,
		expiresIn: (expires - Date.now()) / 60000,
	}
}

export async function getInviteCodeData(code) {
	// TODO
	return {
		valid: true,
		neighbourhood: 1,
	}
}

export async function getMessagesFor(uid) {
	// TODO
	return [];
}

export async function getNotificationsFor(uid) {
	// TODO
	return [];
}

export async function getPostsFor(neighbourhood) {
	// TODO
	return [];
}

export async function getUserData(uid) {
	const db = await database;
	const getUserDataStatement = await db.prepare(
		"SELECT * FROM users WHERE uid=?"
	);

	const getUserData = await getUserDataStatement.get(uid);
	if(!getUserData) throw new Error("User does not exist");

	switch(getUserData.position) {
		case "R":
			getUserData.position = "Resident";
			break;
		case "M":
			getUserData.position = "Moderator";
			break;
		case "A":
			getUserData.position = "Administrator";
			break;
		default:
			break;
	}

	return getUserData;
}

export async function useLoginCode(email, code) {
	const db = await database;
	const getCodeStatement = await db.prepare(
		"SELECT code, expires FROM login_codes WHERE email=?"
	);

	const getCode = await getCodeStatement.get(email);
	await getCodeStatement.finalize();
	if(!getCode || getCode.code != code || Date.now() - code.expires > 0) throw new Error("Invalid code");

	const deleteCodeStatement = await db.prepare(
		"DELETE FROM login_codes WHERE email=?"
	);

	await deleteCodeStatement.run(email);
	await deleteCodeStatement.finalize();

	const getUidStatement = await db.prepare(
		"SELECT uid FROM users WHERE email=?"
	);

	const getUid = await getUidStatement.get(email);
	await getUidStatement.finalize();
	if(!getUid) throw new Error("User does not exist");

	return getUid.uid;
}

export function validateToken(token) {
	try {
		jwt.verify(token, "supersecret");
		return true;
	} catch {
		return false;
	}
}