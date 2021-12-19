import Cookies from "cookies";
import React from "react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Head from "next/head";
import { validateToken, getUserData } from "../../lib/backend";
import * as jwt from "jsonwebtoken";

export default class Edit extends React.Component {
	render() {
		const { nickname, fname, lname, bio }
			= this.props.userData;

		return (
			<div>
				<Head>
					<title>Profile</title>
				</Head>

				<Header />

				<main>
					<h2>Edit Profile</h2>
					<hr />

					<form action="/api/user/update" method="POST" style={{ textAlign: "left" }}>
						<table>
							<tbody>
								<tr>
									<td>
										<label forName="nickname">Nickname: </label>
									</td>
									<td>
										<input type="text" name="nickname" defaultValue={ nickname } maxLength="30" required />
									</td>
								</tr>
								
								<tr>
									<td>
										<label forName="fname">First Name: </label>
									</td>
									<td>
										<input type="text" name="fname" defaultValue={ fname } maxLength="30" />
									</td>
								</tr>

								<tr>
									<td>
										<label forName="lname">Last Name: </label>
									</td>

									<td>
										<input type="text" name="lname" defaultValue={ lname } maxLength="30" />
									</td>
								</tr>
							</tbody>
						</table>

						<label forName="bio">Bio: </label> <br />
						<textarea name="bio" maxLength="250" rows="6" cols="45" style={{ resize: "none" }} >
							{ bio }
						</textarea>

						<br />

						<button type="submit">Update Profile</button>
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