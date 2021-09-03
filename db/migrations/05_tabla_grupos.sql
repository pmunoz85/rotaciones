///////////////////////////////////////
//  ESTRUCTURA DE LA BASES DE DATOS  //
///////////////////////////////////////

// MySql

drop table grupos;

create table grupos (
  id INT not null AUTO_INCREMENT UNIQUE, 
  descripcion TEXT NOT NULL, 
  created_at DATETIME, 
  updated_at DATETIME, 
  primary key (id) );




// PostgreSql

drop table grupos;

create table grupos (
  id SERIAL, 
  descripcion TEXT NOT NULL, 
  created_at timestamp, 
  updated_at timestamp, 
  primary key (id) );



