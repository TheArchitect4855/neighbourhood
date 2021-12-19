export async function createAccount(email, nickname, dob, fname, lname, neighbourhood) {

}

export async function createLoginCode(email) {
	return {
		expiresIn: 5
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
	// TODO
	return {};
}

export async function useLoginCode(email, code) {
	return 0;
}

export function validateToken(token) {
	// TODO
	return true;
}