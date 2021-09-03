///////////////////////////////////////
//  ESTRUCTURA DE LA BASES DE DATOS  //
///////////////////////////////////////

// MySql



// PostgreSql

drop function siguiente(g_id int);

CREATE FUNCTION siguiente(grupo int)
RETURNS int AS 
$$
DECLARE 
  numero_miembros int;
  numero_eventos int;
  usuarios int;
  i int := 0;
  seleccionado int;
BEGIN
  select count(*) into numero_miembros 
  from grupo_user
  where grupo_id = $1;

  -- En caso de que no exista ningún miembro de este grupo, termina la función.
  if (numero_miembros = 0) then
    return -1;
  end if;

  select count(*) into numero_eventos 
  from eventos
  where grupo_id = $1;

  -- Si en número de miembros es inferior al número de eventos, eso significa que le toca al siguiente de 
  -- la lista de miembros.
  if (numero_eventos < numero_miembros) then
    SELECT user_id  into seleccionado
    FROM grupo_user 
    where grupo_id = $1 
    and user_id not in (
      select user_id from eventos where grupo_id = $1 order by id desc limit numero_eventos) 
    order by id limit 1;
    return seleccionado;
  end if;

  -- Bucle para decidir quien queda por pagar del grupo, según los eventos anteriores.
  while i <= numero_eventos
  loop
    i = i + 1;

    SELECT count(*) into usuarios   
    FROM grupo_user 
    where grupo_id = $1 
    and user_id not in (select user_id from eventos where grupo_id = $1 order by eventos.id desc limit i);

    if (usuarios = 1) then
      SELECT user_id  into seleccionado
      FROM grupo_user 
      where grupo_id = $1 
      and user_id not in (
        select user_id from eventos where grupo_id = $1 order by id desc limit i) 
      order by id ;
      return seleccionado;
    end if;
  end loop;

  -- Si el bucle anterior no ha tenido éxito, elegimos al siguiente de la lista de miembros.
  SELECT user_id  into seleccionado
  FROM grupo_user 
  where grupo_id = $1 
  and user_id not in (
    select user_id from eventos where grupo_id = $1 order by id desc) 
  order by id limit 1;
  return seleccionado;

END;
$$ 
LANGUAGE plpgsql;

select siguiente(1);


drop function siguiente_email(g_id int);

CREATE FUNCTION siguiente_email(grupo int)
RETURNS VARCHAR(256) AS 
$$
DECLARE 
  numero_miembros int;
  numero_eventos int;
  usuarios int;
  i int := 0;
  seleccionado VARCHAR(256);
BEGIN
  select count(*) into numero_miembros 
  from grupo_user
  where grupo_id = $1;

  -- En caso de que no exista ningún miembro de este grupo, termina la función.
  if (numero_miembros = 0) then
    return '-1';
  end if;

  select count(*) into numero_eventos 
  from eventos
  where grupo_id = $1;

  -- Si en número de miembros es inferior al número de eventos, eso significa que le toca al siguiente de 
  -- la lista de miembros.
  if (numero_eventos < numero_miembros) then
    SELECT users.email  into seleccionado
    FROM grupo_user 
    left join users on users.id = grupo_user.user_id
    where grupo_id = $1 
    and user_id not in (
      select user_id from eventos where grupo_id = $1 order by id desc limit numero_eventos) 
    order by grupo_user.id limit 1;
    return seleccionado;
  end if;

  -- Bucle para decidir quien queda por pagar del grupo, según los eventos anteriores.
  while i <= numero_eventos
  loop
    i = i + 1;

    SELECT count(*) into usuarios   
    FROM grupo_user 
    where grupo_id = $1 
    and user_id not in (select user_id from eventos where grupo_id = $1 order by eventos.id desc limit i);

    if (usuarios = 1) then
      SELECT users.email  into seleccionado
      FROM grupo_user 
      left join users on users.id = grupo_user.user_id
      where grupo_id = $1 
      and user_id not in (
        select user_id from eventos where grupo_id = $1 order by id desc limit i) 
      order by grupo_user.id ;
      return seleccionado;
    end if;
  end loop;

  -- Si el bucle anterior no ha tenido éxito, elegimos al siguiente de la lista de miembros.
  SELECT users.email  into seleccionado
  FROM grupo_user 
  left join users on users.id = grupo_user.user_id
  where grupo_id = $1 
  and user_id not in (
    select user_id from eventos where grupo_id = $1 order by id desc) 
  order by grupo_user.id limit 1;
  return seleccionado;

END;
$$ 
LANGUAGE plpgsql;

select siguiente_email(1);

