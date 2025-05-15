const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
require('dotenv').config();

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));

// Conexão com banco de dados
const db = mysql.createConnection({
  host: 'localhost',
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: 'studyboost'
});

db.connect(err => {
  if (err) throw err;
  console.log('Conectado ao MySQL');
});

// Rota para cadastro
app.post('/cadastro', async (req, res) => {
  const { nome, email, senha, confirmarSenha } = req.body;

  if (senha !== confirmarSenha) {
    return res.send('As senhas não coincidem!');
  }

  const hash = await bcrypt.hash(senha, 10);

  const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
  db.query(sql, [nome, email, hash], (err, result) => {
    if (err) {
      if (err.code === 'ER_DUP_ENTRY') {
        return res.send('Email já cadastrado.');
      }
      return res.send('Erro ao cadastrar.');
    }
    res.send('Usuário cadastrado com sucesso!');
  });
});

// Iniciar servidor
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});
