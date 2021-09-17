# **Proyecto Rotaciones**

Puedes ver una demo de esta aplicación desplegada en [rotaciones.herokuapp.com](https://rotaciones.herokuapp.com/).

Este proyecto nace de la necesidad de realizar una codekata. El contexto de realización de la codekata se basa en el desarrollo de una aplicación web completa, pero de pequeño tamaño. De esta manera podemos evaluar algunos de los problemas a los que nos vamos a enfrentar en un desarrollo, pero sin emplear mucho tiempo en resolver dichos problemas.

Para ello, hemos planteado el desarrollado una aplicación web que sirve para contralar las rotaciones de los turnos, según los integrantes de un grupo que se haya formado. La labor del sistema es indicar cual sería el integrante al que le pertenece el siguiente turno y llevar un registro de todos los turnos realizados junto al integrante seleccionado.

Para muestra un botón. El ejemplo más claro, y por el cual se ha elegido este proyecto, es el control del turno de pago de los desayunos con los compañeros del trabajo. Si los compañeros son a la vez amigos, es frecuente que el desayuno se vaya pagando de forma rotatoria, pero esto, normalmente, acaba estando descompensado ya que la memoria humana es limitada, y si lo unimos a la problemática de que, en las reuniones del desayuno el número de compañeros que las componen van cambiando, el control del turno de pago se puede volver algo complejo y tedioso.

## **_Despliegue de la aplicación web_**

Si estamos interesados en probar el funcionamiento de la plicación en nuestro propio equipo, debemos realizar los siguientes pasos, antes de poder ejecutar la aplicación con garantias de éxito:

Damos por sentado que tienes instalado en tu sistema las siguientes herramientas: Nodejs, npm, PostgreSQL y Git.

1. Clonado del repositorio Git Hub. 
    ``` git clone git@github.com:pmunoz85/rotaciones.git ```

2. [Definición de la base de datos en Postgres.](#almacenamiento-persistente)

3. Instalación de las dependencias con NPM. 
    ``` npm install```

4. [Creación de un fichero con las variables de entorno necesarias.](#variables-de-entorno)

## **_Que implica este desarrollo_**

Para poder llevar a cabo la tarea, que yo mismo me he asignado sin necesidad, he tenido que realizar una serie de trabajos para que una tarea, en principio tan sencilla como esta, pueda llegar a cumplir de forma adecuada su cometido.

### _Landing page_

Obviamente, debemos tener una página de partida, en la que explicamos brevemente en que consiste el sitio web al que acabas de llegar. Este diseño se ha realizado utilizando HTML y CSS apoyado en el Framework de Bootstrap.

![Landing page](https://github.com/pmunoz85/rotaciones/blob/main/public/imagenes/landing.png)

### _Usuarios y roles_

Los únicos datos almacenados de los usuarios en la tabla de usuarios son la dirección de correo electrónico y la contraseña encriptada.

#### **Usuarios**

Obviamente, si los grupos lo van a formar personas necesitamos una gestión de usuarios, para que puedan formar parte de un grupo, ya que la aplicación necesita saber de cuantas personas consta un grupo, implantando una rotación de los integrantes del grupo, y así, poder proporcionar la identidad del próximo integrante del grupo al que le toca hacer, por ejemplo, pagar el desayuno o lo que sea que se haya establecido con el grupo de amigos al que perteneces.

El alta de los nuevos usuarios se puede producir de dos formas:

  1. La primera opción, es cuando un usuario solicita consumir los servicios de la aplicación web y proporciona su dirección de correo electrónico y una contraseña. A partir de ese momento podrá crear nuevos grupos de rotaciones en los que él es el propietario. Esto implica que solo él puede editar el grupo, crear eventos, eliminar eventos, añadir integrantes, etc.

  2. La segunda opción es cuando otro usuario del servicio añade tu correo electrónico a un grupo, en ese momento la aplicación web le envía un correo electrónico al nuevo usuario indicándole lo que ha ocurrido e invitándole a que participe fiscalizando dicho grupo.

#### **Roles**

También, hemos creado una gestión de roles para los usuarios, con la asignación de roles a los usuarios podemos indicar el nivel de acceso de cada uno de ellos. En principio, hemos creado tres roles: Administrador, Usuario e Invitado, pero solo utilizamos los dos primeros.

El nuevo usuario obtiene el rol de Usuario de forma automática, para obtener el rol de Administrador este debe ser asignado por otro usuario con nivel de Administrador.

Cuando tenemos la base de datos vacía, el primer usuario que se da de alta obtiene el rol de Administrador de forma automática.

#### **Recuperación de contraseña**

Como no podía ser de otra forma, hemos integrado una forma de recuperación de contraseñas en la aplicación web. Hoy en día es incomprensible que una aplicación web no cuente con un sistema de recuperación de contraseñas ya que es muy común olvidarse de las credenciales de un usuario.

### _JWT para controlar las sesiones_

Utilizamos JSON Web Token (JWT) para contralar quien se ha identificado en la plataforma y quien no.

### _Almacenamiento persistente_

En el apartado de persistencia hemos optado por el servidor de bases de datos de código abierto PostgreSQL. Para el correcto funcionamiento de la aplicación web necesitamos crear con antelación la base de datos a la que se va a conectar. A parte de la estructura de la base de datos, también, necesitamos crear un par de funciones de apoyo.

Aquí está el código necesario para la creación de la base de datos.

```sql
create database rotaciones_development;

create table users (
  id SERIAL, 
  email VARCHAR(256) NOT NULL UNIQUE, 
  encrypted_password VARCHAR(1024) NOT NULL, 
  created_at timestamp, 
  updated_at timestamp, 
  primary key (id) );

create table tokens (
  id SERIAL, 
  revocado VARCHAR(1024) NOT NULL UNIQUE, 
  created_at timestamp, 
  updated_at timestamp, 
  primary key (id) );

create table user_rol (
  id SERIAL, 
  user_id INT NOT NULL,
  rol VARCHAR(64) NOT NULL, 
  created_at timestamp, 
  updated_at timestamp, 
  primary key (id), 
  constraint no_duplicar_usuario_rol unique (user_id, rol),
  FOREIGN KEY (user_id) REFERENCES users(id)
);

create table grupos (
  id SERIAL, 
  descripcion TEXT NOT NULL, 
  created_at timestamp, 
  updated_at timestamp, 
  primary key (id) );

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

alter table grupo_user add column propietario int not null default 0;

alter table grupos add column color VARCHAR(256) not null default 'black';

alter table grupos add column "textColor" VARCHAR(256) not null default 'white';

```
Este es el código escrito en PS/SQL, es necesario para la creación de las dos funciones utilizada para obtener el siguiente integrante del grupo al que le toca el turno.

```pl sql
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
```
### _Variables de entorno_

Una vez que hemos realizado un clon de la aplicación web y hemos creado la base de datos en Postgres, es el momento de crear un fichero llamado ".env" en la raíz de la aplicación. Podemos ver el conenido del ejemplo que hemos aportado en un fichero llamado ".env.EXAMPLE". Podemos renombrar el ejemplo con el nombre requerido ".env" y que este nos sirva de guía para crear nuestras constantes específicas. En este fichero definimos las constantes necesarias para la conexión a la base de datos, la configuración de la cuenta de correor electrónico para el envío de correos electrónicos, la clave privada de los Json Web Token, etc.

Aquí tenemos el contenido del fichero ".env.EXAMPLE".

``` 
/////////////////////////////////////////////////
// Puerto de escucha para las peticiones http  //
/////////////////////////////////////////////////
PORT=8080

////////////////////////////////////////
// Clave privada para genrar los JWT  //
////////////////////////////////////////
PRIVATEKEY=1234567890

///////////////////////////////////////////////////////////////////
// Constantes utilizadas para el servicio de correo electrónico  //
///////////////////////////////////////////////////////////////////
EMAIL_USER=micuentadecorreo@gmail.com
EMAIL_PASSWORD=EstaEsLaClave
EMAIL_SERVICE=gmail

////////////////////////////////////////////////
// Parámetros de la base de datos PostgreSql  //
////////////////////////////////////////////////
DB_HOST=localhost
DB_USER=postgres
DB_PASSWORD=1234567890
DB=rotaciones_development
DB_DIALECT=postgres
DB_PORT=5432
DB_POOL_MAX=5
DB_POOL_MIN=0
DB_POOL_ACQUIRE=30000
DB_POOL_IDLE=10000
// es_ES.ISO8859-1
```

### _Paginado de las tablas grupos y usuarios_

Hemos desarrollado un control de paginación espartano para los usuarios y grupos del sistema. A continuación, podemos ver el código HTML y la función JavaScript realizada para obtener una paginación dinámica.

```handlebars
<nav aria-label='Page navigation example'>
  <ul class='pagination justify-content-end'>
    <li class='page-item {{previous_disabled}}'>
      <a
        class='aqui-token page-link'
        href='/grupos/?page={{pagina_anterior}}'
        tabindex='-1'
        aria-disabled='true'
      >Anterior</a>
    </li>
    {{#each botonesPaginas}}
      <li class='page-item {{#if (eq this ../pagina)}}active{{/if}}' >
        <a
          class='aqui-token page-link' 
          href='/grupos?page={{this}}'
        >{{this}}</a></li>
    {{/each}}
    <li class='page-item {{next_disabled}}'>
      <a
        class='aqui-token page-link'
        href='/grupos/?page={{pagina_posterior}}'
      >Siguiente</a>
    </li>
  </ul>
</nav>
```

Habrá que trabajar en una mejora que consista en la sustitución de los if por un switch, pero eso será en un futuro próximo, por ahora este código es funcional.

```javascript
const array_paginador = (pagina, ultima_pagina) => {
  let array_ultima_pagina = [];

  if (ultima_pagina < 12) {
    array_ultima_pagina = Array.from(
      { length: ultima_pagina },
      (_, i) => i + 1
    );
  } else {
    if (pagina < 6) {
      array_ultima_pagina = Array.from({ length: 10 }, (_, i) => {
        if (i < 7) return i + 1;
        else if (i === 7) return '...';
        else if (i === 8) return ultima_pagina - 1;
        else return ultima_pagina;
      });
    } else if (pagina > ultima_pagina - 5) {
      array_ultima_pagina = Array.from({ length: 10 }, (_, i) => {
        if (i < 2) return i + 1;
        else if (i === 2) return '...';
        else if (i === 3) return ultima_pagina - 6;
        else if (i === 4) return ultima_pagina - 5;
        else if (i === 5) return ultima_pagina - 4;
        else if (i === 6) return ultima_pagina - 3;
        else if (i === 7) return ultima_pagina - 2;
        else if (i === 8) return ultima_pagina - 1;
        else if (i === 9) return ultima_pagina;
      });
    } else {
      array_ultima_pagina = Array.from({ length: 11 }, (_, i) => {
        if (i < 2) return i + 1;
        else if (i === 2) return '...';
        else if (i === 3) return pagina - 2;
        else if (i === 4) return pagina - 1;
        else if (i === 5) return pagina;
        else if (i === 6) return pagina + 1;
        else if (i === 7) return pagina + 2;
        else if (i === 8) return '...';
        else if (i === 9) return ultima_pagina - 1;
        else if (i === 10) return ultima_pagina;
      });
    }
  }
  return array_ultima_pagina;
};
```

### _Comunicación entre el Backend y el Frontend_

Como toma de contacto con la comunicación a través de Websocket hemos elegido la librería Socket.io. A continuación, mostramos la parte del código donde recibimos y procesamos los mensajes Websocket.

```javascript
const socketController = (socket) => {
  console.log('Cliente contectado con del ID:', socket.id);

  socket.on('disconnect', () => {
    console.log('Cliente desconectado con el ID:', socket.id);
  });

  socket.on('mensaje', (payload, callback) => {
    if (callback) {
      callback(socket.id);
    }
    socket.broadcast.emit('mensaje', payload);
  });

  socket.on('guardarRoles', async (payload, callback) => {
    const {usuarioID, token} = payload;
    let {rolesParaGuardar} = payload;
    
    await comprobarJWT(token);

    if (callback) {
      let guardado = false;

      db.UserRol.findAll({
        where: {
          user_id: usuarioID,
        },
        attributes: ['id', 'user_id', 'rol'],
      }).then((registros) => {
        for (const registro of registros) {
          if (rolesParaGuardar.includes(registro.rol)) {
            rolesParaGuardar = rolesParaGuardar.filter(item => item !== registro.rol);
          }
          else if (borrarRol(registro.id)) {
            throw new Error('ERROR: no fue posible modificar los roles del usuario correctamente, vuelva a intentarlo');
          }
        }
        for (const rol of rolesParaGuardar) {
          if (darDeAltaElNuevoRol(usuarioID, rol)) {
            throw new Error('ERROR: no fue posible modificar los roles del usuario correctamente, vuelva a intentarlo');
          }
        }
      }).catch((error) => {
        globalThis.alertaGlobal =  'ERROR: no fue posible modificar los roles del usuario correctamente, vuelva a intentarlo';
        globalThis.colorAlerta = 'danger';
        console.log(error);
        guardado = false;
      });

      callback(socket.id, guardado);
    }
  });
};
```

### _Plantillas con Handlebars_

El apartad de plantillas está cubierto por Handlebars. Este es un popular sistema de plantillas en Javascript que te permite generar código HTML de una manera muy sencilla. Como estoy acostumbrado a utilizar Ruby On Rails, esta es la opción menos traumática. En versiones posteriores, optaremos por un Framework de Frontend más sofisticado como Angular, React o Vue.

### _Gestor de paquetes NPM_

Contenido del fichero de configuración de paquetes package.json. 

```json
{
  "name": "rotaciones",
  "version": "1.0.0",
  "description": "Aplicación para el control de rotaciones en grupos de amigos",
  "main": "app.js",
  "directories": {
    "doc": "docs"
  },
  "scripts": {
    "dev": "nodemon --inspect",
    "test": "echo \"Error: no test specified\" && exit 1",
    "start": "node app.js"
  },
  "author": "Pedro Manuel Muñoz Morales",
  "license": "ISC",
  "dependencies": {
    "bcryptjs": "^2.4.3",
    "body-parser": "^1.19.0",
    "cors": "^2.8.5",
    "crypto": "^1.0.1",
    "dotenv": "^10.0.0",
    "express": "^4.17.1",
    "express-fileupload": "^1.2.1",
    "express-handlebars": "^5.3.2",
    "express-validator": "^6.11.1",
    "handlebars-helpers": "^0.10.0",
    "jsonwebtoken": "^8.5.1",
    "nodemailer": "^6.6.3",
    "pg": "^8.6.0",
    "pg-hstore": "^2.3.3",
    "sequelize": "^6.6.2",
    "socket.io": "^4.1.2",
    "yarg": "^1.0.2"
  },
  "devDependencies": {
    "eslint": "^7.25.0",
    "eslint-config-airbnb-base": "^14.2.1",
    "eslint-config-prettier": "^8.3.0",
    "eslint-plugin-import": "^2.22.1",
    "nodemon": "^2.0.7"
  }
}
```

### _Despliegue de la aplicación_

Heroku nos ofrece un ecosistema perfecto para el despliegue de la aplicación en la nube, sin tener que configurar un servidor virtual desde cero, donde tendríamos que haber instalado todo lo necesario para que la aplicación web funcionase; Ubuntu Server, Apache, NodeJS, PostgreSQL, paquetes NPM, etc.

También, es importante resaltar que la plataforma te permite de forma gratuita desplegar cinco aplicaciones como máximo, y también, crear una base de datos para cada aplicación con un máximo de tamaño de 50MB.

Por estas dos razones hemos elegido una plataforma como servicio (PaaS) como es Heroku en vez de un servidor dedicado.

## **_Plataformas y recursos Open Source utilizados_**

El proyecto se ha realizado utilizando una gran variedad de frameworks, librerias y lenguajes Open Source. A continuación, hacemos una breve referencia a ellos.

- El lenguaje de desarrollo elegido, tanto en el Frontend como en el Backend, ha sido [JavaScript](https://developer.mozilla.org/es/docs/Web/JavaScript).
- El entorno de ejecución en el servidor ha sido [Node.js](https://nodejs.org/es/).
- Al elegir Node.js como entorno de ejecución, lo natural es utilizar como herramienta de gestión de paquetes [NPM](https://www.npmjs.com/). 
- Por supuesto, como no podía ser de otra manera, ya que como producto final obtenemos una página web, hemos utilizado como lenguaje de maquetado [HTML](https://www.w3schools.com/html/).
- Se ha utilizado el Framework de CSS [Bootstrap](https://getbootstrap.com/docs/5.0/getting-started/introduction/) para dar un poco de colorido a la aplicación.
- También se ha hecho uso del sistema de plantilla [Handlebars](https://handlebarsjs.com/) para construir el contenido dinámico en las páginas web.
- Como medio de verificación de sesiones en el entorno restringido a usuarios, hemos optado por utilizar la tecnología de JSON Web Token [(JWT)](https://jwt.io/).
- Utilización de la biblioteca [Socket.io](https://socket.io/) para mejorar la experiencia de usuario.
- En el apartado de bases de datos, hemos optado por almacenar la información en un servidor de bases de datos [PostgreSQL](https://www.postgresql.org/).
- La plataforma utilizada para el despliegue en producción ha sido [Heroku](https://www.heroku.com/) en la siguiente URL [rotaciones.herokuapp.com](https://rotaciones.herokuapp.com/)
