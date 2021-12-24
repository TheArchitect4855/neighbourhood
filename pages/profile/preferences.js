import Head from "next/head";
import React from "react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Cookies from "cookies";
import { validateToken, getUserData } from "../../lib/backend";
import * as jwt from "jsonwebtoken";

export default class Preferences extends React.Component {
	render() {
		const { email_notifications } = this.props.userData;
		return (
			<div>
				<Head>
					<title>User Preferences</title>
				</Head>

				<Header />

				<main>
					<h2>Preferences</h2>
					<hr />

					<form action="/api/user/updatePrefs" method="POST" style={{ textAlign: "left" }}>
						<table className="spaced">
							<tbody>
								<tr>
									<td>
										<label htmlFor="emailNotifs">Email Notifications</label>
									</td>
									<td>
										<input type="checkbox" name="emailNotifs" defaultChecked={ email_notifications == 1 } />
									</td>
								</tr>
							</tbody>
						</table>

						<button type="submit">Update Preferences</button>
					</form>
				</main>

				<Footer />
			</div>
		);
	}
}

export async function getServerSideProps(ctx) {
	const { req, res } = ctx;
	const cookies = new Cookies(req, res);
	const userToken = cookies.get("userToken");
	if(!userToken || !validateToken(userToken)) {
		return {
			redirect: {
				destination: "/login",
				permanent: false,
			}
		}
	}

	let userDataToken = cookies.get("userData");
	if(!userDataToken || !validateToken(userDataToken)) {
		try {
			const { uid } = jwt.decode(userToken);
			const userData = await getUserData(uid);
			userDataToken = jwt.sign(userData, "supersecret");
			cookies.set("userData", userDataToken);
		} catch(e) {
			console.error(e);
			return {
				redirect: {
					destination: "/api/user/logout",
					permanent: false,
				}
			}
		}
	}

	return {
		props: {
			userData: jwt.decode(userDataToken)
		}
	}
}