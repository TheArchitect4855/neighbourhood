import { open } from "sqlite";
import sqlite3 from "sqlite3";
import { randomBytes } from "crypto";
import { validateDOB, validateEmail, validateNickname } from "./datavalidator";
import * as jwt from "jsonwebtoken";
import { NotificationTarget } from "./notifications";
import { readFileSync } from "fs";

const database = open({
	filename: "data/main.db",
	driver: sqlite3.Database,
});

export async function createAccount(email, nickname, dob, fname, lname, neighbourhood) {
	if(!validateEmail(email)) throw new Error("Please enter a valid email");
	if(!validateNickname(nickname)) throw new Error("Please enter a valid nickname (it must be no more than 30 characters, and contain only letters, numbers, underscores, dashes, and spaces)");
	if(!validateDOB(dob)) throw new Error("You must be at least 18 years old to use neighbourhood");

	const db = await database;
	const getRankStatement = await db.prepare(
		"SELECT uid FROM users WHERE neighbourhood=?"
	);

	const getRank = await getRankStatement.all(neighbourhood);
	await getRankStatement.finalize();

	if(getRank.length == 64) throw new Error("This Neighbourhood is full");

	const rank = getRank.length + 1;
	
	let position = "R";
	if(rank == 1) position = "A";

	const createStatement = await db.prepare(
		"INSERT INTO users (email, nickname, dob, fname, lname, neighbourhood, rank, position) VALUES (?, ?, ?, ?, ?, ?, ?, ?)"
	);

	await createStatement.run(email, nickname, dob, fname, lname, neighbourhood, rank, position);
	await createStatement.finalize();
}

export async function createComment(uid, pid, content) {
	if(content.length > 250) throw new Error("Content must be less than 250 characters");

	const db = await database;
	const createCommentStatement = await db.prepare(
		"INSERT INTO comments (author, post, content) VALUES (?, ?, ?)"
	);

	await createCommentStatement.run(uid, pid, content);
	await createCommentStatement.finalize();
}

export async function createLoginCode(email) {
	const db = await database;

	// Make sure the user exists
	const getUserStatement = await db.prepare(
		"SELECT uid FROM users WHERE email=?"
	);

	const userRes = await getUserStatement.get(email);
	await getUserStatement.finalize();
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
	await createStatement.finalize();

	return {
		code,
		expiresIn: Math.round((expires - Date.now()) / 60000),
	}
}

export async function createPost(author, neighbourhood, content, attachment) {
	const db = await database;
	const createPostStatement = await db.prepare(
		"INSERT INTO posts (author, neighbourhood, content, attachment) VALUES (?, ?, ?, ?)"
	);

	await createPostStatement.run(author, neighbourhood, content, attachment);
	await createPostStatement.finalize();
}

export async function deletePost(pid) {
	const db = await database;
	const deleteStatement = await db.prepare(
		"DELETE FROM posts WHERE pid=?"
	);

	await deleteStatement.run(pid);
	await deleteStatement.finalize();
}

export async function getCommentsFor(pid) {
	const db = await database;
	const getCommentsStatement = await db.prepare(
		"SELECT author, nickname, rank, content FROM ((SELECT * FROM comments INNER JOIN posts ON pid=post) INNER JOIN users ON uid=author) WHERE pid=? ORDER BY posted_on DESC"
	);

	const getComments = await getCommentsStatement.all(pid);
	await getCommentsStatement.finalize();

	return getComments;
}

