import Cookies from "cookies";

export default function handler(req, res) {
	const cookies = new Cookies(req, res);
	cookies.set("userToken");
	cookies.set("userData");
	res.writeHead(302, {
		Location: "/login",
	}).end();
}