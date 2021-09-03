/* eslint-disable no-await-in-loop */
/* eslint-disable radix */
/* eslint-disable no-restricted-syntax */
const path = require('path');
const db = require('../db/connection');

const directorioVista = '../views/grupos/';
const arrayPaginador = require('../helpers/paginador');

const campos = ['id', 'descripcion', 'createdAt', 'updatedAt'];

// ########################################################
// Funciones 
const emailCrearUsuario = (creador, destinatario, grupo) => {
  const email = require('../helpers/email.js');
  email.enviarEmail(destinatario,
    ` 
      Buenos días,

      su dirección de correo electrónico, ${destinatario}, ha sido referenciada por un compañero, ${creador}, de rotación en un grupo denominado "${grupo}". Si necesita consultar el número de componentes del grupo, la lista de rotaciones del grupo con la fecha del evento y quien la realizo, a quien le toca el siguiente turno, etc. Puede acceder a la aplicación a través de la siguiente dirección web https://rotaciones.herokuapp.com/grupos.

      Como ha sido dado de alta en el servicio a petición de otro usuario, todavía, no tiene una contraseña asignada a su correo electrónico, por lo tanto, la primera vez que acceda al servicio debe usted hacer uso del enlace para recuperar la contraseña. Una vez que ha solicitada la recuperación de la contraseña, el sistema le enviará un enlace a su correo electrónico para crear una nueva contraseña, y así, poder acceder al mismo.

      Esta app es una iniciativa privada desarrollada por Pedro Manuel Muñoz Morales, a petición de los amigos Daniel Nagore y Raúl Iglesias, para la realización y el visado de los turnos del pago de los desayunos entre amigos. Este proyecto Open Source está disponible con licencia Apache en Git Hub, en la siguiente URL https://github.com/pmunoz85/rotaciones. Debemos recordar, que el proyecto todavía está en fase de pruebas, por lo que si encuentra un error o aprecia que necesita una mejora, por favor, indíquelo a través de Git Hub.

      Atentamente,
      Pedro Manuel Muñoz Morales
      Desarrollador y administrador del sistema.
    `,
    'Rotaciones '
  );
};

// ########################################################
// index
const indice = async (req, res) => {
  const rutaFichero = path.join(__dirname, directorioVista, 'index.hbs');
  const pagina = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = 0 + (pagina - 1) * limit;

  const contador = await db.sequelize.query(`
    select count(*)
    from grupos 
    left join grupo_user on grupo_user.grupo_id = grupos.id
    where grupo_user.user_id = ${req.usuario.id}
    `,
  { 
    type: db.sequelize.QueryTypes.SELECT, 
  }
  );

  const registros = await db.sequelize.query(`
    select 
      grupos.id, 
      grupos.descripcion, 
      siguiente(grupos.id) as siguiente_id,
      siguiente_email(grupos.id) as siguiente_email 
    from grupos 
    left join grupo_user on grupo_user.grupo_id = grupos.id
    where grupo_user.user_id = ${req.usuario.id}
    order by descripcion
    limit ${limit}
    offset ${offset}
  `,
  { 
    type: db.sequelize.QueryTypes.SELECT, 
  }
  );

  for (const grupo of registros) {

    await db.sequelize.query(`
      select 
        users.id,
        users.email, 
        case 
        when '${grupo.siguiente_email}' = users.email
        then 1
        else 0
        end
        as siguiente,
        grupo_user.propietario as propietario
      from grupo_user
      left join users on users.id = grupo_user.user_id 
      where grupo_user.grupo_id = ${grupo.id}
      order by users.id  
      `,
    { type: db.sequelize.QueryTypes.SELECT }
    ).then(usuarios => {
      grupo.usuarios = usuarios;
    })

    await db.sequelize.query(`
      select 
        eventos.user_id as pagador_id,
        users.email as pagador_email,
        to_char(eventos.created_at, 'yyyy-mm-dd') as cuando
      from eventos 
      left join users on users.id = eventos.user_id 
      where eventos.grupo_id = ${grupo.id}
      order by eventos.id desc limit 10 
      `,
    { type: db.sequelize.QueryTypes.SELECT }
    ).then(eventos => {
      grupo.eventos = eventos;
    })
  }

  const ultimaPagina = Math.ceil(contador[0].count / limit);
  const botonesPaginas = arrayPaginador(pagina, ultimaPagina);

  res.status(200).render(rutaFichero, {
    registros,
    alerta: globalThis.alertaGlobal,
    colorAlerta:globalThis.colorAlerta,
    grupos_active: 'active',
    id_usuario: req.usuario.id,
    email_usuario: req.usuario.email,
    total_registros: registros.count,
    previous_disabled: pagina === 1 ? 'disabled' : '',
    next_disabled: pagina < ultimaPagina ? '' : 'disabled',
    pagina_anterior: pagina - 1,
    pagina_posterior: pagina < ultimaPagina ? pagina + 1 : pagina,
    botonesPaginas,
    pagina,
  });
  globalThis.alertaGlobal = '';
};

