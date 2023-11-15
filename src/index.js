const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require("dotenv").config();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

// Crear y configurar el servidor
const app = express();
app.use(cors());
app.use(express.json({ limit: '25mb' }));

// Variables de entorno
const dbUser = process.env.DB_USER;
const dbPass = process.env.DB_PASS;
const dbName = process.env.DB_NAME;

const SECRET_KEY = process.env.SECRET_KEY;

// Conexión a la base de datos
async function getConnection() {
  const connection = await mysql.createConnection({
    host: 'sql.freedb.tech',
    user: dbUser,
    password: dbPass,
    database: dbName,
  });

  await connection.connect();
  console.log('Conexión establecida con éxito');

  return connection;
}

// Iniciar el servidor
const port = 3005;
app.listen(port, () => {
  console.log(`Servidor iniciado en http://localhost:${port}`);
});

// Generación, verificación y middleware de autenticación del token
const generateToken = (payload) => {
  const token = jwt.sign(payload, 'secreto', { expiresIn: '1h' });
    return token;
};
const verifyToken = (token) => {
  try {
    const decoded = jwt.verify(token, 'secreto');
    return decoded;
  } catch (err) {
    return null;
  }
};
const authenticateToken = (req, res, next) => {
  const token = req.headers['authorization'];
  if (!token) {
    return res.status(401).json({ error: 'Token no proporcionado' });
  }
  const decoded = verifyToken(token);
  if (!decoded) {
    return res.status(401).json({ error: 'Token inválido' });
  }
  req.user = decoded;
  next();
};

// Endpoints ----------------------------------------------------

// Login y Registro ------------------------------

