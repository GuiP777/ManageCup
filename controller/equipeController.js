const { Equipes, User_Voleibol_Treinador, User_Voleibol_Jogador, User, Convite } = require("../model");
const mensagem = require('../utils/mensagem');
const { Op } = require('sequelize');

module.exports = {
    pagEquipe: async function (req, res) {

        const treinador = await User_Voleibol_Treinador.findOne({
            where: {
                id_usuario: req.session.usuario_id
            }
        });

        if (!treinador) {
            mensagem(req, 'info', "Não foi possivel achar o Treinador");
            res.redirect('/');
        }

        let dados = await Equipes.findOne({
            raw: false,
            include: [
                {
                    model: User_Voleibol_Treinador,
                    as: 'treinador',
                },
                {
                    model: User_Voleibol_Jogador,
                    as: 'jogadores',

                    include: [
                        {
                            model: User,
                            as: 'donoDoPerfil',
                            attributes: {
                                exclude: ['senha']
                            }
                        }
                    ]
                }
            ],
            where: {
                id_treinador: treinador.id
            }
        });

        const anoAtual = new Date().getFullYear();
        let sexo;
        let anoNascimento;

        switch (treinador.categoria) {
            case 'adultoMasculino':
                sexo = 'Masculino';
                break;
            case 'adultoFeminino':
                sexo = 'Feminino';
                break;
            case 'infantoMasculino':
                sexo = 'Masculino';
                anoNascimento = anoAtual - 18;
                break;
            case 'infantoFeminino':
                sexo = 'Feminino';
                anoNascimento = anoAtual - 18;
                break;
            case 'juvenilMasculino':
                sexo = 'Masculino';
                anoNascimento = anoAtual - 20;
                break;
            case 'juvenilFeminino':
                sexo = 'Feminino';
                anoNascimento = anoAtual - 20;
                break;
        }

        let jogadores = await User_Voleibol_Jogador.findAll({
            raw: false,
            include: [
                {
                    model: User,
                    as: 'donoDoPerfil',
                    where: {
                        sexo: sexo,
                        ...(anoNascimento && {
                            nascimento: {
                                [Op.gte]: new Date(anoNascimento, 0, 1),
                                [Op.lt]: new Date(anoNascimento + 1, 0, 1)
                            }
                        })
                    }
                },
                {
                    model: Convite,
                    as: 'conviteJogador',
                    where: {
                        id_equipe: dados.id
                    },
                    required: false
                }
            ]
        });


        res.render('equipe/index', { dadosEquipe: dados, dadosJogadores: jogadores });
    },

    removerJogador: async function (req, res) {

        const id_jogador = req.params.id_jogador;
        const id_equipe = req.params.id_equipe;

        let resultado = await User_Voleibol_Jogador.update(
            { id_equipe: null },
            {
                where: {
                    id: id_jogador
                }
            }
        );
        await Convite.update(
            { status: "removido" },
            {
                where: {
                    id_equipe: id_equipe,
                    id_jogador: id_jogador
                }
            }
        );

        mensagem(req, 'sucesso', "Jogador removido com sucesso");
        res.redirect("/equipe");
    }


}