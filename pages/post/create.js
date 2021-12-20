import Head from "next/head";
import { withRouter } from "next/router";
import React from "react";
import Footer from "../../components/Footer";
import Header from "../../components/Header";

export default withRouter(class Create extends React.Component {
	render() {
		let { msg } = this.props.router.query;
		if(!msg) msg = "";

		return (
			<div>
				<Head>
					<title>Create Post</title>
				</Head>

				<Header />

				<main>
					<h2>Create Post</h2>
					<hr />

					<form style={{ textAlign: "left" }} method="POST" action="/api/post/create" encType="multipart/form-data">
						<label htmlFor="content">Post Content:</label> <br />
						<textarea name="content" maxLength="1000" rows="25" cols="40" placeholder="Use Markdown to format your post!" style={{ resize: "none" }}>
						</textarea> 
						
						<br />
						
						<a href="https://www.markdownguide.org/basic-syntax/" target="_blank" noreferrer="true" nofollow="true">Markdown Guide</a> <br />

						<label htmlFor="attachment">Attach File: </label>
						<input type="file" name="attachment" /> <br />

						<p style={{ color: "red" }}>{msg}</p>
						<button type="submit">Create Post</button>
					</form>
				</main>

				<Footer />
			</div>
		);
	}
});