
const { User_Boxe, Inscritos_Campeonato, Campeonatos } = require("../model");
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

        const inscrito = await Inscritos_Campeonato.findOne({
            raw: false,
            where: { id_usuario: req.session.usuario_id },
            include: [
                {
                    model: Campeonatos,
                    as: 'campeonatoInscritos',
                    where: { esporte: 'boxe' }
                }
            ]
        });
        if (inscrito) {
            mensagem(req, 'erro', "Não é possível editar o perfil enquanto estiver inscrito em um campeonato.");
            return res.redirect('/perfil');
        }

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