import Head from "next/head";
import React from "react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";
import Cookies from "cookies";
import { getCommentsFor, getPostData, validateToken } from "../../lib/backend";
import * as jwt from "jsonwebtoken";
import { parseMd } from "../../lib/mdparser";
import styles from "../../styles/view.module.css";

export default class View extends React.Component {
	render() {
		if(!this.props.postData) {
			return (
				<div>
					<Head>
						<title>View Post</title>
					</Head>

					<Header />

					<main>
						<article>
							{ this.props.message }.
						</article>
					</main>

					<Footer />
				</div>
			)
		}

		const { content, pid, uid, rank, nickname } = this.props.postData;

		let comments = [];
		for(const comment of this.props.comments) {
			comments.push(
				<div className={ styles.comment }>
					<h5>
						<a href={ `/profile/${comment.author}` } style={{ color: "inherit", textDecoration: "none" }}>{comment.nickname}</a>
						{ ' ' }
						<span className="userRank">#{comment.rank}</span>
					</h5>
					{ parseMd(comment.content) }
				</div>
			);
		}

		if(comments.length == 0) comments = "No comments yet!";

		return (
			<div>
				<Head>
					<title>View Post</title>
				</Head>

				<Header />

				<main>
					<article>
						<h4>
							<a href={ `/profile/${uid}` } style={{ color: "inherit", textDecoration: "none" }}>{nickname}</a>
							{ ' ' }
							<span className="userRank">#{rank}</span>
						</h4>
						{ parseMd(content) }
					</article>

					<p style={{ color: "red" }}>
						{ this.props.message }
					</p>

					<form action={ `/api/post/comment?ret=${pid}` } method="POST" style={{ textAlign: "left" }}>
						<textarea placeholder="Write a comment..." name="comment" rows="10" cols="40" style={{ resize: "none" }} required></textarea>
						<br />
						<button type="submit">Comment</button>
					</form>

					<article>
						{ comments }
					</article>
				</main>

				<Footer />
			</div>
		);
	}
}

export async function getServerSideProps(ctx) {
	const { req, res, query } = ctx;
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

	const { id, msg } = query;
	const userData = jwt.decode(userDataToken);
	const postData = await getPostData(id);
	if(!postData || userData.neighbourhood != postData.neighbourhood) {
		res.statusCode = 404;
		return {
			props: {
				message: "Post not found",
			}
		}
	}

	const comments = await getCommentsFor(postData.pid);
	return {
		props: {
			postData,
			comments,
			message: msg ?? "",
		}
	}
}