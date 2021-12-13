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
		}
	];
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