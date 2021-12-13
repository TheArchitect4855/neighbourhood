import Head from "next/head";
import React from "react";
import Footer from "../components/Footer";
import Header from "../components/Header";
import Cookies from "cookies";
import { getNotificationsFor, getMessagesFor, validateToken } from "../lib/backend";

export default class Inbox extends React.Component {
	render() {
		const { messages, notifications } = this.props;

		let notifs = [];
		for(const notif of notifications) {
			notifs.push(
				<article dangerouslySetInnerHTML={{ __html: notif }}></article>
			);
		}

		if(notifs.length == 0) {
			notifs = (
				<article>
					Nothing new!
				</article>
			);
		}

		let msgs = [];
		for(const msg of messages) {
			const { to, preview } = msg;
			msgs.push(
				<article style={{ display: "flex", justifyContent: "space-between" }}>
					<h4>{to.name} <span className="usernum">{to.rank}</span></h4>
					<p style={{ opacity: "50%" }} dangerouslySetInnerHTML={{ __html: preview }}></p>
				</article>
			);
		}

		if(msgs.length == 0) {
			msgs = (
				<article>
					Crickets... 🦗
				</article>
			);
		}

		return (
			<div>
				<Head>
					<title>Inbox</title>
				</Head>

				<Header />

				<main>
					<h2>Inbox</h2>
					<hr />
					{ notifs }

					<h2>Messages</h2>
					<hr />
					{ msgs }

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

	const messages = getMessagesFor(userToken);
	const notifications = getNotificationsFor(userToken);
	return {
		props: {
			messages,
			notifications,
		}
	};
}