CREATE TABLE login_codes (
	uid INTEGER PRIMARY KEY NOT NULL,
	code CHAR(5) NOT NULL,
	expires DATE NOT NULL
);