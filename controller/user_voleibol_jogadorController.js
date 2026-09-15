const { User_Voleibol_Jogador } = require("../model");
const mensagem = require('../utils/mensagem');

module.exports = {

    SalvarPerfilJogador: async function (req, res) {
        var posicao = req.body['posicao'];
        var tamanho = req.body['tamanho'];
        var tempo = req.body['tempo'];

        const perfilExiste = await User_Voleibol_Jogador.findOne({
            where: {
                id_usuario: req.session.usuario_id
            }
        });

        if (perfilExiste) {
            mensagem(req, 'erro', "Perfil ja criado!");
            return res.redirect('/perfil');

        } else {
            await User_Voleibol_Jogador.create({

                posicao: posicao,
                tamanho: tamanho,
                tempo: tempo,
                id_usuario: req.session.usuario_id

            });
            mensagem(req, 'sucesso', "Perfil criado com sucesso!");
        }

        req.session.perfis.voleibolJogador = true;

        res.redirect('/perfil');
    },

    pagEditar: async function (req, res) {

        const id = req.session.usuario_id;

        const dadosJogador = await User_Voleibol_Jogador.findOne({
            where: {
                id_usuario: id
            }
        });


        res.render('user/editarPerfil.ejs', { dados: dadosJogador, perfil: 'voleibolJogador' });
    },

    atualizarPerfilJogador: async function (req, res) {
        var posicao = req.body['posicao'];
        var tamanho = req.body['tamanho'];
        var tempo = req.body['tempo'];

        if (!posicao && !tamanho && !tempo) {
            mensagem(req, 'erro', "Preencha pelo menos uma informação!");
            return res.redirect('/perfil');
        }

        await User_Voleibol_Jogador.update({
            ...(posicao && { posicao: posicao }),
            ...(tamanho && { tamanho: tamanho }),
            ...(tempo && { tempo: tempo })
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