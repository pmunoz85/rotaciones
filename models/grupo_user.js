module.exports = (sequelize, Sequelize) => {
  const GrupoUser = sequelize.define(
    'grupo_user',
    {
      id: {
        autoIncrement: true,
        type: Sequelize.DataTypes.INTEGER,
        required: true,
        primaryKey: true,
      },
      grupo_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'grupos',
          key: 'id',
        }
      },
      user_id: {
        type: Sequelize.DataTypes.INTEGER,
        allowNull: false,
        references: {
          model: 'users',
          key: 'id',
        },
      },
      propietario: {
        type: Sequelize.DataTypes.INTEGER,
        required: true,
        default: 0,
      },
    }, { 
      underscored: true, 
      tableName: 'grupo_user', 
/*
      classMethods: {
        associate: (models) => {
          GrupoUser.belongsTo(models.Grupos, {
            as: 'grupos',
            foreignKey: 'grupo_id',
          });
      
          GrupoUser.belongsTo(models.Users, {
            as: 'users',
            foreignKey: 'user_id',
          });
        }
      },
*/
    }
  );

  /*
  GrupoUser.associate = (models) => {

    GrupoUser.belongsTo(models.Grupos, {
      as: 'grupos',
      foreignKey: 'grupo_id',
    });

    GrupoUser.belongsTo(models.Users, {
      as: 'users',
      foreignKey: 'user_id',
    });
  }
*/


  return GrupoUser;
};
