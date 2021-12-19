import Cookies from "cookies";
import React from "react";
import Link from "next/link";
import Header from "../components/Header";
import Footer from "../components/Footer";
import { parseMd } from "../lib/mdparser";
import { validateToken, getPostsFor, getUserData } from "../lib/backend";
import styles from "../styles/index.module.css";
import Head from "next/head";
import * as jwt from "jsonwebtoken";

export default class Home extends React.Component {
	constructor(props) {
		super(props);
		this.reportRef = React.createRef();
		this.postIdInputRef = React.createRef();
		this.report = this.report.bind(this);
		this.cancelReport = this.cancelReport.bind(this);
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
				<Head>
					<title>Neighbourhood</title>
				</Head>

				<Header />
				<main>
					{body}
				</main>

				<button id="createPost">
					<Link href="/post/create">+</Link>
				</button>

				<article className="popup" ref={ this.reportRef }>
					<h2>Report Post</h2>
					<form action="/api/post/report" method="POST" style={{ textAlign: "left" }}>
						<label htmlFor="reason">Reason for report:</label> <br />
						<textarea name="reason" placeholder="Reason..." style={{ resize: "none" }} rows="10" cols="40" required></textarea> <br />
						<input type="hidden" name="postId" ref={ this.postIdInputRef } />
						<button type="submit">Submit</button>
						<span style={{ margin: "0.5em" }}></span>
						<button type="reset" onClick={ this.cancelReport }>Cancel</button>
					</form>
				</article>

				<Footer />
			</div>
		);
	}

	report(id) {
		const report = this.reportRef.current;
		report.style.display = "block";

		const postIdInput = this.postIdInputRef.current;
		postIdInput.value = id;
	}

	cancelReport() {
		const { current } = this.reportRef;
		current.style.display = "none";
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

	let userDataToken = cookies.get("userData");
	if(!userDataToken || !validateToken(userDataToken)) {
		const userData = await getUserData(userToken.uid);
		userDataToken = jwt.sign(userData, "supersecret");
		cookies.set("userData", userDataToken);
	}

	const { neighbourhood } = jwt.decode(userDataToken);
	
	try {
		const posts = await getPostsFor(neighbourhood);
		return {
			props: {
				posts
			}
		}
	} catch(e) {
		console.error(e);
		return {
			props: {
				posts: []
			}
		}
	}
}