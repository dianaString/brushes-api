USE freedb_myBrushes_db;

CREATE TABLE 
	brushes(
		id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
		name VARCHAR(255) NOT NULL,
		serie VARCHAR(20) NOT NULL,
		hair_type VARCHAR(50) NOT NULL,
		hardness VARCHAR(20) NOT NULL,
		recommended_medium VARCHAR(255) NOT NULL,
		price VARCHAR(20) NOT NULL
	);
    
CREATE TABLE
	users(
		id INT NOT NULL AUTO_INCREMENT PRIMARY KEY,
		email varchar(45) NOT NULL,
		name varchar(45) NOT NULL,
		password varchar(45) NOT NULL
	);
    
CREATE TABLE
	user_brushes (
		idBrushesUsers INT AUTO_INCREMENT PRIMARY KEY,
		fkBrush INT,
		fkUser INT,
		tried BOOLEAN, 
		recommend VARCHAR(1028),
		FOREIGN KEY (fkBrush) REFERENCES brushes(id),
		FOREIGN KEY (fkUser) REFERENCES users(id)
	);

SHOW TABLES;
SELECT * FROM brushes;
SELECT * FROM brushes WHERE id = 1;
SELECT * FROM users;
SELECT * FROM user_brushes;

INSERT INTO
	brushes 
		( name, serie, hair_type, hardness, recommended_medium, price )
VALUES 	
	( 'Van Gogh Selected Filament', '191', 'synthetic', 'medium', 'watercolors, gouache and acrylic', 'aforable' ),
	( 'Da Vinci Casaneo', '5598', 'synthetic (petit-gris imitation)', 'soft', 'watercolors and gouache', 'aforable' );
    
INSERT INTO
	users 
		( email, name, password )
VALUES 	
	( 'dianastring.code@gmail.com', 'Diana', 'diana1234' ),
	( 'velazquez@email.com', 'Diego', 'diego1234' );
    
INSERT INTO 
	user_brushes
		(fkUser, fkBrush, tried, recommend)
VALUES 	
	( 1, 1, TRUE, 'Recomendado para su precio' ),
	( 1, 2, FALSE, NULL ),
	( 2, 1, TRUE, 'Para pintar meninas con acuarela va perfecto' );
    
    
-- Esto muestra el id y el nombre del usuario, el id y el nombre de los pinceles que tiene, si los ha probado y si los recomienda.
SELECT users.id, users.name, brushes.id, brushes.name AS 'saved brushes', user_brushes.tried, user_brushes.recommend
FROM users
INNER JOIN user_brushes
ON users.id = user_brushes.fkUser
INNER JOIN brushes
ON brushes.id = user_brushes.fkBrush
ORDER BY users.id ASC;

-- el password de users solo tenía 45 caracteres y al hacer el Hash no almacenaba toda la contraseña nueva
ALTER TABLE users
MODIFY COLUMN password varchar(250) NOT NULL;

-- mi prueba
SELECT * FROM users;