export async function getEmailsForTarget(notif, neighbourhood) {
	const db = await database;
	
	let positions = [ "A" ];
	if(notif.target >= NotificationTarget.Mod) positions.push("M");
	if(notif.target == NotificationTarget.All) positions.push("R");

	if(notif.target == NotificationTarget.User) {
		const getUserStatement = await db.prepare(
			"SELECT email FROM users WHERE uid=?"
		);

		const user = await getUserStatement.get(notif.userId);
		await getUserStatement.finalize();

		if(!user) throw new Error("User does not exist");

		return [ user.email ];
	} else if(neighbourhood) {
		const getUsersStatement = await db.prepare(
			"SELECT email FROM users WHERE neighbourhood=? AND position IN (?)"
		);

		const users = await getUsersStatement.all(neighbourhood, positions);
		await getUsersStatement.finalize();

		return users.map((u) => u.email);
	} else {
		const getUsersStatement = await db.prepare(
			"SELECT email FROM users WHERE position IN (?)"
		);

		const users = await getUsersStatement.all(positions);
		await getUsersStatement.finalize();

		return users.map((u) => u.email);
	}
}

export async function getInviteCodeData(code) {
	const db = await database;
	const getCodeStatement = await db.prepare(
		"SELECT neighbourhood FROM invite_codes WHERE code=?"
	);

	const getCode = await getCodeStatement.get(code);
	await getCodeStatement.finalize();

	if(!getCode) {
		return {
			valid: false,
			neighbourhood: 0,
		}
	}

	return {
		valid: true,
		neighbourhood: getCode.neighbourhood,
	}
}

export async function getMessagesFor(uid) {
	// TODO
	return [];
}

export async function getNotificationsFor(uid) {
	const db = await database;
	const getNotificationsStatement = await db.prepare(
		"SELECT content FROM notifications WHERE user=?"
	);

	const getNotifications = await getNotificationsStatement.all(uid);
	await getNotificationsStatement.finalize();

	const deleteNotificationsStatement = await db.prepare(
		"DELETE FROM notifications WHERE user=?"
	);

	await deleteNotificationsStatement.run(uid);
	await deleteNotificationsStatement.finalize();

	return getNotifications.map((x) => {
		return x.content;
	});
}

export async function getPostData(pid) {
	const db = await database;
	const getPostStatement = await db.prepare(
		"SELECT * FROM posts WHERE pid=?"
	);

	const getPost = await getPostStatement.get(pid);
	await getPostStatement.finalize();

	getPost.content = processContent(getPost);
	return getPost;
}

export async function getPostsFor(uid, neighbourhood) {
	const db = await database;
	const getPostsStatement = await db.prepare(
		"SELECT * FROM (SELECT posts.neighbourhood, pid, author, content, attachment, nickname, rank, uid, posted_at FROM posts INNER JOIN users ON author=uid) WHERE neighbourhood=? ORDER BY posted_at DESC"
	);

	const getPosts = await getPostsStatement.all(neighbourhood);
	await getPostsStatement.finalize();

	const posts = getPosts.map((p) => {
		const content = processContent(p);
		return {
			author: {
				name: p.nickname,
				rank: p.rank,
				uid: p.uid,
			},
			content,
			id: p.pid,
			canDelete: p.uid == uid,
		}
	})

	return posts;
}

export async function getResidentsIn(neighbourhood) {
	const db = await database;
	const getResidentsStatement = await db.prepare(
		"SELECT * FROM users WHERE neighbourhood=? ORDER BY rank ASC"
	);

	const getResidents = await getResidentsStatement.all(neighbourhood);
	await getResidentsStatement.finalize();

	return getResidents;
}

