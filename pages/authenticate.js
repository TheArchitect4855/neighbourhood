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

	const { email, code } = await new Promise((resolve, reject) => {
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
	cookies.set("userToken", email);
	return {
		redirect: {
			destination: "/",
			permanent: false,
		}
	}
}