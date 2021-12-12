import Footer from "../components/Footer";
import Head from "next/head";
import React from "react";

export default class Login extends React.Component {
	constructor(props) {
		super(props);
		this.sendCode = this.sendCode.bind(this);
		this.emailForm = React.createRef();
		this.codeForm = React.createRef();

		this.state = {
			msg: "",
		}
	}
	
	componentDidMount() {
		let msg = null;
		if(window.location.search) {
			const query = {};
			window.location.search.substring(1)
				.split("&")
				.forEach((x) => {
					const pair = x.split("=");
					const key = decodeURIComponent(pair[0]);
					const value = decodeURIComponent(pair[1]);
					return query[key] = value;
				});
			msg = query.msg;
		}

		if(msg) {
			this.setState({ msg });
		}
	}

	render() {
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

					<form action="/authenticate" method="POST">
						<div ref={this.emailForm}>
							<label htmlFor="email">Email:</label> <br/>
							<input type="email" name="email" placeholder="email@example.com" required /> <br/>
							<button type="button" onClick={this.sendCode}>Send Code</button>
						</div>

						<div ref={this.codeForm} style={{ display: "none" }}>
							<label htmlFor="code">Code:</label> <br />
							<input type="text" name="code" placeholder="12345" minLength="5" maxLength="5" required /> <br/>
							<button type="submit">Log In</button>
						</div>

						<p style={{ color: "red" }}>{this.state.msg}</p>
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

	sendCode(e) {
		e.preventDefault();

		// TODO: Send user a code
		const emailForm = this.emailForm.current;
		emailForm.style.display = "none";

		const codeForm = this.codeForm.current;
		codeForm.style.display = "block";
	}
}