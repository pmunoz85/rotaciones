const path = require('path');
const db = require('../db/connection');

const { Router } = require('express');
const { validarJWT } = require('../middlewares/validar_jwt');

module.exports = () => {
  const router = Router();

  router
    .route('/') //
    .get(validarJWT, async (req, res) => {
      const rutaFichero = path.join(__dirname, '../views/home/', 'home.hbs');

      const grupos = await db.sequelize.query(`
          select 
            grupos.id,
            descripcion,
            "textColor",
            color 
          from grupos 
          left join grupo_user on grupo_user.grupo_id = grupos.id 
          where grupo_user.user_id = ${req.usuario.id}
        `,
      { 
        type: db.sequelize.QueryTypes.SELECT, 
      });

      const registros = await db.sequelize.query(`
      select 
        to_char(eventos.created_at, 'YYYY-MM-DD') as start, 
        users.email as title, 
        grupos.color as color, 
        "textColor"
      from eventos 
      left join users on users.id = eventos.user_id 
      left join grupos on grupos.id = eventos.grupo_id 
      where eventos.grupo_id in (select grupo_id from grupo_user where user_id = ${req.usuario.id})
    `,
      { 
        type: db.sequelize.QueryTypes.SELECT, 
      }
      );
    
      /*
        console.log("=================");
        console.log(registros);
        console.log("=================");

        [
          {
            title: 'pagador 1',
            start: '2021-09-17',
            color: 'black',
          },
          {
            title: 'pagador 2',
            start: '2021-09-18',
            color: 'yellow',
            textColor: 'black'
          },
          {
            title: 'pagador 3',
            start: '2021-09-19',
            color: 'blue',
          },
        ]
      */


      res.status(200).render(rutaFichero, {
        alerta: globalThis.alertaGlobal,
        colorAlerta: globalThis.colorAlerta, 
        home_active: 'active',
        id_usuario: req.usuario.id,
        email_usuario: req.usuario.email,
        eventos: registros,
        grupos,
      });
      globalThis.alertaGlobal = '';
    });

  return router;
};
