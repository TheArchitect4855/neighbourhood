import Head from "next/head";
import React from "react";
import Cookies from "cookies";
import { getInvite, validateToken } from "../../lib/backend";
import generateNickname from "../../lib/generateNickname";
import { withRouter } from "next/router";

export default withRouter(class Invite extends React.Component {
	constructor(props) {
		super(props);
		this.getRandomNickname = this.getRandomNickname.bind(this);
		this.state = {
			nickname: "nickname",
		}
	}

	componentDidMount() {
		this.getRandomNickname();
		setInterval(this.getRandomNickname, 3000);
	}
	
	render() {
		const { valid, neighbourhood, code } = this.props;

		let message = valid ? `You've been invited to join Neighbourhood #${neighbourhood}! Now you can sign up and start participating in your community.` : "This invite is invalid."
		if(this.props.message) message = this.props.message;

		let signupForm = null;
		if(valid) {
			signupForm = (
				<form action={ `/signup?code=${code}` } method="POST">
					<table className="spaced">
						<tbody>
							<tr>
								<td>
									<label htmlFor="email">Email:*</label> <br />
									<input name="email" type="email" placeholder="email@example.com" required />
								</td>
								<td className="subtitle">
									Your email. We use this to send you login codes and notifications.
								</td>
							</tr>

							<tr>
								<td>
									<label htmlFor="nickname">Nickname:*</label> <br />
									<input name="nickname" type="text" placeholder={this.state.nickname} required />
								</td>
								<td className="subtitle">
									Your public display name on Neighbourhood. You can change this later.
								</td>
							</tr>

							<tr>
								<td>
									<label htmlFor="dob">Date of Birth:*</label> <br />
									<input name="dob" type="date" required />
								</td>
								<td className="subtitle">
									Your birthday. Needed for legal reasons and to wish you a happy birthday.
								</td>
							</tr>

							<tr>
								<td>
									<label htmlFor="fname">First Name:</label> <br />
									<input name="fname" type="text" placeholder="First" />
								</td>
								<td className="subtitle">
									Optional. Your first or preferred name to be displayed on your profile.
								</td>
							</tr>

							<tr>
								<td>
									<label htmlFor="lname">Last Name:</label> <br />
									<input name="lname" type="text" placeholder="Last" />
								</td>
								<td className="subtitle">
									Optional. Your last name to be displayed on your profile.
								</td>
							</tr>
						</tbody>
					</table>

					<input name="tos" type="checkbox" required />
					<label htmlFor="tos"> I accept Neighbourhood&#39;s Terms of Service and Privacy Policy</label>

					<br />

					<button type="submit" style={{ margin: "1em", padding: "1em" }}>Sign Up</button>
				</form>
			);
		}

		let { msg } = this.props.router.query;
		if(!msg) msg = "";

		return (
			<div>
				<Head>
					<title>Sign Up</title>
				</Head>
				
				<header style={{ backgroundColor: "var(--primary-color)" }}>
					<h1>Neighbourhood</h1>
				</header>

				<main>
					<h2>Sign Up</h2>
					<hr />

					<article>{ message }</article>
					<p style={{ color: "red" }}>{msg}</p>
					{signupForm}
				</main>
			</div>
		);
	}

	getRandomNickname() {
		const nickname = generateNickname();
		this.setState({ nickname });
	}
});

export async function getServerSideProps(ctx) {
	const { req, res } = ctx;
	const cookies = new Cookies(req, res);

	const userToken = cookies.get("userToken");
	if(userToken && validateToken(userToken)) {
		return {
			props: {
				message: "You're already in a neighbourhood!"
			}
		};
	}

	const { url } = req;
	const code = url.substring("/invite/".length);
	const invite = getInvite(code);
	
	let props = {};
	if(invite && invite.valid) {
		props = invite;
		props.code = code;
	} else {
		props.valid = false;
	}

	return {
		props
	}
}