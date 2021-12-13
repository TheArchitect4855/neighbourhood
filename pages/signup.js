import Cookies from "cookies";
import React from "react";
import { parseBody } from "../lib/bodyparser";
import { createAccount } from "../lib/backend";

export default class Authenticate extends React.Component {
	render() {
		return (
			<div>
				Signing you in...
			</div>
		);
	}
}

export async function getServerSideProps(ctx) {
	const { req, res } = ctx;
	
	if(req.method != "POST") {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			}
		};
	}

	const cookies = new Cookies(req, res);
	const userToken = cookies.get("userToken");
	if(userToken && validateToken(userToken)) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			}
		};
	}

	const { email, nickname, dob, fname, lname, tos } = await new Promise((resolve, reject) => {
		req.on("data", (data) => {
			const body = parseBody(data);
			resolve(body);
		});
	});

	const { url } = req;
	const query = url.substring("/signup".length);
	const { code } = parseBody(query);
	if(!email || !nickname || !dob || !tos) {
		return {
			redirect: {
				destination: `/invite/${code}?msg=${encodeURIComponent("Missing required parameters")}`,
				permanent: false,
			}
		}
	}

	if(!createAccount(email, nickname, dob, fname, lname)) {
		return {
			redirect: {
				destination: `/invite/${code}?msg=${encodeURIComponent("Error creating account")}`,
				permanent: false,
			}
		}
	}

	return {
		redirect: {
			destination: `/login?msg=${encodeURIComponent("Successfully created account")}`,
			permanent: false,
		}
	}
}