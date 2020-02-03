const router = require("express").Router();
const passport = require("passport");

const mealsController = require("../controllers/meals");

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

// GET ALL MEALS
router.get("/", async (req, res, next) => {
	const meals = await mealsController.getAllMeals();
	res.json(meals);
});

// GET ONE MEAL BY ID
router.get("/:mealId", async (req, res, next) => {
	const meal = await mealsController.getOneMeal(req.params.mealId);
	res.json(meal);
});

// GET ONE MEAL BY ID W INGREDIENTS
router.get("/:mealId/ingredients", async (req, res) => {
	const meals = await mealsController.getIngredientsForOneMeal(
		req.params.mealId
	);
	res.json(meals);
});

// GET ALL MEALS BY CATEGORY W INGREDIENTS
router.get("/category/:category", async (req, res) => {
	const meals = await mealsController.getAllMealsByCategoryIncludedIngrediants(
		req.params.category
	);
	res.json(meals);
});

// ADD MEAL
router.post("/", handleNotManagerAuth, async (req, res, next) => {
	const meal = await mealsController.addMeal(
		req.body.titleInEnglish,
		req.body.titleInArabic,
		req.body.category
	);
	res.status(201).json(meal);
});

// EDIT MEAL
router.put("/:mealId", handleNotManagerAuth, async (req, res, next) => {
	const ingredient = await mealsController.editMeal(
		req.params.mealId,
		req.body.titleInEnglish,
		req.body.titleInArabic,
		req.body.category
	);
	if (!ingredient) res.status(400).end();
	res.status(200).end();
});

// DELETE MEAL
router.delete("/:mealId", handleNotManagerAuth, async (req, res, next) => {
	await mealsController.deleteMeal(req.params.mealId);
	res.send(204).end();
});

// ADD INGREDIENT TO MEAL
router.put(
	"/:mealId/ingredients/:ingredientId",
	handleNotManagerAuth,
	async (req, res, next) => {
		if (req.user.role === "Manager") next(new Error());
		const meal = await mealsController.addIngredientToMeal(
			req.params.mealId,
			req.params.ingredientId
		);
		if (!meal) {
			res.status(400).end();
		}
		res.status(200).end();
	}
);

// REMOVE INGREDIENT FROM MEAL
router.delete(
	"/:mealId/ingredients/:ingredientId",
	handleNotManagerAuth,
	async (req, res, next) => {
		const meal = await mealsController.removeIngredientFromMeal(
			req.params.mealId,
			req.params.ingredientId
		);
		if (!meal) {
			res.status(400).end();
		}
		res.status(200).end();
	}
);

module.exports = router;
