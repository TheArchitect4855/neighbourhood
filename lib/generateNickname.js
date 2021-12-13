const adjectives = require("../data/english-adjectives.json");
const nouns = require("../data/english-nouns.json");

const breaks = [
	" ",
	"_",
	"-"
];

console.log(`Number of generated nicknames: ${adjectives.length * breaks.length * nouns.length}`);

export default function generateNickname() {
	const adjective = Math.floor(Math.random() * adjectives.length);
	const wordBreak = Math.floor(Math.random() * breaks.length);
	const noun = Math.floor(Math.random() * nouns.length);
	return adjectives[adjective] + breaks[wordBreak] + nouns[noun];
}