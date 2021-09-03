///////////////////////////////////////
//  ESTRUCTURA DE LA BASES DE DATOS  //
///////////////////////////////////////

// MySql

alter table grupo_user drop column propietario;

alter table grupo_user add column propietario int not null default 0;


// PostgreSql

alter table grupo_user drop column propietario;

alter table grupo_user add column propietario int not null default 0;

' // alter table grupo_user add constraint no_duplicar_usuario_rol unique (user_id, rol);
