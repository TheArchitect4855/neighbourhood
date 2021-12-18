import sqlite3 from "sqlite3";
import { open } from "sqlite";

const NotificationTarget = {
	Admin: 0,
	Mod: 1,
	All: 2,
	User: 3,
};

// Creates & sends notifications
export default class Notification {
	static all(content) {
		return new NotificationData(content, NotificationTarget.All);
	}

	static administrator(content) {
		return new NotificationData(content, NotificationTarget.Admin);
	}

	static moderators(content) {
		return new NotificationData(content, NotificationTarget.Mod);
	}

	static user(content, userId) {
		return new NotificationData(content, NotificationTarget.User, userId);
	}
}

class NotificationData {
	constructor(content, target, userId = null) {
		if(content.length > 250) throw new Error("Content must be less than 250 characters");
		this.content = content;
		this.target = target;
		this.userId = userId;
	}

	async send(neighbourhood = null) {
		// 1. Add notification to database for when users log on to the site
		let db = null;
		try {
			db = await open({
				filename: "data/main.db",
				driver: sqlite3.Database,
			});
			
			if(this.target == NotificationTarget.User) {
				const createStatement = await db.prepare(
					"INSERT INTO notifications (content, target, user_id) VALUES (?, ?, ?)"
				);

				await createStatement.run(this.content, this.target, this.userId);
				createStatement.finalize();
			} else if(neighbourhood) {
				const createStatement = await db.prepare(
					"INSERT INTO notifications (content, target, neighbourhood) VALUES (?, ?, ?)"
				);

				await createStatement.run(this.content, this.target, neighbourhood);
				createStatement.finalize();
			} else {
				const createStatement = await db.prepare(
					"INSERT INTO notifications (content, target) VALUES (?, ?)"
				);

				await createStatement.run(this.content, this.target);
				createStatement.finalize();
			}
		} catch(e) {
			console.error(e);
		} finally {
			if(db) await db.close();
		}

		// 2. Push notifications	
	}
}