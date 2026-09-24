const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { User_Voleibol_Treinador, Equipes, User_Voleibol_Jogador } = require("../model");
const bcrypt = require('bcrypt');
const mensagem = require('../utils/mensagem');

module.exports = {

    SalvarPerfilTreinador: async function (req, res) {
        var nomeEquipe = req.body['nomeEquipe'];
        var categoria = req.body['categoria'];

        const perfilExiste = await User_Voleibol_Treinador.findOne({
            where: {
                id_usuario: req.session.usuario_id
            }
        });

        if (perfilExiste) {
            mensagem(req, 'erro', "Perfil ja criado!");
            return res.redirect('/perfil');

        } else {
            await User_Voleibol_Treinador.create({
                nomeEquipe: nomeEquipe,
                categoria: categoria,
                id_usuario: req.session.usuario_id

            });

            mensagem(req, 'sucesso', "Perfil criado com sucesso!");

            let treinador = await User_Voleibol_Treinador.findOne({
                where: {
                    id_usuario: req.session.usuario_id
                }
            })

            await Equipes.create({
                id_treinador: treinador.id
            });
        }

        req.session.perfis.voleibolTreinador = true;

        res.redirect('/perfil');
    },

    pagEditar: async function (req, res) {

        const id = req.session.usuario_id;

        const dadosTreinador = await User_Voleibol_Treinador.findOne({
            where: {
                id_usuario: id
            }
        });


        res.render('user/editarPerfil.ejs', { dados: dadosTreinador, perfil: 'voleibolTreinador' });
    },

    atualizarPerfilTreinador: async function (req, res) {
        var nomeEquipe = req.body['nomeEquipe'];
        var categoria = req.body['categoria'];

        if (categoria) {
            const treinador = await User_Voleibol_Treinador.findOne({
                where: { id_usuario: req.session.usuario_id }
            });
            if (treinador.categoria !== categoria) {
                const equipe = await Equipes.findOne({
                    where: { id_treinador: treinador.id }
                });
                const jogadoresNaEquipe = await User_Voleibol_Jogador.findAll({
                    where: { id_equipe: equipe.id }
                });

                if (jogadoresNaEquipe.length > 0) {
                    mensagem(req, 'erro', "Você deve remover todos os jogadores da sua equipe para poder modificar a categoria");
                    return res.redirect('/perfil');
                }
            }
        }

        if (!nomeEquipe && !categoria) {
            mensagem(req, 'erro', "Preencha pelo menos uma informação!");
            return res.redirect('/perfil');
        }

        await User_Voleibol_Treinador.update({
            ...(nomeEquipe && { nomeEquipe: nomeEquipe }),
            ...(categoria && { categoria: categoria })
        },
            {
                where: {
                    id_usuario: req.session.usuario_id
                }
            });

        mensagem(req, 'sucesso', "Perfil atualizado com sucesso!");

        res.redirect('/perfil');
    }
}