const express = require('express');
var session = require('express-session');
const app = express();
app.use(express.urlencoded({ extended: true }))
app.set('view engine', 'ejs')
app.use(express.static("public"));
app.use(session({
    secret: '2C44-4D44-WppQ38S',
    resave: false,
    saveUninitialized: true
}));
const formatarDataMensagem = require('./utils/formatarDataMensagem');

const http = require('http');
const server = http.createServer(app);
const { Server } = require('socket.io');
const io = new Server(server);

io.on('connection', (socket) => {

    socket.on('identificarUsuario', (usuarioId) => {

        socket.join(`usuario_${usuarioId}`);

    });

    socket.on('enviarMensagem', async (dados) => {

        const novaMensagem = await Chat.create({
            id_remetente: dados.remetente,
            id_destinatario: dados.destinatario,
            mensagem: dados.mensagem,
            lido: false,
            creat_at: new Date()
        });

        const mensagem = {
            remetente: novaMensagem.id_remetente,
            destinatario: novaMensagem.id_destinatario,
            mensagem: novaMensagem.mensagem,
            horario: novaMensagem.creat_at
        };

        io.to(`usuario_${dados.destinatario}`)
            .emit('novaMensagem', mensagem);

        io.to(`usuario_${dados.remetente}`)
            .emit('mensagemEnviada', mensagem);

    });

});

(async () => {
    const database = require('./config/db');
    try {
        const resultado = await database.sync();
        console.log(resultado);
    } catch (error) {
        console.log(error);
    }
})();

const { Chat } = require("./model");
const auth = require("./middleware/auth");
const userController = require("./controller/userController");
const user_boxeController = require("./controller/user_boxeController");
const user_corridaController = require("./controller/user_corridaController");
const user_voleibol_treinadorController = require("./controller/user_voleibol_treinadorController");
const user_voleibol_jogadorController = require("./controller/user_voleibol_jogadorController");
const campeonatoController = require("./controller/campeonatoController");
const inscritos_campeonatoController = require("./controller/inscritos_campeonatoController");
const equipeController = require("./controller/equipeController");
const conviteController = require("./controller/conviteController");
const notificacaoController = require("./controller/notificacaoController");
const chatController = require("./controller/chatController");
const postagemController = require("./controller/postagemController");

app.use(async (req, res, next) => {
    res.locals.rotaAtual = req.path;
    res.locals.username = req.session.username;
    res.locals.usuario_id = req.session.usuario_id;
    res.locals.logado = req.session.logado;
    res.locals.avatar = req.session.avatar;
    res.locals.perfis = req.session.perfis || {
        voleibolTreinador: false,
        voleibolJogador: false,
        boxe: false,
        corrida: false
    };
    res.locals.formatarDataMensagem = formatarDataMensagem;
    res.locals.mensagem = req.session.mensagem;
    delete req.session.mensagem;

    next();
});

app.get('/', (req, res) => {
    res.render('index');
});
app.get('/login', userController.pagLogin);
app.get('/logout', userController.logout);
app.post('/login', userController.efetuaLogin);
app.get('/logout', auth.logado, userController.logout);
app.get('/cadastro', userController.pagCadastro);
app.post('/cadastro', userController.efetuaCadastro);
app.get('/perfil', auth.logado, userController.pagPerfil);
app.get('/editar_usuario', auth.logado, userController.pagEditarUsuario);
app.post('/editar_usuario', auth.logado, userController.atualizarUsuario);

app.get('/editar_perfil/:tipo', (req, res) => {

    const tipo = req.params.tipo;

    if (tipo === 'boxe') {
        return user_boxeController.pagEditar(req, res);
    }

    if (tipo === 'corrida') {
        return user_corridaController.pagEditar(req, res);
    }

    if (tipo === 'voleibolTreinador') {
        return user_voleibol_treinadorController.pagEditarTreinador(req, res);
    }

    if (tipo === 'voleibolJogador') {
        return user_voleibol_jogadorController.pagEditarJogador(req, res);
    }

    return res.status(404).send('Perfil não encontrado');
});

app.post('/atualiza_perfil_boxe', auth.logado, user_boxeController.SalvarPerfilBoxe);

app.post('/atualiza_perfil_corrida', auth.logado, user_corridaController.SalvarPerfilCorrida);

app.post('/atualiza_perfil_voleibolTreinador', auth.logado, user_voleibol_treinadorController.SalvarPerfilTreinador);

app.post('/atualiza_perfil_voleibolJogador', auth.logado, user_voleibol_jogadorController.SalvarPerfilJogador);

app.get('/campeonato', campeonatoController.pagCampeonatos);
app.get('/filtrarCampeonatos', campeonatoController.filtrarCampeonatos);
app.get('/infoCampeonato/:id', campeonatoController.infoCampeonato);
app.get('/cadastroCampeonato', auth.logado, campeonatoController.pagCadastroCampeonato);
app.post('/cadastroCampeonato', auth.logado, campeonatoController.efetuaCadastroCampeonato);

app.get('/inscrever/:id', auth.logado, inscritos_campeonatoController.inscrever);

app.get('/equipe', auth.logado, equipeController.pagEquipe);
app.get('/removerJogador/:id_jogador/:id_equipe', auth.logado, equipeController.removerJogador);

app.get('/convidar/:id_jogador/:id_equipe', auth.logado, conviteController.convidar);
app.get('/conviteAceito/:id_equipe/:id_convite', auth.logado, conviteController.conviteAceito);
app.post('/conviteRecusa/:id_convite', auth.logado, conviteController.conviteRecusa);
app.get('/recusadoVisto/:id_convite', auth.logado, conviteController.recusadoVisto);

app.get('/notificacao', auth.logado, notificacaoController.pagNotificacao);

app.get('/chat/:id_destinatario', auth.logado, chatController.chatConversa);
app.get('/chat', auth.logado, chatController.pagChat);


server.listen(3000, () => {

});