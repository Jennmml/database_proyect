-- Crear la base de datos y usarla
-- CREATE DATABASE fastfitness;
-- USE fastfitness;

--USE master
--DROP DATABASE fastfitness


--Regla de restriccion para la cedula, para que el formato sea exactamente 9 numeros sin signos ni letras
CREATE RULE ReglaCedulaNumerica AS
    @cedula LIKE '[0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]';
GO

--Creamos el tipo de dato cedulaRestringida
EXEC	sp_addtype	CedulaRestringida,	'CHAR(9)',	'NOT NULL'
GO

--Asociamos la regla ReglaCedulaNumerica con el tipo de dato CedulaRestringida
EXEC	sp_bindrule	'ReglaCedulaNumerica', 'CedulaRestringida'
GO


--Regla de restriccion para validar correos, formato basico algo@algo.algo
CREATE RULE ReglaCorreo AS 
    @correo LIKE '_%@__%.__%'; --Validacion basica de correo
GO

--Creamos el tipo de dato CorreoRestringido
EXEC sp_addtype CorreoRestringido, 'VARCHAR(100)', 'NOT NULL'
GO

--Asociamos la regla ReglaCorreo el tipo de dato CorreoRestringido 
EXEC sp_bindrule 'ReglaCorreo', 'CorreoRestringido'
GO


--Regla de restriccion para los telefonos, en costa rica por ejemplo no existen con 0 o 1,
--pero de 2 para arriba, ejemplo 24470202, 8 numeros exactos
CREATE RULE ReglaTelefono AS
	@telefono LIKE '[2-9][0-9][0-9][0-9][0-9][0-9][0-9][0-9]';
GO

--Creamos el tipo de dato TelefonoRestringido
EXEC sp_addtype TelefonoRestringido, 'CHAR(8)', 'NOT NULL'
GO

--Asociamos la regla ReglaTelefono el tipo de dato TelefonoRestringido
EXEC sp_bindrule 'ReglaTelefono', 'TelefonoRestringido'
GO


/*
Solo permite letras mayusculas y minisculas, incluyendo la tilde y la enie, rechaza cualquier numero
o caracter especial como @, asi evitamos que se pongan nombres como XxJos3ProG@merxX*/
CREATE RULE ReglaNombreYApellidos AS
	@nombre NOT LIKE '%[^a-zA-ZáéíóúÁÉÍÓÚñÑ ]%';
GO

--Creamos el tipo de dato ReglaNombreYApellidos
EXEC sp_addtype  NombreYApellidosLimpios, 'Varchar(20)', 'NOT NULL'
GO

----Asociamos la regla ReglaNombreYApellidos el tipo de dato ReglaNombreYApellidos
EXEC sp_bindrule 'ReglaNombreYApellidos', 'NombreYApellidosLimpios'
GO


/* Regla para restriccion de edades, de 5 a 120, por que nadie de menos de 5 anios va a ir al gym, por que 
a esas edades uno debe estar jugando play todo el dia y viendo tok tok y no mas de 120 por que ya
despues de ahi estan muy viejitos para hacer ejercicio y pobrecitos, deben descansar de tanto programar
*/
CREATE RULE ReglaEdad AS 
    @edad BETWEEN 5 AND 120;
GO

-- Creamos el tipo de dato TelefonoRestringido
EXEC sp_addtype EdadRestringida, 'TINYINT', 'NOT NULL';
GO

-- Asociar regla
EXEC sp_bindrule 'ReglaEdad', 'EdadRestringida';
GO



-- Tabla provincias
CREATE TABLE provincias(
	id_provincia TINYINT			NOT NULL,
	nombre_provincia VARCHAR(20)	NOT NULL,
	CONSTRAINT PK_id_provincia_provincias PRIMARY KEY(id_provincia)
);


-- Tabla cantones
CREATE TABLE cantones(
	id_canton TINYINT			NOT NULL,
	provincia TINYINT			NOT NULL,
	nombre_canton VARCHAR(50)	NOT NULL,
	CONSTRAINT PK_canton_cantones PRIMARY KEY(id_canton)
);

-- Tabla distritos
CREATE TABLE distritos(
	id_distrito SMALLINT		NOT NULL,
	canton TINYINT				NOT NULL,
	nombre_distrito VARCHAR(50)	NOT NULL,
	CONSTRAINT PK_id_distrito_distritos PRIMARY KEY(id_distrito)
);

-- Tabla generos
CREATE TABLE generos(
	id_genero TINYINT		NOT NULL,
	genero VARCHAR(9)		NOT NULL,
	CONSTRAINT PK_id_genero_generos PRIMARY KEY(id_genero)
);

-- Tabla persona
CREATE TABLE persona(
	cedula CedulaRestringida			NOT NULL,
	nombre NombreYApellidosLimpios		NOT NULL,
	apellido1 NombreYApellidosLimpios	NOT NULL,
	apellido2 NombreYApellidosLimpios	NOT NULL,
	genero TINYINT						NOT NULL,
	distrito SMALLINT					NOT NULL,
	correo CorreoRestringido			NOT NULL,
	fecha_nacimiento			DATE NOT NULL DEFAULT GETDATE(),
	edad EdadRestringida		NOT NULL,
	CONSTRAINT PK_cedula_personas PRIMARY KEY(cedula)
);

-- Tabla telefonos_personas
CREATE TABLE telefonos_personas (
    cedula_persona CedulaRestringida PRIMARY KEY,  
    telefono TelefonoRestringido NOT NULL,
    CONSTRAINT FK_cedula_persona_tel FOREIGN KEY (cedula_persona) REFERENCES persona(cedula)
        ON DELETE CASCADE
        ON UPDATE CASCADE
);

-- Tabla entrenador
CREATE TABLE entrenador(
	cedula  CedulaRestringida			NOT NULL,
	fecha_contratacion DATE				NOT NULL DEFAULT GETDATE(),
	tipo VARCHAR(20)					NOT NULL DEFAULT 'General',
	CONSTRAINT PK_cedula_entrenador PRIMARY KEY(cedula),
	CONSTRAINT FK_entrenador_persona FOREIGN KEY(cedula) REFERENCES persona(cedula)
	ON DELETE CASCADE
	ON UPDATE CASCADE
);

-- Tabla administrador
CREATE TABLE administrador(
	cedula CedulaRestringida				NOT NULL,
	fecha_contratacion DATE NOT NULL DEFAULT GETDATE(),
	CONSTRAINT PK_cedula_administrador PRIMARY KEY(cedula),
	CONSTRAINT FK_administrador_persona FOREIGN KEY(cedula) REFERENCES persona(cedula)
	ON DELETE CASCADE
	ON UPDATE CASCADE
);


--Tabla clientes
CREATE TABLE cliente(
	cedula CedulaRestringida	NOT NULL,
	estado TINYINT				NOT NULL DEFAULT 1	,		
	fecha_registro	DATE		NOT NULL DEFAULT GETDATE(),

	CONSTRAINT PK_cedula_cliente PRIMARY KEY(cedula),
	CONSTRAINT FK_cliente_persona FOREIGN KEY(cedula) REFERENCES persona(cedula)
	ON DELETE CASCADE
	ON UPDATE CASCADE
)


--Tabla asistencia_cliente
CREATE TABLE asistencia_cliente (
    id_sesion_programada INT NOT NULL,
    cedula CedulaRestringida NOT NULL,
    asistio BIT NULL DEFAULT NULL,
    CONSTRAINT PK_asistencia_cliente PRIMARY KEY (id_sesion_programada, cedula)
);
GO

--Tabla estado de clientes
CREATE TABLE estados_clientes(
	id_estado	TINYINT				NOT NULL,
	estado		VARCHAR(15)		    NOT NULL,
	CONSTRAINT PK_id_estado_estado_clientes PRIMARY KEY(id_estado)
)


--Tabla intermedia clientes_membresias
CREATE TABLE cliente_membresias(
	cedula			 CedulaRestringida	NOT NULL,
	id_membresia	INT					NOT NULL,
	vigente			BIT					NOT NULL DEFAULT 1
	CONSTRAINT PK_cliente_membresias PRIMARY KEY(cedula, id_membresia)
)


--Tabla de membresias
CREATE TABLE membresia(
	id_membresia		INT	IDENTITY(1,1)	NOT NULL,
	fecha_expiracion	DATE				,
	tipo				TINYINT				NOT NULL

	CONSTRAINT PK_id_membresia_membresia PRIMARY KEY(id_membresia)
)


--Tabla de los tipos de membresia
CREATE TABLE tipo_membresia(
	id_tipo_membresia		TINYINT				NOT NULL,
	tipo					VARCHAR(30)			NOT NULL,

	CONSTRAINT PK_id_tipo_tipo_membresia PRIMARY KEY(id_tipo_membresia)
)


--Tabla de formas de pago
CREATE TABLE formas_de_pago (
    id_forma_pago INT ,
    formaDePago VARCHAR(30) NOT NULL

	CONSTRAINT PK_id_forma_pago_formas_de_pago PRIMARY KEY(id_forma_pago)
);


--Tablas de pago
CREATE TABLE pagos (
    id_pago INT IDENTITY(1,1),
    fecha_pago DATE						NOT NULL,
    id_membresia INT					NOT NULL,
	cedula_cliente CedulaRestringida	NOT NULL,
    forma_pago INT						NOT NULL,
    monto INT							NOT NULL
	CONSTRAINT PK_id_pago_pagos PRIMARY KEY(id_pago)
);


-- Tabla estados de maquinas
CREATE TABLE estados_maquinas(
	id_estado TINYINT	NOT NULL,
	estado VARCHAR(20)	NOT NULL,
	CONSTRAINT PK_id_estado_estados_maquinas PRIMARY KEY(id_estado)
);


-- Tabla maquina
CREATE TABLE maquina(
	id_maquina	INT	IDENTITY(1,1)	NOT NULL,
	estado		TINYINT				NOT NULL,
	tipo		VARCHAR(50)			NOT NULL,
	modelo		VARCHAR(40)			NOT NULL,
	marca		VARCHAR(30)			NOT NULL,
	CONSTRAINT PK_maquina_id_maquina PRIMARY KEY(id_maquina)
);


-- Tabla intermedia admin_maquina
CREATE TABLE admin_maquina(
	cedula  CedulaRestringida	NOT NULL,
	id_maquina INT				NOT NULL,
	ultima_revision DATE		NOT NULL,
	cant_maquinas INT			,
	CONSTRAINT PK_admin_maquina PRIMARY KEY (cedula, id_maquina)
);


--Tabla clase
CREATE  TABLE clase(
	id_clase	INT	IDENTITY(1,1)	NOT NULL,
	nombre		VARCHAR(50)			NOT NULL,
	descripcion VARCHAR(200)		NOT NULL DEFAULT 'Sin descripción'

	CONSTRAINT PK_clase_id_clase PRIMARY KEY(id_clase)
)
GO


-- Tabla Grupo
CREATE TABLE grupo (
	numero_grupo		  TINYINT IDENTITY(1,1) NOT NULL,
	cupo_disponible		  TINYINT NOT NULL,
	cantidad_matriculados TINYINT NOT NULL DEFAULT 0,
	CONSTRAINT PK_grupo PRIMARY KEY (numero_grupo)
);
GO

-- Tabla horario
CREATE TABLE horario (
	id_horario INT IDENTITY(1,1) NOT NULL,
	dia VARCHAR(20) NOT NULL,
	hora_inicio TIME NOT NULL,
	hora_fin TIME NOT NULL,
	CONSTRAINT PK_horario PRIMARY KEY (id_horario)
);
GO

-- Tabla intermedia sesion
CREATE TABLE sesion (
    id_sesion INT		IDENTITY(1,1)	NOT NULL,
    numero_grupo TINYINT	NOT NULL,
    id_horario INT			NOT NULL,
    id_clase INT			NOT NULL

	CONSTRAINT PK_sesion_id_sesion PRIMARY KEY(id_sesion)
);

-- Tabla de sesion programada
CREATE TABLE sesion_programada (
    id_sesion_programada INT IDENTITY(1,1) NOT NULL,
    id_sesion INT			 NOT NULL,
    fecha DATE				 NOT NULL

	CONSTRAINT sesion_programada_id_sesion_programada PRIMARY KEY(id_sesion_programada)
);
GO


