import Head from "next/head";
import React from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Cookies from "cookies";
import { getUserData, validateToken } from "../lib/backend";
import { parseMd } from "../lib/mdparser";
import Link from "next/link";

export default class Profile extends React.Component {
	render() {
		const { displayName, rank, position, neighbourhood, fname, lname, dob, bio } = this.props.userData;
		const bioContent = parseMd(bio ?? "");

		let name = null;
		if(fname && lname) {
			name = (
				<tr>
					<td className="subtitle">Name</td>
					<td>{fname} {lname}</td>
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
					<h2>{displayName} <span className="userRank">#{rank}</span></h2>
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
		};
	}

	const userData = await getUserData(userToken);
	return {
		props: { userData }
	}
}