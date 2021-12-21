import Head from "next/head";
import React from "react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { getUserData } from "../../lib/backend";
import { parseMd } from "../../lib/mdparser";

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
					</article>
				</main>

				<Footer />
			</div>
		);
	}
}

export async function getServerSideProps(ctx) {
	const { query } = ctx;

	const userData = await getUserData(query.uid);
	return {
		props: {
			userData
		}
	}
}