--Tabla de inscripciones a las sesiones programadas
CREATE TABLE inscripcion_sesion_programada (
  id_sesion_programada INT NOT NULL,
  cedula CedulaRestringida NOT NULL,
  fecha_inscripcion DATE NOT NULL DEFAULT GETDATE(),
  PRIMARY KEY (id_sesion_programada, cedula),
  CONSTRAINT FK_inscripcion_sesion_programada FOREIGN KEY (id_sesion_programada)
    REFERENCES sesion_programada(id_sesion_programada)
    ON DELETE CASCADE ON UPDATE CASCADE,
  CONSTRAINT FK_inscripcion_sesion_cliente FOREIGN KEY (cedula)
    REFERENCES cliente(cedula)
    ON DELETE CASCADE ON UPDATE CASCADE
);


--Tabla intermedia entrenador-sesion programada
CREATE TABLE entrenador_sesion_programada (
    id_sesion_programada INT NOT NULL,
    cedula_entrenador CedulaRestringida NOT NULL,
    CONSTRAINT PK_entrenador_sesion_programada PRIMARY KEY (id_sesion_programada),
    CONSTRAINT FK_entrenador_sesion FOREIGN KEY (id_sesion_programada) REFERENCES sesion_programada(id_sesion_programada)
        ON DELETE CASCADE ON UPDATE CASCADE,
    CONSTRAINT FK_entrenador_sesion_entrenador FOREIGN KEY (cedula_entrenador) REFERENCES entrenador(cedula)
        ON DELETE CASCADE ON UPDATE CASCADE
);

--Tabla de revisiones de maquina
CREATE TABLE revision_maquina (
    id_revision INT IDENTITY(1,1) PRIMARY KEY,
    id_maquina INT NOT NULL,
    cedula_admin CedulaRestringida NOT NULL,
    fecha_revision DATE NOT NULL DEFAULT GETDATE(),
    nuevo_estado TINYINT NOT NULL,
    observacion VARCHAR(300) NULL,
    CONSTRAINT FK_revision_maquina_maquina FOREIGN KEY (id_maquina) REFERENCES maquina(id_maquina),
    CONSTRAINT FK_revision_maquina_admin FOREIGN KEY (cedula_admin) REFERENCES administrador(cedula),
    CONSTRAINT FK_revision_maquina_estado FOREIGN KEY (nuevo_estado) REFERENCES estados_maquinas(id_estado)
);


-- Agregar las claves foraneas despues de crear todas las tablas

--Llaves foraneas que tienen que ver con persona
-- FK: distritos → cantones
ALTER TABLE distritos
ADD CONSTRAINT FK_canton_distritos FOREIGN KEY(canton) REFERENCES cantones(id_canton)
ON UPDATE CASCADE;
GO

-- FK: cantones → provincias
ALTER TABLE cantones
ADD CONSTRAINT FK_provincia_provincias FOREIGN KEY(provincia) REFERENCES provincias(id_provincia)
ON UPDATE CASCADE;
GO

-- FK: persona → distritos
ALTER TABLE persona
ADD CONSTRAINT FK_distrito_persona FOREIGN KEY(distrito)
REFERENCES distritos(id_distrito)
ON UPDATE CASCADE;
GO

-- FK: persona → generos
ALTER TABLE persona
ADD CONSTRAINT FK_genero_persona FOREIGN KEY(genero)
REFERENCES generos(id_genero)
ON UPDATE CASCADE;
GO


--Llaves foraneas que tienen que ver con cliente
-- FK: cliente->estado_clientes
ALTER TABLE cliente
ADD CONSTRAINT FK_estado_clientes_cliente FOREIGN KEY(estado)
REFERENCES estados_clientes(id_estado)
ON UPDATE CASCADE
GO

-- FK: cliente_membresias->cliente
ALTER TABLE cliente_membresias
ADD CONSTRAINT FK_cliente_membresias_cliente FOREIGN KEY(cedula)
REFERENCES cliente(cedula)
ON DELETE CASCADE
ON UPDATE CASCADE;
GO

-- FK: cliente_membresias->membresias
ALTER TABLE cliente_membresias
ADD CONSTRAINT FK_cliente_membresias_membresia FOREIGN KEY(id_membresia)
REFERENCES membresia(id_membresia)
ON DELETE CASCADE
ON UPDATE CASCADE;
GO


--FK: membresia->tipo_membresia
ALTER TABLE membresia
ADD CONSTRAINT FK_tipo_membresia FOREIGN KEY(tipo)
REFERENCES tipo_membresia(id_tipo_membresia)
GO



--Llaves foraneas que tienen que ver con administrador
-- FK: admin_maquina → administrador
ALTER TABLE admin_maquina
ADD CONSTRAINT FK_admin_maquina_administrador FOREIGN KEY (cedula)
REFERENCES administrador(cedula)
ON DELETE CASCADE
ON UPDATE CASCADE;
GO

-- FK: admin_maquina → maquina
ALTER TABLE admin_maquina
ADD CONSTRAINT FK_admin_maquina_maquina FOREIGN KEY (id_maquina)
REFERENCES maquina(id_maquina)
ON DELETE CASCADE
ON UPDATE CASCADE;
GO

-- FK: maquina → estados_maquinas
ALTER TABLE maquina
ADD CONSTRAINT FK_estado_estados FOREIGN KEY(estado)
REFERENCES estados_maquinas(id_estado);
GO




--Llaves foraneas que tienen que ver con clase y sesion
--FK: sesion->grupo
ALTER TABLE sesion
ADD CONSTRAINT FK_sesion_grupo FOREIGN KEY (numero_grupo)
REFERENCES grupo(numero_grupo)
ON DELETE CASCADE
ON UPDATE CASCADE
GO


--FK: sesion->horario
ALTER TABLE sesion
ADD CONSTRAINT FK_sesion_horario FOREIGN KEY (id_horario)
REFERENCES horario(id_horario)
ON DELETE CASCADE
ON UPDATE CASCADE
GO


--FK: sesion->clase
ALTER TABLE sesion
ADD CONSTRAINT FK_sesion_clase FOREIGN KEY (id_clase)
REFERENCES clase(id_clase)
ON DELETE CASCADE
ON UPDATE CASCADE
GO


--FK: sesion_programada -> sesion
ALTER TABLE sesion_programada
ADD CONSTRAINT FK_sesion_programada_sesion FOREIGN KEY (id_sesion)
    REFERENCES sesion(id_sesion) ON DELETE CASCADE ON UPDATE CASCADE;
GO

--FK: asistencia_cliente -> sesion_programada
ALTER TABLE asistencia_cliente
ADD CONSTRAINT FK_asistencia_programada FOREIGN KEY (id_sesion_programada)
REFERENCES sesion_programada(id_sesion_programada)
ON DELETE CASCADE
ON UPDATE CASCADE;


--FK: asistencia_cliente -> cliente
ALTER TABLE asistencia_cliente
ADD CONSTRAINT FK_asistencia_cliente FOREIGN KEY (cedula)
REFERENCES cliente(cedula) 
ON DELETE CASCADE
ON UPDATE CASCADE;
GO

--Llaves foraneas que tiene que ver con membresia y pago
--FK: pagos -> membresia
ALTER TABLE pagos
ADD CONSTRAINT FK_pago_membresia FOREIGN KEY (id_membresia)
REFERENCES membresia(id_membresia)
ON DELETE CASCADE
ON UPDATE CASCADE
GO

--FK: pagos -> forma_pago
ALTER TABLE pagos
ADD CONSTRAINT FK_pago_forma_pago FOREIGN KEY (forma_pago)
REFERENCES formas_de_pago(id_forma_pago)
ON DELETE CASCADE
ON UPDATE CASCADE
GO

--FK: pagos -> cliente
ALTER TABLE pagos
ADD CONSTRAINT FK_pago_cliente FOREIGN KEY (cedula_cliente)
REFERENCES cliente(cedula)
ON DELETE CASCADE
ON UPDATE CASCADE




--Checks para validaciones de datos
ALTER TABLE grupo
ADD CONSTRAINT CK_grupo_cupos CHECK (cantidad_matriculados <= cupo_disponible);



/*Creamos un indice NONCLUSTERED en la columna nombre, apellido1 y apellido2, ya que estas columnas
  son frecuentemente accedidas en muchos lados de la aplicacion

 Ya que solo se puede crear 1 CLUSTERED INDEX por tabla y en el caso de la tabla persona,
 ya existe la llave primaria cedula que automaticamente crea un CLUSTERED INDEX
 
 Por buenas practicas y para que el comportamiento de la tabla no dependa del estado
 previo de la tabla, se especifica que es NONCLUSTERED INDEX
*/
CREATE NONCLUSTERED INDEX idx_persona_nombre ON persona(nombre);
CREATE NONCLUSTERED INDEX idx_persona_apellido1 ON persona(apellido1);
CREATE NONCLUSTERED INDEX idx_persona_apellido2 ON persona(apellido2);


/*Trigger que determina automaticamente la fecha de expiracion de la membresia de acuerdo al tipo,
Tipo 1 → 'Mensual' → +30 días

Tipo 2 → 'Trimestral' → +90 días

Tipo 3 → 'Anual' → +365 días

Tipo 4 → 'Semestral' → +180 días

Tipo 5 → 'Diaria' → +1 día
*/
GO
CREATE OR ALTER TRIGGER trigger_set_fecha_expiracion_membresia
ON membresia
INSTEAD OF INSERT
AS
BEGIN
    SET NOCOUNT ON;

    IF EXISTS (
        SELECT 1
        FROM inserted
        WHERE tipo NOT IN (1, 2, 3, 4, 5)
    )
    BEGIN
        RAISERROR('Tipo de membresía inválido. Solo se permiten los valores 1-5.', 16, 1);
        RETURN;
    END

    INSERT INTO membresia (fecha_expiracion, tipo)
    SELECT 
        CASE tipo
            WHEN 1 THEN DATEADD(DAY, 30, GETDATE())
            WHEN 2 THEN DATEADD(DAY, 90, GETDATE())
            WHEN 3 THEN DATEADD(DAY, 365, GETDATE())
            WHEN 4 THEN DATEADD(DAY, 180, GETDATE())
            WHEN 5 THEN DATEADD(DAY, 1, GETDATE())
        END,
        tipo
    FROM inserted;
END;
GO


/*
Este trigger se ejecuta cada vez que se actualiza cualquier membresia, verificando 
si alguna membresia ya paso su fecha de expiracion (la fecha de hoy)
*/
CREATE OR ALTER TRIGGER trigger_actualizar_estado_cliente
ON cliente_membresias
AFTER INSERT, UPDATE, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    -- Primero, actualizar clientes que deben estar activos porque tienen membresia vigente
    UPDATE c
    SET c.estado = 1 -- activo
    FROM cliente c
    WHERE EXISTS (
        SELECT 1
        FROM cliente_membresias cm
        JOIN membresia m ON cm.id_membresia = m.id_membresia
        WHERE cm.cedula = c.cedula
          AND cm.vigente = 1
          AND m.fecha_expiracion >= CAST(GETDATE() AS DATE)
    )
    AND c.estado != 1;

    -- Luego, actualizar clientes que deben estar inactivos porque no tienen membresia vigente
    UPDATE c
    SET c.estado = 2 -- inactivo
    FROM cliente c
    WHERE NOT EXISTS (
        SELECT 1
        FROM cliente_membresias cm
        JOIN membresia m ON cm.id_membresia = m.id_membresia
        WHERE cm.cedula = c.cedula
          AND cm.vigente = 1
          AND m.fecha_expiracion >= CAST(GETDATE() AS DATE)
    )
    AND c.estado != 2;
END;
GO



/*Triiger que actualiza la cantidad total de maquinas que administra cada admin en la columna
cant_maquinas, garantizando que siempre este sincronizada.*/
CREATE OR ALTER TRIGGER trigger_recalcular_cant_maquinas_admin
ON admin_maquina
AFTER INSERT, DELETE
AS
BEGIN
    SET NOCOUNT ON;

    UPDATE am
    SET am.cant_maquinas = (
        SELECT COUNT(*) 
        FROM admin_maquina am2 
        WHERE am2.cedula = am.cedula
    )
    FROM admin_maquina am
    WHERE EXISTS (
        SELECT 1 
        FROM inserted i 
        WHERE i.cedula = am.cedula
        UNION
        SELECT 1 
        FROM deleted d 
        WHERE d.cedula = am.cedula
    );
END;
GO




