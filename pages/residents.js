import Cookies from "cookies";
import Head from "next/head";
import React from "react";
import { getResidentsIn, getUserData, validateToken } from "../lib/backend";
import { decode, sign } from "jsonwebtoken";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default class Residents extends React.Component {
	constructor(props) {
		super(props);
		this.leave = this.leave.bind(this);
		this.closePopups = this.closePopups.bind(this);
		this.createInvite = this.createInvite.bind(this);
		this.leaveConfirmRef = React.createRef();
		this.notificationRef = React.createRef();
	}
	
	render() {
		const residents = [];
		for(const resident of this.props.residents) {
			residents.push(
				<article>
					<h4 key={ resident.uid }>
						<a href={ `/profile/${resident.uid}` } style={{ color: "inherit" }}>
							{resident.nickname}
						</a>
						{ ' ' }
						<span className="userRank">#{resident.rank}</span>
					</h4>
				</article>
			);
		}

		let createInviteButton = null;
		if(this.props.position == "Administrator") {
			createInviteButton = [
				<button onClick={ this.createInvite } style={{ backgroundColor: "#5f5" }} key="createButton">Create Invite</button>,
				<span style={{ margin: "0.5em" }} key="spacer"></span>,
			];
		}

		return (
			<div>
				<Head>
					<title>Residents</title>
				</Head>

				<Header />

				<main>
					<h2>Residents of Neighbourhood #{this.props.neighbourhood}</h2>
					<hr />

					{ residents }

					{ createInviteButton }
					<button onClick={ this.leave } style={{ backgroundColor: "#f55" }}>Leave Neighbourhood</button>
				</main>

				<Footer />

				<article className="popup" ref={ this.leaveConfirmRef }>
					<h2>Leave Neighbourhood</h2>
					<p>
						Are you sure you want to leave the neighbourhood?
						This will delete your account and you will not be able
						to rejoin the neighbourhood unless you have an invite.
					</p>
					<form action="/api/user/leave" method="POST">
						<button type="submit" style={{ backgroundColor: "#f55" }}>Yes</button>
						<span style={{ margin: "0.5em" }}></span>
						<button type="reset" onClick={ this.closePopups }>No</button>
					</form>
				</article>

				<article className="notification" ref={ this.notificationRef }>
					Invite code copied to clipboard
				</article>
			</div>
		);
	}

	leave() {
		const { current } = this.leaveConfirmRef;
		current.style.display = "block";
	}

	async createInvite() {
		const res = await fetch("/api/invite/create");
		let message = "Invite code copied to clipboard"
		if(res.ok) {
			const code = await res.text();
			navigator.clipboard.writeText(code);
		} else {
			message = "Error getting invite code"
		}

		const { current } = this.notificationRef;
		current.innerText = message;
		current.style.display = "block";

		setTimeout(() => {
			current.style.display = "none";
		}, 2750);
	}

	closePopups() {
		const leavePopup = this.leaveConfirmRef.current;
		leavePopup.style.display = "none";
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

	const { uid } = decode(userToken);

	const userDataToken = cookies.get("userData");
	let userData = null;
	if(!userDataToken || !validateToken(userDataToken)) {
		userData = await getUserData(uid);
		cookies.set("userData", sign(userData, "supersecret"));
	} else userData = decode(userDataToken);

	const residents = (await getResidentsIn(userData.neighbourhood))
		.map((r) => {
			return {
				uid: r.uid,
				nickname: r.nickname,
				rank: r.rank,
			}
		});

	return {
		props: {
			neighbourhood: userData.neighbourhood,
			position: userData.position,
			residents,
		}
	}
}