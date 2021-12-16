CREATE TABLE users (
	uid INTEGER PRIMARY KEY AUTOINCREMENT NOT NULL,
	email VARCHAR(255) UNIQUE NOT NULL,
	nickname VARCHAR(30) NOT NULL,
	dob DATE NOT NULL,
	fname VARCHAR(30),
	lname VARCHAR(30),
	joined_on DATE NOT NULL
);