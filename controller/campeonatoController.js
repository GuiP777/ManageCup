const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { Campeonatos, Inscritos_Campeonato, User } = require("../model");
const mensagem = require('../utils/mensagem');
const { carregarBracket } = require('../utils/bracket');
const { validarSet } = require('../utils/regraVoleibol');
const { TOTAL_ROUNDS, calcularDecisao } = require('../utils/regraBoxe');
const { calcularResultado } = require('../utils/regraCorrida');

module.exports = {
    pagCampeonatos: async function (req, res) {
        const dados = await Campeonatos.findAll({
            raw: false,
            include: [
                {
                    model: Inscritos_Campeonato,
                    as: 'inscritosCamp',
                },
                {
                    model: User,
                    as: 'organizador',
                }
            ]
        });
        res.render('campeonato/index', { dadosCampeonatos: dados });
    },

    pagCadastroCampeonato: async function (req, res) {

        let modalidade = "";
        const perfis = res.locals.perfis;


        if (perfis.voleibolTreinador || perfis.voleibolJogador) {
            modalidade = "Voleibol"
        }
        if (perfis.boxe) {
            modalidade = "Boxe"
        }
        if (perfis.corrida) {
            modalidade = "Corrida"
        }

        res.render('campeonato/criarCampeonato', { modalidade });
    },

    infoCampeonato: async function (req, res) {
        const id = req.params.id;
        const dados = await Campeonatos.findByPk(id, {
            raw: false,
            include:
            {
                model: User,
                as: 'organizador',
            }
        });
        const resultado = await Inscritos_Campeonato.findAll({
            where: {
                id_campeonato: id
            }
        })
        const inscritos = resultado.length
        res.render('campeonato/infoCampeonato', { dadosCampeonatos: dados, inscritosCampeonato: inscritos });
    },

    efetuaCadastroCampeonato: async function (req, res) {
        var formidable = require('formidable');
        var form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            const extensoesPermitidas = ['.jpg', '.jpeg', '.png', '.gif', '.webp'];
            const extencao = path.extname(files.imagem[0].originalFilename).toLowerCase();

            const tiposPermitidos = [
                'image/jpeg',
                'image/png',
                'image/gif',
                'image/webp'
            ];

            if (!extensoesPermitidas.includes(extencao) || !tiposPermitidos.includes(files.imagem[0].mimetype)) {
                mensagem(req, 'erro', 'Envie apenas arquivos de imagem válidos!');
                return res.redirect('/cadastroCampeonato');
            }
            var oldpath = files.imagem[0].filepath;
            var hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
            var ext = path.extname(files.imagem[0].originalFilename)
            var nomeimg = hash + ext
            var newpath = path.join(__dirname, '../public/imagens/', nomeimg);
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
            });

            await Campeonatos.create({
                nome: fields['nome'][0], esporte: fields['esporte'][0], id_organizador: req.session.usuario_id,
                data: fields['data'][0], inscricoes: fields['inscricoes'][0], localizacao: fields['localizacao'][0],
                imagem: nomeimg, iniciado: false
            })

            mensagem(req, 'sucesso', "Campeonato criado com sucesso");
            res.redirect('/campeonato');

        });
    },

    filtrarCampeonatos: async function (req, res) {

        const nome = req.query.nome;
        const esporte = req.query.esporte;
        let campeonatos = [];

        if (nome && esporte) {
            campeonatos = await Campeonatos.findAll({
                raw: false,
                include: [
                    {
                        model: Inscritos_Campeonato,
                        as: 'inscritosCamp',
                    },
                    {
                        model: User,
                        as: 'organizador',
                    }
                ],
                where: {
                    nome: nome, esporte: esporte
                }

            })
        } else if (!nome && esporte) {
            campeonatos = await Campeonatos.findAll({
                raw: false,
                include: [
                    {
                        model: Inscritos_Campeonato,
                        as: 'inscritosCamp',
                    },
                    {
                        model: User,
                        as: 'organizador',
                    }
                ],
                where: {
                    esporte: esporte
                }
            })
        } else if (nome && !esporte) {
            campeonatos = await Campeonatos.findAll({
                raw: false,
                include: [
                    {
                        model: Inscritos_Campeonato,
                        as: 'inscritosCamp',
                    },
                    {
                        model: User,
                        as: 'organizador',
                    }
                ],
                where: {
                    nome: nome
                }
            });
        } else {
            campeonatos = await Campeonatos.findAll({
                raw: false,
                include: [
                    {
                        model: Inscritos_Campeonato,
                        as: 'inscritosCamp',
                    },
                    {
                        model: User,
                        as: 'organizador',
                    }
                ],
            });
        }
        res.render('campeonato', { dadosCampeonatos: campeonatos })
    },

    pagChaveamento: async function (req, res) {

        try {

            const id = req.params.id;
            const campeonato = await Campeonatos.findByPk(id);

            if (!campeonato) {
                mensagem(req, 'erro', 'Campeonato não encontrado');
                return res.redirect('/campeonato');
            }

            if (!campeonato.bracket_data) {
                mensagem(req, 'erro', 'Este campeonato ainda não possui chaveamento');
                return res.redirect('/campeonato');
            }

            const bracketData = JSON.parse(campeonato.bracket_data);

            res.render('campeonato/chaveamento', {
                campeonato,
                bracketData
            });

        } catch (erro) {

            console.error(erro);

            mensagem(req, 'erro', 'Erro ao carregar chaveamento');
            return res.redirect('/campeonato');

        }

    },

    criarChaveamento: async function (req, res) {

        try {

            const id = req.params.id;
            const campeonato = await Campeonatos.findByPk(id);

            if (campeonato.id_organizador != req.session.usuario_id) {
                mensagem(req, 'erro', 'Somente o organizador deste campeonato pode inicia-lo');
                return res.redirect('/campeonato');
            }

            if (!campeonato) {
                mensagem(req, 'erro', 'Campeonato não encontrado');
                return res.redirect('/campeonato');
            }

            if (campeonato.bracket_data) {
                mensagem(req, 'erro', 'Este campeonato já possui um chaveamento');
                return res.redirect('/campeonato');
            }
            const obterParticipantesCampeonato = require('../utils/obterParticipantesCampeonato');
            const participantes = await obterParticipantesCampeonato(id);

            if (participantes.length < 2) {
                mensagem(req, 'erro', 'É necessário ter pelo menos 2 participantes');
                return res.redirect('/campeonato');
            }

            const { criarBracket } = require('../utils/bracket');

            const bracketData = await criarBracket(
                campeonato.id,
                participantes,
                campeonato.esporte
            );

            await Campeonatos.update(
                {
                    bracket_data: JSON.stringify(bracketData),
                    iniciado: true
                },
                {
                    where: {
                        id: campeonato.id
                    }
                }
            );

            res.redirect(`/campeonato/${id}/chaveamento`);

        } catch (erro) {

            console.error(erro);
            mensagem(req, 'erro', 'É necessário ter pelo menos 2 participantes');
            return res.redirect('/campeonato');

        }

    },

    registrarResultado: async function (req, res) {
        try {
            const campeonatoId = req.params.id;
            const matchId = Number(req.params.matchId);
            const campeonato = await Campeonatos.findByPk(campeonatoId);

            const erro = (texto, status = 400) => {
                mensagem(req, 'erro', texto);
                return res.status(status).json({ erro: texto });
            };

            if (!campeonato) {
                return erro('Campeonato não encontrado', 404);
            }

            if (!campeonato.bracket_data) {
                return erro('Este campeonato não possui chaveamento');
            }

            const manager = await carregarBracket(
                JSON.parse(campeonato.bracket_data)
            );

            const matches = await manager.get.matches({
                id: matchId
            });

            if (!matches || matches.length === 0) {
                return erro('Partida não encontrada', 404);
            }

            const match = matches[0];

            if (
                match.opponent1?.id == null ||
                match.opponent2?.id == null
            ) {
                return erro('Partida não possui dois participantes mínimos');
            }

            if (campeonato.esporte === 'voleibol') {
                const numeroSet = Number(req.body.numeroSet);
                const pontos1 = Number(req.body.pontos1);
                const pontos2 = Number(req.body.pontos2);

                const games = await manager.get.matchGames([match]);

                const jogosConcluidos = games.filter(game =>
                    game.opponent1?.result ||
                    game.opponent2?.result
                );

                let vitorias1 = 0;
                let vitorias2 = 0;

                for (const game of jogosConcluidos) {
                    if (game.opponent1?.result === 'win') {
                        vitorias1++;
                    }

                    if (game.opponent2?.result === 'win') {
                        vitorias2++;
                    }
                }

                if (vitorias1 >= 3 || vitorias2 >= 3) {
                    return erro('Esta partida já terminou.');
                }

                const proximoSet = jogosConcluidos.length + 1;

                if (numeroSet !== proximoSet) {
                    return erro(`O próximo set deve ser o ${proximoSet}º.`);
                }

                if (numeroSet === 5) {
                    if (vitorias1 !== 2 || vitorias2 !== 2) {
                        return erro('O quinto set só pode acontecer com a partida em 2 a 2.');
                    }
                }

                const validacao = validarSet(
                    pontos1,
                    pontos2,
                    numeroSet
                );

                if (!validacao.valido) {
                    return erro(validacao.mensagem);
                }

                const game = games.find(
                    item => item.number === numeroSet
                );

                if (!game) {
                    return erro('Set não encontrado', 404);
                }

                await manager.update.matchGame({
                    id: game.id,
                    opponent1: {
                        score: pontos1,
                        result: pontos1 > pontos2 ? 'win' : 'loss'
                    },
                    opponent2: {
                        score: pontos2,
                        result: pontos2 > pontos1 ? 'win' : 'loss'
                    }
                });
            }

            else if (campeonato.esporte === 'boxe') {
                const tipoResultado = req.body.tipoResultado;

                if (tipoResultado !== 'decisao' && tipoResultado !== 'ko') {
                    return erro('Tipo de resultado errado');
                }

                if (tipoResultado === 'decisao') {
                    const rounds = [];

                    for (let i = 1; i <= TOTAL_ROUNDS; i++) {
                        rounds.push({
                            numero: i,
                            pontos1: Number(req.body[`round${i}_pontos1`]),
                            pontos2: Number(req.body[`round${i}_pontos2`])
                        });
                    }

                    const resultado = calcularDecisao(rounds);

                    if (!resultado.valido) {
                        return erro(resultado.mensagem);
                    }

                    await manager.update.match({
                        id: matchId,
                        opponent1: {
                            score: resultado.total1,
                            result: resultado.vencedor === 1 ? 'win' : 'loss'
                        },
                        opponent2: {
                            score: resultado.total2,
                            result: resultado.vencedor === 2 ? 'win' : 'loss'
                        },
                        resultadoBoxe: {
                            tipo: 'decisao',
                            rounds: rounds,
                            media1: resultado.media1,
                            media2: resultado.media2
                        }
                    });
                }

                else {
                    const roundFinal = Number(req.body.roundFinal);
                    const vencedor = Number(req.body.vencedor);

                    if (roundFinal < 1 || roundFinal > TOTAL_ROUNDS) {
                        return erro('Round do KO inválido');
                    }

                    if (vencedor !== 1 && vencedor !== 2) {
                        return erro('Vencedor Inválido');
                    }

                    await manager.update.match({
                        id: matchId,
                        opponent1: {
                            score: vencedor === 1 ? 1 : 0,
                            result: vencedor === 1 ? 'win' : 'loss'
                        },
                        opponent2: {
                            score: vencedor === 2 ? 1 : 0,
                            result: vencedor === 2 ? 'win' : 'loss'
                        },
                        resultadoBoxe: {
                            tipo: 'ko',
                            roundFinal: roundFinal,
                            vencedor: vencedor
                        }
                    });
                }
            }

            else if (campeonato.esporte === 'corrida') {
                const tempo1 = Number(req.body.tempo1);
                const tempo2 = Number(req.body.tempo2);
                const resultado = calcularResultado(tempo1, tempo2);

                if (!resultado.valido) {
                    return erro(resultado.mensagem);
                }

                await manager.update.match({
                    id: matchId,
                    opponent1: {
                        score: 1,
                        result: resultado.vencedor === 1 ? 'win' : 'loss'
                    },
                    opponent2: {
                        score: 0,
                        result: resultado.vencedor === 2 ? 'win' : 'loss'
                    },
                    resultadoCorrida: {
                        tempo1: resultado.tempo1,
                        tempo2: resultado.tempo2
                    }
                });
            }

            else {
                return erro('Esporte não informado corretamente');
            }

            const novoBracket = await manager.export();

            await Campeonatos.update(
                {
                    bracket_data: JSON.stringify(novoBracket)
                },
                {
                    where: {
                        id: campeonatoId
                    }
                }
            );

            return res.json({
                sucesso: true,
                bracket: novoBracket
            });

        } catch (erroCatch) {
            console.error(erroCatch);
            mensagem(req, 'erro', 'Erro ao registrar resultado');
            return res.status(500).json({
                erro: 'Erro ao registrar resultado'
            });
        }
    },


}