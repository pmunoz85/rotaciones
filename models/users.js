module.exports = (sequelize, Sequelize) => {
  const Users = sequelize.define(
    'users',
    {
      id: {
        autoIncrement: true,
        type: Sequelize.DataTypes.INTEGER,
        required: true,
        primaryKey: true,
      },
      email: {
        type: Sequelize.STRING,
        required: true,
      },
      encrypted_password: Sequelize.STRING,
    }, { 
      underscored: true, 
      tableName: 'users', 
      /*
      classMethods: {
        associate: (models) => {

          Users.belongsToMany(models.Grupos, {
            through: 'grupo_user',
            as: 'grupos',
            foreignKey: 'user_id',
          });
        }
      },
      */      
    }
  );
  /*
  Users.associate = (models) => {

    Users.belongsToMany(models.Grupos, {
      through: 'grupo_user',
      as: 'grupos',
      foreignKey: 'user_id',
    });
  };
*/
  

  // createdAt: Sequelize.DATE,
  // updatedAt: Sequelize.DATE,

  return Users;
};
