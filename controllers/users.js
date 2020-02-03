const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const JWTStrategy = require("passport-jwt").Strategy;
const bcrypt = require("bcrypt");
const uuid = require("uuid/v4");

const { User } = require("../models");

const cookieExtractor = req => {
	let token = null;
	if (req && req.cookies) {
		token = req.cookies["JWT"];
	}
	return token;
};

// LOCAL STRATEGY
// ==============
passport.use(
	new LocalStrategy(
		{
			usernameField: "username",
			passwordField: "password"
		},
		async function(username, password, done) {
			try {
				const user = await User.findOne({ where: { username } });
				if (!user) {
					return done(null, false, { message: "User not found" });
				}
				const hashPassword = await bcrypt.compare(password, user.password);
				if (!hashPassword) {
					return done(null, false, { message: "Incorrect password" });
				}
				return done(null, user, {
					message: "Logged In Successfully"
				});
			} catch (error) {
				done(error, false);
			}
		}
	)
);

// JWT STRATEGY
// ============
passport.use(
	new JWTStrategy(
		{
			jwtFromRequest: cookieExtractor,
			secretOrKey: process.env.JWT_SECRET
		},
		(JWTPayload, done) => {
			return done(null, JWTPayload);
		}
	)
);

const saveUser = async (username, password, role) => {
	try {
		await User.create({
			id: uuid(),
			username,
			password: bcrypt.hashSync(password, bcrypt.genSaltSync()),
			role
		});
	} catch (error) {
		console.log(error);
	}
};

const findUser = async username => {
	const user = await User.findOne({
		where: { username },
		attributes: ["id", "username", "role", "verified", "createdAt", "updatedAt"]
	});
	return user;
};

module.exports = {
	saveUser,
	findUser
};
