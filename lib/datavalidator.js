export function validateEmail(email) {
	const pattern = /.{1,64}@.{1,253}\..{1,253}/g;
	return email.match(pattern) != null && email.length < 255;
}

export function validateNickname(nickname) {
	const pattern = /[a-zA-Z0-9-_ ]{1,30}/g;
	return nickname.match(pattern) != null;
}

export function validateDOB(dob) {
	const age = Date.now() - Date.parse(dob);
	return age > 18 * 3.154e+10;
}