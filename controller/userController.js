const fs = require('fs');
const crypto = require('crypto');
const path = require('path');
const bcrypt = require('bcrypt');
const { User, User_Boxe, User_Corrida, User_Voleibol_Jogador, User_Voleibol_Treinador } = require("../model");
const mensagem = require('../utils/mensagem');

module.exports = {
    pagLogin: function (req, res) {
        res.render('user/login');
    },
    efetuaLogin: function (req, res) {
        const senha = req.body['senha'];
        const email = req.body['email'];

        User.findAll({
            where: {
                email: email
            }
        }).then(result => {
            if (result.length) {
                bcrypt.compare(senha, result[0]['senha'], async function (err, resultado) {
                    if (err) throw err;
                    if (resultado) {
                        req.session.logado = true;
                        req.session.username = result[0]['nome'];
                        req.session.usuario_id = result[0]['id'];
                        req.session.avatar = result[0]['avatar'];

                        const usuario = await User.findByPk(result[0]['id'], {
                            raw: false,
                            include: [
                                { model: User_Voleibol_Treinador, as: 'perfilVoleibolTreinador' },
                                { model: User_Voleibol_Jogador, as: 'perfilVoleibolJogador' },
                                { model: User_Boxe, as: 'perfilBoxe' },
                                { model: User_Corrida, as: 'perfilCorrida' }
                            ]
                        });
                        req.session.perfis = {
                            voleibolTreinador: !!usuario.perfilVoleibolTreinador,
                            voleibolJogador: !!usuario.perfilVoleibolJogador,
                            boxe: !!usuario.perfilBoxe,
                            corrida: !!usuario.perfilCorrida
                        };

                        mensagem(req, 'sucesso', "Login realizado com sucesso");
                        res.redirect('/');
                    }
                    else {
                        mensagem(req, 'erro', "Senha incorreta");
                        res.redirect('/login');
                    }
                });
            }
            else {
                mensagem(req, 'erro', "Email não encontrado");
                res.redirect('/login');
            }
        })
            .catch(err =>
                console.error(err)
            );
    },

    pagCadastro: function (req, res) {
        res.render('user/cadastro.ejs');
    },
    efetuaCadastro: async function (req, res) {
        const formidable = require('formidable');
        const form = new formidable.IncomingForm();
        form.parse(req, async (err, fields, files) => {
            User.findAll({
                where: {
                    email: fields['email'][0]
                }
            }).then(result => {
                if (result.length == 0) {
                    var oldpath = files.avatar[0].filepath;
                    var hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
                    var ext = path.extname(files.avatar[0].originalFilename)
                    var nomeimg = hash + ext
                    var newpath = path.join(__dirname, '../public/imagens/', nomeimg);
                    fs.rename(oldpath, newpath, function (err) {
                        if (err) throw err;
                    });
                    bcrypt.hash(fields['senha'][0], 10, async function (err, hashPassword) {
                        if (err) throw err;
                        console.log("ERRROO" + fields['senha'][0]);
                        User.create({
                            nome: fields['nome'][0], email: fields['email'][0], senha: hashPassword, nascimento: fields['data'][0], sexo: fields['sexo'][0], avatar: nomeimg
                        })
                    });
                    mensagem(req, 'sucesso', "Cadastro com sucesso!!");

                    res.redirect('/login');
                }
                else {
                    mensagem(req, 'erro', "Email já Cadastrado");

                    res.redirect('/cadastro');
                }
            });
        });
    },

    logout: function (req, res) {
        req.session.destroy(function (err) {
        })

        res.redirect('/');
    },

    pagPerfil: async function (req, res) {
        const id = req.session.usuario_id;

        const usuario = await User.findOne({
            raw: false,
            where: {
                id: id
            },
            include: [
                {
                    model: User_Voleibol_Treinador,
                    as: 'perfilVoleibolTreinador'
                },
                {
                    model: User_Voleibol_Jogador,
                    as: 'perfilVoleibolJogador'
                },
                {
                    model: User_Boxe,
                    as: 'perfilBoxe'
                },
                {
                    model: User_Corrida,
                    as: 'perfilCorrida'
                }
            ]
        });

        res.render('user/perfil', { dados: usuario });

    },

    verPerfil: async function (req, res) {
        const id = req.session.usuario_id;
        const usuario = await User.findByPk(req.session.usuario_id, {
            raw: false,
            include: [
                { model: User_Voleibol_Treinador, as: 'perfilVoleibolTreinador' },
                { model: User_Voleibol_Jogador, as: 'perfilVoleibolJogador' },
                { model: User_Boxe, as: 'perfilBoxe' },
                { model: User_Corrida, as: 'perfilCorrida' }
            ]
        });

        res.render('user/perfil', { dados: usuario });

    },

    pagEditarUsuario: async function (req, res) {

        const id = req.session.usuario_id;

        const dados = await User.findByPk(id);

        res.render('user/editarUsuario.ejs', { dados: dados });
    },

    atualizarUsuario: async function (req, res) {
        const id = req.session.usuario_id;
        const formidable = require('formidable');
        const form = new formidable.IncomingForm({ allowEmptyFiles: true, minFileSize: 0 });

        form.parse(req, async (err, fields, files) => {
            if (err) {
                console.log("ERRO FORMDIABLE:", err);
                return;
            } if (files.avatar) {
                var oldpath = files.avatar[0].filepath;
                var hash = crypto.createHash('md5').update(Date.now().toString()).digest('hex');
                var ext = path.extname(files.avatar[0].originalFilename)
                var nomeimg = hash + ext
                var newpath = path.join(__dirname, '../public/imagens/', nomeimg);
                fs.rename(oldpath, newpath, function (err) {
                    if (err) throw err;
                });
            }

            const resultado = await User.update({
                nome: fields['nome'][0], email: fields['email'][0], nascimento: fields['nascimento'][0], sexo: fields['sexo'][0],
                ...(files.avatar && { avatar: nomeimg })
            },
                {
                    where: {
                        id: id
                    }
                })

            if (resultado) {
                req.session.avatar = nomeimg;
                req.session.username = fields['nome'][0];

                mensagem(req, 'sucesso', "Edição realizada com sucesso!");
            }

            res.redirect('/perfil');

        });
    }
}