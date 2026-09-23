const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { Campeonatos, Inscritos_Campeonato, User } = require("../model");
const mensagem = require('../utils/mensagem');
const { carregarBracket } = require('../utils/bracket');
const { validarSet } = require('../utils/regraVoleibol');
const { TOTAL_ROUNDS, calcularDecisao } = require('../utils/regraBoxe');
const { calcularResultado } = require('../utils/regraCorrida');
const { criarCorrida } = require('../utils/criarCorrida');

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

            let bracketData;

            if (campeonato.esporte === 'corrida') {
                bracketData = criarCorrida(participantes);
            } else {
                const { criarBracket } = require('../utils/bracket');

                bracketData = await criarBracket(
                    campeonato.id,
                    participantes,
                    campeonato.esporte
                );
            }

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

            if (!campeonato || campeonato.id_organizador !== req.session.usuario_id) {
                return erro('Acesso negado');
            }

            if (campeonato.esporte === 'corrida') {

                const bracketData = JSON.parse(campeonato.bracket_data);
                const fase = req.body.fase;
                const bateriaNumero = Number(req.body.bateria);
                const participanteId = Number(req.body.participanteId);
                const tempo = Number(req.body.tempo);

                if (!fase || !['bateria', 'final'].includes(fase)) {
                    return erro('Fase da corrida inválida.');
                }

                if (!Number.isFinite(tempo) || tempo <= 0) {
                    return erro('Informe um tempo válido.');
                }

                if (fase === 'bateria') {
                    if (!Number.isInteger(bateriaNumero) || bateriaNumero < 1 ||
                        bateriaNumero > bracketData.baterias.length) {
                        return erro('Bateria inválida.');
                    }

                    const bateria = bracketData.baterias[bateriaNumero - 1];

                    if (bateria.concluida) {
                        return erro('Esta bateria já foi encerrada.');
                    }

                    const participante = bateria.participantes.find(item => item.id === participanteId);

                    if (!participante) {
                        return erro('Participante não encontrado.');
                    }

                    if (participante.tempo !== null) {
                        return erro('O tempo deste participante já foi registrado.');
                    }

                    participante.tempo = tempo;

                    if (bateria.participantes.every(item => item.tempo !== null)) {
                        bateria.participantes = [...bateria.participantes].sort((a, b) =>
                            a.tempo - b.tempo).map((item, index) =>
                            ({
                                ...item,
                                colocacao: index + 1
                            }));
                        bateria.concluida = true;
                    }

                    const todasBateriasConcluidas = bracketData.baterias.every(item => item.concluida);

                    if (todasBateriasConcluidas && bracketData.baterias.length > 1 &&
                        bracketData.final.participantes.length === 0) {

                        const quantidadeBaterias = bracketData.baterias.length;
                        const vagasPorBateria = Math.floor(8 / quantidadeBaterias);
                        const vagasRestantes = 8 - vagasPorBateria * quantidadeBaterias;
                        const classificados = [];
                        const restantes = [];

                        for (const bateriaAtual of bracketData.baterias) {
                            classificados.push(...bateriaAtual.participantes.slice(0, vagasPorBateria));
                            restantes.push(...bateriaAtual.participantes.slice(vagasPorBateria));
                        }

                        restantes.sort((a, b) => a.tempo - b.tempo);
                        classificados.push(...restantes.slice(0, vagasRestantes));

                        bracketData.final.participantes = classificados.sort((a, b) =>
                            a.tempo - b.tempo).map((participante, index) => ({
                                id: index + 1,
                                externalId: participante.externalId,
                                name: participante.name,
                                tempo: null,
                                colocacao: null
                            }));
                    }
                } else {
                    if (!bracketData.final || bracketData.final.participantes.length === 0) {
                        return erro('A final ainda não foi formada.');
                    }

                    if (bracketData.final.concluida) {
                        return erro('A final já foi encerrada.');
                    }

                    const participante = bracketData.final.participantes.find(item =>
                        item.id === participanteId);

                    if (!participante) {
                        return erro('Participante da final não encontrado.');
                    }

                    if (participante.tempo !== null) {
                        return erro('O tempo deste participante já foi registrado.');
                    }

                    participante.tempo = tempo;

                    if (bracketData.final.participantes.every(item => item.tempo !== null)) {
                        bracketData.final.participantes = [...bracketData.final.participantes].sort((a, b) =>
                            a.tempo - b.tempo).map((item, index) =>
                                ({ ...item, colocacao: index + 1 }));
                        bracketData.final.concluida = true;
                    }
                }

                await Campeonatos.update({
                    bracket_data: JSON.stringify(bracketData)
                },
                    {
                        where: {
                            id: campeonatoId
                        }
                    });
                console.log('BRACKET DEPOIS:', JSON.stringify(bracketData));
                return res.json({ sucesso: true, bracket: bracketData });
            }

            const manager = await carregarBracket(JSON.parse(campeonato.bracket_data));
            const matches = await manager.get.matches({ id: matchId });

            if (!matches || !matches.length) {
                return erro('Partida não encontrada.', 404);
            }

            const match = matches[0];

            if ((campeonato.esporte === 'boxe') &&
                (match.opponent1?.result || match.opponent2?.result)) {
                return erro('Esta partida já terminou.');
            }

            if (campeonato.esporte === 'voleibol') {
                const numeroSet = Number(req.body.numeroSet);
                const pontos1 = Number(req.body.pontos1);
                const pontos2 = Number(req.body.pontos2);

                const validacao = validarSet(pontos1, pontos2, numeroSet);

                if (!validacao.valido) {
                    return erro(validacao.mensagem);
                }

                const dadosBracket = JSON.parse(campeonato.bracket_data);
                const jogos = dadosBracket.match_game || [];

                const jogosPartida = jogos.filter(game =>
                    game.parent_id === match.id
                );

                const jogoExistente = jogosPartida.find(game =>
                    game.number === numeroSet
                );

                if (jogoExistente && (
                    jogoExistente.opponent1?.result ||
                    jogoExistente.opponent2?.result
                )) {
                    return erro('Esse set já foi cadastrado.');
                }

                const vencedor1 = pontos1 > pontos2;
                const vencedor2 = pontos2 > pontos1;

                await manager.update.matchGame({
                    parent_id: match.id,
                    number: numeroSet,
                    opponent1: {
                        score: pontos1,
                        result: vencedor1 ? 'win' : undefined
                    },
                    opponent2: {
                        score: pontos2,
                        result: vencedor2 ? 'win' : undefined
                    }
                });

                const bracketAtualizado = JSON.parse(campeonato.bracket_data);
                const setsAtualizados = (bracketAtualizado.match_game || [])
                    .filter(game => game.parent_id === match.id);

                let vitorias1 = 0;
                let vitorias2 = 0;

                for (const set of setsAtualizados) {
                    if (set.opponent1?.result === 'win') {
                        vitorias1++;
                    }

                    if (set.opponent2?.result === 'win') {
                        vitorias2++;
                    }
                }

                if (vitorias1 >= 3 || vitorias2 >= 3) {
                    await manager.update.match({
                        id: match.id,
                        opponent1: {
                            result: vitorias1 > vitorias2 ? 'win' : null
                        },
                        opponent2: {
                            result: vitorias2 > vitorias1 ? 'win' : null
                        }
                    });
                }
                mensagem(req, 'sucesso', 'Placar do set ' + numeroSet + ' foi salvo com sucesso');
            }

            if (campeonato.esporte === 'boxe') {
                const tipoResultado = req.body.tipoResultado;
                const vencedor = Number(req.body.vencedor);

                if (!['decisao', 'ko'].includes(tipoResultado)) {
                    return erro('Tipo de resultado inválido.');
                }

                if (![1, 2].includes(vencedor)) {
                    return erro('Vencedor inválido.');
                }

                if (tipoResultado === 'decisao') {
                    const rounds = [];

                    for (let i = 1; i <= TOTAL_ROUNDS; i++) {
                        rounds.push({
                            pontos1: req.body[`round${i}_pontos1`],
                            pontos2: req.body[`round${i}_pontos2`]
                        });
                    }

                    const resultado = calcularDecisao(rounds);

                    if (!resultado.valido) {
                        return erro(resultado.mensagem);
                    }

                    if (vencedor !== resultado.vencedor) {
                        return erro('O vencedor informado não corresponde à pontuação.');
                    }

                    await manager.update.match({
                        id: match.id,
                        opponent1: {
                            score: resultado.total1,
                            result: vencedor === 1 ? 'win' : 'loss'
                        },
                        opponent2: {
                            score: resultado.total2,
                            result: vencedor === 2 ? 'win' : 'loss'
                        },
                        resultadoBoxe: {
                            tipo: 'decisao',
                            rounds,
                            total1: resultado.total1,
                            total2: resultado.total2,
                            vencedor
                        }
                    });

                } else {
                    const roundFinal = Number(req.body.roundFinal);

                    if (!Number.isInteger(roundFinal) || roundFinal < 1 || roundFinal > TOTAL_ROUNDS) {
                        return erro('Round do KO inválido.');
                    }

                    await manager.update.match({
                        id: match.id,
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
                            round: roundFinal,
                            vencedor
                        }
                    });
                }
                mensagem(req, 'sucesso', 'Resultado da luta por ' + tipoResultado + ' foi salvo com sucesso');

            }

            const bracketData = await manager.export();
            await Campeonatos.update({ bracket_data: JSON.stringify(bracketData) }, { where: { id: campeonatoId } });

            return res.json({ sucesso: true, bracket: bracketData });
        } catch (erro) {
            console.error(erro);
            return res.status(500).json({ erro: 'Erro ao registrar resultado.' });
        }
    }
}