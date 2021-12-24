const express = require("express");
const next = require("next");
const { parse } = require("url");

const app = next({});
const handle = app.getRequestHandler();

app.prepare().then(() => {
	const server = express();
	server.get("/uploads/:file", (req, res) => {
		res.sendFile(`${__dirname}/public/uploads/${req.params.file}`);
	});
	
	server.all("*", (req, res) => {
		const parsed = parse(req.url, true);
		return handle(req, res, parsed);
	});

	server.listen(8080, () => {
		console.log(`Server started on port 8080`);
	});
});