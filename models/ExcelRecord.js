module.exports = (sequelize, Sequelize) => {
	return sequelize.define("excelRecord", {
		id: {
			type: Sequelize.UUID,
			primaryKey: true
		},
		title: Sequelize.STRING,
		salesAmount: Sequelize.INTEGER,
		percentage: Sequelize.FLOAT,
		quantity: Sequelize.FLOAT,
		dateFrom: Sequelize.DATE,
		dateTo: Sequelize.DATE
	});
};
