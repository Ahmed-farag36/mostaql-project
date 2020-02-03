const router = require("express").Router();
const passport = require("passport");

const ingredientsController = require("../controllers/ingredients");

// AUTHORIZATION
const handleNotClientAuth = (req, res, next) => {
	if (req.user.role !== "Client") {
		next();
	} else {
		res.status(403).json({ error: "You are not allowed to access this data!" });
	}
};

const handleNotManagerAuth = (req, res, next) => {
	if (req.user.role !== "Manager") {
		next();
	} else {
		res.status(403).json({ error: "You are not allowed to access this data!" });
	}
};

// AUTHENTICATION
router.use(passport.authenticate("jwt", { session: false }));

// GET ALL INGREDIENTS
router.get("/", async (req, res) => {
	const ingredients = await ingredientsController.getAllIngredients();
	res.json(ingredients);
});

// ADD INGREDIENT
router.post("/", handleNotManagerAuth, async (req, res, next) => {
	const ingredients = await ingredientsController.addIngredient(
		req.body.titleInEnglish,
		req.body.titleInArabic,
		req.body.unit,
		req.body.quantity
	);
	res.status(201).json(ingredients);
});

// UPADTE INGREDIENT
router.put("/:ingredientId", handleNotManagerAuth, async (req, res, next) => {
	const ingredient = await ingredientsController.editIngredient(
		req.params.ingredientId,
		req.body.titleInEnglish,
		req.body.titleInArabic,
		req.body.unit,
		req.body.quantity
	);
	if (!ingredient) res.status(400).end();
	res.status(200).end();
});

// DELETE INGREDIENT
router.delete(
	"/:ingredientId",
	handleNotManagerAuth,
	async (req, res, next) => {
		const ingredient = await ingredientsController.deleteIngredient(
			req.params.ingredientId
		);
		if (!ingredient) {
			res.status(400).end();
		}
		res.status(204).end();
	}
);

module.exports = router;