export async function getUserData(uid) {
	const db = await database;
	const getUserDataStatement = await db.prepare(
		"SELECT * FROM users WHERE uid=?"
	);

	const getUserData = await getUserDataStatement.get(uid);
	await getUserDataStatement.finalize();
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

export async function getUid(email) {
	const db = await database;
	const getUidStatement = await db.prepare("SELECT uid FROM users WHERE email=?");
	const getUid = await getUidStatement.get(email);
	await getUidStatement.finalize();
	return getUid.uid;
}

export async function postNotification(notification, neighbourhood) {
	const db = await database;

	let targetPosition = "'R', 'M', 'A'";
	if(notification.target == NotificationTarget.Mod) {
		targetPosition = "'M', 'A'";
	} else if(notification.target == NotificationTarget.Admin) {
		targetPosition = "'A'";
	}

	if(notification.target == NotificationTarget.User) {
		const { content, userId } = notification;
		const createStatement = await db.prepare(
			"INSERT INTO notifications (content, user) VALUES (?, ?)"
		);

		await createStatement.run(content, userId);
		await createStatement.finalize();
	} else if(neighbourhood) {
		const getUsersStatement = await db.prepare(
			`SELECT uid FROM users WHERE neighbourhood=? AND position IN (${targetPosition})`
		);

		const getUsers = await getUsersStatement.all(neighbourhood);
		await getUsersStatement.finalize();

		const createStatement = await db.prepare(
			"INSERT INTO notifications (content, user) VALUES (?, ?)"
		);

		const { content } = notification;
		for(const { uid } of getUsers) {
			await createStatement.run(content, uid);
		}

		await createStatement.finalize();
	} else {
		const getUsersStatement = await db.prepare(
			`SELECT uid FROM users WHERE position IN (${targetPosition})`
		);

		const getUsers = await getUsersStatement.all();
		await getUsersStatement.finalize();

		const createStatement = await db.prepare(
			"INSERT INTO notifications (content, user) VALUES (?, ?)"
		);

		const { content } = notification;
		for(const { uid } of getUsers) {
			await createStatement.run(content, uid);
		}

		await createStatement.finalize();
	}
}

export async function promoteUser(uid) {
	const db = await database;
	const promoteStatement = await db.prepare(
		"UPDATE users SET position='M' WHERE uid=?"
	);

	await promoteStatement.run(uid);
	await promoteStatement.finalize();
}

export async function removeUserFromNeighbourhood(uid) {
	const db = await database;
	const getUserStatement = await db.prepare(
		"SELECT neighbourhood, rank FROM users WHERE uid=?"
	);

	const getUser = await getUserStatement.get(uid);
	await getUserStatement.finalize();
	if(!getUser) throw new Error("User does not exist");

	const { neighbourhood, rank } = getUser;

	const removeUserStatement = await db.prepare(
		"DELETE FROM users WHERE uid=?"
	);

	await removeUserStatement.run(uid);
	await removeUserStatement.finalize();

	const updateRankStatement = await db.prepare(
		"UPDATE users SET rank=rank-1 WHERE rank > ? AND neighbourhood=?"
	);

	await updateRankStatement.run(rank, neighbourhood);
	await updateRankStatement.finalize();

	const updateAdminStatement = await db.prepare(
		"UPDATE users SET position='A' WHERE rank=1 AND neighbourhood=?"
	);

	await updateAdminStatement.run(neighbourhood);
	await updateAdminStatement.finalize();
}

export async function updateUserData(uid, nickname, fname, lname, bio) {	
	const db = await database;
	const updateUserDataStatement = await db.prepare(
		"UPDATE users SET nickname=?, fname=?, lname=?, bio=? WHERE uid=?"
	);

	await updateUserDataStatement.run(nickname, fname, lname, bio, uid);
	await updateUserDataStatement.finalize();
}

export async function redeemInviteCode(code) {
	const db = await database;
	const deleteCodeStatement = await db.prepare(
		"DELETE FROM invite_codes WHERE code=?"
	);

	await deleteCodeStatement.run(code);
	await deleteCodeStatement.finalize();
}

export async function redeemLoginCode(email, code) {
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

function processContent(p) {
	let filetype = null;
	let ogName = null;
	let fileUrl = `/uploads/${p.attachment}`;
	if(p.attachment) {
		try {
			const meta = JSON.parse(
				readFileSync(`${process.cwd()}/public${fileUrl}.meta`)
			);

			filetype = meta.type;
			ogName = meta.originalName;
		} catch(e) {
			console.error(e);
		}
	}

	let content = p.content ?? "";
	if(filetype) {
		if(filetype.startsWith("image/")) {
			content += `\n\n![${ogName}](${fileUrl})`;
		} else {
			content += `\n\n[${ogName}](${fileUrl})`;
		}
	}

	return content;
}