--Inserciones de prueba a todas las tablas
-- Tabla provincias
INSERT INTO provincias (id_provincia, nombre_provincia) VALUES
(1, 'San José'), (2, 'Alajuela'), (3, 'Cartago'),
(4, 'Heredia'), (5, 'Puntarenas'), (6, 'Limón'),
(7, 'Guanacaste'), (8, 'San Rafael'), (9, 'Desamparados'), (10, 'Escazú');

-- Tabla cantones
INSERT INTO cantones (id_canton, provincia, nombre_canton) VALUES
(1,1,'Central'),(2,2,'San Carlos'),(3,3,'El Guarco'),
(4,4,'Belén'),(5,5,'Corredores'),(6,6,'Limón'),(7,7,'Liberia'),
(8,8,'San Rafael'),(9,9,'Desamparados'),(10,10,'Escazú');

-- Tabla distritos
INSERT INTO distritos (id_distrito, canton, nombre_distrito) VALUES
(1,1,'Carmen'),(2,2,'Quesada'),(3,3,'Tejar'),(4,4,'San Antonio'),
(5,5,'Paso Canoas'),(6,6,'Limón Centro'),(7,7,'Liberia Centro'),
(8,8,'Centro'),(9,9,'Desamparados Centro'),(10,10,'Escazú Centro');

-- Tabla generos
INSERT INTO generos (id_genero, genero) VALUES
(1,'Masculino'),(2,'Femenino');

-- Tabla persona
INSERT INTO persona (cedula, nombre, apellido1, apellido2, genero, distrito, correo, fecha_nacimiento, edad) VALUES
('414086906', 'Mónica', 'Soto', 'Campos', 2, 1, 'mónica1@gmail.com', '2002-01-05', 23),
('800308848', 'Lucía', 'Chinchilla', 'Gómez', 2, 10, 'lucía2@correo.com', '2000-11-03', 25),
('746841900', 'Tomás', 'Vargas', 'Castro', 1, 9, 'tomás3@gmail.com', '1999-09-30', 26),
('767402437', 'Paula', 'Rojas', 'Fernández', 1, 4, 'paula4@correo.com', '2008-05-01', 17),
('270735008', 'Ana', 'Campos', 'Chinchilla', 2, 8, 'ana5@example.com', '2006-03-21', 19),
('931161349', 'Tatiana', 'Castro', 'Alvarado', 2, 7, 'tatiana6@correo.com', '2004-12-28', 20),
('393040211', 'Javier', 'Chinchilla', 'Mora', 1, 3, 'javier7@example.com', '1996-10-30', 27),
('290719496', 'Lucía', 'Gómez', 'Vargas', 2, 6, 'lucía8@correo.com', '1998-09-25', 25),
('867978083', 'Luis', 'Alvarado', 'Campos', 1, 5, 'luis9@correo.com', '2003-05-01', 21),
('934827096', 'Emilio', 'Quesada', 'Gómez', 1, 2, 'emilio10@example.com', '1997-11-12', 26),
('681366395', 'Camila', 'Fernández', 'Chinchilla', 2, 1, 'camila11@correo.com', '1993-02-08', 31),
('281520804', 'Pedro', 'Chacón', 'Martínez', 1, 2, 'pedro12@example.com', '1990-08-20', 33),
('261935470', 'Sebastián', 'Gómez', 'Vargas', 1, 3, 'sebastián13@correo.com', '1991-09-10', 32),
('142192323', 'Gabriel', 'Pérez', 'Chinchilla', 1, 4, 'gabriel14@example.com', '1992-07-03', 31),
('569206408', 'Valeria', 'Mora', 'Campos', 2, 5, 'valeria15@gmail.com', '1995-05-15', 30),
('373450054', 'Andrea', 'Castro', 'Gómez', 2, 6, 'andrea16@correo.com', '2000-12-25', 24),
('198689770', 'Juan', 'Campos', 'Quesada', 1, 7, 'juan17@correo.com', '1999-10-14', 25),
('866266009', 'Laura', 'Ramírez', 'Chinchilla', 2, 8, 'laura18@gmail.com', '1998-11-11', 25),
('758085848', 'Isabel', 'Soto', 'Gómez', 2, 9, 'isabel19@correo.com', '1997-01-09', 27),
('920327174', 'Ricardo', 'Chacón', 'Soto', 1, 10, 'ricardo20@example.com', '1996-05-24', 28),
('264451244', 'Natalia', 'Castro', 'Mora', 2, 1, 'natalia21@correo.com', '2002-09-15', 22),
('227902729', 'María', 'Vargas', 'Alvarado', 2, 2, 'maría22@gmail.com', '2003-03-07', 21),
('273939798', 'Andrés', 'Gómez', 'Soto', 1, 3, 'andrés23@example.com', '1995-06-19', 28),
('209902497', 'Carlos', 'Fernández', 'Ramírez', 1, 4, 'carlos24@correo.com', '1993-04-01', 31),
('347260670', 'Diego', 'Campos', 'Martínez', 1, 5, 'diego25@correo.com', '1991-08-22', 32),
('586898512', 'Daniela', 'Gómez', 'Pérez', 2, 6, 'daniela26@example.com', '1999-07-07', 25),
('962000470', 'Esteban', 'Vargas', 'Chinchilla', 1, 7, 'esteban27@correo.com', '2000-10-30', 23),
('352890774', 'Elena', 'Quesada', 'Alvarado', 2, 8, 'elena28@example.com', '2004-06-14', 20),
('313189524', 'Fernando', 'Soto', 'Castro', 1, 9, 'fernando29@correo.com', '2002-11-08', 22),
('711248682', 'Tatiana', 'Ramírez', 'Mora', 2, 10, 'tatiana30@example.com', '2005-01-03', 19);


-- Tabla telefonos_personas
INSERT INTO telefonos_personas (cedula_persona, telefono) VALUES
(414086906, 69138025),
(800308848, 88122452),
(746841900, 44456033),
(767402437, 93412129),
(270735008, 30750417),
(931161349, 87109040),
(393040211, 23331464),
(290719496, 37959276),
(867978083, 71413782),
(934827096, 58514372),
(681366395, 38934314),
(281520804, 50430892),
(261935470, 79960784),
(142192323, 75799887),
(569206408, 76775504),
(373450054, 98648661),
(198689770, 40796733),
(866266009, 37061941),
(758085848, 68129577),
(920327174, 62319951),
(264451244, 71527865),
(227902729, 35321064),
(273939798, 43204296),
(209902497, 63615721),
(347260670, 40214986),
(586898512, 89037154),
(962000470, 39260361),
(352890774, 94309934),
(313189524, 53631283),
(711248682, 92295715);


-- Tabla entrenador
INSERT INTO entrenador (cedula, fecha_contratacion, tipo) VALUES
(373450054, '2025-01-01', 'Personal'),
(198689770, '2025-01-01', 'Personal'),
(866266009, '2025-01-01', 'General'),
(758085848, '2025-01-01', 'Funcional'),
(920327174, '2025-01-01', 'Personal');



-- Tabla administrador
INSERT INTO administrador (cedula, fecha_contratacion) VALUES
(264451244, '2025-01-01')


-- Tabla estados_clientes
INSERT INTO estados_clientes (id_estado, estado) VALUES
(1,'Activo'),(2,'Inactivo')

-- Tabla cliente
INSERT INTO cliente (cedula, estado, fecha_registro) VALUES
(414086906, 1, '2025-01-01'),
(800308848, 1, '2025-01-01'),
(746841900, 1, '2025-01-01'),
(767402437, 1, '2025-01-01'),
(270735008, 1, '2025-01-01'),
(931161349, 1, '2025-01-01'),
(393040211, 1, '2025-01-01'),
(290719496, 1, '2025-01-01'),
(867978083, 1, '2025-01-01'),
(934827096, 1, '2025-01-01'),
(681366395, 1, '2025-01-01'),
(281520804, 1, '2025-01-01'),
(261935470, 1, '2025-01-01'),
(142192323, 1, '2025-01-01'),
(569206408, 1, '2025-01-01');



-- Tabla tipo_membresia
INSERT INTO tipo_membresia (id_tipo_membresia, tipo) VALUES
(1,'Mensual'),(2,'Trimestral'),(3,'Anual'),
(4,'Semestral'),(5,'Diaria')

-- Tabla membresia
INSERT INTO membresia (tipo) VALUES
(1),
(2),
(3),
(4),
(5),
(2),
(4),
(5),
(1),
(2);


-- Tabla cliente_membresias
INSERT INTO cliente_membresias (cedula, id_membresia) VALUES
(414086906, 1),
(800308848, 2),
(746841900, 3),
(767402437, 4),
(270735008, 5),
(931161349, 6),
(393040211, 7),
(290719496, 8),
(867978083, 9)



-- Tabla clase
INSERT INTO clase (nombre, descripcion) VALUES
('Zumba','Ejercicio de baile'),
('Spinning','Bicicleta'),
('Yoga','Estiramiento'),
('Crossfit','Alta intensidad'),
('Pilates','Cuerpo y mente'),
('Boxeo','De contacto'),
('HIIT','Intervalos'),
('Funcional','Movimientos útiles'),
('Stretching','Flexibilidad'),
('TRX','Con suspensión');


-- Tabla estados_maquinas
INSERT INTO estados_maquinas (id_estado, estado) VALUES
(1,'Operativa'),(3,'Reparación'),
(2,'Mantenimiento'),(4,'Descompuesta');

-- Tabla maquina
INSERT INTO maquina (estado, tipo, modelo, marca) VALUES
(1,'Cardio','X1000','LifeFitness'),(2,'Fuerza','P3000','Technogym'),
(2,'Elíptica','E500','Precor'),(4,'Caminadora','RunFast','Matrix'),
(3,'Bicicleta','SpinPro','StarTrac'),(4,'Remo','R300','Concept2'),
(1,'Escaladora','E900','BH'),(4,'Prensa','LegMaster','Nautilus'),
(2,'Multipower','MPX','Reebok'),(4,'Hack','HX100','Sole');

-- Tabla admin_maquina
INSERT INTO admin_maquina (cedula, id_maquina,ultima_revision) VALUES
(264451244, 1, '2025-05-01'),
(264451244, 2, '2025-05-01'),
(264451244, 3, '2025-05-01'),
(264451244, 4, '2025-05-01'),
(264451244, 5, '2025-05-01'),
(264451244, 6, '2025-05-01'),
(264451244, 7, '2025-05-01'),
(264451244, 8, '2025-05-01'),
(264451244, 9, '2025-05-01'),
(264451244,10, '2025-05-01');

SELECT * FROM admin_maquina
-- Tabla grupo
INSERT INTO grupo (cupo_disponible, cantidad_matriculados) VALUES
(10,5), (15,12), (20,18), (8,7), (25,20),
(12,9), (16,15), (22,21), (10,10), (30,30);

-- Tabla horario
INSERT INTO horario (dia, hora_inicio, hora_fin) VALUES
('Lunes','08:00','09:00'),
('Martes','09:00','10:00'),
('Miércoles','10:00','11:00'),
('Jueves','11:00','12:00'),
('Viernes','12:00','13:00'),
('Sábado','13:00','14:00'),
('Domingo','14:00','15:00'),
('Lunes','15:00','16:00'),
('Martes','16:00','17:00'),
('Miércoles','17:00','18:00');



-- Tabla sesion
INSERT INTO sesion (numero_grupo, id_horario, id_clase) VALUES
(1, 1, 1),
(2, 2, 2),
(3, 3, 3),
(4, 4, 4),
(5, 5, 5),
(6, 6, 6),
(7, 7, 7),
(8, 8, 8),
(9, 9, 9),
(10, 10, 10);




-- Insertar sesiones programadas (relacionadas con las sesiones existentes)
INSERT INTO sesion_programada (id_sesion, fecha) VALUES
(1, '2025-06-01'),
(2, '2025-06-02'),
(3, '2025-06-03'),
(4, '2025-06-04'),
(5, '2025-06-05'),
(6, '2025-06-06'),
(7, '2025-06-07'),
(8, '2025-06-08'),
(9, '2025-06-09'),
(10, '2025-06-10');


INSERT INTO entrenador_sesion_programada (id_sesion_programada, cedula_entrenador)
VALUES 
(3, 866266009),
(6, 198689770), 
(9, 373450054), 
(10, 920327174); 




-- Insertar asistencias de los clientes según la clase asignada
INSERT INTO asistencia_cliente (id_sesion_programada, cedula) VALUES
(1, 414086906),
(2, 800308848),
(3, 746841900),
(4, 767402437),
(5, 270735008),
(6, 931161349),
(7, 393040211),
(8, 290719496),
(9, 867978083)