// Registro
app.post("/api/register", async (req, res) => {
  const { name, password, email } = req.body;

  const passwordHashed = await bcrypt.hash(password, 10); 

  const sqlQuery =
    "INSERT INTO users( name, email, password ) VALUES (?, ? ,?)";

  try {
    jwt.sign(password, SECRET_KEY, async (err, token) => {
      if (err) {
        res.status(400).send({ msg: "Error al firmar el token JWT" });
      } else {
        const conn = await getConnection();
        const [results] = await conn.query(sqlQuery, [name, email, passwordHashed]);

        conn.end();

        res.json({
          success: true,
          id: results.insertId,
          user: name,
          pass: passwordHashed,
          token: token
        });
      }
    });

  } catch (error) {
    console.error("Error during registration:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});

// Login
app.post("/api/login", async (req, res) => {
  const name = req.body.name;
  const password = req.body.password;

  const sqlQuery = "SELECT * FROM users WHERE name = ?";

 try {
  const conn = await getConnection();

  const [users] = await conn.query(sqlQuery, [name]);
  const user = users[0]; 
  console.log(user);

  //Comprobar si el usuario y la contraseña coincide con la que está en BD: bcrypt
  const isOkPass =
    user === null
      ? false
      : await bcrypt.compare(password, user.password);

    //Si el usuario no existe o la contraseña es incorrecta -> credenciales no válidas
    if (!(user && isOkPass)) {
      return res.json({ success: false, error: "Credenciales inválidas" });
    }

    //si el usaurio existe y la contraseña coincide: generar un token
    const infoToken = {
      name: user.name,
      id: user.id,
    };
    const token = generateToken(infoToken);

    res.json({ success: true, token, name: user.name });

  } catch (error) {
    console.error("Error during login:", error);
    res.status(500).json({ success: false, error: "Internal Server Error" });
  }
});
// module.exports = app;

app.get("/api/user_brushes", authenticateToken, async (req, res) => {

  const UserId = req.user.id;
  const UserName = req.user.name;

  const conn = await getConnection();
  const sqlQuery = 
  
    "SELECT users.id, users.name, brushes.id, brushes.name AS 'saved brushes', user_brushes.tried, user_brushes.recommend " +
    "FROM users " +
    "INNER JOIN user_brushes ON users.id = user_brushes.fkUser " +
    "INNER JOIN brushes ON brushes.id = user_brushes.fkBrush " +
    "WHERE users.id = ?;"

    const [user_brushes] = await conn.query(sqlQuery, [UserId]);
    conn.end();
  
    const response = {
      [`user ${UserName} brushes`]: user_brushes,
    };
    res.json(response);
});

// CRUD ------------------------------------------

// Obtener todos los pinteles (GET /api/brushes)
app.get("/api/brushes", async (req, res) => {

  const conn = await getConnection();
  const sqlQuery = "SELECT * FROM brushes;";
  const [results] = await conn.query(sqlQuery);
  const numOfElements = results.length;

  conn.end();
  res.json({
    info: { count: numOfElements },
    results: results
  });
});

//Obtener un pincel por su ID (GET /api/brushes/:id)
app.get("/api/brushes/:id", async (req, res) => {

  const idBrush = req.params.id;

  if (isNaN(parseInt(idBrush))) {
    res.json({
      success: false,
      error: "El id debe ser un número",
    });
    return;
  }

  const sqlQuery = "SELECT * FROM brushes WHERE id = ?";

  try {
    const conn = await getConnection();
    const [results] = await conn.query(sqlQuery, [idBrush]);
    const numOfElements = results.length;

    if (numOfElements === 0) {
      res.json({
        success: false,
        message: "No existe el pincel que buscas, quizás deberías añadirlo",
      });
      return;
    }

    conn.end();
    res.json({
      results: results[0]
    });
  } catch (error) {
    res.json({
      success: false,
      message: `Ha ocurrido un error: ${error}`,
    });
  }
});

// Crear un nuevo pincel (POST /api/brushes)
app.post("/api/brushes", async (req, res) => {

  // Queries
  const sqlFullQuery = "INSERT INTO brushes( name, serie, hair_type, hardness, recommended_medium, price ) VALUES (?, ?, ?, ?, ?, ?);";
  const sqlNameQuery = "SELECT * FROM brushes WHERE name = ?;"

  const newBrush = req.body; 
  const requiredFields = [ 'name', 'serie', 'hair_type', 'hardness', 'recommended_medium', 'price' ];

  // Validación -> si hay algún dato sin rellenar
  for (let field of requiredFields) {
    if (!newBrush[field]) {
      res.json({
        success: false,
        message: "Todos los datos deben estar rellenados.",
      });
      return;
    };
  };

  try {
    const conn = await getConnection();

    // Validación -> si el pincel ya existe
    const [existingBrush] = await conn.query(sqlNameQuery, [newBrush.name]);
    // [existingBrush] en lugar de existingBrush, es una desestructuración de arrays, extrae solo el 1er elemento
    // Se puede observar en este console.log:
    console.log("Existing Brush:", existingBrush);
    
    if (existingBrush.length > 0) {
      res.json({
        success: false,
        message: "Ese pincel ya existe.",
      });
      return;
    }

    // Ejecutar la consulta
    const [results] = await conn.query(sqlFullQuery, [
      newBrush.name, newBrush.serie, newBrush.hair_type, newBrush.hardness, newBrush.recommended_medium, newBrush.price
    ]);
    conn.end();

    // Validación -> si se ha insertado
    if (results.affectedRows === 0) {
      res.json({
        success: false,
        message: "No se ha podido insertar",
      });
      return;
    }

    res.json({
      success: true,
      id: results.insertId
    });

  } catch (error) {
    res.json({
      success: false,
      message: `Ha ocurrido un error: ${error}`,
    });
  }
});

// Actualizar/Modificar un pincel existente (PUT /api/brushes/:id)
app.put("/api/brushes/:id", async (req, res) => {
  // Queries
  const sqlFullQuery = "UPDATE brushes SET name=?, serie=?, hair_type=?, hardness=?, recommended_medium=?, price=? WHERE id=?";
  const sqlQueryID = "SELECT * FROM brushes WHERE id=?";

  const modifiedBrush = req.body;
  const requiredFields = ['name', 'serie', 'hair_type', 'hardness', 'recommended_medium', 'price'];
  const idBrush = req.params.id;

  // Validación -> si hay algún dato sin rellenar
  for (let field of requiredFields) {
    if (!modifiedBrush[field]) {
      res.json({
        success: false,
        message: "Todos los datos deben estar rellenados.",
      });
      return;
    }
  }

  try {
    const conn = await getConnection();

    // Validación -> si la id no corresp. con ningún pincel
    const existingBrush = await conn.query(sqlQueryID, [idBrush]);

    if (existingBrush.length === 0) {
      res.json({
        success: false,
        message: `La id {${idBrush}} no corresponde con ningún pincel.`,
      });
      return;
    }

    // Ejecutar la consulta de actualización
    const [results] = await conn.query(sqlFullQuery, [
      modifiedBrush.name,
      modifiedBrush.serie,
      modifiedBrush.hair_type, 
      modifiedBrush.hardness, 
      modifiedBrush.recommended_medium, 
      modifiedBrush.price, 
      idBrush
    ]);
    conn.end();

    res.json({
      success: true,
      message: `Pincel con id ${idBrush} actualizado`,
    });

  } catch (error) {
    res.json({
      success: false,
      message: `Error al actualizar el pincel: ${error}`,
    });
  } 
});

//Eliminar un pincel (DELETE /api/brushes/:id)
app.delete("/api/brushes/:id", async (req, res) => {
  //Obtener el id del req.params
  const idBrush = req.params.id;

  let sqlQuery = "DELETE FROM brushes WHERE id = ? ";

  try {
  const conn = await getConnection();

  //Ejecutar esa consulta
  const [results] = await conn.query(sqlQuery, [idBrush]);

  if (results.affectedRows === 0) {
    res.json({
      success: false,
      message: `La id {${idBrush}} no corresponde con ningún pincel. No se eliminó la id.`,
    });
    return;
  }

  res.json({
    success: true,
    message: `Pincel con id ${idBrush} eliminado`
  });

  } catch {
    res.json({
      success: false,
      message: `Error al eliminar el pincel: ${error}`,
    });
  }
});
