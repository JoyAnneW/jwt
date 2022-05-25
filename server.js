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
// Everytime a request to get the posts comes in, the authentication runs. I can't get all the posts as before. I need to get only the posts of the authenticated user
// need to pass authorization header
app.get("/posts", authenticateToken, (req, res) => {
	const authUserPosts = posts.filter(
		(post) => post.username === req.user.username
	);

	res.json(authUserPosts);
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

// to authenticate route so not everyone can get the posts.
app.post("/login", async (req, res) => {
	const { username, password } = req.body;
	// first Authenticate User
	console.log(req.body);
	const user = posts.find((user) => user.username === username);
	console.log({ user });
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
			console.log({ accessToken });
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

//* middleware to authenticate token. only those with the accessToken should be able to access endpoint

function authenticateToken(req, res, next) {
	// get token, verify it's the correct user, return user for use in .get

	// get the token from the header which as the value  "Bearer TOKEN", where token is the access token generated. to extract just the token without the bearer keyword split the value into an array of [bearer, token] and get the value at [1]
	const authHeader = req.headers.authorization;
	console.log({ authHeader });
	// if there's an authHeader then return the token portion of it, otherwise return undefined
	const token = authHeader && authHeader.split(" ")[1];
	// == null/undefined. if no token, return 401 (unauthorized).
	console.log({ token });
	if (token == null) return res.sendStatus(401);

	// verify token. pass the token, the secret key and the serialized user
	jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
		// if there's an error, send 403, which means you have a token, but it's not valid, so no access
		if (err) return res.sendStatus(403);
		// if past this check, then we have a valid user. Set req.user to that now authenticated user. now I can use req.user in the get req to get the details of this user
		req.user = user;
		console.log(req.user);

		next();
	});
}
app.listen(3000);