// ########################################################
// next
const siguiente = (req, res) => {
  const { id } = req.params;

  db.sequelize.query(`
    select user_id 
    from grupo_user 
    where grupo_id = ${id} 
    and propietario = 1
    `, { type: db.sequelize.QueryTypes.SELECT }
  ).then((propietarioGrupo) => {
    if (propietarioGrupo.length === 0 || propietarioGrupo[0].user_id !== req.usuario.id) {
      globalThis.alertaGlobal = 'PERMISOS: No es el propietario de este grupo. Por lo tanto, no puede hacer ANOTACIONES en la rotación. Esta tarea es exclusiva del propietario del grupo';
      globalThis.colorAlerta = 'success';
      console.log(globalThis.alertaGlobal);
      res.redirect(`/grupos?tokenparam=${req.query.tokenparam}`);
      return;
    }
  
    db.sequelize.query(`
      insert into eventos (
        grupo_id,
        user_id,
        created_at)
      values (
        ${id},
        siguiente(${id}),
        NOW()
      )
    `,
    { type: db.sequelize.QueryTypes.SELECT }
    ).then(evento => {
      globalThis.alertaGlobal = 'El evento ha sido anotado correctamente.';
      globalThis.colorAlerta = 'success';
      res.redirect(`/grupos?tokenparam=${req.query.tokenparam}`);
    }).catch((error) => {
      globalThis.alertaGlobal = 'ERROR: no fue posible crear el evento correctamente, vuelva a intentarlo';
      globalThis.colorAlerta = 'danger';
      console.log(error);
      res.redirect(`/grupos?tokenparam=${req.query.tokenparam}`);
    });
  });
};

// ########################################################
// payer
const pagador = (req, res) => {
  const { id, userID } = req.params;

  db.sequelize.query(`
    select user_id 
    from grupo_user 
    where grupo_id = ${id} 
    and propietario = 1
    `, { type: db.sequelize.QueryTypes.SELECT }
  ).then((propietarioGrupo) => {
    if (propietarioGrupo.length === 0 || propietarioGrupo[0].user_id !== req.usuario.id) {
      globalThis.alertaGlobal = 'PERMISOS: No es el propietario de este grupo. Por lo tanto, no puede hacer ANOTACIONES en la rotación. Esta tarea es exclusiva del propietario del grupo';
      globalThis.colorAlerta = 'danger';
      console.log(globalThis.alertaGlobal);
      res.redirect(`/grupos?tokenparam=${req.query.tokenparam}`);
      return;
    }
  
    db.sequelize.query(`
      insert into eventos (
        grupo_id,
        user_id,
        created_at)
      values (
        ${id},
        ${userID},
        NOW()
      )
    `,
    { type: db.sequelize.QueryTypes.SELECT }
    ).then(evento => {
      globalThis.alertaGlobal = 'El evento ha sido anotado correctamente.';
      globalThis.colorAlerta = 'success';
      res.redirect(`/grupos?tokenparam=${req.query.tokenparam}`);
    }).catch((error) => {
      globalThis.alertaGlobal = 'ERROR: no fue posible crear el evento correctamente, vuelva a intentarlo';
      globalThis.colorAlerta = 'danger';
      console.log(error);
      res.redirect(`/grupos?tokenparam=${req.query.tokenparam}`);
    });
  });
};

// ########################################################
// new
const nuevo = (req, res) => {
  const rutaFichero = path.join(__dirname, directorioVista, 'new.hbs');
  res
    .status(200)
    .render(rutaFichero, { 
      email_usuario: req.usuario.email, 
      alerta: globalThis.alertaGlobal, 
      colorAlerta: globalThis.colorAlerta,
      grupos_active: 'active' 
    });
  globalThis.alertaGlobal = '';
};

