const router = require("express").Router();
const passport = require("passport");

const excelSheetsController = require("../controllers/excelSheets");

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
router.use(
	passport.authenticate("jwt", { session: false }),
	handleNotClientAuth
);

// GET ALL EXCEL SHEETS
router.get("/", async (req, res) => {
	console.log(req.user);
	const excelSheets = await excelSheetsController.getAllExcelSheets();
	res.json(excelSheets);
});

// GET ALL SHEET'S EXCEL RECORDS
router.get("/:sheetId/excelRecords", async (req, res) => {
	const response = await excelSheetsController.getAllRecordsForOneSheet(
		req.params.sheetId
	);
	res.json(response);
});

// GET MEAL RECORD FROM RECORD BY TITLE
router.get("/:sheetId/meals/:mealTitle", async (req, res) => {
	const excelRecord = await excelSheetsController.getExcelRecordForOneMeal(
		req.params.sheetId,
		req.params.mealTitle
	);
	res.json(excelRecord);
});

// GET MEAL RECORD FROM RECORD BY TITLE and CATEGORY
// router.get(":sheetId/meals/:mealTitle/category:category", async (req, res) => {
// 	const response = await excelSheetsController.getOneMealBytitleAndCategory(
// 		req.params.mealTitle,
// 		req.params.category
// 	);
// 	res.json(response);
// });

// UPLOAD EXCEL SHEET
router.post("/", async (req, res) => {
	const response = await excelSheetsController.uploadExcelFile(
		req.files.file,
		req.user.username
	);
	if (!response) {
		res.status(400).end();
	}
	res.status(200).json(response);
	res.end();
});

// DELETE EXCEL SHEET
router.delete("/:excelSheetId", async (req, res) => {
	const response = await excelSheetsController.deleteExcelFile(
		req.params.excelSheetId
	);
	if (!response) {
		res.status(400).end();
	}
	res.status(204).end();
});

// CONSUMPTION FOR ONE MEAL WITIN PERIOD
router.get("/consumption/meal/:mealId", async (req, res) => {
	const response = await excelSheetsController.consumptionForOneMeal(
		req.params.mealId,
		req.query.from,
		req.query.to
	);
	res.json(response);
});

// CONSUMPTION FOR ONE CATEGORY WITIN PERIOD
router.get("/consumption/category/:categoryTitle", async (req, res) => {
	const response = await excelSheetsController.consumptionForOneCategory(
		req.params.categoryTitle,
		req.query.from,
		req.query.to
	);
	res.json(response);
});

// TOTAL CONSUMPTION WITIN PERIOD
router.get("/consumption", async (req, res) => {
	const response = await excelSheetsController.totalConsumption(
		req.query.from,
		req.query.to
	);
	res.json(response);
});

module.exports = router;
