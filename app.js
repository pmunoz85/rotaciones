require('dotenv').config();

globalThis.alertaGlobal = '';
globalThis.arrayAlertaGlobal = [];
globalThis.colorAlerta = 'danger';
// globalThis.rolesAsignados = [];

const Server = require('./server/server');

const s = new Server();
