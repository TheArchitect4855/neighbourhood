import Footer from "../components/Footer";
import Head from "next/head";
import React from "react";
import Cookies from "cookies";
import { withRouter } from "next/router";
import { validateToken } from "../lib/backend";

export default withRouter(class Login extends React.Component {
	constructor(props) {
		super(props);
		this.sendCode = this.sendCode.bind(this);
		this.emailForm = React.createRef();
		this.codeForm = React.createRef();
		this.emailInput = React.createRef();
		this.msgBox = React.createRef();
	}

	render() {
		let { msg } = this.props.router.query;
		if(!msg) msg = "";

		return (
			<div>
				<Head>
					<title>Log In</title>
				</Head>

				<header>
					<h1>Neighbourhood</h1>
				</header>

				<main>
					<h2>Log In</h2>
					<hr />

					<form action="/api/user/auth" method="POST">
						<div ref={this.emailForm}>
							<label htmlFor="email">Email:</label> <br/>
							<input type="email" name="email" placeholder="email@example.com" ref={this.emailInput} required /> <br/>
							<button type="button" onClick={this.sendCode}>Send Code</button>
						</div>

						<div ref={this.codeForm} style={{ display: "none" }}>
							<label htmlFor="code">Code:</label> <br />
							<input type="text" name="code" placeholder="12345" minLength="5" maxLength="5" required /> <br/>
							
							<p>Check your email for your login code.</p>

							<input type="checkbox" name="remember" />
							<label htmlFor="remember">Remember Me</label> <br />
							<button type="submit">Log In</button>
						</div>

						<p style={{ color: "red" }} ref={ this.msgBox }>{msg}</p>
					</form>

					<article>
						Don&#39;t have an account? Someone needs to invite you to
						a Neighbourhood in order to create one.
					</article>
				</main>

				<Footer />
			</div>
		);
	}

	async sendCode(e) {
		e.preventDefault();

		this.msgBox.current.innerText = "";
		const emailInput = this.emailInput.current;
		const email = emailInput.value;
		const res = await fetch("/api/user/code", {
			method: "POST",
			headers: {
				"Content-Type": "application/json",
			},
			body: JSON.stringify({
				email,
			}),
		});

		const { ok, msg } = await res.json();
		if(ok) {
			const emailForm = this.emailForm.current;
			emailForm.style.display = "none";

			const codeForm = this.codeForm.current;
			codeForm.style.display = "block";
		} else {
			const { current } = this.msgBox;
			current.innerText = msg;
		}
	}
});

export async function getServerSideProps(ctx) {
	const { req, res } = ctx;
	const cookies = new Cookies(req, res);
	const userToken = cookies.get("userToken");
	if(userToken && validateToken(userToken)) {
		return {
			redirect: {
				destination: "/",
				permanent: false,
			}
		}
	}

	return {
		props: {}
	}
}