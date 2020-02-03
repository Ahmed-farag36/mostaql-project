const router = require("express").Router();
const passport = require("passport");
const jwt = require("jsonwebtoken");

const usersController = require("../controllers/users");

// RENDER REGISTER PAGE
router.get("/register", (req, res) => {
	res.render("register", { error: "" });
});

// REGISTER USER
router.post("/register", async (req, res) => {
	const { username, password, confirmPassword, role } = req.body;
	// VALIDTAE USER CREDENTIALS
	if (!username || !password || password !== confirmPassword) {
		return res.status(400).render("register", { error: "Validation error" });
	}
	// SAVE USER TO DB
	await usersController.saveUser(username, password, role);
	// REDIRECT LOGIN
	res.redirect(`/users/login?message=Register successfully`);
});

// RENDER LOGIN PAGE
router.get("/login", (req, res) => {
	res.render("login", { error: "" });
});

// LOGIN USER
router.post("/login", (req, res) => {
	passport.authenticate("local", { session: false }, (err, user, info) => {
		console.log(err, user, info);
		if (err || !user) {
			return res.status(400).render("login", { error: "Login failed" });
		}

		req.login(user, { session: false }, err => {
			if (err) {
				return res.status(400).render("login", { error: "Login failed" });
			}
			const token = jwt.sign(
				{
					id: user.id,
					username: user.username,
					role: user.role,
					verified: user.verified,
					createdAt: user.createdAt,
					updatedAt: user.updatedAt
				},
				process.env.JWT_SECRET
			);

			return res.cookie("JWT", token).redirect(`/app`);
		});
	})(req, res);
});

// LOGOUT
router.get("/logout", (req, res) => {
	req.logout();
	res.clearCookie("JWT").redirect("/users/login");
});

// GET USER DATA
router.get(
	"/",
	passport.authenticate("jwt", { session: false }),
	async (req, res) => {
		const user = await usersController.findUser(req.user.username);
		res.json(user);
	}
);

module.exports = router;
