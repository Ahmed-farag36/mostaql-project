const uuid = require("uuid/v4");
const db = require("../models");

const getAllMeals = () => {
	return db.Meal.findAll();
};

const getOneMeal = mealId => {
	return db.Meal.findByPk(mealId);
};

const getIngredientsForOneMeal = mealId => {
	return db.Meal.findOne({
		where: { id: mealId },
		include: db.Ingredient
	});
};

const getAllMealsByCategoryIncludedIngrediants = category => {
	return db.Meal.findAll({
		where: { category },
		include: db.Ingredient
	});
};

const addMeal = (titleInEnglish, titleInArabic, category) => {
	return db.Meal.create({
		id: uuid(),
		titleInEnglish: titleInEnglish,
		titleInArabic: titleInArabic,
		category: category
	});
};

const editMeal = async (mealId, titleInEnglish, titleInArabic, category) => {
	const res = await db.Meal.update(
		{
			titleInEnglish: titleInEnglish,
			titleInArabic: titleInArabic,
			category: category
		},
		{ where: { id: mealId } }
	);
	return res[0];
};

const deleteMeal = async mealId => {
	const res = await db.Meal.destroy({ where: { id: mealId } });
	return res;
};

const addIngredientToMeal = async (mealId, ingredientId) => {
	const meal = await db.Meal.findByPk(mealId);
	const ingredient = await db.Ingredient.findByPk(ingredientId);
	const res = await meal.addIngredient(ingredient);
	return !!res;
};

const removeIngredientFromMeal = async (mealId, ingredientId) => {
	const meal = await db.Meal.findByPk(mealId);
	const ingredient = await db.Ingredient.findByPk(ingredientId);
	const res = await meal.removeIngredient(ingredient);
	return !!res;
};

module.exports = {
	getAllMeals,
	getOneMeal,
	getIngredientsForOneMeal,
	getAllMealsByCategoryIncludedIngrediants,
	addMeal,
	editMeal,
	deleteMeal,
	addIngredientToMeal,
	removeIngredientFromMeal
};
