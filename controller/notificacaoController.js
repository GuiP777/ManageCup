const { Sequelize } = require("sequelize");
const { Convite, Equipes, User_Voleibol_Treinador, User_Voleibol_Jogador, User } = require("../model");
const mensagem = require('../utils/mensagem');

module.exports = {

    pagNotificacao: async function (req, res) {

        let dadosConvitesJogadores = [];
        let dadosConvitesTreinador = [];

        if (res.locals.perfis.voleibolJogador) {
            const jogador = await User_Voleibol_Jogador.findOne({
                where: {
                    id_usuario: req.session.usuario_id
                }
            });

            const id_jogador = jogador.id;

            const dadosJogador = await Convite.findAll({
                raw: false,
                include: [
                    {
                        model: Equipes,
                        as: "equipe",

                        include: [
                            {
                                model: User_Voleibol_Treinador,
                                as: "treinador"
                            }
                        ]
                    }
                ],
                where: {
                    id_jogador: id_jogador
                },
                order: [
                    [
                        Sequelize.literal(`
                            CASE
                                WHEN status = 'pendente' THEN 1
                                WHEN status = 'recusado' THEN 2
                                WHEN status = 'recusadoVisto' THEN 3
                                WHEN status = 'aceito' THEN 4
                                ELSE 5
                            END
                        `),
                        'ASC'
                    ]
                ]
            });

            dadosConvitesJogadores = dadosJogador;
        }

        if (res.locals.perfis.voleibolTreinador) {
            const treinador = await User_Voleibol_Treinador.findOne({
                raw: false,
                include: {
                    model: Equipes,
                    as: "equipeTreinador"
                },
                where: {
                    id_usuario: req.session.usuario_id
                }
            });

            const dadosTreinador = await Convite.findAll({
                raw: false,
                include: [
                    {
                        model: Equipes,
                        as: "equipe",

                        include: [
                            {
                                model: User_Voleibol_Treinador,
                                as: "treinador"
                            },

                        ],

                        model: User_Voleibol_Jogador,
                        as: "jogador",

                        include: [
                            {
                                model: User,
                                as: "donoDoPerfil"
                            }
                        ]

                    }
                ],
                where: {
                    id_equipe: treinador.equipeTreinador.id
                },
                order: [
                    [
                        Sequelize.literal(`
                            CASE
                                WHEN status = 'pendente' THEN 1
                                WHEN status = 'recusado' THEN 2
                                WHEN status = 'recusadoVisto' THEN 3
                                WHEN status = 'aceito' THEN 4
                                ELSE 5
                            END
                        `),
                        'ASC'
                    ]
                ]
            });

            dadosConvitesTreinador = dadosTreinador;
        }

        res.render("user/notificacao", { dadosConvitesJogadores: dadosConvitesJogadores, dadosConvitesTreinador: dadosConvitesTreinador });
    },

}