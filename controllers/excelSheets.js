const path = require("path");
const uuid = require("uuid");
const readExcelFile = require("read-excel-file/node");
const flat = require("array.prototype.flat");
const { Op } = require("sequelize");
const convert = require("convert-units");

const db = require("../models/index");

const getAllExcelSheets = () => {
	return db.ExcelSheet.findAll();
};

const getAllRecordsForOneSheet = excelSheetId => {
	return db.ExcelRecord.findAll({ where: { excelSheetId } }); //may be limited
};

const getExcelRecordForOneMeal = (sheetId, mealTitle) => {
	return db.ExcelRecord.findOne({
		where: { title: mealTitle, excelSheetId: sheetId }
	});
};

// const getOneMealBytitleAndCategory = async (mealTitle, category) => {
// 	return db.Meal.findOne({
// 		where: { titleInEnglish: mealTitle, category },
// 		include: db.Ingredient
// 	});
// };

const getAllRecordsForOneMealWithinPeriod = (mealTitle, from, to) => {
	return db.ExcelRecord.findAll({
		where: {
			title: mealTitle,
			dateFrom: { [Op.gte]: new Date(from) },
			dateTo: { [Op.lte]: new Date(to) }
		}
	});
};

const getAllRecordsWithinPeriod = (from, to) => {
	return db.ExcelRecord.findAll({
		where: {
			dateFrom: { [Op.gte]: new Date(from) },
			dateTo: { [Op.lte]: new Date(to) }
		}
	});
};

const uploadExcelFile = async (file, username) => {
	console.log(username);
	try {
		file.mv(path.join(__dirname, "../excel-sheets", file.name), err => {
			if (err) {
				throw new Error();
			}
		});
		const row = await readExcelFile(
			path.join(__dirname, `../excel-sheets/${file.name}`)
		);
		const excelSheet = await db.ExcelSheet.create({
			id: uuid(),
			filename: file.name,
			dateFrom: row[4][0].slice(5, 15),
			dateTo: row[4][0].slice(19),
			uploadedBy: username
		});
		for (let i = 7; i < row.length; i++) {
			if (row[i][1] === null) break;
			await db.ExcelRecord.create({
				id: uuid(),
				title: row[i][1],
				salesAmount: row[i][2],
				percentage: row[i][3],
				quantity: row[i][4],
				dateFrom: row[4][0].slice(5, 15),
				dateTo: row[4][0].slice(19),
				excelSheetId: excelSheet.dataValues.id
			});
		}
		return excelSheet;
	} catch (error) {
		return false;
	}
};

const deleteExcelFile = excelSheetId => {
	return db.ExcelSheet.destroy({ where: { id: excelSheetId } });
};

const consumptionForOneMeal = async (mealId, from, to) => {
	try {
		// meal with ingrediants
		const meal = await db.Meal.findByPk(mealId, { include: db.Ingredient });
		// record for meal
		const records = await getAllRecordsForOneMealWithinPeriod(
			meal.titleInEnglish,
			from,
			to
		);
		// loop records
		const allIngredients = records.map(record => {
			// loop ingredients
			return meal.ingredients.map(ingredient => {
				// ingredient Qty * sales Qty
				return {
					id: ingredient.id,
					titleInEnglish: ingredient.titleInEnglish,
					titleInArabic: ingredient.titleInArabic,
					quantity: ingredient.quantity,
					unit: ingredient.unit,
					sold: record.quantity,
					totalQuantity: ingredient.quantity * record.quantity
				};
			});
		});
		const finalResult = flat(allIngredients).reduce((ingredientsMap, val) => {
			if (ingredientsMap.has(val.titleInEnglish)) {
				const prevTotalQty = ingredientsMap.get(val.titleInEnglish)
					.totalQuantity;
				const prevTotalSold = ingredientsMap.get(val.titleInEnglish).sold;
				console.log(ingredientsMap.get(val.titleInEnglish));
				return ingredientsMap.set(val.titleInEnglish, {
					...val,
					totalQuantity: val.totalQuantity + prevTotalQty,
					sold: val.sold + prevTotalSold
				});
			}
			return ingredientsMap.set(val.titleInEnglish, val);
		}, new Map());
		return [...finalResult].map(ingArr => ingArr[1]);
	} catch (error) {
		return [];
	}
};

