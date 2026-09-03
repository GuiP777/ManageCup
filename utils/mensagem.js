function mensagem(req, tipo, texto){

    req.session.mensagem = {
        tipo,
        texto
    };

}

module.exports = mensagem;