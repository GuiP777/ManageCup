const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { User_Corrida } = require("../model");
const bcrypt = require('bcrypt');
const mensagem = require('../utils/mensagem');

module.exports = {

    SalvarPerfilCorrida: async function (req, res) {
        var distancia = req.body['distancia'];
        var tempo = req.body['tempo'];
        var nivel = req.body['nivel'];


        var recordePessoal = distancia + "Km em " + tempo;


        const perfilExiste = await User_Corrida.findOne({
            where: {
                id_usuario: req.session.usuario_id
            }
        });

        if (perfilExiste) {
            await User_Corrida.update({
                recordePessoal: recordePessoal,
                nivel: nivel,
            },
                {
                    where: {
                        id_usuario: req.session.usuario_id
                    }
                });
            mensagem(req, 'sucesso', "Perfil atualizado com sucesso!");

        } else {
            await User_Corrida.create({
                recordePessoal: recordePessoal,
                nivel: nivel,
                id_usuario: req.session.usuario_id

            });
            mensagem(req, 'sucesso', "Perfil criado com sucesso!");
        }

        req.session.perfis.corrida = true ;

        res.redirect('/');
    },


}