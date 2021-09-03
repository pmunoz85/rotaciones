///////////////////////////////////////
//  ESTRUCTURA DE LA BASES DE DATOS  //
///////////////////////////////////////

// MySql

drop table eventos;

create table eventos (
  id INT not null AUTO_INCREMENT, 
  grupo_id INT NOT NULL,
  user_id INT NOT NULL,
  createdAt DATETIME, 
  updatedAt DATETIME, 
  primary key (id), 
  FOREIGN KEY (grupo_id) REFERENCES grupos(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
  );

// PostgreSql

drop table eventos;

create table eventos (
  id SERIAL, 
  grupo_id INT NOT NULL, 
  user_id INT NOT NULL,
  created_at timestamp, 
  updated_at timestamp, 
  primary key (id), 
  FOREIGN KEY (grupo_id) REFERENCES grupos(id),
  FOREIGN KEY (user_id) REFERENCES users(id)
  );

