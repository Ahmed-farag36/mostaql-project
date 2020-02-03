module.exports = (sequelize, Sequelize) => {
	return sequelize.define("ingredient", {
		id: {
			type: Sequelize.UUID,
			primaryKey: true
		},
		titleInEnglish: Sequelize.STRING,
		titleInArabic: Sequelize.STRING,
		unit: Sequelize.STRING,
		quantity: Sequelize.FLOAT
	});
};