const consumptionForOneCategory = async (category, from, to) => {
	// all records one sheet
	const records = await getAllRecordsWithinPeriod(from, to);
	const meals = await db.Meal.findAll({
		where: {
			category
		},
		include: db.Ingredient
	});
	// loop records
	// return await Promise.all(
	const allIngredients = records.map(record => {
		const meal = meals.find(meal => meal.titleInEnglish === record.title);
		if (!meal) return null;
		// loop ingredients
		return meal.ingredients.map(ingredient => {
			// ingredient qty * record sold qty
			return {
				id: ingredient.id,
				titleInEnglish: ingredient.titleInEnglish,
				titleInArabic: ingredient.titleInArabic,
				totalQuantity: ingredient.quantity * record.quantity,
				unit: ingredient.unit
			};
		});
	});
	// sum same ingredients total Qty
	const finalResult = flat(
		allIngredients.filter(ingredient => ingredient)
	).reduce((ingredientsMap, val) => {
		if (ingredientsMap.has(val.titleInEnglish)) {
			const prevTotalQty = ingredientsMap.get(val.titleInEnglish).totalQuantity;
			return ingredientsMap.set(val.titleInEnglish, {
				...val,
				totalQuantity: prevTotalQty + val.totalQuantity
			});
		}
		return ingredientsMap.set(val.titleInEnglish, val);
	}, new Map());
	return [...finalResult].map(ingArr => ingArr[1]);
};

const totalConsumption = async (from, to) => {
	// all meals
	const meals = await db.Meal.findAll({ include: db.Ingredient });
	// sheet records
	const records = await getAllRecordsWithinPeriod(from, to);
	// loop records
	const allIngredients = records
		.map(record => {
			// find meal by title
			const meal = meals.find(meal => meal.titleInEnglish === record.title);
			if (!meal) return null;
			// loop meal ingredients
			return meal.ingredients.map(ingredient => {
				// ingredient Qty * record sale Qty
				return {
					id: ingredient.id,
					titleInEnglish: ingredient.titleInEnglish,
					titleInArabic: ingredient.titleInArabic,
					totalQuantity: ingredient.quantity * record.quantity,
					unit: ingredient.unit,
					sold: record.quantity
				};
			});
		})
		.filter(ingredient => ingredient);
	const finalResult = flat(allIngredients).reduce((ingredientsMap, val) => {
		if (ingredientsMap.has(val.titleInEnglish)) {
			const prevTotalQty = ingredientsMap.get(val.titleInEnglish).totalQuantity;
			const prevTotalSold = ingredientsMap.get(val.titleInEnglish).sold;
			return ingredientsMap.set(val.titleInEnglish, {
				id: val.id,
				titleInEnglish: val.titleInEnglish,
				titleInArabic: val.titleInArabic,
				totalQuantity: val.totalQuantity + prevTotalQty,
				unit: val.unit,
				sold: val.sold + prevTotalSold
			});
		}
		return ingredientsMap.set(val.titleInEnglish, val);
	}, new Map());
	return [...finalResult].map(ingArr => ingArr[1]);
};

module.exports = {
	getAllExcelSheets,
	getAllRecordsForOneSheet,
	getExcelRecordForOneMeal,
	// getOneMealBytitleAndCategory,
	getAllRecordsForOneMealWithinPeriod,
	getAllRecordsWithinPeriod,
	uploadExcelFile,
	deleteExcelFile,
	consumptionForOneMeal,
	consumptionForOneCategory,
	totalConsumption
};
