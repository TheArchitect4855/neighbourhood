import Head from "next/head";
import React from "react";
import generateNickname from "../../lib/generateNickname";
import { withRouter } from "next/router";
import { getInviteCodeData, validateToken } from "../../lib/backend";
import Cookies from "cookies";

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
				<form action={ `/api/user/create?code=${code}` } method="POST">
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
									<input name="nickname" type="text" maxLength="30" placeholder={this.state.nickname} required />
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
									<input name="fname" type="text" maxLength="30" placeholder="First" />
								</td>
								<td className="subtitle">
									Optional. Your first or preferred name to be displayed on your profile.
								</td>
							</tr>

							<tr>
								<td>
									<label htmlFor="lname">Last Name:</label> <br />
									<input name="lname" type="text" maxLength="30" placeholder="Last" />
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
	const { req, res, query } = ctx;
	const cookies = new Cookies(req, res);
	const userToken = cookies.get("userToken");
	if(userToken && validateToken(userToken)) {
		return {
			props: {
				valid: false,
				message: "You're already in a Neighbourhood!",
			}
		}
	}

	const { valid, neighbourhood } = await getInviteCodeData(query.code);
	return {
		props: {
			valid,
			neighbourhood,
			code: query.code,
		}
	}
}