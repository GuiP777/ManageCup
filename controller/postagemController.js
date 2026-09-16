const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const { Postagem, Postagem_Comentarios, User } = require("../model");
const mensagem = require('../utils/mensagem');

module.exports = {

    pagPostagens: async function (req, res) {

        const esporte = req.params.esporte;

        switch (esporte) {
            case 'boxe':
                if (!req.session.perfis.boxe) {
                    mensagem(req, 'erro', 'Você não possui perfil de Boxe');
                    return res.redirect('/perfil');
                }
                break;
            case 'corrida':
                if (!req.session.perfis.corrida) {
                    mensagem(req, 'erro', 'Você não possui perfil de Corrida');
                    return res.redirect('/perfil');
                }
                break;
            case 'voleibol':
                if (!req.session.perfis.voleibolTreinador && !req.session.perfis.voleibolJogador) {
                    mensagem(req, 'erro', 'Você não possui perfil de Voleibol');
                    return res.redirect('/perfil');
                }
                break;
            default:
                return mensagem(req, 'erro', 'Esporte não encontrado');
        }

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

        const esporte = req.params.esporte;

        res.render('postagens/criarPostagem', { esporte });

    },

    criarPostagem: async function (req, res) {
        const esporte = req.params.esporte;
        const formidable = require('formidable');
        const form = new formidable.IncomingForm({ allowEmptyFiles: true, minFileSize: 0 });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.log("ERRO FORMDIABLE:", err);
                return;
            } if (files.imagem && files.imagem[0].size > 0) {
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
                    return res.redirect('/criarPostagem/' + esporte);
                }

                var oldpath = files.imagem[0].filepath;
                var hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
                var ext = path.extname(files.imagem[0].originalFilename);
                var nomeimg = hash + ext;
                var newpath = path.join(__dirname, '../public/imagens/', nomeimg);
                fs.rename(oldpath, newpath, function (err) {
                    if (err) throw err;
                });
            }

            const resultado = await Postagem.create({
                esporte: esporte,
                mensagem: fields['mensagem'][0],
                ...(files.imagem && files.imagem[0].size > 0 && { imagem: nomeimg }),
                id_usuario: req.session.usuario_id,
                creat_at: new Date(Date.now() - 3 * 60 * 60 * 1000)
            });

            if (resultado) {
                mensagem(req, 'sucesso', "Postagem criada com sucesso!");
            }
            else {
                mensagem(req, 'erro', "Erro ao criar postagem!");
            }

            res.redirect('/postagens/' + esporte);

        });
    },

    verPostagem: async function (req, res) {

        const id = req.params.id;
        const postagem = await Postagem.findByPk(id, {
            raw: false,
            include: [{
                    model: User,
                    as: 'userPostagem'
                },
                {
                    model: Postagem_Comentarios,
                    as: 'comentarios',

                    include: [
                        {
                            model: User,
                            as: 'userPostagemComentario'
                        }
                    ]
                }],
        });

        if (!postagem) {
            mensagem(req, 'erro', 'Postagem não encontrada');
            return res.redirect('/');
        }
        res.render('postagens/postagem', { postagem });

    },

    criarComentario: async function (req, res) {

        const id_postagem = req.params.id;
        const comentario = req.body.comentario;

        const resultado = await Postagem_Comentarios.create({
            id_postagem: id_postagem,
            id_usuario: req.session.usuario_id,
            comentario: comentario,
            creat_at: new Date(Date.now() - 3 * 60 * 60 * 1000)
        });

        if (resultado) {
            mensagem(req, 'sucesso', "Comentário criado com sucesso!");
        }
        else {
            mensagem(req, 'erro', "Erro ao criar comentário!");
        }

        res.redirect('/postagem/' + id_postagem);
    }

}