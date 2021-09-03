const { Router } = require('express');
const { validationResult } = require('express-validator');
const { validarJWT } = require('../middlewares/validar_jwt');

const {
  indice,
  nuevo,
  siguiente,
  pagador,
  crear,
  editar,
  actualizar,
  borrar,
  mostrar,
} = require('../controllers/grupos');

const validaciones = [
  validarJWT,
  (req, res, next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty())
      return false;
    next();
  },
];

module.exports = () => {
  const router = Router();

  router
    .route('/') //
    .get(validaciones, indice)
    .post(validaciones, crear);
  router
    .route('/:id/next') //
    .get(validaciones, siguiente);
  router
    .route('/:id/:userID/payer') //
    .get(validaciones, pagador);
  router
    .route('/new') //
    .get(validaciones, nuevo);
  router
    .route('/:id') //
    .get(validaciones, mostrar)
    .post(validaciones, actualizar);
  router
    .route('/:id/delete') //
    .post(validaciones, borrar);
  router
    .route('/:id/edit') //
    .get(validaciones, editar);

  return router;
};