// create
const crear = (req, res) => {
  const { descripcion, integrantes } = req.body;
  const idUsuario = req.usuario.id;

  db.Grupos.create({ descripcion })
    .then( async (grupo) => {

      if (integrantes) {
        await db.GrupoUser.create({ grupo_id: grupo.id, user_id: idUsuario, propietario: 1 });
        if (Array.isArray(integrantes)) {
          for (const emailUsuario of integrantes) {
            let u = await db.Users.findOne({
              where: { email: emailUsuario },
              attributes: ['id', 'email', 'encrypted_password'],
            });

            if (!u) {
              u = await db.Users.create({ email: emailUsuario, encrypted_password: 'NADA' });
              await db.UserRol.create({ rol: 'Usuario', user_id: u.id });
              emailCrearUsuario(req.usuario.email, emailUsuario, descripcion);
            }

            await db.GrupoUser.create({ grupo_id: grupo.id, user_id: u.dataValues.id });
          }
        }
        else {
          let u = await db.Users.findOne({
            where: { email: integrantes },
            attributes: ['id', 'email', 'encrypted_password'],
          });

          if (!u) {
            u = await db.Users.create({ email: integrantes, encrypted_password: 'NADA' });
            await db.UserRol.create({ rol: 'Usuario', user_id: u.id });
            emailCrearUsuario(req.usuario.email, integrantes, descripcion);
          }

          await db.GrupoUser.create({ grupo_id: grupo.id, user_id: u.dataValues.id });
        }

        globalThis.alertaGlobal = 'El grupo y sus integrantes han sido creados correctamente.';
        globalThis.colorAlerta = 'success';
        res.redirect(`/grupos?tokenparam=${req.query.tokenparam}`);
      }
      else {
        db.GrupoUser.create({ grupo_id: grupo.id, user_id: idUsuario, propietario: 1 })
          .then(() => {
            globalThis.alertaGlobal = 'El grupo y sus integrantes han sido creados correctamente.';
            globalThis.colorAlerta = 'success';
            res.redirect(`/grupos?tokenparam=${req.query.tokenparam}`);
          }).catch((error) => {
            globalThis.alertaGlobal = 'ERROR: no fue posible crear el grupo correctamente, vuelva a intentarlo';
            globalThis.colorAlerta = 'danger';
            console.log(error);
            res.redirect(`/grupos/new`);
          });
      }
    }).catch((error) => {
      globalThis.alertaGlobal = 'ERROR: no fue posible crear el grupo correctamente, vuelva a intentarlo';
      globalThis.colorAlerta = 'danger';
      console.log(error);
      res.redirect(`/grupos/new`);
    });
};

// ########################################################
// show
const mostrar = (req, res) => {
  const rutaFichero = path.join(__dirname, directorioVista, 'show.hbs');
  const { id } = req.params;

  let uDatos;

  db.Grupos.findOne({
    where: {
      id,
    },
    attributes: campos,
  }).then((grupo)=> {
    uDatos = grupo.dataValues;

    db.sequelize.query(`
      select 
        users.id,
        users.email, 
        case 
        when '${grupo.siguiente_email}' = users.email
        then 1
        else 0
        end
        as siguiente,
        grupo_user.propietario as propietario
      from grupo_user
      left join users on users.id = grupo_user.user_id 
      where grupo_user.grupo_id = ${grupo.id}
      order by users.id  
      `,
    { type: db.sequelize.QueryTypes.SELECT })
      .then(usuarios => {
        uDatos.usuarios = usuarios;

        for (const usuario of uDatos.usuarios) {  
          if (usuario.propietario === 1 && usuario.id === req.usuario.id) uDatos.soyPropietario = true;
        }


        db.sequelize.query(`
          select 
            eventos.user_id as pagador_id,
            users.email as pagador_email,
            to_char(eventos.created_at, 'yyyy-mm-dd') as cuando
          from eventos 
          left join users on users.id = eventos.user_id 
          where eventos.grupo_id = ${grupo.id}
          order by eventos.id desc limit 10 
          `,
        { type: db.sequelize.QueryTypes.SELECT }
        ).then(eventos => {
          uDatos.eventos = eventos;

          res.status(200).render(rutaFichero, { 
            uDatos, 
            alerta: globalThis.alertaGlobal, 
            colorAlerta: globalThis.colorAlerta, 
            grupos_active: 'active', 
            id_usuario: req.usuario.id, 
            email_usuario: req.usuario.email,
          });
          globalThis.alertaGlobal = '';
        })
      });
  });
};

