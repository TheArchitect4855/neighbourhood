import Cookies from "cookies";
import React from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { parseMd } from "../lib/mdparser";

export default class Home extends React.Component {
	render() {
		const { posts } = this.props;
		let body = [];
		let idx = 0;
		for(let post of posts) {
			let name = "system";
			let rank = 0;
			if(post.author) {
				name = post.author.name;
				rank = post.author.rank;
			}

			const content = parseMd(post.content);
			body.push(
				<article key={++idx}>
					<h4>{name} <span className="userRank">#{rank}</span></h4>
					{content}
				</article>
			);
		}

		return (
			<div>
				<Header />
				<main>
					{body}
				</main>

				<button id="createPost">
					<Link href="/post/create">+</Link>
				</button>
				
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
	const posts = [
		{ 
			content: "No posts yet!"
		}
	];

	return {
		props: {
			posts
		}
	};
}