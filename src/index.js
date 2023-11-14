const express = require('express');
const cors = require('cors');
const mysql = require('mysql2/promise');
require("dotenv").config();

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

app.get("/api/brushes", async (req, res) => {

    // 1. Obtener la conexion
    const conn = await getConnection();
  
    //. 2. Consulta que quiero a la bd: obtener todas las alumnas
    const sql = "SELECT * FROM brushes;";
  
    //3. Ejecutar la consulta
    const [results] = await conn.query(sql);
  
    console.log(results);
  
    //4. Cerra la conexión
    conn.end();
    res.json(results);
  });