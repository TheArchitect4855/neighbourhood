import { postNotification } from "./backend";

export const NotificationTarget = {
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
		postNotification(this, neighbourhood);

		// TODO: Push notifications
	}
}