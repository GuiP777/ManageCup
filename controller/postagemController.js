const { Postagem, Postagem_Comentarios } = require("../model");
const mensagem = require('../utils/mensagem');

module.exports = {

    pagPostagens: async function (req, res) {

        const esporte = req.params.esporte;

        const nomesEsportes = {
            boxe: 'Boxe',
            corrida: 'Corrida',
            voleibol: 'Voleibol'
        };

        const nomeEsporte = nomesEsportes[esporte];

        const postagens = await Postagem.findAll({
            where: {
                esporte: esporte
            },
            //include: [{
            //  model: Postagem_Comentarios,
            // as: 'comentarios'
            //}],
            order: [['creat_at', 'DESC']],
        });

        res.render('postagens', { postagens, esporte, nomeEsporte });

    },

    pagCriarPostagem: async function (req, res) {

    },

    criarPostagem: async function (req, res) {


    }

}