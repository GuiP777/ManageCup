const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { User_Voleibol_Treinador, Equipes } = require("../model");
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
            await User_Voleibol_Treinador.update({
                nomeEquipe: nomeEquipe,
                categoria: categoria,
            },
                {
                    where: {
                        id_usuario: req.session.usuario_id
                    }
                });

            mensagem(req, 'sucesso', "Perfil atualizado com sucesso!");

        } else {
            await User_Voleibol_Treinador.create({
                nomeEquipe: nomeEquipe,
                categoria: categoria,
                id_usuario: req.session.usuario_id

            });

            mensagem(req, 'sucesso', "Perfil criado com sucesso!");

            let treinador = await User_Voleibol_Treinador.findOne({
                where:{
                    id_usuario: req.session.usuario_id
                }
            })

            await Equipes.create({
                id_treinador: treinador.id
            });
        }

        req.session.perfis.voleibolTreinador = true ;

        res.redirect('/');
    },


}