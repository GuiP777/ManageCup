const { Inscritos_Campeonato, Campeonatos, User_Voleibol_Jogador, User_Boxe, User_Voleibol_Treinador } = require("../model");
const mensagem = require('../utils/mensagem');

module.exports = {
    inscrever: async function (req, res) {
        var id_campeonato = req.params.id;
        var id_user = req.session.usuario_id;
        var flag = 0;
        const perfis = res.locals.perfis;

        const inscritosLimite = await Inscritos_Campeonato.findAll({
            where: {
                id_campeonato: id_campeonato
            }
        });
        const campeonato = await Campeonatos.findByPk(id_campeonato);

        if (campeonato.iniciado) {
            mensagem(req, 'erro', "Campeonato já iniciado");
            res.redirect('/campeonato');
        }

        if (inscritosLimite.length >= campeonato.inscricoes) {
            mensagem(req, 'erro', "Campeonato atingiu o limite de inscrições");
            res.redirect('/campeonato');
        }
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
                    const treinador = await User_Voleibol_Treinador.findOne({
                        where: {
                            id_usuario: id_user
                        }
                    });

                    if (treinador.categoria !== campeonato.categoria) {
                        mensagem(req, 'erro', "Sua categoria não corresponde à categoria do campeonato");
                        flag = 2;
                        break;
                    }
                    flag = 1;
                    break;
                }
            case "boxe":
                if (perfis.boxe) {
                    const boxeador = await User_Boxe.findOne({
                        where: {
                            id_usuario: id_user
                        }
                    });

                    const peso = Number(boxeador.peso);

                    const limites = {
                        palha: [0, 47.63],
                        moscaLigeiro: [47.64, 48.99],
                        mosca: [49.00, 50.80],
                        supermosca: [50.81, 52.16],
                        galo: [52.17, 53.42],
                        supergalo: [53.43, 55.34],
                        pena: [55.35, 57.15],
                        superpena: [57.16, 58.97],
                        leve: [58.98, 61.23],
                        superleve: [61.24, 63.50],
                        meioMedio: [63.51, 66.68],
                        superMeioMedio: [66.69, 69.85],
                        medio: [69.86, 72.58],
                        superMedio: [72.59, 76.20],
                        meioPesado: [76.21, 79.38],
                        cruzador: [79.39, 90.71],
                        ponte: [90.72, 101.60],
                        pesado: [101.61, Infinity]
                    };

                    const limite = limites[campeonato.categoria];

                    if (!limite || peso < limite[0] || peso > limite[1]) {
                        mensagem(req, 'erro', "Seu peso não corresponde à categoria do campeonato");
                        flag = 2;
                        break;
                    }

                    flag = 1;
                    break;
                }
            case "corrida":
                if (perfis.corrida)
                    flag = 1;
                break;
        }

        if (flag == 1) {
            const inscritos = await Inscritos_Campeonato.findAll({
                where: {
                    id_usuario: id_user, id_campeonato: id_campeonato
                }
            });
            if (inscritos.length == 0) {
                const resultado = await Inscritos_Campeonato.create({
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

        } else if (flag == 2) {
            res.redirect('/campeonato');

        } else {
            mensagem(req, 'erro', "Você não completou seu perfil neste esporte");
            res.redirect('/perfil');
        }
    },

    desinscrever: async function (req, res) {
        const id_campeonato = req.body.id_campeonato;
        const campeonato = await Campeonatos.findByPk(id_campeonato);

        if (!campeonato.iniciado) {
            const resultado = await Inscritos_Campeonato.destroy({
                where: {
                    id_campeonato: id_campeonato,
                    id_usuario: req.session.usuario_id
                }
            });

            if (resultado) {
                mensagem(req, 'sucesso', "Desinscrição do campeonato com sucesso");
                res.redirect('/campeonato');
            } else {
                mensagem(req, 'erro', "Não foi possivel se desinscrever do campeonato");
                res.redirect('/campeonato');
            }
        } else {
            mensagem(req, 'erro', "Campeonato já foi inicializado");
            res.redirect('/campeonato');
        }


    }


}