// ########################################################
// edit
const editar = async (req, res) => {
  const rutaFichero = path.join(__dirname, directorioVista, 'edit.hbs');
  const { id } = req.params;
  let uDatos;

  const propietarioGrupo = await db.sequelize.query(`
    select user_id 
    from grupo_user 
    where grupo_id = ${id} 
    and propietario = 1
    `, { type: db.sequelize.QueryTypes.SELECT }
  );

  if (propietarioGrupo.length === 0 || propietarioGrupo[0].user_id !== req.usuario.id) {
    globalThis.alertaGlobal = 'PERMISOS: No es el propietario de este grupo, por lo tanto, no puede hacer modificaciones';
    globalThis.colorAlerta = 'danger';
    console.log(globalThis.alertaGlobal);
    res.redirect(`/grupos/${id}?tokenparam=${req.query.tokenparam}`);
    return;
  }

  db.Grupos.findOne({
    where: {
      id,
    },
    attributes: campos,
  }).then((grupo)=> {
    uDatos = grupo.dataValues;

    db.sequelize.query(`
      select 
        users.id,
        users.email, 
        case 
        when '${grupo.siguiente_email}' = users.email
        then 1
        else 0
        end
        as siguiente,
        grupo_user.propietario as propietario
      from grupo_user
      left join users on users.id = grupo_user.user_id 
      where propietario = 0 and grupo_user.grupo_id = ${grupo.id}
      order by users.id  
      `, { type: db.sequelize.QueryTypes.SELECT })
      .then(usuarios => {
        uDatos.usuarios = usuarios;

        db.sequelize.query(`
          select 
            eventos.id as id,
            eventos.user_id as pagador_id,
            users.email as pagador_email,
            to_char(eventos.created_at, 'yyyy-mm-dd') as cuando
          from eventos 
          left join users on users.id = eventos.user_id 
          where eventos.grupo_id = ${grupo.id}
          order by eventos.id desc limit 10 
          `, { type: db.sequelize.QueryTypes.SELECT }
        ).then(eventos => {
          uDatos.eventos = eventos;

          res.status(200).render(rutaFichero, { 
            uDatos, 
            alerta: globalThis.alertaGlobal, 
            colorAlerta: globalThis.colorAlerta, 
            grupos_active: 'active', 
            id_usuario: req.usuario.id, 
            email_usuario: req.usuario.email,
          });
          globalThis.alertaGlobal = '';
        })
      });
  });
};

