module.exports = (sequelize, Sequelize) => {
	return sequelize.define("excelSheet", {
		id: {
			type: Sequelize.UUID,
			primaryKey: true
		},
		filename: Sequelize.STRING,
		dateFrom: Sequelize.STRING,
		dateTo: Sequelize.STRING,
		uploadedBy: Sequelize.STRING
	});
};
