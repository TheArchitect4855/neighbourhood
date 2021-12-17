import Cookies from "cookies";

export default function handler(req, res) {
	const cookies = new Cookies(req, res);
	cookies.set("userToken");
	res.writeHead(302, {
		Location: "/login",
	}).end();
}