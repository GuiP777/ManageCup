const Campeonatos = require('./campeonatos');
const User = require('./user');
const User_Boxe = require('./user_boxe');

User.hasOne(User_Boxe, {
    foreignKey: 'id_usuario',
    as: 'perfilBoxe'
});

User_Boxe.belongsTo(User, {
    foreignKey: 'id_usuario',
    as: 'donoDoPerfil'
});

const User_Corrida = require('./user_corrida');

User.hasOne(User_Corrida, {
    foreignKey: 'id_usuario',
    as: 'perfilCorrida'
});

User_Corrida.belongsTo(User, {
    foreignKey: 'id_usuario',
    as: 'donoDoPerfil'
});

const User_Voleibol_Jogador = require('./user_voleibol_jogador');

User.hasOne(User_Voleibol_Jogador, {
    foreignKey: 'id_usuario',
    as: 'perfilVoleibolJogador'
});

User_Voleibol_Jogador.belongsTo(User, {
    foreignKey: 'id_usuario',
    as: 'donoDoPerfil'
});

const User_Voleibol_Treinador = require('./user_voleibol_treinador');

User.hasOne(User_Voleibol_Treinador, {
    foreignKey: 'id_usuario',
    as: 'perfilVoleibolTreinador'
});

User_Voleibol_Treinador.belongsTo(User, {
    foreignKey: 'id_usuario',
    as: 'donoDoPerfil'
});

const Inscritos_Campeonato = require('./inscritos_campeonato');

User.hasMany(Inscritos_Campeonato, {
    foreignKey: 'id_usuario',
    as: 'inscritosUser'
});

Inscritos_Campeonato.belongsTo(User, {
    foreignKey: 'id_usuario',
    as: 'userInscrito'
});

Campeonatos.hasMany(Inscritos_Campeonato, {
    foreignKey: 'id_campeonato',
    as: 'inscritosCamp'
});

Inscritos_Campeonato.belongsTo(Campeonatos, {
    foreignKey: 'id_campeonato',
    as: 'campeonatoInscritos'
});

const Equipes = require('./equipes');

User_Voleibol_Treinador.hasOne(Equipes, {
    foreignKey: 'id_treinador',
    as: 'equipeTreinador'
});

Equipes.belongsTo(User_Voleibol_Treinador, {
    foreignKey: 'id_treinador',
    as: 'treinador'
});

Equipes.hasMany(User_Voleibol_Jogador, {
    foreignKey: 'id_equipe',
    as: 'jogadores'
});

User_Voleibol_Jogador.belongsTo(Equipes, {
    foreignKey: 'id_equipe',
    as: 'equipeJogador'
});

const Convite = require('./convite');

Equipes.hasMany(Convite, {
    foreignKey: 'id_equipe',
    as: 'convite'
});

Convite.belongsTo(Equipes, {
    foreignKey: 'id_equipe',
    as: 'equipe'
});

User_Voleibol_Jogador.hasMany(Convite, {
    foreignKey: 'id_jogador',
    as: 'conviteJogador'
});

Convite.belongsTo(User_Voleibol_Jogador, {
    foreignKey: 'id_jogador',
    as: 'jogador'
});

const Postagem = require('./postagem');

User.hasMany(Postagem, {
    foreignKey: 'id_usuario',
    as: 'postagemUser'
});

Postagem.belongsTo(User, {
    foreignKey: 'id_usuario',
    as: 'userPostagem'
});

const Postagem_Comentarios = require('./postagem_comentarios');

User.hasMany(Postagem_Comentarios, {
    foreignKey: 'id_usuario',
    as: 'postagemComentarioUser'
});

Postagem_Comentarios.belongsTo(User, {
    foreignKey: 'id_usuario',
    as: 'userPostagemComentario'
});

Postagem.hasMany(Postagem_Comentarios, {
    foreignKey: 'id_postagem',
    as: 'comentarios'
});

Postagem_Comentarios.belongsTo(Postagem, {
    foreignKey: 'id_postagem',
    as: 'postagem'
});

const Chat = require('./chat');

User.hasMany(Chat, {
    foreignKey: 'id_remetente',
    as: 'remetente'
});

Chat.belongsTo(User, {
    foreignKey: 'id_remetente',
    as: 'chatUserRemetente'
});

User.hasMany(Chat, {
    foreignKey: 'id_destinatario',
    as: 'destinatario'
});

Chat.belongsTo(User, {
    foreignKey: 'id_destinatario',
    as: 'chatUserDestinatario'
});

module.exports = {
    User,
    User_Boxe,
    User_Corrida,
    User_Voleibol_Jogador,
    User_Voleibol_Treinador,
    Campeonatos,
    Inscritos_Campeonato,
    Equipes,
    Convite,
    Chat,
    Postagem,
    Postagem_Comentarios
};