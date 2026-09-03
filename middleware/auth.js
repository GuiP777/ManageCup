module.exports = {
    logado: function (req, res, next) {
        if (req.session.logado) {
            return next();
        } else {
            return res.redirect('/login');
        }
    },

    

};