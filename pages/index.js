import Cookies from "cookies";
import React from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { parseMd } from "../lib/mdparser";
import { validateToken, getPostsFor } from "../lib/backend";

export default class Home extends React.Component {
	render() {
		const { posts } = this.props;
		let body = [];
		let idx = 0;
		for(let post of posts) {
			const { name, rank } = post.author;
			const content = parseMd(post.content);
			body.push(
				<article key={++idx}>
					<h4>{name} <span className="userRank">#{rank}</span></h4>
					{content}
				</article>
			);
		}

		if(posts.length == 0) {
			body = (
				<article>
					No posts yet! Why not <Link href="/post/create">create one</Link>?
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
	if(!userToken || !validateToken(userToken)) {
		return {
			redirect: {
				destination: "/login",
				permanent: false,
			}
		};
	}

	const posts = getPostsFor(1);
	return {
		props: {
			posts
		}
	};
}