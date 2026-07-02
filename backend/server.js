//variaveis pré definidos//
const express = require("express");
const cors = require("cors");
//mini banco de dados//
const mysql = require("mysql2")

const app = express();
app.use(cors());
app.use(express.json());

const db = mysql.createConnection({
    host: process.env.DB_HOST || "localhost",
    user: process.env.DB_USER ||"root",
    password: process.env.DB_PASSWORD || "",
    database: process.env.DB_NAME ||   "CriticalHit",
    port : process.env.DB_PORT || 3306,
    ssl: process.env.DB_HOST ? { rejectUnauthorized:false} : null
});

//sql funcionando//
db.connect((erro) =>{
    if(erro) {
        console.log("Erro ao conectar");
        console.log(erro);
        return;
    }
    console.log("Conectado com sucesso");
db.query(`
CREATE TABLE IF NOT EXISTS player (
    id INT AUTO_INCREMENT PRIMARY KEY,
    email VARCHAR(50) NOT NULL,
    nick VARCHAR(30) NOT NULL,
    nascimento DATE NOT NULL,
    senha VARCHAR(30) NOT NULL
)
`);

db.query(`
CREATE TABLE IF NOT EXISTS jogos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    titulo VARCHAR(20) NOT NULL,
    capa VARCHAR(255) NOT NULL,
    url VARCHAR(255) NOT NULL,
    id_player INT NOT NULL,
    FOREIGN KEY (id_player) REFERENCES player(id)
)
`);
     db.query(criarTabelaSQL, (erroTabela) =>{
        if (erroTabela) {
            console.log("Erro de verificação ou criação da tabela", erroTabela);
        } else {
            console.log("Tabela Pronto para uso")
        }
     })
});

//api funcionar//
app.get("/", (req, res) => {
    res.json({
        mensagem: "API funcionando"
    });
});


//regras para que o player possa cadastrar//
app.post("/player", (req, res) => {
    const { email, nick, nascimento, senha} = req.body;
    //preencher os campos//
    if (!email || !nick || !nascimento || !senha) {
        return res.status(400).json({
            erro: "Preencha todos os campos."
        });
    }
    //regra de senha//
    if (senha.length < 8) {
        return res.status(400).json({
            erro: "A senha deve conter no mínimo 8 caracteres."
        });
    }

      //identificar se o player ja existe usando sql//
const verificaSQL = "SELECT * FROM player WHERE nick = ? or email = ?";
        db.query(verificaSQL, [nick, email],    
        (erro, resultado) => {
            if (erro) {
                return res.status(500).json(erro);
            }
            if (resultado.length > 0) {
                return res.status(400).json({
                    erro: "Já existe este Nome de Usuário cadastrado no banco"
                })
            }
            const inserirSQL = 'insert into player (email, nick, nascimento, senha) values(?, ?, ?, ?)'
            db.query (inserirSQL, [email, nick, nascimento, senha], (erro,resultado) => {
                if (erro) {
                    return res.status(500).json(erro);
                }
                res.status(201).json({
                    mensagem: "Player Cadastrado",
                     id: resultado.insertId
                })
            })
        })
    })

 //regras de login//
app.post("/login", (req, res) => {
    const { email, senha } = req.body;

    const Loginsql = "SELECT * FROM player WHERE email = ?";

    db.query(Loginsql, [email], (erro, resultado) => {
        if (erro) {
            console.error(erro);
            return res.status(500).json({
                erro: "Erro no servidor."
            });
        }

        if (resultado.length === 0) {
            return res.status(401).json({
                erro: "Usuário não encontrado."
            });
        }

        const usuario = resultado[0];

        if (usuario.senha !== senha) {
            return res.status(401).json({
                erro: "Senha ou email incorreta."
            });
        }

        res.json({
            mensagem: "Login realizado!",
             id: usuario.id
        });
    });
});


 // jogos publish!!! //
app.get("/jogos", (req, res) => {
    const sqlJogos = `
        SELECT jogos.*, player.nick 
        FROM jogos 
        INNER JOIN player ON jogos.id_player = player.id
    `;
    
    db.query(sqlJogos, (erro, resultado) => {
        if (erro) {
            console.error(erro);
            return res.status(500).json({
                erro: "Erro ao buscar jogos no banco de dados."
            });
        }
        res.json(resultado);
    });
});

