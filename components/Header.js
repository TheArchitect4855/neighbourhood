import Image from "next/image";
import React from "react";
import styles from "../styles/Header.module.css";
import Link from "next/link";

import bellIcon from "../public/icons/bell.svg";
import homeIcon from "../public/icons/home.svg";
import menuIcon from "../public/icons/menu.svg";
import userIcon from "../public/icons/user.svg";

export default class Header extends React.Component {
	constructor(props) {
		super(props);
		this.toggleMenu = this.toggleMenu.bind(this);
		this.menuRef = React.createRef();
		this.state = {
			menuOpen: false,
		};
	}

	render() {
		return (
			<header>
				<h1>Neighbourhood</h1>
				<button className="portrait menuButton" onClick={this.toggleMenu}>
					<Image src={menuIcon} alt="Menu Icon"></Image>
				</button>

				<div className={styles.menu} ref={ this.menuRef }>
					<button className="portrait menuButton" onClick={this.toggleMenu}>
						<span style={{ fontSize: "2em", fontWeight: "bold" }}>&#62;</span>
					</button>
					
					<button className="menuButton">
						<Link href="/">
							<Image src={homeIcon} alt="Home Icon"></Image>
						</Link>
					</button>

					<button className="menuButton">
						<Link href="/inbox">
							<Image src={bellIcon} alt="Bell Icon"></Image>
						</Link>
					</button>

					<button className="menuButton">
						<Link href="/profile">
							<Image src={userIcon} alt="User Icon"></Image>
						</Link>
					</button>
				</div>
			</header>
		);
	}

	toggleMenu() {
		const menuOpen = !this.state.menuOpen;
		const { current } = this.menuRef;
		if(menuOpen) {
			current.style.width = "5em";
		} else {
			current.style.width = 0;
		}

		this.setState({ menuOpen });
	}
}