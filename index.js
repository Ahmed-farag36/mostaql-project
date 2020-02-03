const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const fileUpload = require("express-fileupload");
const path = require("path");
const passport = require("passport");
const cookieParser = require("cookie-parser");
require("dotenv").config({ path: "../.env" });

const userRoutes = require("./routes/users");
const mealsRoutes = require("./routes/meals");
const ingredientsRoutes = require("./routes/ingredients");
const excelSheetsRoutes = require("./routes/excelSheets");

const { getAllRecordsWithinPeriod } = require("./controllers/excelSheets");

const app = express();

app.use(cors({ origin: "http://localhost:4001", credentials: true }));
// app.use(cors());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());
app.use(cookieParser());
app.use(fileUpload());
app.use(
	"/app",
	passport.authenticate("jwt", {
		session: false,
		failureRedirect: "/users/login"
	}),
	express.static(path.join(__dirname, "build"))
);

app.set("view engine", "ejs");

app.use("/users", userRoutes);
app.use("/meals", mealsRoutes);
app.use("/ingredients", ingredientsRoutes);
app.use("/excelsheets", excelSheetsRoutes);

app.get("*", (req, res) => {
	res.redirect("/app");
});

app.listen(process.env.PORT || 4000, () => console.log(`Server has started`));
