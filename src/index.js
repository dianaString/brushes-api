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

// Endpoints ---------------------------------------
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
