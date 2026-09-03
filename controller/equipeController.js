const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { Equipes, User_Voleibol_Treinador, User_Voleibol_Jogador, User, Convite } = require("../model");
const mensagem = require('../utils/mensagem');

module.exports = {
    pagEquipe: async function (req, res) {

        let treinador = await User_Voleibol_Treinador.findOne({
            where:{
                id_usuario:req.session.usuario_id
            }
        });

        let dados = await Equipes.findOne({
            raw: false,
            include: [
                {
                    model: User_Voleibol_Treinador,
                    as: 'treinador',
                },
                {
                    model: User_Voleibol_Jogador,
                    as: 'jogadores',

                    include: [
                        {
                            model: User,
                            as: 'donoDoPerfil',
                            attributes: {
                                exclude: ['senha']
                            }
                        }
                    ]
                }
            ],
            where: {
                id_treinador: treinador.id
            }
        });

        let jogadores = await User_Voleibol_Jogador.findAll({
            raw: false,
            include: [
                {
                    model: User,
                    as: 'donoDoPerfil',
                },
                {
                    model: Convite,
                    as: 'conviteJogador',

                    where: {
                        id_equipe: dados.id
                    },
                    required: false
                }
            ]
        });

        //console.log(JSON.stringify(jogadores, null, 2));

        res.render('equipe/index', { dadosEquipe: dados, dadosJogadores: jogadores });
    },

    removerJogador: async function (req, res) {
        
        const id_jogador = req.params.id_jogador;
        const id_equipe = req.params.id_equipe;

        let resultado = await User_Voleibol_Jogador.update(
            {id_equipe: null},
            {
                where:{
                    id: id_jogador
                }
            }
        );
        await Convite.update(
            {status: "removido"},
            {
                where:{
                    id_equipe: id_equipe,
                    id_jogador:id_jogador
                }
            }
        );

        mensagem(req, 'sucesso', "Jogador removido com sucesso");
        res.redirect("/equipe");
    }


}