const mongoose = require('mongoose');
const validator = require('validator');
const bcryptjs = require('bcryptjs');

const LoginSchema = new mongoose.Schema({
  email: { type: String, required: true },
  senha: { type: String, required: true },
});

const LoginModel = mongoose.model('Login', LoginSchema);

class Login {
  constructor(body){
    this.body = body;
    this.errors = [];
    this.user = null;
  }

  async login(){

    this.valida();
    if(this.errors.length > 0) return
    this.user = await LoginModel.findOne({ email: this.body.email});

    if(!this.user){
      this.errors.push('usuário inválido');
      return
    }

    if(!bcryptjs.compareSync(this.body.senha, this.user.senha)){
      this.errors.push('senha inválida');
      this.user = null;
      return;
    }


  }

  valida(){
    this.cleanUp();

    //if(!validator.isEmail(this.body.email)) this.errors.push('Email inválido');
    if(this.body.senha.length < 3 || this.body.senha.length > 50) this.errors.push('Senha incorreta');
  }

  cleanUp(){
    for(const key in this.body){
      if(typeof this.body[key] !== 'string'){
        this.body[key] = '';
      }
    }

    this.body = {
      email: this.body.email,
      senha: this.body.senha
    }
  }

}

module.exports = Login;