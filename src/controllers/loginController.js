const Login = require('../models/LoginModel');

exports.index = (req, res) => {
    if(req.session.user) return res.render('pesquisa');
    return res.render('login');
}

exports.login = async function(req, res){
    try{
        const login = new Login(req.body);
        await login.login();

        if(login.errors.length > 0){
            req.flash('errors', login.errors);
            req.session.save(function(){
                return res.redirect('index');
            });
            return;
        }
        //req.flash('success', 'Usuário Logado');
        req.session.user = login.user;
        req.session.save(function(){
            return res.redirect('index');
        });
        console.log(`USUÁRIO LOGADO: ${login.user.email}`);
    }catch(e){
        console.log(e);
        return res.render('404');
    }
}

exports.logout = function(req, res){
    console.log(`USUÁRIO SAIU DO SISTEMA: ${Object.values(req.session.user)}`);
    req.session.destroy();
    res.redirect('/');
}