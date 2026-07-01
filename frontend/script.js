const API = "http://localhost:3000"


//acontecer antes de tudo//
document.addEventListener("DOMContentLoaded", () => {
  
      //trocar a cor de fundo//
    const btn = document.querySelector("#toggle-btn");
    if (btn) {
        btn.addEventListener("click", () => {
            document.documentElement.classList.toggle("dark-mode");
            const éEscuro = document.documentElement.classList.contains("dark-mode");
            localStorage.setItem("tema", éEscuro ? "escuro" : "claro");
        });
    }
     
    //codigo bomba do Juliano para a foto de perfil//
    const image1 = document.getElementById("minhaimagem");
    const inputcp = document.getElementById("inputArquivo");
    const botaocp = document.getElementById("botaoconfp");

    if (image1 && inputcp && botaocp) {
        botaocp.addEventListener("click", () => inputcp.click());
        inputcp.addEventListener("change", (event) => {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => { image1.src = e.target.result; };
                reader.readAsDataURL(file);
            }
        });
    }
    
 //rodar o header nick//
 async function HeaderNick() {
    const nomeHeader = document.getElementById("nomeHeader");
    if (!nomeHeader) return;

    // Mostra imediatamente o nick salvo no localStorage (Zero lag)
    const nickSalvo = localStorage.getItem("nick");
    if (nickSalvo) {
        nomeHeader.textContent = nickSalvo;
    }

    const id = localStorage.getItem("id_player");
    if (!id) return;

    try {
        // Faz o fetch de forma silenciosa em segundo plano
        const resposta = await fetch(`${API}/player/${id}`);
        const player = await resposta.json();

        if (player.nick && player.nick !== nickSalvo) {
            nomeHeader.textContent = player.nick;
            localStorage.setItem("nick", player.nick);
        }
    } catch (erro) {
        console.error("Erro ao atualizar nick do header:", erro);
    }
}
    HeaderNick();

     // fazer as funçoes funcionar -->//

     //dados do perfil//
    if (document.getElementById("dds")) {
        setTimeout(dadosPlayer, 0);
    }
      //aparecer os jogos no inicio//
    if (document.getElementById("paginaDeJogos")) {
        setTimeout(carregarJogo, 0);
    }
    //preview da capa do jogo (enviar.html)//
    const inputCapa = document.getElementById("capaArquivo");
    const previewCapa = document.getElementById("previewCapa");
    if (inputCapa && previewCapa) {
        inputCapa.addEventListener("change", () => {
            const file = inputCapa.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (e) => {
                    previewCapa.src = e.target.result;
                    previewCapa.style.display = "block";
                };
                reader.readAsDataURL(file);
            }
        });
    }

       //pesquisar funcionar//
    const campoBusca = document.getElementById("pesquisar");
    if (campoBusca) {
        campoBusca.addEventListener("input", () => {
            filtrarJogos(campoBusca.value);
        });
    }
});
     //Pesquisar Lupa//
function filtrarJogos(Lupa) {
    const cards = document.querySelectorAll("#paginaDeJogos .aDosJogos");
    const LupaBusca = Lupa.trim().toLowerCase();

    cards.forEach(card => {
        const titulo = card.querySelector("h3")?.textContent.toLowerCase() ?? "";
        const nick = card.querySelector(".nickCriador")?.textContent.toLowerCase() ?? "";
        const visivel = titulo.includes(LupaBusca) || nick.includes(LupaBusca);
        card.style.display = visivel ? "" : "none";
    });

    const semResultado = document.getElementById("semResultadoBusca");
    const algumVisivel = [...cards].some(c => c.style.display !== "none");

    if (!algumVisivel && LupaBusca !== "") {
        if (!semResultado) {
            const msg = document.createElement("p");
            msg.id = "semResultadoBusca";
            msg.textContent = `Nenhum jogo encontrado para "${Lupa}".`;
            msg.style.cssText = "width:100%; text-align:center; color:gray; padding: 32px 0;";
            document.getElementById("paginaDeJogos").appendChild(msg);
        }
    } else if (semResultado) {
        semResultado.remove();
    }
}


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

