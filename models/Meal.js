module.exports = (sequelize, Sequelize) => {
	return sequelize.define("meal", {
		id: {
			type: Sequelize.UUID,
			primaryKey: true
		},
		titleInEnglish: Sequelize.STRING,
		titleInArabic: Sequelize.STRING,
		category: Sequelize.STRING
	});
};
