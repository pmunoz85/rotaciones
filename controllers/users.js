/* eslint-disable no-await-in-loop */
/* eslint-disable radix */
/* eslint-disable no-restricted-syntax */
const path = require('path');
const bcryptjs = require('bcryptjs');
// const handlebars = require('handlebars');
// const helpers = require('handlebars-helpers')({ handlebars: handlebars });

const db = require('../db/connection');

const directorioVista = '../views/users/';
const arrayPaginador = require('../helpers/paginador');
const {listadoRoles} = require('../config/roles');

const campos = ['id', 'email', 'encrypted_password', 'createdAt', 'updatedAt'];

// ########################################################
// index
const indice = async (req, res) => {
  const rutaFichero = path.join(__dirname, directorioVista, 'index.hbs');
  const registros = [];

  const pagina = parseInt(req.query.page) || 1;
  const limit = 10;
  const offset = 0 + (pagina - 1) * limit;

  const usuariosCount = await db.Users.findAndCountAll({
    offset,
    limit,
    attributes: campos,
  });

  const usuarios = usuariosCount.rows;
  const ultimaPagina = Math.ceil(usuariosCount.count / limit);
  const botonesPaginas = arrayPaginador(pagina, ultimaPagina);

  for (let i = 0; i < usuarios.length; i += 1) {
    const element = usuarios[i];

    const rolesDB = await db.UserRol.findAll({
      where: {
        user_id: element.id,
      },
      attributes: ['id','rol','user_id'],
    });
    
    const rolesAsignados = [];
    for (const rol of rolesDB) {
      rolesAsignados.push(rol.dataValues.rol);
    }

    registros.push({
      id: element.id,
      email: element.email,
      pass: element.encrypted_password,
      roles: rolesAsignados,
    });
  }

  res.status(200).render(rutaFichero, {
    registros,
    alerta: globalThis.alertaGlobal,
    colorAlerta: globalThis.colorAlerta, 
    users_active: 'active',
    id_usuario: req.usuario.id,
    email_usuario: req.usuario.email,
    total_registros: usuariosCount.count,
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
// new
const nuevo = (req, res) => {
  const rutaFichero = path.join(__dirname, directorioVista, 'new.hbs');
  res
    .status(200)
    .render(rutaFichero, { 
      email_usuario: req.usuario.email, 
      alerta: globalThis.alertaGlobal, 
      colorAlerta: globalThis.colorAlerta, 
      users_active: 'active' 
    });
  globalThis.alertaGlobal = '';
};

// create
const crear = (req, res) => {
  const { email, password } = req.body;
  const newUsuario = {
    email,
    encrypted_password: bcryptjs.hashSync(password, 10),
  };

  db.Users.create(newUsuario).then(() => {
    globalThis.alertaGlobal = 'El usuario ha sido creado correctamente.';
    globalThis.colorAlerta = 'success';
    res.redirect(`/users?tokenparam=${req.query.tokenparam}`);
  }).catch((error)=>{
    globalThis.alertaGlobal = 'ERROR: no fue posible crear el usuario correctamente, vuelva a intentarlo';
    globalThis.colorAlerta = 'danger';
    console.log(error);
    res.redirect(`/users/new?tokenparam=${req.query.tokenparam}`);
  });
};

// ########################################################
// show
const mostrar = async (req, res) => {
  const rutaFichero = path.join(__dirname, directorioVista, 'show.hbs');
  const { id } = req.params;

  const usuario = await db.Users.findOne({
    where: {
      id,
    },
    attributes: campos,
  });

  const rolesDB = await db.UserRol.findAll({
    where: {
      user_id: usuario.dataValues.id,
    },
    attributes: ['id','rol','user_id'],
  });
  
  const rolesAsignados = [];
  for (const rol of rolesDB) {
    rolesAsignados.push(rol.dataValues.rol);
  }

  const rolesNoAsignados = [];  
  for (const r of listadoRoles) {
    if (!rolesAsignados.includes(r))
      rolesNoAsignados.push(r);
  }

  const uDatos = usuario.dataValues;

  res.status(200).render(rutaFichero, { 
    uDatos, 
    rolesNoAsignados, 
    rolesAsignados,
    alerta: globalThis.alertaGlobal, 
    colorAlerta: globalThis.colorAlerta, 
    users_active: 'active', 
    id_usuario: req.usuario.id, 
    email_usuario: req.usuario.email,
  });
  globalThis.alertaGlobal = '';
};

// ########################################################
// edit
const editar = async (req, res) => {
  const rutaFichero = path.join(__dirname, directorioVista, 'edit.hbs');
  const { id } = req.params;

  const usuario = await db.Users.findOne({
    where: {
      id,
    },
    attributes: campos,
  });

  const uDatos = usuario.dataValues;

  res.status(200).render(rutaFichero, { 
    uDatos, 
    alerta: globalThis.alertaGlobal, 
    colorAlerta: globalThis.colorAlerta, 
    users_active: 'active', 
    id_usuario: req.usuario.id,
    email_usuario: req.usuario.email,
  });
  globalThis.alertaGlobal = '';
};

// update
const actualizar = async (req, res) => {
  const { id } = req.params;
  const { email, password } = req.body;

  db.Users.findOne({
    where: {
      id,
    },
    attributes: campos,
  })
    .then((registro) => {
      if (!registro) throw new Error('Registro no encontrado');

      const valores = {
        email,
        encrypted_password: bcryptjs.hashSync(password, 10),
      };

      registro.update(valores).then((actualizado) => {
        globalThis.alertaGlobal = 'Usuario actualizado correctamente';
        globalThis.colorAlerta = 'success';
        console.log(
          `Registro actualizado ${JSON.stringify(actualizado, null, 2)}`
        );
        res.redirect(`/users/${id}?tokenparam=${req.query.tokenparam}`);
      });
    })
    .catch((error) => {
      globalThis.alertaGlobal =  'ERROR: no fue posible modificar el usuario correctamente, vuelva a intentarlo';
      globalThis.colorAlerta = 'danger';
      console.log(error);
      res.redirect(`/users/${id}?tokenparam=${req.query.tokenparam}`);
    });
};

// ########################################################
// editActual
const editarActual = async (req, res) => {
  const rutaFichero = path.join(__dirname, directorioVista, 'edit_actual.hbs');
  const { id } = req.usuario;

  const usuario = await db.Users.findOne({
    where: {
      id,
    },
    attributes: campos,
  });

  const uDatos = usuario.dataValues;

  res.status(200).render(rutaFichero, { 
    uDatos, 
    alerta: globalThis.alertaGlobal, 
    colorAlerta: globalThis.colorAlerta, 
    actual_active: 'active', 
    id_usuario: req.usuario.id,
    email_usuario: req.usuario.email,
  });
  globalThis.alertaGlobal = '';
};

// updateActual
const actualizarActual = async (req, res) => {
  const { id } = req.params;
  const { actual_password, password, repetir_password } = req.body;

  db.Users.findOne({
    where: {
      id,
    },
    attributes: campos,
  })
    .then((registro) => {
      if (!registro) throw new Error('Registro no encontrado');

      const valores = {
        encrypted_password: bcryptjs.hashSync(password, 10),
      };

      if (bcryptjs.compareSync(actual_password, registro.encrypted_password) ) {
        if (password === repetir_password) {

          registro.update(valores).then((actualizado) => {
            globalThis.alertaGlobal = 'Contraseña actualizada correctamente';
            globalThis.colorAlerta = 'success';
            console.log(`Contraseña actualizada correctamente ${JSON.stringify(actualizado, null, 2)}` );
            res.redirect(`/home?tokenparam=${req.query.tokenparam}`);
          });
        }
        else {
          globalThis.alertaGlobal = 'ERROR: la nueva contraseña y la repetición de la misma debe coincidir, vuelva a intentarlo';
          globalThis.colorAlerta = 'danger';
          res.redirect(`/home?tokenparam=${req.query.tokenparam}`);
        }
      }
      else {
        globalThis.alertaGlobal = 'ERROR: la contraseña actual no coincide, vuelva a intentarlo';
        globalThis.colorAlerta = 'danger';
        res.redirect(`/home?tokenparam=${req.query.tokenparam}`);
      }
    })
    .catch((error) => {
      globalThis.alertaGlobal = 'ERROR: no fue posible modificar el usuario correctamente, vuelva a intentarlo';
      globalThis.colorAlerta = 'danger';
      console.log(error);
      res.redirect(`/home?tokenparam=${req.query.tokenparam}`);
    });
};

// ########################################################
// delete
const borrar = (req, res) => {
  const { id } = req.params;

  db.Users.destroy({
    where: {
      id,
    },
  }).then(() => {
    console.log(`Registro BORRADO con el ID = ${id}`);
    globalThis.alertaGlobal = 'El usuario fue borrado correctamente';
    globalThis.colorAlerta = 'success';
    res.redirect(`/users?tokenparam=${req.query.tokenparam}`);
  }).catch((error) => {
    globalThis.alertaGlobal = 'ERROR: no fue posible borrar el usuario, vuelva a intentarlo';
    globalThis.colorAlerta = 'danger';
    console.log(error);
    res.redirect(`/users/${id}?tokenparam=${req.query.tokenparam}`);
  });
};

module.exports = {
  indice,
  nuevo,
  crear,
  editar,
  editarActual,
  actualizar,
  actualizarActual,
  mostrar,
  borrar,
};
