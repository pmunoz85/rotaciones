module.exports = (sequelize, Sequelize) => {
  const Eventos = sequelize.define(
    'eventos',
    {
      id: {
        autoIncrement: true,
        type: Sequelize.DataTypes.INTEGER,
        required: true,
        primaryKey: true,
      },
      grupo_id: Sequelize.DataTypes.INTEGER,
      user_id: Sequelize.DataTypes.INTEGER,
    }, { 
      underscored: true, 
      tableName: 'eventos' 
    }
  );

  return Eventos;
};
