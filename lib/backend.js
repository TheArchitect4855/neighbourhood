export function createAccount(email, nickname, dob, fname, lname) {
	// TODO: Verify & sanitize data, create account
	return {
		ok: true,
		msg: "Account successfully created",
	};
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