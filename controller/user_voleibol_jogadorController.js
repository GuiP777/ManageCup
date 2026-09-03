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
            await User_Voleibol_Jogador.update({

                posicao: posicao,
                tamanho: tamanho,
                tempo: tempo,

            },
                {
                    where: {
                        id_usuario: req.session.usuario_id
                    }
                });

            mensagem(req, 'sucesso', "Perfil atualizado com sucesso!");

        } else {
            await User_Voleibol_Jogador.create({

                posicao: posicao,
                tamanho: tamanho,
                tempo: tempo,
                id_usuario: req.session.usuario_id

            });
            mensagem(req, 'sucesso', "Perfil criado com sucesso!");
        }

        req.session.perfis.voleibolJogador = true ;

        res.redirect('/');
    },


}