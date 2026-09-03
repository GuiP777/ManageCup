const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { Campeonatos, Inscritos_Campeonato, User } = require("../model");
const mensagem = require('../utils/mensagem');

module.exports = {
    pagCampeonatos: async function (req, res) {
        let dados = await Campeonatos.findAll({
            raw: false,
            include: {
                model: Inscritos_Campeonato,
                as: 'inscritosCamp',
            }
        });
        res.render('campeonato/index', { dadosCampeonatos: dados });
    },

    pagCadastroCampeonato: async function (req, res) {

        let usuario = await User.findByPk(req.session.usuario_id);
        let modalidade = "";
        const perfis = res.locals.perfis;


        if(perfis.voleibolTreinador || perfis.voleibolJogador){
            modalidade = "Voleibol"
        }
         if(perfis.boxe){
            modalidade = "Boxe"
        }
         if(perfis.corrida){
            modalidade = "Corrida"
        }

        res.render('campeonato/criarCampeonato',{ dadosUsuario: usuario, modalidade });
    },

    infoCampeonato: async function (req, res) {
        const id = req.params.id;
        const dados = await Campeonatos.findByPk(id);
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
            var oldpath = files.imagem[0].filepath;
            var hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
            var ext = path.extname(files.imagem[0].originalFilename)
            var nomeimg = hash + ext
            var newpath = path.join(__dirname, '../public/imagens/', nomeimg);
            fs.rename(oldpath, newpath, function (err) {
                if (err) throw err;
            });

            await Campeonatos.create({
                nome: fields['nome'][0], organizador: fields['organizador'][0], esporte: fields['esporte'][0],
                data: fields['data'][0], inscricoes: fields['inscricoes'][0], localizacao: fields['localizacao'][0], imagem: nomeimg
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
                include: {
                    model: Inscritos_Campeonato,
                    as: 'inscritosCamp',
                },
                where: {
                    nome: nome, esporte: esporte
                }

            })
        } else if (!nome && esporte) {
            campeonatos = await Campeonatos.findAll({
                raw: false,
                include: {
                    model: Inscritos_Campeonato,
                    as: 'inscritosCamp',
                },
                where: {
                    esporte: esporte
                }
            })
        } else if (nome && !esporte) {
            campeonatos = await Campeonatos.findAll({
                raw: false,
                include: {
                    model: Inscritos_Campeonato,
                    as: 'inscritosCamp',
                },
                where: {
                    nome: nome
                }
            });
        } else {
            campeonatos = await Campeonatos.findAll({
                raw: false,
                include: {
                    model: Inscritos_Campeonato,
                    as: 'inscritosCamp',
                }
            });
        }
        res.render('campeonato', { dadosCampeonatos: campeonatos })
    }


}