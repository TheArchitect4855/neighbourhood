import Cookies from "cookies";
import React from "react";
import { parseBody } from "../lib/bodyparser";
import { useLoginCode } from "../lib/backend";

export default class Authenticate extends React.Component {
	render() {
		return (
			<div>
				Logging you in...
			</div>
		);
	}
}

export async function getServerSideProps(ctx) {
	const { req, res } = ctx;
	
	if(req.method != "POST") {
		return {
			redirect: {
				destination: "/login",
				permanent: false,
			}
		};
	}

	const { email, code, remember } = await new Promise((resolve, reject) => {
		req.on("data", (data) => {
			const body = parseBody(data);
			resolve(body);
		});
	});

	const { ok, msg } = useLoginCode(email, code);
	if(!ok) {
		const encodedMsg = encodeURIComponent(msg);
		return {
			redirect: {
				destination: `/login?msg=${encodedMsg}`,
				permanent: false,
			}
		}
	}

	const cookies = new Cookies(req, res);
	
	let options = {};
	if(remember && remember == "on") {
		options.maxAge = 30 * 86400000;
	}
	
	cookies.set("userToken", email, options); // TODO: Get actual token
	return {
		redirect: {
			destination: "/",
			permanent: false,
		}
	}
}