const { request } = require('express');
const { comprobarJWT } = require('../funciones/comprobar_jwt');

const validarJWT = async (req = request, res, next) => {
  const usuario = await comprobarJWT(req.query.tokenparam);
  if (usuario) {
    req.usuario = usuario;
    req.usuario.autorizado = true;
  }
  else {
    return res.redirect(`/login`);
  }
  next();
};

module.exports = {
  validarJWT,
};