// update
const actualizar = async (req, res) => {
  const { id } = req.params;
  const { descripcion, integrantes, eventos } = req.body;
  const idUsuario = req.usuario.id;

  const propietarioGrupo = await db.sequelize.query(`
    select user_id 
    from grupo_user 
    where grupo_id = ${id} 
    and propietario = 1
    `, { type: db.sequelize.QueryTypes.SELECT }
  );

  if (propietarioGrupo.length === 0 || propietarioGrupo[0].user_id !== req.usuario.id) {
    globalThis.alertaGlobal = 'PERMISOS: No es el propietario de este grupo, por lo tanto, no puede hacer modificaciones';
    globalThis.colorAlerta = 'danger';
    console.log(globalThis.alertaGlobal);
    res.redirect(`/grupos/${id}?tokenparam=${req.query.tokenparam}`);
    return;
  }

  db.Grupos.findOne({
    where: { id },
    attributes: campos,
  }).then( async (grupo) => {
    if (!grupo) 
      throw new Error('Grupo no encontrado');

    grupo.update({ 
      descripcion 
    }).then( async (actualizado) => {
      await db.sequelize.query(`
        delete from eventos 
        where grupo_id = ${id} 
      `, { type: db.sequelize.QueryTypes.SELECT }
      );
      await db.sequelize.query(`
        delete from grupo_user  
        where grupo_id = ${id} 
        and user_id <> ${idUsuario}
        `, { type: db.sequelize.QueryTypes.SELECT }
      );

      if (integrantes) {
        if (Array.isArray(integrantes)) {

          for (const emailUsuario of integrantes) {
            let u = await db.Users.findOne({
              where: { email: emailUsuario },
              attributes: ['id', 'email', 'encrypted_password'],
            });
  
            if (u) {
              const contador = await db.sequelize.query(`
                select count(*)
                from grupo_user 
                where user_id = ${u.id} 
                and grupo_id = ${id};
                `, { type: db.sequelize.QueryTypes.SELECT }
              );
              if (contador[0].count === '0') {
                await db.GrupoUser.create({ grupo_id: grupo.id, user_id: u.dataValues.id });
              }
            }
            else {
              u = await db.Users.create({ email: emailUsuario, encrypted_password: 'NADA' });
              await db.UserRol.create({ rol: 'Usuario', user_id: u.id });
              await db.GrupoUser.create({ grupo_id: grupo.id, user_id: u.dataValues.id });
              emailCrearUsuario(req.usuario.email, emailUsuario, descripcion);
            }
          }
        }
        else {
          let u = await db.Users.findOne({
            where: { email: integrantes },
            attributes: ['id', 'email', 'encrypted_password'],
          });
  
          if (!u) {
            u = await db.Users.create({ email: integrantes, encrypted_password: 'NADA' });
            await db.UserRol.create({ rol: 'Usuario', user_id: u.id });
            emailCrearUsuario(req.usuario.email, integrantes, descripcion);
          }

          await db.GrupoUser.create({ grupo_id: grupo.id, user_id: u.dataValues.id });
        }
      }

      if (eventos) {
        if (Array.isArray(eventos)) {
          for (const evento of eventos) {
            const fechaEvento = evento.substring(0, 10);
            const emailEvento = evento.substring(13, evento.length);

            await db.sequelize.query(`
              insert into eventos 
                (created_at, grupo_id, user_id) 
                values ( 
                  '${fechaEvento}', 
                  ${id}, 
                  (select id from users where email = '${emailEvento}') )
              `, { type: db.sequelize.QueryTypes.SELECT }
            );
          }
        }
        else {
          const evento = eventos;
          const fechaEvento = evento.substring(0, 10);
          const emailEvento = evento.substring(13, evento.length);

          await db.sequelize.query(`
            insert into eventos 
              (created_at, grupo_id, user_id) 
              values ( 
                '${fechaEvento}', 
                ${id}, 
                (select id from users where email = '${emailEvento}') )
            `, { type: db.sequelize.QueryTypes.SELECT }
          );
        }
      }
      globalThis.alertaGlobal = 'El grupo y sus integrantes han sido creados correctamente.';
      globalThis.colorAlerta = 'success';
      console.log( `Grupo actualizado ${JSON.stringify(actualizado, null, 2)}` );
      res.redirect(`/grupos/${id}?tokenparam=${req.query.tokenparam}`);
    });
  }).catch((error) => {
    globalThis.alertaGlobal = 'ERROR: no fue posible actualizar el grupo correctamente, vuelva a intentarlo';
    globalThis.colorAlerta = 'danger';
    console.log(error);
    res.redirect(`/grupos/${id}?tokenparam=${req.query.tokenparam}`);
  });
};

// ########################################################
// delete
const borrar = async (req, res) => {
  const { id } = req.params;

  const propietarioGrupo = await db.sequelize.query(`
    select user_id 
    from grupo_user 
    where grupo_id = ${id} 
    and propietario = 1
    `, { type: db.sequelize.QueryTypes.SELECT }
  );

  if (propietarioGrupo.length === 0 || propietarioGrupo[0].user_id !== req.usuario.id) {
    globalThis.alertaGlobal = 'ERROR: No es el propietario de este grupo, por lo tanto, no puede borrar el grupo';
    globalThis.colorAlerta = 'danger';
    console.log(globalThis.alertaGlobal);
    res.redirect(`/grupos/${id}?tokenparam=${req.query.tokenparam}`);
    return;
  }

  db.Eventos.destroy({
    where: { grupo_id: id }
  }).then(() => {
    db.GrupoUser.destroy({
      where: { grupo_id: id }
    }).then(() => {
      db.Grupos.destroy({
        where: { id }
      }).then(() => {
        console.log(`Grupo BORRADO con el ID = ${id}`);
        globalThis.alertaGlobal = 'El grupo fue borrado correctamente';
        globalThis.colorAlerta = 'success';
        res.redirect(`/grupos?tokenparam=${req.query.tokenparam}`);
      });
    });
  }).catch((error) => {
    globalThis.alertaGlobal = 'ERROR: no fue posible borrar el grupo, vuelva a intentarlo';
    globalThis.colorAlerta = 'danger';
    console.log(error);
    res.redirect(`/grupos/${id}?tokenparam=${req.query.tokenparam}`);
  });
};


module.exports = {
  indice,
  nuevo,
  crear,
  editar,
  actualizar,
  mostrar,
  borrar,
  siguiente,
  pagador,
};
