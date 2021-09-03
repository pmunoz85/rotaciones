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
    }, { 
      underscored: true, 
      tableName: 'grupos', 
      /*
      classMethods: {
        associate: (models) => {
          Grupos.belongsToMany(models.Users, {
            through: 'grupo_user',
            as: 'usuarios',
            foreignKey: 'grupo_id',
          });
        }
      },
      */
    }
  );
  /*
  Grupos.associate = (models) => {
    Grupos.belongsToMany(models.Users, {
      through: 'grupo_user',
      as: 'usuarios',
      foreignKey: 'grupo_id',
    });
  };
*/

  return Grupos;
};
