module.exports = (sequelize, Sequelize) => {
  const Grupos = sequelize.define(
    'grupos',
    {
      id: {
        autoIncrement: true,
        type: Sequelize.DataTypes.INTEGER,
        required: true,
        primaryKey: true,
      },
      descripcion: {
        type: Sequelize.DataTypes.TEXT,
        required: true,
      },
      color: {
        type: Sequelize.DataTypes.TEXT,
        required: true,
      },
      textColor: {
        type: Sequelize.DataTypes.TEXT,
        required: true,
        field: "textColor",
      },
    }, { 
      underscored: true, 
      tableName: 'grupos', 
    }
  );

  return Grupos;
};
