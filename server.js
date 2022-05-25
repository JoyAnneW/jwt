require("dotenv").config();

const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
// allows application to accept json from the body of a req
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

// create new post. this req also hashes the password
app.post("/posts", async (req, res) => {
	// need to create post,  hash password sent, and saving inside of posts variable
	const { username, password, title } = req.body;
	// can't simply get and post the values from req.body because that would expose the passwords

	try {
		// pass it the number of hash rounds. the longer it takes to create the hash, the more secure. the higher the number passed, the longer it will take. default is 10
		// const salt = await bcrypt.genSalt(10);
		// can do the salt generation and password hashing in one step. instead of passin the salt variable created, pass the rounds.
		const hashedPassword = await bcrypt.hash(password, 10);

		// salt will always be different so hashedpassword will always be different
		console.log({ hashedPassword });

		const post = { username, password: hashedPassword, title };
		posts.push(post);

		// send back all posts
		res.status(201).send(posts);
	} catch (error) {
		res.status(500).send({ Error: error });
	}
});

// to authenticate route so not everyone can get the posts
app.post("/login", async (req, res) => {
	const { username, password } = req.body;
	// first Authenticate User
	const user = posts.find((user) => user.username === username);
	console.log(user);
	if (user == null) {
		return res.status(404).send("cannot find user");
	}

	// comparison for password
	try {
		// this will compare the original password from req.body with the hashed version. it will get the salt out of hashed pass. the comparison will return true or false so it can be used in an if condition
		if (await bcrypt.compare(password, user.password)) {
			// res.send("success"); can't send 2 responses
			// once user is authenticated, serialize user with jwt
			// to create a jwt, pass .sign the obj (payload) you want to serialize and the special access key
			const accessToken = jwt.sign(user, process.env.ACCESS_TOKEN_SECRET);
			// or: 	res.json({ accessToken });
			// when we make a req to login, this will create an access token and that token will have the user info saved inside of it since we passed it to jwt.sign
			res.json({ accessToken: accessToken });
			// this access token gives the user (details stored within) access to the endpoints
		} else {
			res.send("incorrect credentials");
		}
	} catch (error) {
		res.status(500).send({ Error: "error" });
	}
});

// middleware to authenticate token. only those with the accessToken should be able to access endpoint

function authenticateToken(req, res, nex) {
	// get token, verify it's the correct user, return user for use in .get
}
app.listen(3000);
