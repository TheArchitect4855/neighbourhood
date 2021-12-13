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
	return [];
}

export function getMessagesFor(user) {
	// TODO
	return [];
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