// jogos de um jogador específico ("Seus Jogos") //
app.get("/jogos/player/:id_player", (req, res) => {
    const { id_player } = req.params;

    const sqlMeusJogos = `
        SELECT jogos.*, player.nick 
        FROM jogos 
        INNER JOIN player ON jogos.id_player = player.id
        WHERE jogos.id_player = ?
    `;

    db.query(sqlMeusJogos, [id_player], (erro, resultado) => {
        if (erro) {
            console.error(erro);
            return res.status(500).json({
                erro: "Erro ao buscar jogos do jogador."
            });
        }
        res.json(resultado);
    });
});

app.post("/jogos", (req, res) => {
console.log(req.body);
    const novoJogo = {
        titulo: req.body.titulo,
        capa: req.body.capa,
        url: req.body.url,
        id_player: req.body.id_player
    };

    console.log("ID recebido:", novoJogo.id_player);
    

     //regras de publicar jogos//
        if (!novoJogo.titulo || !novoJogo.url || !novoJogo.capa) {
        return res.status(400).json({
            erro: "Preencha todos os campos."
        });
    }
       if (novoJogo.url.length > 255) {
        return res.status(400).json({
            erro: "A URL deve conter no máximo 255 caracteres."
        });
    }
      if (novoJogo.capa.length > 255) {
        return res.status(400).json({
            erro: "A URL da capa deve conter no máximo 255 caracteres."
        });
    }
   if (novoJogo.titulo.length > 15) {
        return res.status(400).json({
            erro: "O título deve conter no máximo 15 caracteres."
        });
    }
//sql publicar jogos//
 const sqlJogos = `
        INSERT INTO jogos (titulo, capa, url, id_player)
        VALUES (?, ?, ?, ?) `;

    db.query(
        sqlJogos,
        [ novoJogo.titulo, novoJogo.capa, novoJogo.url, novoJogo.id_player],
        (erro, resultado) => {
            if (erro) {
                console.error(erro);
                return res.status(500).json({
                    erro: "Erro ao Publicar jogo."
                });
            }
            res.status(201).json({
                mensagem: "Jogo Publicado com sucesso!",
                id: resultado.insertId
            });
        }
    );
});
   // dados do player no perfil backend//
   app.get("/player/:id", (req, res) => {
    const id = req.params.id;

    const sql = "SELECT * FROM player WHERE id = ?";

    db.query(sql, [id], (erro, resultado) => {
        if (erro) {
            console.error(erro);
            return res.status(500).json({
                erro: "Erro ao buscar jogador"
            });
        }

        if (resultado.length === 0) {
            return res.status(404).json({
                erro: "Jogador não encontrado"
            });
        }

        res.json(resultado[0]);
    });
});


  //deletar os jogos  & conta//
  //deletar conta//
app.delete("/player/:id", (req, res) => {
    const id = req.params.id;
    const sqlDel = "DELETE FROM player WHERE id = ?";

    db.query(sqlDel, [id], (erro, resultado) => {
        if (erro) {
            console.error(erro);
            return res.status(500).json({
                erro: "Erro ao excluir conta"
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                erro: "Conta não encontrada"
            });
        }

        res.json({
            mensagem: "Conta removida"
        });
    });
});
//deletar jogos//
app.delete("/jogos/player/:id_player/:titulo", (req, res) => {
    const { id_player, titulo } = req.params;

    const sqlDelGame = `
        DELETE FROM jogos
        WHERE id_player = ? AND titulo = ?
    `;

    db.query(sqlDelGame, [id_player, titulo], (erro, resultado) => {
        if (erro) {
            console.error(erro);
            return res.status(500).json({
                erro: "Erro ao excluir jogo"
            });
        }

        if (resultado.affectedRows === 0) {
            return res.status(404).json({
                erro: "Jogo não encontrado ou não pertence ao jogador"
            });
        }

        res.json({
            mensagem: "Jogo removido com sucesso"
        });
    });
});

//deixa no final prfv!//servidor rodar//
const PORT = process.env.PORT || 3000;
    app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});