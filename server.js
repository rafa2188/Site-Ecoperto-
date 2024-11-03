const express = require('express');
const mysql = require('mysql2');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

// Rota POST para cadastrar usuário
app.post('/cadastrar-se', (req, res) => {
  const { nome, email, senha, gender, endereco_residencia, telefone, regiao_coleta } = req.body;

  // Conecte-se ao banco de dados MySQL
  const connection = mysql.createConnection({
    host: 'localhost',
    user: 'Rafa', // Usuário do banco Ecoperto
    password: '2188', // Senha do banco Ecoperto
    database: 'ecoperto', // Banco de dados Ecoperto
    port: 3306 // Porta do MySQL
  });

  // Verifique a conexão com o MySQL
  connection.ping(err => {
    if (err) {
      console.error('Erro ao conectar ao MySQL:', err);
      res.status(500).send('Erro ao conectar ao MySQL');
      return;
    }
    console.log('Conectado ao MySQL com sucesso!');

    // Validação de dados (opcional)
    if (!nome || !email || !senha || !gender) {
      res.status(400).send('Dados incompletos');
      return;
    }

    // Verificar se o usuário já está cadastrado com o mesmo e-mail
    const checkEmailQuery = `SELECT COUNT(*) AS count FROM registro_coletores WHERE email = ?`;
    connection.query(checkEmailQuery, [email], (err, results) => {
      if (err) {
        console.error('Erro ao verificar e-mail no banco de dados:', err);
        res.status(500).send('Erro ao verificar e-mail');
        return;
      }

      const count = results[0].count;
      if (count > 0) {
        // Se o e-mail já estiver cadastrado, retorne uma mensagem indicando que o usuário já existe
        res.status(409).send('Usuário já cadastrado com esse e-mail');
        return;
      }

      // Se o e-mail não estiver cadastrado, proceda com a inserção dos dados
      const insertQuery = `INSERT INTO registro_coletores (nome, email, senha, gender, endereco_residencia, telefone, regiao_coleta) VALUES (?, ?, ?, ?, ?, ?, ?)`;
      connection.query(insertQuery, [nome, email, senha, gender, endereco_residencia, telefone, regiao_coleta], (err, results) => {
        if (err) {
          console.error('Erro ao salvar dados no banco de dados:', err);
          res.status(500).send('Erro ao cadastrar usuário');
          return;
        }

        // Retorne uma resposta para o cliente indicando que o usuário foi cadastrado com sucesso
        res.send('Dados cadastrados com sucesso!');
      });
    });
  });
});

// Inicie o servidor na porta 5500
app.listen(5500, () => {
  console.log('Servidor escutando na porta 5500');
});