INSERT INTO formas_de_pago(id_forma_pago, formaDePago)VALUES
(1,'Tarjeta'),
(2,'Simpe'),
(3,'Efectivo')


INSERT INTO pagos (fecha_pago, id_membresia, cedula_cliente, forma_pago, monto) VALUES 
('2025-05-23', 1, 414086906, 1, 15000),
('2025-05-23', 2, 800308848, 2, 40000), 
('2025-05-23', 3, 746841900, 3, 120000),
('2025-05-23', 4, 767402437, 1, 80000), 
('2025-05-23', 5, 270735008, 2, 5000), 
('2025-05-23', 6, 931161349, 3, 35000), 
('2025-05-23', 7, 393040211, 1, 80000), 
('2025-05-23', 8, 290719496, 2, 5000), 
('2025-05-23', 9, 867978083, 1, 15000); 

-- Inscribir clientes a sesiones programadas ya existentes
INSERT INTO inscripcion_sesion_programada (id_sesion_programada, cedula) VALUES
(1, '414086906'),  
(2, '800308848'),  
(3, '746841900'),  
(4, '767402437'),  
(5, '270735008'),  
(6, '931161349'),  
(7, '393040211'),  
(8, '290719496'),  
(9, '867978083'), 
(10, '934827096'); 








SELECT * FROM pagos
SELECT * FROM provincias;
SELECT * FROM cantones;
SELECT * FROM distritos;
SELECT * FROM generos;
SELECT * FROM persona;
SELECT * FROM telefonos_personas;
SELECT * FROM entrenador;
SELECT * FROM administrador;
SELECT * FROM estados_clientes;
SELECT * FROM cliente;
SELECT * FROM tipo_membresia;
SELECT * FROM membresia;
SELECT * FROM cliente_membresias;
SELECT * FROM clase;
SELECT * FROM entrenador_sesion_programada
SELECT * FROM estados_maquinas;
SELECT * FROM maquina;
SELECT * FROM admin_maquina;
SELECT * FROM grupo;
SELECT * FROM horario;
SELECT * FROM sesion;
GO


--Vista de general de todos los clientes
CREATE OR ALTER VIEW vista_clientes AS
SELECT
    dc.nombre,
    dc.apellido1,
    dc.apellido2,
    dc.cedula,
    dc.correo,
    dc.telefono,
    dc.fecha_registro,
    dm.fecha_expiracion,
    dm.tipo_membresia,
    dc.estado_cliente
FROM
    (
        SELECT
            p.nombre,
            p.apellido1,
            p.apellido2,
            p.correo,
            c.cedula,
            tp.telefono,
            c.fecha_registro,
            ec.estado AS estado_cliente
        FROM cliente c
        JOIN persona p ON c.cedula = p.cedula
        JOIN telefonos_personas tp ON c.cedula = tp.cedula_persona
        JOIN estados_clientes ec ON c.estado = ec.id_estado
    ) AS dc
LEFT JOIN (
        SELECT
            cm.cedula,
            me.fecha_expiracion,
            tm.tipo AS tipo_membresia
        FROM cliente_membresias cm
        JOIN membresia me ON cm.id_membresia = me.id_membresia
        JOIN tipo_membresia tm ON me.tipo = tm.id_tipo_membresia
        WHERE cm.vigente = 1
    ) AS dm
    ON dc.cedula = dm.cedula;
GO

SELECT * FROM asistencia_cliente
GO
--Vista de sesion para ver el grupo,horario y la clase que el cliente debe asistir por medio de la tabla asistencia
CREATE OR ALTER VIEW vista_clientes_sesion AS
SELECT
	sp.id_sesion_programada,
	p.nombre + ' ' + p.apellido1 + ' ' + p.apellido2 AS nombre_cliente,
    p.cedula,
    c.nombre AS nombre_clase,
    g.numero_grupo,
	h.dia,
    sp.fecha AS fecha_sesion,
    h.hora_inicio,
    h.hora_fin,
    ent.nombre + ' ' + ent.apellido1 + ' ' + ent.apellido2 AS entrenador_asignado,
	ac.asistio
FROM inscripcion_sesion_programada isp
JOIN cliente cli ON cli.cedula = isp.cedula
JOIN persona p ON p.cedula = cli.cedula
JOIN sesion_programada sp ON isp.id_sesion_programada = sp.id_sesion_programada
JOIN sesion s ON sp.id_sesion = s.id_sesion
JOIN clase c ON s.id_clase = c.id_clase
JOIN grupo g ON s.numero_grupo = g.numero_grupo
JOIN horario h ON s.id_horario = h.id_horario
LEFT JOIN entrenador_sesion_programada esp ON esp.id_sesion_programada = sp.id_sesion_programada
LEFT JOIN persona ent ON esp.cedula_entrenador = ent.cedula
LEFT JOIN asistencia_cliente ac ON ac.cedula = p.cedula AND ac.id_sesion_programada = sp.id_sesion_programada

GO

SELECT * FROM vista_clientes_sesion
GO

--Vista para ver el historial de pagos de clientes
GO
CREATE OR ALTER VIEW vista_historial_pagos_clientes AS
SELECT
    pa.id_pago,
    p.cedula,
    p.nombre + ' ' + p.apellido1 + ' ' + p.apellido2 AS nombre_completo,
    tm.tipo AS tipo_membresia,
    pa.fecha_pago,
    pa.monto,
    fdp.formaDePago
FROM pagos pa
JOIN persona p ON pa.cedula_cliente = p.cedula
JOIN membresia m ON pa.id_membresia = m.id_membresia
JOIN tipo_membresia tm ON m.tipo = tm.id_tipo_membresia
JOIN formas_de_pago fdp ON pa.forma_pago = fdp.id_forma_pago;
GO


SELECT * 
FROM vista_historial_pagos_clientes
ORDER BY id_pago ASC;




