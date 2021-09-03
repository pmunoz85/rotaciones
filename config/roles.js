const listadoRoles = ['Administrador', 'Usuario', 'Invitado'];
const roles = { 
  "Administrador": {
    "users": ["index", "new", "show", "edit", "delete"],
    "grupos": ["index", "new", "show", "edit", "delete"]
  },
  "Usuario": {
  },
  "Invitado": {
  }
};

module.exports = {listadoRoles, roles};
