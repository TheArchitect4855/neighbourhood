import Head from "next/head";
import React from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import { parseMd } from "../lib/mdparser";
import Link from "next/link";
import Cookies from "cookies";
import { validateToken, getUserData } from "../lib/backend";
import * as jwt from "jsonwebtoken";

export default class Profile extends React.Component {
	render() {
		const { nickname, rank, position, neighbourhood, fname, lname, dob, bio } = this.props.userData;
		const bioContent = parseMd(bio ?? "");

		let name = null;
		if(fname || lname) {
			name = (
				<tr>
					<td className="subtitle">Name</td>
					<td>{fname ?? ""} {lname ?? ""}</td>
				</tr>
			);
		}

		return(
			<div>
				<Head>
					<title>Profile</title>
				</Head>

				<Header />
				
				<main>
					<h2>{nickname} <span className="userRank">#{rank}</span></h2>
					<hr />

					<table className="spaced">
						<tbody>
							<tr>
								<td className="subtitle">{position} of</td>
								<td>Neighbourhood #{neighbourhood}</td>
							</tr>

							{name}

							<tr>
								<td className="subtitle">Birthday</td>
								<td>{dob}</td>
							</tr>
						</tbody>
					</table>

					<h4>Bio</h4>
					<article>
						{ bioContent }
						<Link href="/profile/edit">Edit</Link>
					</article>

					<Link href="/profile/preferences">Preferences</Link>
					<br />
					<Link href="/api/user/logout">Log Out</Link>
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