GO
--Procedimiento almacenado transaccional para insertar un cliente
CREATE OR ALTER PROCEDURE insertar_cliente (
    @cedula CedulaRestringida,
    @nombre NombreYApellidosLimpios,
    @apellido1 NombreYApellidosLimpios,
    @apellido2 NombreYApellidosLimpios,
    @telefono TelefonoRestringido,
    @genero TINYINT,
    @distrito SMALLINT,
    @correo CorreoRestringido,
    @fecha_nacimiento DATE,
    @edad TINYINT
)
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validar que la persona no exista ya
        IF EXISTS (SELECT 1 FROM persona WHERE cedula = @cedula)
        BEGIN
            RAISERROR('El cliente ya existe en la base de datos.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Validar que el teléfono no esté ya registrado
        IF EXISTS (SELECT 1 FROM telefonos_personas WHERE telefono = @telefono)
        BEGIN
            RAISERROR('Este teléfono está registrado para otra persona.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Validar que el correo no esté registrado por otra persona
        IF EXISTS (SELECT 1 FROM persona WHERE correo = @correo)
        BEGIN
            RAISERROR('El correo ya está registrado por otra persona.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Validar que el distrito exista
        IF NOT EXISTS (SELECT 1 FROM distritos WHERE id_distrito = @distrito)
        BEGIN
            RAISERROR('El distrito indicado no existe.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Validar que el género exista
        IF NOT EXISTS (SELECT 1 FROM generos WHERE id_genero = @genero)
        BEGIN
            RAISERROR('El género indicado no existe.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Insertar en persona
        INSERT INTO persona (
            cedula, nombre, apellido1, apellido2,
            genero, distrito, correo,
            fecha_nacimiento, edad
        )
        VALUES (
            @cedula, @nombre, @apellido1, @apellido2,
            @genero, @distrito, @correo,
            @fecha_nacimiento, @edad
        );
        -- Insertar en cliente con estado activo (1)
        INSERT INTO cliente (cedula, estado)
        VALUES (@cedula, 2);

        -- Insertar el teléfono
        INSERT INTO telefonos_personas (cedula_persona, telefono)
        VALUES (@cedula, @telefono);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        DECLARE @mensaje_error NVARCHAR(4000) = ERROR_MESSAGE();

        IF XACT_STATE() != 0
            ROLLBACK TRANSACTION;

        RAISERROR(@mensaje_error, 16, 1);
    END CATCH
END;
GO




/*
Procedimiento almacenado transaccional para actualizar la informacion de una persona, en este caso
el correo y su telefono
*/
CREATE OR ALTER PROCEDURE actualizar_persona(
    @cedula CedulaRestringida,
    @correo CorreoRestringido,
    @telefono TelefonoRestringido
)
AS
BEGIN
	BEGIN TRY
		BEGIN TRANSACTION;

		-- Verificar existencia de la persona
		IF NOT EXISTS (
			SELECT 1 FROM persona WHERE cedula = @cedula
		)
		BEGIN
			RAISERROR('La persona no existe.', 16, 1);
			ROLLBACK TRANSACTION;
			RETURN;
		END

		-- Obtener valores actuales
		DECLARE @correo_actual VARCHAR(100)
		DECLARE @telefono_actual VARCHAR(20)

		SELECT @correo_actual = correo FROM persona WHERE cedula = @cedula;
		SELECT @telefono_actual = telefono FROM telefonos_personas WHERE cedula_persona = @cedula;

		-- Validar que al menos uno cambie
		IF (@correo_actual = @correo OR @correo IS NULL) AND (@telefono_actual = @telefono OR @telefono IS NULL)
		BEGIN
			RAISERROR('Debe modificar al menos el correo o el teléfono.', 16, 1);
			ROLLBACK TRANSACTION;
			RETURN;
		END

		-- Verificar correo no duplicado
		IF EXISTS (
			SELECT 1 FROM persona WHERE correo = @correo AND cedula <> @cedula
		)
		BEGIN
			RAISERROR('El correo ya está registrado por otra persona.', 16, 1);
			ROLLBACK TRANSACTION;
			RETURN;
		END

		-- Actualizar correo solo si cambia
		IF @correo_actual != @correo
		BEGIN
			UPDATE persona
			SET correo = @correo
			WHERE cedula = @cedula;
		END

		-- Actualizar o insertar telefono solo si cambia
		IF @telefono_actual != @telefono
		BEGIN
			IF @telefono_actual IS NOT NULL
			BEGIN
				UPDATE telefonos_personas
				SET telefono = @telefono
				WHERE cedula_persona = @cedula;
			END
			ELSE
			BEGIN
				INSERT INTO telefonos_personas (cedula_persona, telefono)
				VALUES (@cedula, @telefono);
			END
		END

		COMMIT TRANSACTION;
	END TRY

    BEGIN CATCH

        DECLARE @msg NVARCHAR(4000) = ERROR_MESSAGE();

        IF XACT_STATE() != 0 ROLLBACK TRANSACTION;
        RAISERROR(@msg, 16, 1);

    END CATCH
END;
GO



--Procedimiento almacenado transaccional para eliminar una persona, como ya la tabla persona tiene
--ON DELETE CASCADE, solo hace falta hacer validaciones para borrar a la persona de la base de datos
CREATE PROCEDURE eliminar_persona(
	@cedula CedulaRestringida
)
AS
BEGIN

	BEGIN TRY
		BEGIN TRANSACTION
			IF NOT EXISTS(
			SELECT 1 FROM persona WHERE cedula = @cedula
			)
			BEGIN
				RAISERROR('La persona no existe en la base de datos',16,1)
				ROLLBACK TRANSACTION;
				RETURN;
			END

		DELETE FROM persona WHERE cedula = @cedula
		COMMIT TRANSACTION;
	END TRY

	BEGIN CATCH
		DECLARE @mensaje_error NVARCHAR(4000) = ERROR_MESSAGE();

		IF XACT_STATE() != 0
			BEGIN
			ROLLBACK TRANSACTION
			END

		RAISERROR(@mensaje_error, 16, 1);
	END CATCH
END;
GO

SELECT * FROM sesion
SELECT * FROM sesion_programada
SELECT * FROM clase

GO


SELECT * FROM clase
GO
--Procedimiento almacenado transaccional para crear una clase 
CREATE OR ALTER PROCEDURE crear_clase (
    @nombre_clase VARCHAR(50),
    @descripcion VARCHAR(200),
    @cupo_disponible TINYINT,
    @dia VARCHAR(20),
    @hora_inicio TIME,
    @hora_fin TIME
)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validación: hora inicio < hora fin
        IF @hora_inicio >= @hora_fin
        BEGIN
            RAISERROR('La hora de inicio debe ser menor que la hora de fin.', 16, 1);
            ROLLBACK;
            RETURN;
        END

        -- 1. Insertar la clase y obtener ID generado automaticamente
        INSERT INTO clase (nombre, descripcion)
        VALUES (@nombre_clase, @descripcion);
        DECLARE @nuevo_id_clase INT = SCOPE_IDENTITY();

        -- 2. Insertar el horario y obtener ID generado
        INSERT INTO horario (dia, hora_inicio, hora_fin)
        VALUES (@dia, @hora_inicio, @hora_fin);
        DECLARE @nuevo_id_horario INT = SCOPE_IDENTITY();

        -- 3. Insertar el grupo y obtener ID generado
        INSERT INTO grupo (cupo_disponible, cantidad_matriculados)
        VALUES (@cupo_disponible, 0);
        DECLARE @nuevo_num_grupo TINYINT = SCOPE_IDENTITY();

        -- 4. Crear la sesion con todos los IDs relacionados
        INSERT INTO sesion (numero_grupo, id_horario, id_clase)
        VALUES (@nuevo_num_grupo, @nuevo_id_horario, @nuevo_id_clase);

        COMMIT;
    END TRY
    BEGIN CATCH
        DECLARE @err NVARCHAR(4000) = ERROR_MESSAGE();
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        RAISERROR(@err, 16, 1);
    END CATCH
END;
GO


SELECT * FROM clase

GO



GO
--Procedimiento almacenado para programar una sesion de una clase, enlazando las tablas de sesion y
--sesion programada
CREATE OR ALTER PROCEDURE crear_sesion_programada (
    @id_sesion INT,
    @fecha DATE
)
AS
BEGIN
    SET NOCOUNT ON;

    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validar que la sesión exista
        IF NOT EXISTS (SELECT 1 FROM sesion WHERE id_sesion = @id_sesion)
        BEGIN
            RAISERROR('La sesión especificada no existe.', 16, 1);
            ROLLBACK;
            RETURN;
        END

        -- Validar que la fecha no sea en el pasado
        IF @fecha < CAST(GETDATE() AS DATE)
        BEGIN
            RAISERROR('No se pueden programar sesiones en el pasado.', 16, 1);
            ROLLBACK;
            RETURN;
        END

        -- Validar que no se haya programado ya esa sesion en esa fecha
        IF EXISTS (
            SELECT 1
            FROM sesion_programada
            WHERE id_sesion = @id_sesion AND fecha = @fecha
        )
        BEGIN
            RAISERROR('Ya existe una sesion programada en esa fecha para esta sesion.', 16, 1);
            ROLLBACK;
            RETURN;
        END

        -- Insertar la sesión programada
        INSERT INTO sesion_programada (id_sesion, fecha)
        VALUES (@id_sesion, @fecha);

        COMMIT;
    END TRY
    BEGIN CATCH
        DECLARE @err NVARCHAR(4000) = ERROR_MESSAGE();
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        RAISERROR(@err, 16, 1);
    END CATCH
END;
GO




SELECT * FROM sesion_programada
GO
--Procedimiento almacenado transaccional para inscribir un cliente a una clase
CREATE OR ALTER PROCEDURE inscribir_cliente_a_sesion_programada (
    @cedula CedulaRestringida,
    @id_sesion_programada INT
)
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validar cliente
        IF NOT EXISTS (SELECT 1 FROM cliente WHERE cedula = @cedula)
        BEGIN
            RAISERROR('Cliente no existe.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Validar sesión programada
        IF NOT EXISTS (SELECT 1 FROM sesion_programada WHERE id_sesion_programada = @id_sesion_programada)
        BEGIN
            RAISERROR('Sesión programada no existe.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Validar si el cliente ya se inscribió
        IF EXISTS (SELECT 1 FROM inscripcion_sesion_programada WHERE cedula = @cedula AND id_sesion_programada = @id_sesion_programada)
        BEGIN
            RAISERROR('El cliente ya está inscrito en esta sesión.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Validar que el grupo no esté lleno
        DECLARE @grupo TINYINT, @cupo INT, @matriculados INT;
        SELECT @grupo = s.numero_grupo
        FROM sesion_programada sp
        JOIN sesion s ON sp.id_sesion = s.id_sesion
        WHERE sp.id_sesion_programada = @id_sesion_programada;

        SELECT 
            @cupo = cupo_disponible, 
            @matriculados = cantidad_matriculados
        FROM grupo
        WHERE numero_grupo = @grupo;

        IF @matriculados >= @cupo
        BEGIN
            RAISERROR('El grupo ya está lleno.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Inscribir cliente
        INSERT INTO inscripcion_sesion_programada (id_sesion_programada, cedula)
        VALUES (@id_sesion_programada, @cedula);

        -- Aumentar contador
        UPDATE grupo
        SET cantidad_matriculados = cantidad_matriculados + 1
        WHERE numero_grupo = @grupo;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        DECLARE @err NVARCHAR(4000) = ERROR_MESSAGE();
        IF XACT_STATE() != 0 
		ROLLBACK TRANSACTION;
        RAISERROR(@err, 16, 1);
    END CATCH
END;


GO

--Procedimiento almacenado transaccional para registrar la asistencia de una clase programada
CREATE OR ALTER PROCEDURE registrar_asistencia_cliente (
    @cedula CedulaRestringida,
    @id_sesion_programada INT,
    @asistio BIT
)
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validar existencia del cliente
        IF NOT EXISTS (
            SELECT 1 FROM cliente WHERE cedula = @cedula
        )
        BEGIN
            RAISERROR('Cliente no existe.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Validar existencia de la sesión programada
        IF NOT EXISTS (
            SELECT 1 FROM sesion_programada WHERE id_sesion_programada = @id_sesion_programada
        )
        BEGIN
            RAISERROR('Sesión programada no existe.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Validar que el cliente esté inscrito en la sesión
        IF NOT EXISTS (
            SELECT 1
            FROM inscripcion_sesion_programada
            WHERE cedula = @cedula AND id_sesion_programada = @id_sesion_programada
        )
        BEGIN
            RAISERROR('El cliente no está inscrito en esta sesión programada.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Si ya existe una fila pero asistio es NULL => actualizar
        IF EXISTS (
            SELECT 1
            FROM asistencia_cliente
            WHERE cedula = @cedula AND id_sesion_programada = @id_sesion_programada AND asistio IS NULL
        )
        BEGIN
            UPDATE asistencia_cliente
            SET asistio = @asistio
            WHERE cedula = @cedula AND id_sesion_programada = @id_sesion_programada;

            COMMIT TRANSACTION;
            RETURN;
        END

        -- Si ya hay registro y asistio no es NULL, bloquear doble registro
        IF EXISTS (
            SELECT 1
            FROM asistencia_cliente
            WHERE cedula = @cedula AND id_sesion_programada = @id_sesion_programada AND asistio IS NOT NULL
        )
        BEGIN
            RAISERROR('Asistencia ya fue registrada.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Si no hay registro, insertar
        INSERT INTO asistencia_cliente (cedula, id_sesion_programada, asistio)
        VALUES (@cedula, @id_sesion_programada, @asistio);

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        DECLARE @err NVARCHAR(4000) = ERROR_MESSAGE();
        IF XACT_STATE() != 0 
            ROLLBACK TRANSACTION;
        RAISERROR(@err, 16, 1);
    END CATCH
END;
GO

GO

--Procedimiento almacenado transaccional para asignar un entrenador a una sesion programada
CREATE OR ALTER PROCEDURE asignar_entrenador_a_sesion_programada (
    @cedula_entrenador CedulaRestringida,
    @id_sesion_programada INT
)
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validar que la sesión programada exista
        IF NOT EXISTS (
            SELECT 1 FROM sesion_programada
            WHERE id_sesion_programada = @id_sesion_programada
        )
        BEGIN
            RAISERROR('❌ La sesión programada indicada no existe.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Validar que el entrenador exista
        IF NOT EXISTS (
            SELECT 1 FROM entrenador
            WHERE cedula = @cedula_entrenador
        )
        BEGIN
            RAISERROR('El entrenador indicado no existe.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Validar que no haya ya un entrenador asignado a esta sesión
        IF EXISTS (
            SELECT 1 FROM entrenador_sesion_programada
            WHERE id_sesion_programada = @id_sesion_programada
        )
        BEGIN
            RAISERROR('Ya hay un entrenador asignado a esta sesión programada.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Asignar el entrenador
        INSERT INTO entrenador_sesion_programada (
            id_sesion_programada,
            cedula_entrenador
        )
        VALUES (
            @id_sesion_programada,
            @cedula_entrenador
        );

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        DECLARE @err NVARCHAR(4000) = ERROR_MESSAGE();

        IF XACT_STATE() <> 0
            ROLLBACK TRANSACTION;

        RAISERROR(@err, 16, 1);
    END CATCH
END;
GO




SELECT * FROM entrenador
GO
--Procedimiento almacenado transaccional para registrar el pago de membresia a un cliente
CREATE OR ALTER PROCEDURE registrar_pago_membresia (
    @cedula_cliente CedulaRestringida,
    @tipo_membresia TINYINT,
    @monto DECIMAL(10,2),
    @fecha_pago DATE,
    @id_forma_pago INT
)
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validaciones
        IF NOT EXISTS (SELECT 1 FROM cliente WHERE cedula = @cedula_cliente)
        BEGIN
            RAISERROR('Cliente no existe.', 16, 1);
            ROLLBACK;
            RETURN;
        END

        IF NOT EXISTS (SELECT 1 FROM formas_de_pago WHERE id_forma_pago = @id_forma_pago)
        BEGIN
            RAISERROR('Forma de pago no válida.', 16, 1);
            ROLLBACK;
            RETURN;
        END

        IF NOT EXISTS (SELECT 1 FROM tipo_membresia WHERE id_tipo_membresia = @tipo_membresia)
        BEGIN
            RAISERROR('Tipo de membresía inválido.', 16, 1);
            ROLLBACK;
            RETURN;
        END

        -- Desactivar vigentes
        UPDATE cliente_membresias
        SET vigente = 0
        WHERE cedula = @cedula_cliente;

        -- Insertar nueva membresia (el trigger la configura)
        DECLARE @id_membresia INT;
        INSERT INTO membresia (tipo) VALUES (@tipo_membresia);
        SELECT TOP 1 @id_membresia = id_membresia FROM membresia ORDER BY id_membresia DESC;

        INSERT INTO cliente_membresias (cedula, id_membresia, vigente)
        VALUES (@cedula_cliente, @id_membresia, 1);

        INSERT INTO pagos (fecha_pago, id_membresia, cedula_cliente, forma_pago, monto)
        VALUES (@fecha_pago, @id_membresia, @cedula_cliente, @id_forma_pago, @monto);

        COMMIT;
    END TRY
    BEGIN CATCH
       DECLARE @err NVARCHAR(4000) = ERROR_MESSAGE();
        IF XACT_STATE() != 0 
		ROLLBACK TRANSACTION;
        RAISERROR(@err, 16, 1);
    END CATCH
END;
GO


--Procedimiento almacenado transaccional para actualizar la membresia de un cliente
CREATE OR ALTER PROCEDURE actualizar_membresia_cliente (
    @cedula_cliente CedulaRestringida,
    @tipo_membresia TINYINT,
    @monto DECIMAL(10,2),
    @fecha_pago DATE,
    @id_forma_pago INT
)
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validaciones
        IF NOT EXISTS (SELECT 1 FROM cliente WHERE cedula = @cedula_cliente)
        BEGIN
            RAISERROR('Cliente no existe.', 16, 1);
            ROLLBACK;
            RETURN;
        END

        IF NOT EXISTS (SELECT 1 FROM formas_de_pago WHERE id_forma_pago = @id_forma_pago)
        BEGIN
            RAISERROR('Forma de pago no válida.', 16, 1);
            ROLLBACK;
            RETURN;
        END

        IF NOT EXISTS (SELECT 1 FROM tipo_membresia WHERE id_tipo_membresia = @tipo_membresia)
        BEGIN
            RAISERROR('Tipo de membresía inválido.', 16, 1);
            ROLLBACK;
            RETURN;
        END

        DECLARE @id_membresia INT;

        SELECT TOP 1 @id_membresia = m.id_membresia
        FROM cliente_membresias cm
        JOIN membresia m ON cm.id_membresia = m.id_membresia
        WHERE cm.cedula = @cedula_cliente AND m.tipo = @tipo_membresia
        ORDER BY m.fecha_expiracion DESC;

        IF @id_membresia IS NULL
        BEGIN
            RAISERROR('No existe membresía previa de ese tipo para el cliente.', 16, 1);
            ROLLBACK;
            RETURN;
        END

        -- Actualizar vigencia
        UPDATE cliente_membresias
        SET vigente = CASE 
            WHEN id_membresia = @id_membresia THEN 1 ELSE 0
        END
        WHERE cedula = @cedula_cliente;

        -- Registrar pago
        INSERT INTO pagos (fecha_pago, id_membresia, cedula_cliente, forma_pago, monto)
        VALUES (@fecha_pago, @id_membresia, @cedula_cliente, @id_forma_pago, @monto);

        COMMIT;
    END TRY
    BEGIN CATCH
	DECLARE @err NVARCHAR(4000) = ERROR_MESSAGE();
        IF XACT_STATE() != 0 
		ROLLBACK TRANSACTION;
        RAISERROR(@err, 16, 1);

    END CATCH
END;
GO





GO
--Procedimiento almacenado para renovar la membresia de un cliente
CREATE OR ALTER PROCEDURE renovar_membresia(
	@cedula CedulaRestringida,
    @monto DECIMAL(10,2),
    @id_forma_pago INT
)
AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION;

		-- Validar existencia del cliente
		IF NOT EXISTS (
			SELECT 1 FROM cliente WHERE cedula = @cedula
		)
		BEGIN
			RAISERROR('El cliente no existe.', 16, 1);
			ROLLBACK TRANSACTION;
			RETURN;
		END

		-- Validar membresía activa
		IF NOT EXISTS (
			SELECT 1 FROM cliente_membresias WHERE cedula = @cedula
		)
		BEGIN
			RAISERROR('El cliente no tiene una membresía activa.', 16, 1);
			ROLLBACK TRANSACTION;
			RETURN;
		END

        -- Validar forma de pago
        IF NOT EXISTS (
            SELECT 1 FROM formas_de_pago WHERE id_forma_pago = @id_forma_pago
        )
        BEGIN
            RAISERROR('La forma de pago no es válida.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

		-- Obtener membresía actual
		DECLARE @id_membresia INT, @tipo TINYINT;
		SELECT 
			@id_membresia = cm.id_membresia,
			@tipo = m.tipo
		FROM cliente_membresias cm
		JOIN membresia m ON cm.id_membresia = m.id_membresia
		WHERE cm.cedula = @cedula;

		-- Calcular nueva fecha de expiración
		DECLARE @nueva_fecha DATE;
		SELECT @nueva_fecha =
			CASE @tipo
				WHEN 1 THEN DATEADD(DAY, 30, GETDATE())
				WHEN 2 THEN DATEADD(DAY, 90, GETDATE())
				WHEN 3 THEN DATEADD(DAY, 365, GETDATE())
				WHEN 4 THEN DATEADD(DAY, 180, GETDATE())
				WHEN 5 THEN DATEADD(DAY, 1, GETDATE())
				ELSE NULL
			END;

		IF @nueva_fecha IS NULL
		BEGIN
			RAISERROR('Tipo de membresía no válido para renovación.', 16, 1);
			ROLLBACK TRANSACTION;
			RETURN;
		END

		-- Actualizar la fecha de expiración
		UPDATE membresia
		SET fecha_expiracion = @nueva_fecha
		WHERE id_membresia = @id_membresia;

		-- Insertar pago asociado
		INSERT INTO pagos (
			fecha_pago,
			id_membresia,
			cedula_cliente,
			forma_pago,
			monto
		)
		VALUES (
			GETDATE(),
			@id_membresia,
			@cedula,
			@id_forma_pago,
			@monto
		);

		COMMIT TRANSACTION;
	END TRY
	BEGIN CATCH
		DECLARE @error NVARCHAR(4000) = ERROR_MESSAGE();
		IF XACT_STATE() != 0 
		ROLLBACK TRANSACTION;
		RAISERROR(@error, 16, 1);
	END CATCH
END;
GO


--Procedimiento almacenado transaccional para obtener estadisticas del gym
CREATE OR ALTER PROCEDURE obtener_estadisticas_por_fecha
    @fecha DATE
AS
BEGIN
    SET NOCOUNT ON;

    -- Validación: la fecha no puede ser mayor a hoy
    IF @fecha > CAST(GETDATE() AS DATE)
    BEGIN
        RAISERROR('La fecha no puede ser mayor a la fecha actual.', 16, 1)
        RETURN;
    END

    SELECT
        (SELECT COUNT(*) 
         FROM cliente 
         WHERE CAST(fecha_registro AS DATE) <= @fecha) AS total_clientes,

        (SELECT COUNT(*) 
         FROM entrenador 
         WHERE CAST(fecha_contratacion AS DATE) <= @fecha) AS total_entrenadores,

        (SELECT COUNT(*) 
         FROM clase) AS total_clases,

        -- ✅ Solo sesiones que AÚN NO han pasado (>= hoy)
        (SELECT COUNT(*) 
         FROM sesion_programada 
         WHERE CAST(fecha AS DATE) >= CAST(GETDATE() AS DATE)) AS sesiones_pendientes,

        (SELECT ISNULL(SUM(monto), 0) 
         FROM pagos 
         WHERE CAST(fecha_pago AS DATE) <= @fecha) AS total_pagos,

        (SELECT COUNT(*) 
         FROM maquina) AS total_maquinas;
END;
GO


EXEC obtener_estadisticas_por_fecha '2025-05-23';

GO


GO



--Consulta avanzada 1: Ranking de clientes por numero de clases inscritas de manera descendente
SELECT 
    p.cedula,
    p.nombre + ' ' + p.apellido1 + ' ' + p.apellido2 AS nombre_completo,
    COUNT(DISTINCT c.id_clase) AS total_clases,
    RANK() OVER (ORDER BY COUNT(DISTINCT c.id_clase) DESC) AS posicion
FROM inscripcion_sesion_programada isp
JOIN sesion_programada sp ON isp.id_sesion_programada = sp.id_sesion_programada
JOIN sesion s ON sp.id_sesion = s.id_sesion
JOIN clase c ON s.id_clase = c.id_clase
JOIN persona p ON isp.cedula = p.cedula
GROUP BY p.cedula, p.nombre, p.apellido1, p.apellido2;



--Consulta avanzada 2: Clientes que tienen membresia proxima a vencer
SELECT 
    p.cedula,
    p.nombre + ' ' + p.apellido1 + ' ' + p.apellido2 AS nombre_completo,
    m.fecha_expiracion,
    DATEDIFF(DAY, GETDATE(), m.fecha_expiracion) AS dias_restantes
FROM cliente_membresias cm
JOIN membresia m ON cm.id_membresia = m.id_membresia
JOIN persona p ON cm.cedula = p.cedula
WHERE 
    m.fecha_expiracion >= CAST(GETDATE() AS DATE)
    AND m.fecha_expiracion < DATEADD(DAY, 7, CAST(GETDATE() AS DATE));




SELECT * FROM sesion_programada

--Consulta avanzada 3: Promedio de matriculados por grupo y detección de sobrecupo
SELECT 
    numero_grupo,
    cupo_disponible,
    cantidad_matriculados,
    CASE 
        WHEN cantidad_matriculados > cupo_disponible THEN 'Sobrecupo'
        WHEN cantidad_matriculados = cupo_disponible THEN 'Lleno'
        ELSE 'Disponible'
    END AS estado
FROM grupo;


--Consulta avanzada 4: distribucion de genero por estado de clientes 
SELECT 
    ec.estado,
    SUM(CASE WHEN g.genero = 'Masculino' THEN 1 ELSE 0 END) AS hombres,
    SUM(CASE WHEN g.genero = 'Femenino' THEN 1 ELSE 0 END) AS mujeres,
    COUNT(*) AS total
FROM inscripcion_sesion_programada ic
JOIN cliente c ON ic.cedula = c.cedula
JOIN persona p ON c.cedula = p.cedula
JOIN generos g ON p.genero = g.id_genero
JOIN estados_clientes ec ON c.estado = ec.id_estado
GROUP BY ec.estado;

select * from inscripcion_sesion_programada






--Consulta avanzada 5: Cuenta la cantidades de sesiones por mes
SELECT 
    c.nombre AS clase,
    DATENAME(MONTH, sp.fecha) + ' ' + CAST(YEAR(sp.fecha) AS VARCHAR) AS mes,
    COUNT(*) AS total_sesiones_en_mes
FROM sesion s
JOIN clase c ON s.id_clase = c.id_clase
JOIN sesion_programada sp ON s.id_sesion = sp.id_sesion
GROUP BY c.nombre, DATENAME(MONTH, sp.fecha), YEAR(sp.fecha)
ORDER BY mes DESC

GO




GO
--Vista de sesiones programadas
CREATE OR ALTER VIEW vista_detalles_sesion_programadas AS
SELECT
    sp.id_sesion_programada,
    s.id_sesion,
    c.nombre AS nombre_clase,
    c.descripcion AS descripcion_clase,
    g.numero_grupo,
    h.dia,
    h.hora_inicio,
    h.hora_fin
FROM sesion_programada sp
JOIN sesion s ON s.id_sesion = sp.id_sesion
JOIN clase c ON c.id_clase = s.id_clase
JOIN grupo g ON g.numero_grupo = s.numero_grupo
JOIN horario h ON h.id_horario = s.id_horario;
GO

SELECT * FROM vista_clientes_sesion

GO



--Vista para ver el total de sesiones creadas por clase
CREATE OR ALTER VIEW vista_total_clases_por_sesion AS
SELECT 
    c.id_clase,
    c.nombre,
    c.descripcion,
    COUNT(sp.id_sesion_programada) AS total_sesiones
FROM clase c
LEFT JOIN sesion s ON c.id_clase = s.id_clase
LEFT JOIN sesion_programada sp ON s.id_sesion = sp.id_sesion
GROUP BY c.id_clase, c.nombre, c.descripcion;



GO
--vista general de admin maquina, para ver datos de todas las maquinas y admins
CREATE OR ALTER VIEW vista_admin_maquina AS
SELECT
    am.cedula AS cedula_admin,
    p.nombre + ' ' + p.apellido1 + ' ' + p.apellido2 AS nombre_admin,
    m.id_maquina,
    m.tipo,
    m.modelo,
    m.marca,
    em.estado,
    am.ultima_revision,
    am.cant_maquinas
FROM maquina m
LEFT JOIN admin_maquina am ON m.id_maquina = am.id_maquina
LEFT JOIN persona p ON am.cedula = p.cedula
JOIN estados_maquinas em ON m.estado = em.id_estado;
GO

SELECT * FROM vista_admin_maquina



GO
--Procedimiento almacenado para agregar una nueva maquina al inventario
CREATE OR ALTER PROCEDURE agregar_maquina(
	@estado TINYINT,
	@tipo   VARCHAR(50),
	@modelo VARCHAR(40),
	@marca  VARCHAR(30)
)
AS
BEGIN
	SET NOCOUNT ON;

	BEGIN TRY
		BEGIN TRANSACTION;

		-- Validar existencia del estado
		IF NOT EXISTS (
			SELECT 1 FROM estados_maquinas WHERE id_estado = @estado
		)
		BEGIN
			RAISERROR('El estado especificado no existe.', 16, 1);
			ROLLBACK TRANSACTION;
			RETURN;
		END

		-- Insertar nueva maquina
		INSERT INTO maquina (estado, tipo, modelo, marca)
		VALUES (@estado, @tipo, @modelo, @marca);

		COMMIT TRANSACTION;
	END TRY

	BEGIN CATCH
		DECLARE @error NVARCHAR(4000) = ERROR_MESSAGE();

		IF XACT_STATE() != 0
			ROLLBACK TRANSACTION;

		RAISERROR(@error, 16, 1);
	END CATCH
END;
GO




GO
--Vista de sesiones programadas sin entrenador asignado
CREATE VIEW vista_sesiones_sin_entrenador
AS
SELECT 
  sp.id_sesion_programada,
  c.nombre AS nombre_clase,
  g.numero_grupo,
  h.hora_inicio,
  h.hora_fin,
  sp.fecha
FROM sesion_programada sp
JOIN sesion s ON sp.id_sesion = s.id_sesion
JOIN clase c ON s.id_clase = c.id_clase
JOIN grupo g ON s.numero_grupo = g.numero_grupo
JOIN horario h ON s.id_horario = h.id_horario
LEFT JOIN entrenador_sesion_programada esp ON esp.id_sesion_programada = sp.id_sesion_programada
WHERE esp.id_sesion_programada IS NULL 
GO

SELECT * FROM vista_sesiones_sin_entrenador

SELECT * FROM vista_sesiones_sin_entrenador


GO
--Vista para ver la cantidad de sesiones totales por entrenador
CREATE OR ALTER VIEW vista_entrenador_sesiones_totales
AS
SELECT
    esp.cedula_entrenador,
    p.nombre + ' ' + p.apellido1 + ' ' + p.apellido2 AS nombreEntrenador,
    COUNT(*) AS cantidad_sesiones
FROM entrenador_sesion_programada esp
JOIN persona p 
    ON esp.cedula_entrenador = p.cedula
GROUP BY esp.cedula_entrenador, p.nombre, p.apellido1, p.apellido2
GO
SELECT * FROM vista_entrenador_sesiones_totales
ORDER BY cantidad_sesiones DESC;


SELECT * FROM maquina

SELECT * FROM estados_maquinas

GO

--Procedimiento almacenado transaccional para revisicion de maquinas
CREATE OR ALTER PROCEDURE revisar_maquina(
    @id_maquina INT,
    @cedula_admin CedulaRestringida,
    @nuevo_estado TINYINT,
    @observacion VARCHAR(300)
)
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validar existencia de la máquina
        IF NOT EXISTS (
            SELECT 1 FROM maquina WHERE id_maquina = @id_maquina
        )
        BEGIN
            RAISERROR('La máquina no existe.', 16, 1);
            ROLLBACK; RETURN;
        END

        -- Validar existencia del estado
        IF NOT EXISTS (
            SELECT 1 FROM estados_maquinas WHERE id_estado = @nuevo_estado
        )
        BEGIN
            RAISERROR('Estado no válido.', 16, 1);
            ROLLBACK; RETURN;
        END

        -- Validar existencia del administrador
        IF NOT EXISTS (
            SELECT 1 FROM administrador WHERE cedula = @cedula_admin
        )
        BEGIN
            RAISERROR('El administrador no existe.', 16, 1);
            ROLLBACK; RETURN;
        END

        -- Insertar la revisión
        INSERT INTO revision_maquina (id_maquina, cedula_admin, nuevo_estado, observacion)
        VALUES (@id_maquina, @cedula_admin, @nuevo_estado, @observacion);

        -- Actualizar estado de la máquina
        UPDATE maquina
        SET estado = @nuevo_estado
        WHERE id_maquina = @id_maquina;

        -- Insertar o actualizar admin_maquina
        IF NOT EXISTS (
            SELECT 1 FROM admin_maquina
            WHERE id_maquina = @id_maquina AND cedula = @cedula_admin
        )
        BEGIN
            INSERT INTO admin_maquina (cedula, id_maquina, ultima_revision)
            VALUES (@cedula_admin, @id_maquina, GETDATE());
        END
        ELSE
        BEGIN
            UPDATE admin_maquina
            SET ultima_revision = GETDATE()
            WHERE id_maquina = @id_maquina AND cedula = @cedula_admin;
        END

        COMMIT;
    END TRY
    BEGIN CATCH
        DECLARE @error NVARCHAR(4000) = ERROR_MESSAGE();
        IF XACT_STATE() != 0
            ROLLBACK;
        RAISERROR(@error, 16, 1);
    END CATCH
END;
GO


GO
--Vista de revisiones de admin maquina
CREATE OR ALTER VIEW vista_revision_maquina AS
SELECT
    rm.id_revision,
    rm.fecha_revision,
    rm.observacion,
    rm.id_maquina,
    em.estado AS estado_asignado,
    p.nombre + ' ' + p.apellido1 + ' ' + p.apellido2 AS nombre_admin
FROM revision_maquina rm
JOIN estados_maquinas em ON rm.nuevo_estado = em.id_estado
JOIN administrador a ON rm.cedula_admin = a.cedula
JOIN persona p ON a.cedula = p.cedula;
GO
SELECT * FROM vista_revision_maquina
GO


EXEC revisar_maquina 1, '264451244', 1, 'Sin novedades. Máquina operativa.';
EXEC revisar_maquina 2, '264451244', 2, 'Desgaste en bandas. Se requiere mantenimiento.';
EXEC revisar_maquina 3, '264451244', 3, 'Ruidos extraños en el motor. En reparación.';
EXEC revisar_maquina 4, '264451244', 4, 'Panel principal no responde. Considerar reemplazo.';
EXEC revisar_maquina 5, '264451244', 1, 'Revisión rutinaria. Máquina funcional.';

SELECT * FROM vista_revision_maquina
SELECT * FROM vista_admin_maquina

SELECT * FROM estados_maquinas
SELECT * FROM maquina

GO

--Cursor para verificar las maquinas con mas de 1 dia sin revision
CREATE OR ALTER PROCEDURE cursor_maquinas_vencidas
AS
BEGIN
    SET NOCOUNT ON;

    -- Tabla temporal con solo los campos necesarios
    DECLARE @resultado TABLE (
        tipo   VARCHAR(50),
        marca  VARCHAR(30),
        estado VARCHAR(20)
    );

    -- Variables del cursor
    DECLARE 
        @tipo   VARCHAR(50),
        @marca  VARCHAR(30),
        @estado VARCHAR(20),
        @ultima_revision DATE,
        @dias INT;

    -- Cursor solo con los campos necesarios
    DECLARE maquinas_cur CURSOR FOR
    SELECT 
        m.tipo,
        m.marca,
        em.estado,
        am.ultima_revision
    FROM maquina m
    JOIN estados_maquinas em ON m.estado = em.id_estado
    LEFT JOIN admin_maquina am ON m.id_maquina = am.id_maquina;

    OPEN maquinas_cur
    FETCH NEXT FROM maquinas_cur INTO @tipo, @marca, @estado, @ultima_revision

    WHILE @@FETCH_STATUS = 0
    BEGIN
        SET @dias = CASE 
            WHEN @ultima_revision IS NULL THEN NULL
            ELSE DATEDIFF(DAY, @ultima_revision, GETDATE())
        END;

        IF @dias IS NULL OR @dias > 1
        BEGIN
            INSERT INTO @resultado (tipo, marca, estado)
            VALUES (@tipo, @marca, @estado);
        END

        FETCH NEXT FROM maquinas_cur INTO @tipo, @marca, @estado, @ultima_revision
    END

    CLOSE maquinas_cur
    DEALLOCATE maquinas_cur

    -- Devolver los resultados
    SELECT * FROM @resultado;
END;
GO



EXEC cursor_maquinas_vencidas


GO
--Cursor que dice cuales clases no tienen entrenador asignado
CREATE OR ALTER PROCEDURE cursor_sesiones_sin_entrenador
AS
BEGIN
    SET NOCOUNT ON;

    -- Tabla temporal con solo los campos requeridos
    DECLARE @resultado TABLE (
        id_sesion_programada INT,
        nombre_clase VARCHAR(50),
        numero_grupo TINYINT
    );

    -- Variables del cursor
    DECLARE 
        @id_sesion_programada INT,
        @nombre_clase VARCHAR(50),
        @numero_grupo TINYINT;

    -- Cursor que obtiene solo sesiones programadas sin entrenador asignado
    DECLARE cur_sesiones CURSOR FOR
    SELECT 
        sp.id_sesion_programada,
        c.nombre,
        g.numero_grupo
    FROM sesion_programada sp
    JOIN sesion s ON sp.id_sesion = s.id_sesion
    JOIN clase c ON s.id_clase = c.id_clase
    JOIN grupo g ON s.numero_grupo = g.numero_grupo
    LEFT JOIN entrenador_sesion_programada esp 
        ON esp.id_sesion_programada = sp.id_sesion_programada
    WHERE esp.id_sesion_programada IS NULL
    AND sp.fecha >= CAST(GETDATE() AS DATE);

    OPEN cur_sesiones;

    FETCH NEXT FROM cur_sesiones 
    INTO @id_sesion_programada, @nombre_clase, @numero_grupo;

    WHILE @@FETCH_STATUS = 0
    BEGIN
        -- Insertar en la tabla temporal
        INSERT INTO @resultado (
            id_sesion_programada, nombre_clase, numero_grupo
        )
        VALUES (
            @id_sesion_programada, @nombre_clase, @numero_grupo
        );

        FETCH NEXT FROM cur_sesiones 
        INTO @id_sesion_programada, @nombre_clase, @numero_grupo;
    END
		
	--Cerrar y liberar el cursor
    CLOSE cur_sesiones;
    DEALLOCATE cur_sesiones;

    -- Mostrar los resultos
    SELECT * FROM @resultado
    ORDER BY id_sesion_programada ASC;
END;
GO

EXEC cursor_sesiones_sin_entrenador


GO

--Procedimiento almacenado transaccional para eliminar clases
CREATE OR ALTER PROCEDURE eliminar_clase (
    @id_clase INT
)
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Verificar existencia de la clase
        IF NOT EXISTS (
            SELECT 1 FROM clase WHERE id_clase = @id_clase
        )
        BEGIN
            RAISERROR('La clase especificada no existe.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Eliminar sesiones programadas asociadas a esta clase
        DELETE sp
        FROM sesion_programada sp
        JOIN sesion s ON s.id_sesion = sp.id_sesion
        WHERE s.id_clase = @id_clase;

        -- Eliminar sesiones relacionadas
        DELETE FROM sesion
        WHERE id_clase = @id_clase;

        -- Finalmente, eliminar la clase
        DELETE FROM clase
        WHERE id_clase = @id_clase;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        DECLARE @error NVARCHAR(4000) = ERROR_MESSAGE();
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        RAISERROR(@error, 16, 1);
    END CATCH
END;
GO


--Procedimiento almacenado transaccional para eliminar sesiones programadas
CREATE OR ALTER PROCEDURE eliminar_sesion_programada (
    @id_sesion_programada INT
)
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validar que la sesion programada exista
        IF NOT EXISTS (
            SELECT 1 FROM sesion_programada WHERE id_sesion_programada = @id_sesion_programada
        )
        BEGIN
            RAISERROR('La sesion programada indicada no existe.', 16, 1);
            ROLLBACK TRANSACTION;
            RETURN;
        END

        -- Eliminar asistencias asociadas 
        DELETE FROM asistencia_cliente
        WHERE id_sesion_programada = @id_sesion_programada;

        -- Eliminar inscripción a la sesión
        DELETE FROM inscripcion_sesion_programada
        WHERE id_sesion_programada = @id_sesion_programada;

        -- Eliminar entrenador asignado a la sesion si existe
        DELETE FROM entrenador_sesion_programada
        WHERE id_sesion_programada = @id_sesion_programada;

        -- Finalmente, eliminar la sesion programada
        DELETE FROM sesion_programada
        WHERE id_sesion_programada = @id_sesion_programada;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        DECLARE @error NVARCHAR(4000) = ERROR_MESSAGE();
        IF XACT_STATE() <> 0 ROLLBACK TRANSACTION;
        RAISERROR(@error, 16, 1);
    END CATCH
END;
GO


--Procedimiento almacenado transaccional para obtener las personas inscritas por sesion
CREATE OR ALTER PROCEDURE obtener_inscritos_por_sesion
  @id_sesion_programada INT
AS
BEGIN
  SET NOCOUNT ON;

  -- Validar existencia de la sesión
  IF NOT EXISTS (
    SELECT 1 FROM sesion_programada WHERE id_sesion_programada = @id_sesion_programada
  )
  BEGIN
    RAISERROR('La sesión programada indicada no existe.', 16, 1);
    RETURN;
  END

  -- Consultar los inscritos
  SELECT 
    p.cedula,
    p.nombre,
    p.correo
  FROM inscripcion_sesion_programada isp
  INNER JOIN persona p ON isp.cedula = p.cedula
  WHERE isp.id_sesion_programada = @id_sesion_programada;
END;
GO

EXEC obtener_inscritos_por_sesion 4

SELECT * FROM vista_detalles_sesion_programadas


GO

--Procedimiento almacenado transaccional para desinscribir un cliente de una sesion programada
CREATE OR ALTER PROCEDURE desinscribir_cliente_de_sesion_programada (
    @cedula CedulaRestringida,
    @id_sesion_programada INT
)
AS
BEGIN
    BEGIN TRY
        BEGIN TRANSACTION;

        -- Validar que el cliente esté inscrito en la sesión
        IF NOT EXISTS (
            SELECT 1 
            FROM inscripcion_sesion_programada 
            WHERE cedula = @cedula AND id_sesion_programada = @id_sesion_programada
        )
        BEGIN
            RAISERROR('El cliente no está inscrito en esta sesión.', 16, 1);
            ROLLBACK;
            RETURN;
        END

        -- Obtener numero de grupo asociado a la sesión
        DECLARE @numero_grupo TINYINT;
        SELECT @numero_grupo = s.numero_grupo
        FROM sesion_programada sp
        JOIN sesion s ON s.id_sesion = sp.id_sesion
        WHERE sp.id_sesion_programada = @id_sesion_programada;

        -- Eliminar la inscripcion
        DELETE FROM inscripcion_sesion_programada 
        WHERE cedula = @cedula AND id_sesion_programada = @id_sesion_programada;

        -- Decrementar cantidad de matriculados en grupo
        UPDATE grupo
        SET cantidad_matriculados = cantidad_matriculados - 1
        WHERE numero_grupo = @numero_grupo;

        -- Eliminar asistencia si existe
        DELETE FROM asistencia_cliente
        WHERE cedula = @cedula AND id_sesion_programada = @id_sesion_programada;

        COMMIT TRANSACTION;
    END TRY
    BEGIN CATCH
        DECLARE @error NVARCHAR(4000) = ERROR_MESSAGE();
        IF XACT_STATE() <> 0 ROLLBACK;
        RAISERROR(@error, 16, 1);
    END CATCH
END;
GO




-- Mas inserts para las tablas
INSERT INTO persona (cedula, nombre, apellido1, apellido2, genero, distrito, correo, fecha_nacimiento, edad) VALUES
('100000001', 'Karina', 'Abrego', 'Ocasio', 2, 4, 'sanchesamador@proyectos.com', '1980-12-17', 45),
('100000002', 'Diego', 'Pantoja', 'Madrigal', 1, 4, 'renecastillo@gmail.com', '1973-08-29', 52),
('100000003', 'Alejandro', 'Mena', 'Brito', 1, 4, 'aldovaldivia@club.com', '1997-07-26', 28),
('100000004', 'Julio César', 'Tamez', 'Corral', 1, 4, 'angel80@badillo-guzman.org', '1968-10-13', 57),
('100000005', 'Eugenio', 'Balderas', 'Pedroza', 1, 5, 'anel65@toledo-laboy.com', '1991-10-18', 34),
('100000006', 'Diego', 'Miramontes', 'Centeno', 1, 2, 'vanesa40@yahoo.com', '1974-04-09', 51),
('100000007', 'Rufino', 'Brito', 'Tello', 1, 1, 'robledogeronimo@llamas-gil.com', '1992-01-15', 33),
('100000008', 'Georgina', 'Cedillo', 'Castro', 2, 1, 'quinteroraul@gmail.com', '1997-04-20', 28),
('100000009', 'Zeferino', 'Cortez', 'Lozada', 1, 9, 'colungapascual@hotmail.com', '1991-11-12', 34),
('100000010', 'Enrique', 'Ávalos', 'Brito', 1, 9, 'sarabiajeronimo@uribe.com', '1966-10-13', 59),
('100000011', 'Fidel', 'Nazario', 'Cepeda', 1, 9, 'agustinaleman@yahoo.com', '1970-11-16', 55),
('100000012', 'Vicente', 'Becerra', 'Lucio', 1, 8, 'aquezada@gmail.com', '1972-07-12', 53),
('100000013', 'Elisa', 'Maestas', 'Montaño', 2, 9, 'rornelas@yahoo.com', '1986-09-27', 39),
('100000014', 'Javier', 'Sotelo', 'Toro', 1, 1, 'ysaenz@grupo.info', '1966-05-17', 59),
('100000015', 'Modesto', 'Cepeda', 'Alvarado', 1, 6, 'eloisanoriega@carrasco-trujillo.net', '1977-06-23', 48),
('100000016', 'Berta', 'Cordero', 'Salas', 2, 1, 'yeniduran@industrias.com', '1978-11-01', 47),
('100000017', 'Fidel', 'Valle', 'Lozano', 1, 2, 'duenasporfirio@uribe.net', '1966-07-04', 59),
('100000018', 'Eloy', 'Pizarro', 'Roybal', 1, 5, 'vieraabel@laureano-toro.com', '1976-12-17', 49),
('100000019', 'Adán', 'Fuentes', 'Vásquez', 1, 9, 'jacintocaraballo@laboratorios.info', '1982-08-25', 43),
('100000020', 'Yuridia', 'Enríquez', 'Samaniego', 2, 4, 'gustavo19@espinal.com', '1984-10-30', 41),
('100000021', 'Rocío', 'Granados', 'Barajas', 2, 7, 'saraespinoza@gmail.com', '1998-05-15', 27),
('100000022', 'Adalberto', 'Rivas', 'Franco', 1, 1, 'jose-mariajuarez@gmail.com', '1982-10-04', 43),
('100000023', 'José Luis', 'Lucio', 'Pedroza', 1, 6, 'enieves@yahoo.com', '1987-04-25', 38),
('100000024', 'Juan Carlos', 'Tejada', 'Cordero', 1, 5, 'violeta03@hotmail.com', '1974-03-12', 51),
('100000025', 'María Eugenia', 'Soliz', 'Ordóñez', 2, 3, 'flavio78@yahoo.com', '2002-01-20', 23),
('100000026', 'Rosario', 'Serrano', 'Medrano', 2, 7, 'hsoliz@proyectos.com', '1978-05-17', 47),
('100000027', 'Paola', 'Saiz', 'Covarrubias', 2, 7, 'amalia47@industrias.biz', '1999-11-02', 26),
('100000028', 'María Eugenia', 'Patiño', 'Meléndez', 2, 1, 'wmontalvo@castaneda-pedraza.com', '1982-12-08', 43),
('100000029', 'Martha', 'Jaramillo', 'Tirado', 2, 8, 'armentarene@ozuna-chacon.com', '1972-10-23', 53)

INSERT INTO telefonos_personas (cedula_persona, telefono) VALUES
(100000001, 24604529),
(100000002, 98772666),
(100000003, 87002736),
(100000004, 22584625),
(100000005, 96239896),
(100000006, 27593507),
(100000007, 22076306),
(100000008, 65367355),
(100000009, 47779438),
(100000010, 97450133),
(100000011, 94727629),
(100000012, 70631599),
(100000013, 56883401),
(100000014, 66953719),
(100000015, 79923992),
(100000016, 45296714),
(100000017, 62662478),
(100000018, 72953051),
(100000019, 25955954),
(100000020, 34605637),
(100000021, 96266637),
(100000022, 87633494),
(100000023, 60747738),
(100000024, 39387547),
(100000025, 23645728),
(100000026, 75494083),
(100000027, 23779367),
(100000028, 22800102),
(100000029, 70398878)

INSERT INTO cliente (cedula, estado, fecha_registro) VALUES
(100000001, 1, '2025-05-25'),
(100000002, 1, '2020-05-01'),
(100000003, 1, '2024-01-30'),
(100000004, 1, '2020-03-28'),
(100000005, 1, '2024-05-11'),
(100000006, 1, '2023-07-08'),
(100000007, 1, '2024-01-23'),
(100000008, 1, '2020-09-30'),
(100000009, 1, '2020-05-30'),
(100000010, 1, '2023-12-07'),
(100000011, 1, '2024-02-27'),
(100000012, 1, '2025-03-22'),
(100000013, 1, '2020-04-19'),
(100000014, 1, '2023-04-05'),
(100000015, 1, '2022-02-04'),
(100000016, 1, '2022-04-26'),
(100000017, 1, '2024-04-03'),
(100000018, 1, '2021-01-19'),
(100000019, 1, '2023-04-02'),
(100000020, 1, '2022-01-09'),
(100000021, 1, '2021-11-30'),
(100000022, 1, '2021-08-12'),
(100000023, 1, '2022-01-04'),
(100000024, 1, '2022-07-23'),
(100000025, 1, '2025-02-24'),
(100000026, 1, '2023-11-28'),
(100000027, 1, '2023-11-14'),
(100000028, 1, '2024-09-01'),
(100000029, 1, '2025-03-08')




INSERT INTO membresia (tipo) VALUES
(2),
(1),
(1),
(3),
(2),
(2),
(4),
(4),
(5),
(5),
(4),
(4),
(3),
(3),
(4),
(5),
(5),
(2),
(5),
(4),
(3),
(3),
(4),
(3),
(5),
(1),
(5),
(1),
(4),
(2);

INSERT INTO cliente_membresias (cedula, id_membresia) VALUES
(100000001, 2),
(100000002, 3),
(100000003, 4),
(100000004, 5),
(100000005, 6),
(100000006, 7),
(100000007, 8),
(100000008, 9),
(100000009, 10),
(100000010, 11),
(100000011, 12),
(100000012, 13),
(100000013, 14),
(100000014, 15),
(100000015, 16),
(100000016, 17),
(100000017, 18),
(100000018, 19),
(100000019, 20),
(100000020, 21),
(100000021, 22),
(100000022, 23),
(100000023, 24),
(100000024, 25),
(100000025, 26),
(100000026, 27),
(100000027, 28),
(100000028, 29),
(100000029, 30);

INSERT INTO pagos (fecha_pago, id_membresia, cedula_cliente, forma_pago, monto) VALUES
('2025-01-09', 2, 100000001, 3, 46785),
('2025-03-25', 3, 100000002, 1, 24214),
('2025-05-12', 4, 100000003, 2, 32395),
('2025-02-25', 5, 100000004, 2, 70877),
('2025-04-16', 6, 100000005, 1, 89190),
('2025-03-01', 7, 100000006, 3, 33856),
('2025-03-06', 8, 100000007, 3, 50169),
('2025-04-06', 9, 100000008, 3, 53176),
('2025-03-15', 10, 100000009, 3, 20518),
('2025-05-12', 11, 100000010, 2, 25469),
('2025-05-12', 12, 100000011, 1, 73481),
('2025-04-14', 13, 100000012, 2, 20426),
('2025-02-07', 14, 100000013, 1, 90230),
('2025-02-04', 15, 100000014, 2, 109811),
('2025-03-07', 16, 100000015, 2, 19582),
('2025-05-04', 17, 100000016, 2, 107554),
('2025-01-24', 18, 100000017, 2, 111854),
('2025-03-19', 19, 100000018, 1, 70607),
('2025-05-02', 20, 100000019, 2, 44972),
('2025-05-10', 21, 100000020, 1, 26776),
('2025-01-11', 22, 100000021, 2, 23808),
('2025-02-07', 23, 100000022, 3, 105128),
('2025-01-12', 24, 100000023, 2, 25708),
('2025-01-10', 25, 100000024, 3, 72511),
('2025-01-31', 26, 100000025, 1, 77579),
('2025-05-14', 27, 100000026, 3, 99361),
('2025-05-25', 28, 100000027, 1, 103128),
('2025-05-08', 29, 100000028, 1, 25599),
('2025-04-15', 30, 100000029, 1, 12169);

INSERT INTO inscripcion_sesion_programada(cedula, id_sesion_programada, fecha_inscripcion) VALUES
(100000001, 2, '2025-01-07'),
(100000002, 3, '2025-03-13'),
(100000003, 4, '2025-01-05'),
(100000004, 5, '2025-05-15'),
(100000005, 6, '2025-01-02'),
(100000006, 7, '2025-05-25'),
(100000007, 8, '2025-02-12'),
(100000008, 9, '2025-01-03'),
(100000009, 10, '2025-05-22'),
(100000010, 1, '2025-05-17'),
(100000011, 2, '2025-03-09'),
(100000012, 3, '2025-03-29'),
(100000013, 4, '2025-03-28'),
(100000014, 5, '2025-03-06'),
(100000015, 6, '2025-02-06'),
(100000016, 7, '2025-03-26'),
(100000017, 8, '2025-05-15'),
(100000018, 9, '2025-01-09'),
(100000019, 10, '2025-04-10'),
(100000020, 1, '2025-03-30'),
(100000021, 2, '2025-02-24'),
(100000022, 3, '2025-04-14'),
(100000023, 4, '2025-05-15'),
(100000024, 5, '2025-01-29'),
(100000025, 6, '2025-01-05'),
(100000026, 7, '2025-05-09'),
(100000027, 8, '2025-05-05'),
(100000028, 9, '2025-01-16'),
(100000029, 10, '2025-01-15');

SELECT * FROM sesion_programada


SELECT * FROM vista_clientes_sesion

