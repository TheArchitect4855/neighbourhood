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
		this.leaveConfirmRef = React.createRef();
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
			</div>
		);
	}

	leave() {
		const { current } = this.leaveConfirmRef;
		current.style.display = "block";
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
			residents,
		}
	}
}