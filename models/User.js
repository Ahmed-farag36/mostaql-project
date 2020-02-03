module.exports = (sequelize, Sequelize) => {
	return sequelize.define("user", {
		id: {
			type: Sequelize.UUID,
			primaryKey: true
		},
		username: Sequelize.STRING,
		password: Sequelize.STRING,
		role: {
			type: Sequelize.STRING,
			default: "Client"
		},
		verified: {
			type: Sequelize.BOOLEAN,
			default: false
		}
	});
};
