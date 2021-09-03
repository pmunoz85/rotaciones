///////////////////////////////////////
//  ESTRUCTURA DE LA BASES DE DATOS  //
///////////////////////////////////////

// MySql

drop table grupo_user;

create table grupo_user (
  id INT not null AUTO_INCREMENT, 
  grupo_id INT NOT NULL,
  user_id INT NOT NULL,
  createdAt DATETIME, 
  updatedAt DATETIME, 
  primary key (id), 
  constraint no_duplicar_grupo_usuario unique (grupo_id, user_id),
  FOREIGN KEY (grupo_id) REFERENCES grupos(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);


// PostgreSql

drop table grupo_user;

create table grupo_user (
  id SERIAL, 
  grupo_id INT NOT NULL, 
  user_id INT NOT NULL,
  created_at timestamp, 
  updated_at timestamp, 
  primary key (id), 
  constraint no_duplicar_grupo_usuario unique (grupo_id, user_id),
  FOREIGN KEY (grupo_id) REFERENCES grupos(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

' // alter table grupo_user add constraint no_duplicar_usuario_rol unique (user_id, rol);
