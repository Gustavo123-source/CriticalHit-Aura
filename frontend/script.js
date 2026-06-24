
const API = "http://localhost:3000"


const btn = document.querySelector("#toggle-btn");
const container = document.querySelector('.container');


const temaSalvo = localStorage.getItem("tema");
if (temaSalvo === "escuro") {
    document.documentElement.classList.add("dark-mode");
}

btn.addEventListener("click", () => {
    document.documentElement.classList.toggle("dark-mode");

    if (document.documentElement.classList.contains("dark-mode")) {
        localStorage.setItem("tema", "escuro");
    } else {
        localStorage.setItem("tema", "claro");
    }
});



const image1 = document.getElementById ("minhaimagem");
const inputcp = document.getElementById ("inputArquivo");
const botaocp = document.getElementById ("botaoconfp");
 
botaocp.addEventListener("click", function () {
    inputcp.click();
});
 
inputcp.addEventListener("change", function (event) {
    const file = event.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (event) {
            image1.src = event.target.result;
        };
        reader.readAsDataURL(file);
    }
});
 



//script conectado no backend, nn colocar coisas que nn usam backend aqui!!//

async function cadastro(event) {
    event.preventDefault();
    const email = document.getElementById("email").value;
    const nick = document.getElementById("nomeUsuario").value;
    const nascimento = document.getElementById("nascimento").value;
    const senha = document.getElementById("senha").value;
    const senhaAgain = document.getElementById("senhaAgain").value;

    if (senha !== senhaAgain) {
        alert("As senhas não coincidem.");
        return;
    }
    const newPlayer = {email, nick, nascimento, senha}
    

    try {
        console.log(newPlayer)
        const resposta = await fetch(`${API}/player`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(newPlayer)
        });
         

        if (!resposta.ok) {
            const dados = await resposta.json();
               console.log("Resposta do servidor:", dados);
               console.log("Status:", resposta.status);
               alert(JSON.stringify(dados));
            return;
        } else{
        alert("Você foi cadastrado com sucesso!")
        window.location.href = "inicio.html";
        
        }
    } catch(erro) {
        console.log(erro);
    }
}
            //função para o login//
async function login(event) {
    event.preventDefault();

    const email = document.getElementById("email").value; 
    const senha = document.getElementById("senha").value;

    try {
        const resposta = await fetch(`${API}/login`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ email, senha })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro);
            return; 
        }

        localStorage.setItem("id_player", dados.id);
        alert("Login feito!");
        window.location.href = "inicio.html";

    } catch (erro) {
        console.error(erro);
        alert("Erro ao conectar ao servidor.");
    }
}



         //função para adm espero q funcione é quase 00 da noite!//
async function adm(event) {
    event.preventDefault();

    const senha = document.getElementById("senhaADM").value;

    try {

        const resposta = await fetch(`${API}/adm`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ senha })
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert(dados.erro);
            return;
        }
        
        alert("Login adm feito!");
        window.location.href = "jogo.html";
    
    } catch (erro) {
        console.log(erro);
    }
}



async function JogoPost(event) {
    event.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const url = document.getElementById("urljogo").value;
    const capa = document.getElementById("capa").value;
    const dadosJogos = {
    titulo,
    url,
    capa,
    id_player: localStorage.getItem("id_player")
};

    try {
       const resposta = await fetch(`${API}/jogos`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json"
    },
    body: JSON.stringify(dadosJogos)
});

const dados = await resposta.json();

if (resposta.ok) {
    alert("Jogo publicado com sucesso!");
} else {
    alert(dados.erro);
}

    } catch (erro) {
        console.log(erro);
    }
}

async function carregarJogo() {
    const paginaDeJogos = document.getElementById("paginaDeJogos");

    try {
        const resposta = await fetch(`${API}/jogos`);
        const jogos = await resposta.json();

        paginaDeJogos.innerHTML = "";
        jogos.forEach(jogo => {
            paginaDeJogos.innerHTML += `
                 <a href="${jogo.url}" class="aDosJogos">
                  <img src="${jogo.capa}" alt="${jogo.titulo}" class="fotoDoJogo" style="border-radius: 10px;">
                  <h3 id="idCapaJogo">${jogo.titulo}</h3>
                  </a>
            `;
        });

    } catch (erro) {
        console.log(erro);
    }
}

//delete account//
async function excluirConta() {


    const confirmar = confirm(
        "Tem certeza que deseja excluir sua conta? Esta ação não pode ser desfeita."
    );
    


    if (!confirmar) return;


    const id = localStorage.getItem("id_player");

    try {
        const resposta = await fetch(`${API}/player/${id}`, {
            method: "DELETE"
        });

        const dados = await resposta.json();

        if (!resposta.ok) {
            alert("Faça login primeiro!");
            return;
        }

        localStorage.removeItem("id_player");

        alert("Conta excluída com sucesso!");

        window.location.href = "index.html";

    } catch (erro) {
        console.error(erro);
        alert("Erro ao conectar ao servidor.");
    }
}





//game delete//
async function excluirJogo() {
    const id_player = localStorage.getItem("id_player");
    const nomeJogo = document.getElementById("delInput").value.trim();

    if (!id_player) {
        alert("Faça login primeiro!");
        return;
    }

    if (!nomeJogo) {
        alert("Digite o nome do jogo!");
        return;
    }

    const confirmar = confirm(
        `Tem certeza que deseja excluir "${nomeJogo}"?`
    );

    if (!confirmar) return;

    const resposta = await fetch(
        `${API}/jogos/player/${id_player}/${encodeURIComponent(nomeJogo)}`,
        {
            method: "DELETE"
        }
    );

    const dados = await resposta.json();

    if (!resposta.ok) {
        alert(dados.erro);
        return;
    }

    alert(dados.mensagem);
}

 //dados de perfil do player//
async function dadosPlayer() {
      console.log("Função executou");
    const dds = document.getElementById("dds");
    console.log(dds);

    if (!dds) return;

    try {
        const id = localStorage.getItem("id_player");

        if (!id) {
            dds.innerHTML = "<p>Faça login primeiro.</p>";
            return;
        }

        const resposta = await fetch(`${API}/player/${id}`);
        console.log("Status:", resposta.status);

        const player = await resposta.json();
        console.log("Player:", player);


        dds.innerHTML = `
<div class="infoItem">
                <div class="infoItem">
                <p class="pDestacado">
                    <strong style="font-family: f1;">
                        Nome de Usuário:
                    </strong>
                </p>
                <p>${player.nick}</p>
            </div>

            <div class="infoItem">
                <p class="pDestacado">
                    <strong style="font-family: f1;">
                        Email:
                    </strong>
                </p>
                <p>${player.email}</p>
            </div>

            <div class="infoItem">
                <p class="pDestacado">
                    <strong style="font-family: f1;">
                        Data de Nascimento:
                    </strong>
                </p>
                <p>${new Date(player.nascimento).toLocaleDateString("pt-BR")}</p>
            </div>
        `; 

    } catch (erro) {
        console.log(erro);
    }
}

window.onload = () => {
    dadosPlayer();
};










