const express = require("express");
const app = express();
const bcrypt = require("bcrypt");

// allows application to accept json
app.use(express.json());

// would usually be in a db
const posts = [
	{
		username: "Joy",
		password: "",
		title: "Post 1",
	},
	{
		username: "Julian",
		password: "",
		title: "Post 2",
	},
];

// testing the setup by making a call in the .rest file that returns the posts above
app.get("/posts", (req, res) => {
	res.json(posts);
});

// create new post
app.post("/posts", async (req, res) => {
	// need to create post,  hash password sent, and saving inside of posts variable
	const { username, password, title } = req.body;
	// can't simply get and post the values from req.body because that would expose the passwords

	try {
		// pass it the number of hash rounds. the longer it takes to create the hash, the more secure. the higher the number passed, the longer it will take. default is 10
		const salt = await bcrypt.genSalt(10);
		const hashedPassword = await bcrypt.hash(password, salt);

		// salt will always be different so hashedpassword will always be different
		console.log({ salt }, { hashedPassword });

		const post = { username, password: hashedPassword, title };
		posts.push(post);

		// send back all posts
		res.status(201).send(posts);
	} catch (error) {
		res.status(500).send({ Error: "error" });
	}
});

// to authenticate route so not everyone can get the posts
app.get("/login", (req, res) => {
	// Authenticate User
});

app.listen(3000);
