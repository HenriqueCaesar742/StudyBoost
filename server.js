require('dotenv').config();
const express = require('express');
const mysql = require('mysql2');
const bcrypt = require('bcrypt');
const bodyParser = require('body-parser');
const path = require('path');

const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname))); // Servir arquivos estáticos (HTML, CSS, JS, imagens)

// Conexão com o MySQL
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

// Rota principal: exibir index.html
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'index.html'));
});

// Rota de cadastro
app.post('/cadastro', async (req, res) => {
  const { nome, email, senha, confirmarSenha } = req.body;

  if (senha !== confirmarSenha) {
    return res.send('As senhas não coincidem!');
  }

  try {
    const hash = await bcrypt.hash(senha, 10);
    const sql = 'INSERT INTO usuarios (nome, email, senha) VALUES (?, ?, ?)';
    db.query(sql, [nome, email, hash], (err, result) => {
      if (err) {
        if (err.code === 'ER_DUP_ENTRY') {
          return res.send('Email já cadastrado.');
        }
        return res.send('Erro ao cadastrar.');
      }
      // Redireciona para o dashboard após cadastro bem-sucedido
      res.redirect('/dashboard/index.html');
    });
  } catch (error) {
    console.error(error);
    res.send('Erro ao processar senha');
  }
});

// Rota de login
app.post('/login', (req, res) => {
  const { email, password } = req.body;

  const sql = 'SELECT * FROM usuarios WHERE email = ?';
  db.query(sql, [email], async (err, results) => {
    if (err) {
      console.error(err);
      return res.send('Erro ao buscar usuário.');
    }

    if (results.length === 0) {
      return res.send('Usuário não encontrado.');
    }

    const usuario = results[0];
    const senhaCorreta = await bcrypt.compare(password, usuario.senha);

    if (senhaCorreta) {
      res.redirect('/dashboard/index.html');
    } else {
      res.send('Senha incorreta.');
    }
  });
});

// Iniciar o servidor
app.listen(3000, () => {
  console.log('Servidor rodando em http://localhost:3000');
});