const Sequelize = require("sequelize");

// DB connection settings /* CHANGE TO REAL DB */
const sequelize = new Sequelize("mostaql", "ahmedfarag", "123456789", {
	host: "db4free.net",
	dialect: "mysql",
	define: {
		charset: "utf8",
		collate: "utf8_general_ci"
	}
});

// const sequelize = new Sequelize("OMG", "root", "", {
// 	host: "localhost",
// 	dialect: "mysql",
// 	define: {
// 		charset: "utf8",
// 		collate: "utf8_general_ci"
// 	}
// });

// sequelize.drop().then(() => console.log(`\nDB dropped successfully\n`));

const Meal = require("./Meal")(sequelize, Sequelize);
const Ingredient = require("./Ingredient")(sequelize, Sequelize);
const ExcelSheet = require("./ExcelSheet")(sequelize, Sequelize);
const ExcelRecord = require("./ExcelRecord")(sequelize, Sequelize);
const User = require("./User")(sequelize, Sequelize);

sequelize
	.sync()
	.then(() => console.log("DB Synced"))
	.catch(err => console.log(err));

(async () => {
	try {
		await sequelize.authenticate();
		console.log("DB connection has been established successfully.");
	} catch (error) {
		console.error(`\n\nUnable to connect to the database: ${error}\n\n`);
	}
})();

// Associations
Meal.belongsToMany(Ingredient, {
	through: "mealIngredient"
});

Ingredient.belongsToMany(Meal, {
	through: "mealIngredient"
});

ExcelSheet.hasMany(ExcelRecord);
ExcelRecord.belongsTo(ExcelSheet);

module.exports = {
	sequelize,
	Sequelize,
	Meal,
	Ingredient,
	ExcelSheet,
	ExcelRecord,
	User
};
