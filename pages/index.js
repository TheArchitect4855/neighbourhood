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
		this.deleteRef = React.createRef();
		this.reportRef = React.createRef();
		this.postIdDeleteRef = React.createRef();
		this.postIdInputRef = React.createRef();
		this.deletePost = this.deletePost.bind(this);
		this.report = this.report.bind(this);
		this.closePopups = this.closePopups.bind(this);
	}
	
	render() {
		const { posts } = this.props;
		let body = [];
	
		for(let post of posts) {
			const { name, rank } = post.author;
			const content = parseMd(post.content);
			
			let actionButton = null;
			if(post.canDelete || this.props.reportShouldDelete) {
				actionButton = (
					<img src="/icons/trash.svg" alt="Trash Icon" onClick={ () => this.deletePost(post.id) }></img>
				);
			} else {
				actionButton = (
					<img src="/icons/flag.svg" alt="Flag Icon" onClick={ () => this.report(post.id) }></img>
				);
			}

			body.push(
				<article key={ post.id } id={ post.id }>
					<h4>{name} <span className="userRank">#{rank}</span></h4>
					{content}
					<div className={ styles.postFooter }>
						<Link href={ `/post/view?id=${post.id}` }>
							<img src="/icons/message.svg" alt="Message Icon"></img>
						</Link>

						{ actionButton }
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
					<div style={{ marginBottom: "6em" }}></div>
				</main>

				<button id="createPost">
					<Link href="/post/create">+</Link>
				</button>

				<article className="popup" ref={ this.deleteRef }>
					<h2>Delete Post</h2>
					<p>Are you sure you want to delete this post?</p>
					<form action="/api/post/delete" method="POST" style={{ textAlign: "left" }}>
						<input type="hidden" name="postId" ref={ this.postIdDeleteRef } />
						<button type="submit">Yes, delete it</button>
						<span style={{ margin: "0.5em" }}></span>
						<button type="reset" onClick={ this.closePopups }>Cancel</button>
					</form>
				</article>

				<article className="popup" ref={ this.reportRef }>
					<h2>Report Post</h2>
					<form action="/api/post/report" method="POST" style={{ textAlign: "left" }}>
						<label htmlFor="reason">Reason for report:</label> <br />
						<textarea name="reason" placeholder="Reason..." style={{ resize: "none" }} rows="10" cols="40" required></textarea> <br />
						<input type="hidden" name="postId" ref={ this.postIdInputRef } />
						<button type="submit">Submit</button>
						<span style={{ margin: "0.5em" }}></span>
						<button type="reset" onClick={ this.closePopups }>Cancel</button>
					</form>
				</article>

				<Footer />
			</div>
		);
	}

	deletePost(id) {
		const deletePopup = this.deleteRef.current;
		deletePopup.style.display = "block";

		const postIdInput = this.postIdDeleteRef.current;
		postIdInput.value = id;
	}

	report(id) {
		const report = this.reportRef.current;
		report.style.display = "block";

		const postIdInput = this.postIdInputRef.current;
		postIdInput.value = id;
	}

	closePopups() {
		const deletePopup = this.deleteRef.current;
		deletePopup.style.display = "none";

		const report = this.reportRef.current;
		report.style.display = "none";
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
		try {
			const { uid } = jwt.decode(userToken);
			const userData = await getUserData(uid);
			userDataToken = jwt.sign(userData, "supersecret");
			cookies.set("userData", userDataToken);
		} catch(e) {
			console.error(e);
			return {
				redirect: {
					destination: "/api/user/logout",
					permanent: false,
				}
			}
		}
	}

	const { uid, neighbourhood, position } = jwt.decode(userDataToken);
	const reportShouldDelete = position == "Administrator" || position == "Moderator";

	try {
		const posts = await getPostsFor(uid, neighbourhood);
		return {
			props: {
				posts,
				reportShouldDelete,
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