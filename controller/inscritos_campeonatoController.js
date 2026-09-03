const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { Inscritos_Campeonato, Campeonatos, User_Voleibol_Jogador } = require("../model");
const mensagem = require('../utils/mensagem');

module.exports = {
    inscrever: async function (req, res) {
        var id_campeonato = req.params.id;
        var id_user = req.session.usuario_id;
        var flag = 0;
        const perfis = res.locals.perfis;

        const campeonato = await Campeonatos.findByPk(id_campeonato);

        switch (campeonato.esporte) {
            case "voleibol":
                if (perfis.voleibolJogador) {
                    const resultado = await User_Voleibol_Jogador.findAll({
                        where: {
                            id_usuario: id_user
                        }
                    })
                    if (resultado.id_equipe === null)
                        mensagem(req, 'info', "Entre em uma equipe para se inscrever. Você pode procurar por um time na comunidade de voleibol");

                    else
                        mensagem(req, 'info', "Somente o treinador da sua equipe pode fazer a inscrição");

                    flag = 2
                    break;
                }
                if (perfis.voleibolTreinador) {
                    flag = 1;
                    break;
                }
            case "boxe":
                if (perfis.boxe)
                    flag = 1;
                break;
            case "corrida":
                if (perfis.corrida)
                    flag = 1;
                break;
        }

        if (flag == 1) {
            await Inscritos_Campeonato.findAll({
                where: {
                    id_usuario: id_user, id_campeonato: id_campeonato
                }
            }).then(result => {
                if (result.length == 0) {
                    const resultado = Inscritos_Campeonato.create({
                        id_campeonato: id_campeonato, id_usuario: id_user
                    })

                    if (resultado) {
                        mensagem(req, 'sucesso', "Inscrito com sucesso");
                        res.redirect('/campeonato');
                    }
                } else {
                    mensagem(req, 'erro', "Já está inscrito");
                    res.redirect('/campeonato');
                }
            })
        } else if (flag == 2) {
            res.redirect('/campeonato');

        } else {
            mensagem(req, 'erro', "Você não completou seu perfil neste esporte");
            res.redirect('/perfil');
        }


    }


}