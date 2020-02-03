const uuid = require("uuid/v4");
const db = require("../models");

const getAllIngredients = () => {
	return db.Ingredient.findAll();
};

const addIngredient = async (titleInEnglish, titleInArabic, unit, quantity) => {
	return await db.Ingredient.create({
		id: uuid(),
		titleInEnglish: titleInEnglish,
		titleInArabic: titleInArabic,
		unit: unit,
		quantity: quantity
	});
};

const editIngredient = async (
	ingredientId,
	titleInEnglish,
	titleInArabic,
	unit,
	quantity
) => {
	const res = await db.Ingredient.update(
		{
			titleInEnglish: titleInEnglish,
			titleInArabic: titleInArabic,
			unit: unit,
			quantity: quantity
		},
		{ where: { id: ingredientId } }
	);
	return res[0];
};

const deleteIngredient = async ingredientId => {
	const res = await db.Ingredient.destroy({ where: { id: ingredientId } });
	return res;
};

module.exports = {
	getAllIngredients,
	addIngredient,
	editIngredient,
	deleteIngredient
};
