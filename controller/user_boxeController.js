const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { User_Boxe } = require("../model");
const bcrypt = require('bcrypt');
const mensagem = require('../utils/mensagem');

module.exports = {

    SalvarPerfilBoxe: async function (req, res) {
        var apelido = req.body['apelido'];
        var peso = req.body['peso'];
        var treinador = req.body['treinador'];
        var quantidadeLutas = req.body['quantidadeLutas'];

        const perfilExiste = await User_Boxe.findOne({
            where: {
                id_usuario: req.session.usuario_id
            }
        });

        if (perfilExiste) {
            mensagem(req, 'erro', "Perfil ja criado!");
            return res.redirect('/perfil');

        } else {
            await User_Boxe.create({
                apelido: apelido,
                peso: peso,
                treinador: treinador,
                quantidadeLutas: quantidadeLutas,
                id_usuario: req.session.usuario_id

            });
            mensagem(req, 'sucesso', "Perfil criado com sucesso!");
        }

        req.session.perfis.boxe = true;

        res.redirect('/perfil');
    },

    pagEditar: async function (req, res) {

        const id = req.session.usuario_id;

        const dadosBoxe = await User_Boxe.findOne({
            where: {
                id_usuario: id
            }
        });


        res.render('user/editarPerfil.ejs', { dados: dadosBoxe, perfil: 'boxe' });
    },

    atualizarPerfilBoxe: async function (req, res) {
        var apelido = req.body['apelido'];
        var peso = req.body['peso'];
        var treinador = req.body['treinador'];
        var quantidadeLutas = req.body['quantidadeLutas'];

        if (!apelido && !peso && !treinador && !quantidadeLutas) {
            mensagem(req, 'erro', "Preencha pelo menos uma informação!");
            return res.redirect('/perfil');
        }

        await User_Boxe.update({
            ...(apelido && { apelido: apelido }),
            ...(peso && { peso: peso }),
            ...(treinador && { treinador: treinador }),
            ...(quantidadeLutas && { quantidadeLutas: quantidadeLutas })
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