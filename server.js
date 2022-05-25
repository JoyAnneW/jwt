const express = require("express");
const app = express();

const posts = [
	{
		username: "Joy",
		title: "Post 1",
	},
	{
		username: "Julian",
		title: "Post 2",
	},
];

// testing the setup by making a call in the .rest file that returns the posts above
app.get("/posts", (req, res) => {
	res.json(posts);
});

// to authenticate route so not everyone can get the posts
app.get("/login", (req, res) => {
	// Authenticate User
});
app.listen(3000);
