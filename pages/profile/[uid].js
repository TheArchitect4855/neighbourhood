import Cookies from "cookies";
import Head from "next/head";
import React from "react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import { getUserData, validateToken } from "../../lib/backend";
import { parseMd } from "../../lib/mdparser";
import { decode } from "jsonwebtoken";

export default class Profile extends React.Component {
	constructor(props) {
		super(props);
		this.kickRef = React.createRef();
		this.uidInputRef = React.createRef();
		this.kick = this.kick.bind(this);
		this.closePopups = this.closePopups.bind(this);
	}

	render() {
		const { uid, nickname, rank, position, neighbourhood, fname, lname, dob, bio } = this.props.userData;
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

		let kickButton = null;
		const userPosition = this.props.position;
		const userNeighbourhood = this.props.neighbourhood;
		if(userNeighbourhood == neighbourhood && (
			userPosition == "Administrator" || (userPosition == "Moderator" && position == "Resident")
		)) {
			kickButton = (
				<button onClick={ () => this.kick(uid) }>Kick User</button>
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

					{ kickButton }
				</main>

				<article className="popup" ref={ this.kickRef }>
					<h2>Kick User</h2>
					<p>Are you sure you want to kick {nickname}?</p>
					<form action="/api/user/kick" method="POST" style={{ textAlign: "left" }}>
						<textarea name="reason" placeholder="Reason..." style={{ resize: "none" }} rows="10" cols="40" required></textarea> <br />
						<button type="submit">Kick</button>
						<span style={{ margin: "0.5em" }}></span>
						<button type="reset" onClick={ this.closePopups }>Cancel</button>
						<input type="hidden" name="uid" ref={ this.uidInputRef } />
					</form>
				</article>

				<Footer />
			</div>
		);
	}

	kick(id) {
		const input = this.uidInputRef.current;
		input.value = id;

		const popup = this.kickRef.current;
		popup.style.display = "block";
	}

	closePopups() {
		const popup = this.kickRef.current;
		popup.style.display = "none";
	}
}

export async function getServerSideProps(ctx) {
	const { req, res, query } = ctx;
	const cookies = new Cookies(req, res);
	
	let position = null;
	let neighbourhood = null;
	const userDataToken = cookies.get("userData");
	if(userDataToken && validateToken(userDataToken)) {
		const userData = decode(userDataToken);
		position = userData.position;
		neighbourhood = userData.neighbourhood;
	}

	const profileData = await getUserData(query.uid);
	return {
		props: {
			userData: profileData,
			position,
			neighbourhood,
		}
	}
}