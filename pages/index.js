import Cookies from "cookies";
import React from "react";
import Link from "next/link";
import Header from "../components/Header";
import Image from "next/image";
import Footer from "../components/Footer";
import { parseMd } from "../lib/mdparser";
import { validateToken, getPostsFor } from "../lib/backend";
import styles from "../styles/index.module.css";

export default class Home extends React.Component {
	constructor(props) {
		super(props);
		this.report = this.report.bind(this);
	}
	
	render() {
		const { posts } = this.props;
		let body = [];
		for(let post of posts) {
			const { name, rank } = post.author;
			const content = parseMd(post.content);
			body.push(
				<article key={ post.id } id={ post.id }>
					<h4>{name} <span className="userRank">#{rank}</span></h4>
					{content}
					<div className={ styles.postFooter }>
						<Link href={ `/post/view?id=${post.id}` }>
							<img src="/icons/message.svg" alt="Message Icon"></img>
						</Link>

						<img src="/icons/flag.svg" alt="Flag Icon" onClick={ () => this.report(post.id) }></img>
					</div>
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

	report(id) {
		// TODO
		console.log(`Report ${id}`);
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