const dados = await resposta.json();

if (!resposta.ok) {
    alert(JSON.stringify(dados));
    return;
}

localStorage.setItem("id_player", dados.id);

localStorage.setItem("id_player", dados.id);
localStorage.setItem("nick", dados.nick);
alert("Você foi cadastrado com sucesso!");
window.location.href = "inicio.html";

}

catch(erro) {
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
        localStorage.setItem("nick", dados.nick);
        alert("Login feito!");
        window.location.href = "inicio.html";

    } catch (erro) {
        console.error(erro);
        alert("Erro ao conectar ao servidor.");
    }
}






async function JogoPost(event) {
    event.preventDefault();

    const titulo = document.getElementById("titulo").value;
    const url = document.getElementById("urljogo").value;
    const arquivoCapa = document.getElementById("capaArquivo").files[0];
    const statusUpload = document.getElementById("statusUpload");
    const botaoPublicar = document.getElementById("idPublicar");

    if (!arquivoCapa) {
        alert("Selecione uma imagem para a capa.");
        return;
    }

    try {
        // trava o botão e mostra status enquanto sobe a imagem//
        if (botaoPublicar) botaoPublicar.disabled = true;
        if (statusUpload) statusUpload.style.display = "block";

        const capaUrl = await enviarImagemParaCloudinary(arquivoCapa);

        const dadosJogos = {
            titulo,
            url,
            capa: capaUrl,
            id_player: localStorage.getItem("id_player")
        };

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
            window.location.href = "inicio.html";
        } else {
            alert(dados.erro);
        }

    } catch (erro) {
        console.log(erro);
        alert("Erro ao enviar a imagem ou publicar o jogo.");
    } finally {
        if (botaoPublicar) botaoPublicar.disabled = false;
        if (statusUpload) statusUpload.style.display = "none";
    }
}

async function carregarJogo() {
    const paginaDeJogos = document.getElementById("paginaDeJogos");
    if (!paginaDeJogos) return;
    paginaDeJogos.innerHTML = "<p style='text-align:center; color:gray;'>Carregando jogos...</p>";

    try {
        const resposta = await fetch(`${API}/jogos`);
        const jogos = await resposta.json();

        if (jogos.length === 0) {
            paginaDeJogos.innerHTML = "<p>Nenhum jogo encontrado.</p>";
            return;
        }

        const html = jogos.map(jogo => `
              <a href="${jogo.url}" class="aDosJogos" data-criador="${jogo.nick || 'Anônimo'}">
              <img src="${jogo.capa}" alt="${jogo.titulo}" class="fotoDoJogo">
              <h3>${jogo.titulo}</h3>
             
               </a>
        `).join("");
       paginaDeJogos.innerHTML = `
    <a href="enviar.html" class="aDosJogos" style="text-align:center" data-criador="Publique o seu jogo">
         <img src="fotos/CriarJogos+.png" alt="sla" style="width: 150px; height: 150px; margin-top: 95px;">
        
        
    </a>
` + html;

document.querySelectorAll(".aDosJogos").forEach(card => {

    card.addEventListener("mousemove", e => {

        const rect = card.getBoundingClientRect();

        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        card.style.setProperty("--x", `${x}px`);
        card.style.setProperty("--y", `${y}px`);

        // Inclinação

        const rx = ((x / rect.width) - 0.5) * 8;
        const ry = ((y / rect.height) - 0.5) * -8;

        card.style.setProperty("--rx", `${rx}deg`);
        card.style.setProperty("--ry", `${ry}deg`);
    });

    card.addEventListener("mouseleave", () => {
        card.style.setProperty("--rx","0deg");
        card.style.setProperty("--ry","0deg");
    });

});
    } catch (erro) {
        console.error(erro);
        paginaDeJogos.innerHTML = "<p>Erro ao carregar os jogos.</p>";
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

//teste de música//