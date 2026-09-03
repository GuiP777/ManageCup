const { Chat, User } = require("../model");
const { Op } = require('sequelize');
const mensagem = require('../utils/mensagem');

module.exports = {

    pagChat: async function (req, res) {

        const id_remetente = req.session.usuario_id

        const conversantes = await Chat.findAll({
            where: {
                [Op.or]: [
                    {
                        id_remetente: id_remetente,
                    },
                    {
                        id_destinatario: id_remetente
                    }
                ]
            },
            order: [
                ['creat_at', 'DESC']
            ]
        });

        const id_conversantes = [];

        conversantes.forEach(conversa => {
            if (conversa.id_remetente == id_remetente) {
                if (!id_conversantes.includes(conversa.id_destinatario)) {
                    id_conversantes.push(conversa.id_destinatario);
                }
            }
            else {
                if (!id_conversantes.includes(conversa.id_remetente)) {
                    id_conversantes.push(conversa.id_remetente);
                }
            }
        });

        const dadosConversantes = await User.findAll({
            where: {
                id: id_conversantes
            }
        });

        const conversas = [];

        for (const conversante of dadosConversantes) {

            const ultimaMensagem = await Chat.findOne({
                where: {
                    [Op.or]: [
                        {
                            id_remetente: id_remetente,
                            id_destinatario: conversante.id
                        },
                        {
                            id_remetente: conversante.id,
                            id_destinatario: id_remetente
                        }
                    ]
                },
                order: [
                    ['creat_at', 'DESC']
                ]
            });

            conversas.push({ usuario: conversante, ultimaMensagem: ultimaMensagem });
        }

        res.render("chat/index", { dadosConversantes: conversas });
    },

    chatConversa: async function (req, res) {

        const id_destinatario = req.params.id_destinatario;

        const dados_destinatario = await User.findByPk(id_destinatario);

        const mensagens = await Chat.findAll({
            where: {
                [Op.or]: [
                    {
                        id_remetente: req.session.usuario_id,
                        id_destinatario: id_destinatario
                    },
                    {
                        id_remetente: id_destinatario,
                        id_destinatario: req.session.usuario_id
                    }
                ]
            },
            order: [
                ['creat_at', 'ASC']
            ]
        });

        const id_remetente = req.session.usuario_id

        const conversantes = await Chat.findAll({
            where: {
                [Op.or]: [
                    {
                        id_remetente: id_remetente,
                    },
                    {
                        id_destinatario: id_remetente
                    }
                ]
            },
            order: [
                ['creat_at', 'DESC']
            ]
        });

        const id_conversantes = [];

        conversantes.forEach(conversa => {
            if (conversa.id_remetente == id_remetente) {
                if (!id_conversantes.includes(conversa.id_destinatario)) {
                    id_conversantes.push(conversa.id_destinatario);
                }
            }
            else {
                if (!id_conversantes.includes(conversa.id_remetente)) {
                    id_conversantes.push(conversa.id_remetente);
                }
            }
        });

        const dadosConversantes = await User.findAll({
            where: {
                id: id_conversantes
            }
        });

        const conversas = [];

        for (const conversante of dadosConversantes) {

            const ultimaMensagem = await Chat.findOne({
                where: {
                    [Op.or]: [
                        {
                            id_remetente: id_remetente,
                            id_destinatario: conversante.id
                        },
                        {
                            id_remetente: conversante.id,
                            id_destinatario: id_remetente
                        }
                    ]
                },
                order: [
                    ['creat_at', 'DESC']
                ]
            });

            conversas.push({ usuario: conversante, ultimaMensagem: ultimaMensagem });
        }

        res.render('chat/conversa', { dadosDestinatario: dados_destinatario, mensagens: mensagens, dadosConversantes: conversas });

    }

}