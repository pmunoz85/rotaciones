
insert into users (email, encrypted_password) values ('danielnagore@marbella.es', 'NADA');
insert into users (email, encrypted_password) values ('raulsierra@marbella.es', 'NADA');
insert into users (email, encrypted_password) values ('azaldivar@marbella.es', 'NADA');

insert into grupos (descripcion) values ('(3) Cuerpo de ingenieros del Ayto de Marbella');
insert into grupos (descripcion) values ('(-2) Compañero Dani - Administración Electrónica');
insert into grupos (descripcion) values ('(1+1) Compañero Raúl - Informática');
insert into grupos (descripcion) values ('(4) Surferos del mal - Ayto de Marbella');

insert into grupo_user (grupo_id, user_id, propietario) values (1,1,1);
insert into grupo_user (grupo_id, user_id) values (1,2);
insert into grupo_user (grupo_id, user_id) values (1,3);

insert into grupo_user (grupo_id, user_id, propietario) values (2,1,1);
insert into grupo_user (grupo_id, user_id) values (2,2);

insert into grupo_user (grupo_id, user_id, propietario) values (3,1,1);
insert into grupo_user (grupo_id, user_id) values (3,3);

insert into grupo_user (grupo_id, user_id, propietario) values (4,1,1);
insert into grupo_user (grupo_id, user_id) values (4,2);
insert into grupo_user (grupo_id, user_id) values (4,3);
insert into grupo_user (grupo_id, user_id) values (4,4);

insert into eventos (grupo_id, user_id, created_at) values (1, 1, '2021-07-12');
insert into eventos (grupo_id, user_id, created_at) values (1, 3, '2021-07-13');
insert into eventos (grupo_id, user_id, created_at) values (1, 2, '2021-07-14');
insert into eventos (grupo_id, user_id, created_at) values (1, 3, '2021-07-16');
insert into eventos (grupo_id, user_id, created_at) values (1, 1, '2021-07-19');
insert into eventos (grupo_id, user_id, created_at) values (1, 2, '2021-07-20');
insert into eventos (grupo_id, user_id, created_at) values (1, 3, '2021-08-11');
insert into eventos (grupo_id, user_id, created_at) values (1, 1, '2021-08-12');

insert into eventos (grupo_id, user_id, created_at) values (2, 2, '2021-07-15');
insert into eventos (grupo_id, user_id, created_at) values (2, 1, '2021-07-21');
insert into eventos (grupo_id, user_id, created_at) values (2, 2, '2021-07-23');

insert into eventos (grupo_id, user_id, created_at) values (3, 1, '2021-07-27');
insert into eventos (grupo_id, user_id, created_at) values (3, 3, '2021-08-03');
insert into eventos (grupo_id, user_id, created_at) values (3, 1, '2021-08-04');
insert into eventos (grupo_id, user_id, created_at) values (3, 3, '2021-08-05');
insert into eventos (grupo_id, user_id, created_at) values (3, 3, '2021-08-06');

insert into eventos (grupo_id, user_id, created_at) values (4, 4, '2021-06-30');
insert into eventos (grupo_id, user_id, created_at) values (4, 1, '2021-07-05');
insert into eventos (grupo_id, user_id, created_at) values (4, 2, '2021-08-09');
insert into eventos (grupo_id, user_id, created_at) values (4, 3, '2021-08-10');
insert into eventos (grupo_id, user_id, created_at) values (4, 4, '2021-08-13');
