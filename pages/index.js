import Cookies from "cookies";
import React from "react";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default class Home extends React.Component {
	render() {
		const { posts } = this.props;
		let content = [];
		if(posts.msg) {
			content = (
				<div style={{ textAlign: "center", width: "100%", margin: "1em 0" }}>
					{ posts.msg }
				</div>
			);
		}

		return (
			<div>
				<Header />
				<main>
					{content}
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
	if(!userToken) {
		return {
			redirect: {
				destination: "/login",
				permanent: false,
			}
		};
	}

	// TODO: Validate login token

	// TODO: Get posts
	const posts = {
		msg: "No posts yet!",
	};

	return {
		props: {
			posts
		}
	};
}