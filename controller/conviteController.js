const { Convite, User_Voleibol_Jogador, Equipes, User_Voleibol_Treinador } = require("../model");
const mensagem = require('../utils/mensagem');

function notificarJogador(req, id_usuario) {
    const io = req.app.get('io');

    console.log("ID do usuário:", id_usuario);
    console.log("IO existe:", !!io);

    io.to(`usuario_${id_usuario}`).emit('novaNotificacao', true);
    console.log("Notificação enviada!");

}

module.exports = {

    convidar: async function (req, res) {
        const id_jogador = req.params.id_jogador;
        const id_equipe = req.params.id_equipe;

        const usuario = await User_Voleibol_Jogador.findByPk(id_jogador);
        const resultado = await Convite.findAll({
            where: {
                id_equipe: id_equipe, id_jogador: id_jogador
            }
        });

        if (resultado.length > 0) {
            for (let i = 0; i < resultado.length; i++) {
                if (resultado[i].status === "recusado") {
                    mensagem(req, 'erro', "Olhe suas notificações para entender o motivo da recusa");
                    return res.redirect('/equipe');
                }
            }
            for (let i = 0; i < resultado.length; i++) {
                if (resultado[i].status === "recusadoVisto" || resultado[i].status === "removido") {
                    await Convite.create({
                        status: "pendente", id_equipe: id_equipe, id_jogador: id_jogador
                    })

                    notificarJogador(req, usuario.id_usuario);
                    mensagem(req, 'sucesso', "Jogador convidado novamente");
                    return res.redirect('/equipe');
                }
            }
            res.redirect('/equipe');
        } else if (resultado.length == 0) {
            await Convite.create({
                status: "pendente", id_equipe: id_equipe, id_jogador: id_jogador
            })

            notificarJogador(req, usuario.id_usuario);
            mensagem(req, 'sucesso', "Jogador convidado");
            res.redirect('/equipe');
        }
        else {
            mensagem(req, 'erro', "Já convidou este jogador!!");
            res.redirect('/equipe');
        }
    },

    conviteAceito: async function (req, res) {
        const jogador = await User_Voleibol_Jogador.findOne({
            where: {
                id_usuario: req.session.usuario_id
            }
        });

        const id_equipe = req.params.id_equipe;
        const id_convite = req.params.id_convite;
        const id_jogador = jogador.id;

        const equipe = await Equipes.findByPk(id_equipe);
        const treinador = await User_Voleibol_Treinador.findByPk(equipe.id_treinador);

        await Convite.update({
            status: "aceito",
        },
            {
                where: {
                    id: id_convite
                }
            });

        await User_Voleibol_Jogador.update({
            id_equipe: id_equipe,
        },
            {
                where: {
                    id: id_jogador
                }
            });

        notificarJogador(req, treinador.id_usuario);
        mensagem(req, 'sucesso', "Convite aceito");

        res.redirect("/notificacao")

    },

    conviteRecusa: async function (req, res) {

        const id_convite = req.params.id_convite;
        const motivo = req.body.motivo;

        const convite = await Convite.findByPk(id_convite);
        const equipe = await Equipes.findByPk(convite.id_equipe);
        const treinador = await User_Voleibol_Treinador.findByPk(equipe.id_treinador);

        await Convite.update({
            status: "recusado",
            motivo: motivo,
        },
            {
                where: {
                    id: id_convite
                }
            });

        notificarJogador(req, treinador.id_usuario);
        mensagem(req, 'info', "Convite recusado e motivo enviado");

        res.redirect("/notificacao")

    },

    recusadoVisto: async function (req, res) {
        const id_convite = req.params.id_convite;

        await Convite.update({
            status: "recusadoVisto",

        },
            {
                where: {
                    id: id_convite
                }
            });

        res.redirect("/notificacao")
    }

}