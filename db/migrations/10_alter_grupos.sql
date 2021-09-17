///////////////////////////////////////
//  ESTRUCTURA DE LA BASES DE DATOS  //
///////////////////////////////////////

// PostgreSql

alter table grupos drop column color;
alter table grupos drop column text_color;

alter table grupos add column color VARCHAR(256) not null default 'black';
alter table grupos add column "textColor" VARCHAR(256) not null default 'white';

