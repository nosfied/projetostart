const Trf1 = require('../models/trf1Model');
const Trf2 = require('../models/trf2Model');
const Trf3 = require('../models/trf3Model');
const Trf4 = require('../models/trf4Model');
const Trf5 = require('../models/trf5Model');
const Tjdf = require('../models/tjdfModel');
const Tjms = require('../models/tjmsModel');
const Tjsp = require('../models/tjspModel');
const Tjsc = require('../models/tjscModel');
const Tjrs = require('../models/tjrsModel');
const Tjba = require('../models/tjbaModel');
const Tjpi = require('../models/tjpiModel');
const Tjal = require('../models/tjalModel');
const Tjap = require('../models/tjapModel');
const Tjce = require('../models/tjceModel');
const Tjes = require('../models/tjesModel');
const Tjgo = require('../models/tjgoModel');
const Tjrr = require('../models/tjrrModel');
const Tjto = require('../models/tjtoModel');
const Tjro = require('../models/tjroModel');
const Tjam = require('../models/tjamModel');
const Tjac = require('../models/tjacModel');
const Tjmt = require('../models/tjmtModel');
const Tjpe = require('../models/tjpeModel');
const Tjma = require('../models/tjmaModel');
const Tjse = require('../models/tjseModel');
const Tjrn = require('../models/tjrnModel');
const Tjpb = require('../models/tjpbModel');
const Tjpa = require('../models/tjpaModel');
const Acpf = require('../models/acpfModel');
const Ctse = require('../models/ctseModel');
const Ctcu = require('../models/ctcuModel');
const Crf = require('../models/crfModel');
const Stm = require('../models/stmModel');
const path = require('path');

const ERRONAOSELECT = "É preciso selecionar ao menos um documento para pesquisa.";
const ERRONOMECOMPLETO = "É preciso digitar o nome COMPLETO, inclusive com acentos.";
const ERROCPF = "O CPF digitado é inválido.";

exports.trf1 = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Trf1.trf1(req.body);
        res.json(result);
    } 
      
}

exports.trf2 = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Trf2.trf2(req.body);
        res.json(result);
    } 
      
}

exports.trf3 = async (req, res) => {

    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Trf3.trf3(req.body);
        res.json(result);
    } 
      
}

exports.trf4 = async (req, res) => {

    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Trf4.trf4(req.body);
        res.json(result);
    } 
      
}

exports.trf5 = async (req, res) => {

    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Trf5.trf5(req.body);
        res.json(result);
    } 
      
}

exports.tjdf = async (req, res) => {

    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.nomeMae){
        error.push('É preciso informar o nome completo da Mãe.'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjdf.tjdf(req.body);
        res.json(result);
    } 
      
}

exports.tjms = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.comarca){
        error.push('É preciso selecionar uma Comarca.'); 
    }

    if(!req.body.sexo){
        error.push('É preciso selecionar o Sexo.'); 
    }

    if(!req.body.nascimento){
        error.push('É preciso informar a data de Nascimento.'); 
    }

    if(!req.body.email){
        error.push('É preciso informar o email para recebimento das certidões'); 
    }

    if(!req.body.nomeMae){
        error.push('É preciso informar o nome completo da Mãe.'); 
    }

    if(!req.body.nomePai){
        error.push('É preciso informar o nome completo do Pai.'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjms.tjms(req.body);
        res.json(result);
    }        
      
}

exports.tjsp = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.sexo){
        error.push('É preciso selecionar o Sexo.'); 
    }

    if(!req.body.nascimento){
        error.push('É preciso informar a data de Nascimento.'); 
    }

    if(!req.body.email){
        error.push('É preciso informar o email para recebimento das certidões'); 
    }

    if(!req.body.nomeMae){
        error.push('É preciso informar o nome completo da Mãe.'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjsp.tjsp(req.body);
        res.json(result);
    }        
      
}

exports.tjsc = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    // if(!req.body.comarca){
    //     error.push('É preciso selecionar uma Comarca.'); 
    // }

    if(!req.body.sexo){
        error.push('É preciso selecionar o Sexo.'); 
    }

    if(!req.body.nascimento){
        error.push('É preciso informar a data de Nascimento.'); 
    }

    if(!req.body.email){
        error.push('É preciso informar o email para recebimento das certidões'); 
    }

    if(!req.body.nomeMae){
        error.push('É preciso informar o nome completo da Mãe.'); 
    }

    if(!req.body.nomePai){
        error.push('É preciso informar o nome completo do Pai.'); 
    }

    if(!req.body.orgaoExp){
        error.push('É preciso informar o órgão expedidor do RG.'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjsc.tjsc(req.body);
        res.json(result);
    }        
      
}

exports.tjrs = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.estadoCivil){
        error.push('É preciso informar o estado civil.'); 
    }

    if(!req.body.sexo){
        error.push('É preciso selecionar o Sexo.'); 
    }

    if(!req.body.nascimento){
        error.push('É preciso informar a data de Nascimento.'); 
    }

    if(!req.body.nomeMae){
        error.push('É preciso informar o nome completo da Mãe.'); 
    }

    if(!req.body.nomePai){
        error.push('É preciso informar o nome completo do Pai.'); 
    }

    if(!req.body.orgaoExp){
        error.push('É preciso informar o órgão expedidor do RG.'); 
    }

    if(!req.body.ufRg){
        error.push('É preciso informar a UF do RG.'); 
    }

    if(!req.body.endereco){
        error.push('É preciso informar o Endereço.'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjrs.tjrs(req.body);
        res.json(result);
    }        
      
}

exports.tjba = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.estadoCivil){
        error.push('É preciso informar o estado civil.'); 
    }

    if(!req.body.nomeMae){
        error.push('É preciso informar o nome completo da Mãe.'); 
    }

    if(!req.body.nomePai){
        error.push('É preciso informar o nome completo do Pai.'); 
    }

    if(!req.body.orgaoExp){
        error.push('É preciso informar o órgão expedidor do RG.'); 
    }

    if(!req.body.endereco){
        error.push('É preciso informar o Endereço.'); 
    }

    if(!req.body.naturalidade){
        error.push('É preciso informar a Naturalidade.'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjba.tjba(req.body);
        res.json(result);
    }        
      
}

exports.tjpi = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.estadoCivilTjPI){
        error.push('É preciso informar o estado civil.'); 
    }

    if(!req.body.nomeMae){
        error.push('É preciso informar o nome completo da Mãe.'); 
    }

    if(!req.body.nomePai){
        error.push('É preciso informar o nome completo do Pai.'); 
    }

    if(!req.body.orgaoExp){
        error.push('É preciso informar o órgão expedidor do RG.'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjpi.tjpi(req.body);
        res.json(result);
    }        
      
}

exports.tjal = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.sexo){
        error.push('É preciso selecionar o Sexo.'); 
    }

    if(!req.body.nascimento){
        error.push('É preciso informar a data de Nascimento.'); 
    }

    if(!req.body.estadoCivil){
        error.push('É preciso informar o estado civil.'); 
    }

    if(!req.body.email){
        error.push('É preciso informar o email para recebimento das certidões'); 
    }

    if(!req.body.nomeMae){
        error.push('É preciso informar o nome completo da Mãe.'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjal.tjal(req.body);
        res.json(result);
    }        
      
}

exports.tjap = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.sexo){
        error.push('É preciso selecionar o Sexo.'); 
    }

    if(!req.body.nascimento){
        error.push('É preciso informar a data de Nascimento.'); 
    }

    if(!req.body.email){
        error.push('É preciso informar o email para recebimento das certidões'); 
    }

    if(!req.body.nomeMae){
        error.push('É preciso informar o nome completo da Mãe.'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjap.tjap(req.body);
        res.json(result);
    }        
      
}

exports.tjce = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.nascimento){
        error.push('É preciso informar a data de Nascimento.'); 
    }

    if(!req.body.email){
        error.push('É preciso informar o email para recebimento das certidões'); 
    }

    if(!req.body.nomeMae){
        error.push('É preciso informar o nome completo da Mãe.'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjce.tjce(req.body);
        res.json(result);
    }        
      
}

exports.tjes = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.nomeMae){
        error.push('É preciso informar o nome completo da Mãe.'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjes.tjes(req.body);
        res.json(result);
    }        
      
}

exports.tjgo = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.nascimento){
        error.push('É preciso informar a data de Nascimento.'); 
    }

    if(!req.body.nomeMae){
        error.push('É preciso informar o nome completo da Mãe.'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjgo.tjgo(req.body);
        res.json(result);
    }        
      
}

exports.tjrr = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjrr.tjrr(req.body);
        res.json(result);
    }        
      
}

exports.tjto = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjto.tjto(req.body);
        res.json(result);
    }        
      
}

exports.tjro = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjro.tjro(req.body);
        res.json(result);
    }        
      
}

exports.tjam = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.nascimento){
        error.push('É preciso informar a data de Nascimento.'); 
    }

    if(!req.body.email){
        error.push('É preciso informar o email para recebimento das certidões'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjam.tjam(req.body);
        res.json(result);
    }        
      
}

exports.tjac = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.nascimento){
        error.push('É preciso informar a data de Nascimento.'); 
    }

    if(!req.body.email){
        error.push('É preciso informar o email para recebimento das certidões'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjac.tjac(req.body);
        res.json(result);
    }        
      
}

exports.tjmt = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjmt.tjmt(req.body);
        res.json(result);
    }        
      
}

exports.tjpe = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.nascimento){
        error.push('É preciso informar a data de Nascimento.'); 
    }

    if(!req.body.estadoCivil){
        error.push('É preciso informar o estado civil.'); 
    }

    if(!req.body.rg){
        error.push('É preciso informar o RG.'); 
    }

    if(!req.body.ufRg){
        error.push('É preciso informar a UF do RG.'); 
    }

    if(!req.body.nomeMae){
        error.push('É preciso informar o nome completo da Mãe.'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjpe.tjpe(req.body);
        res.json(result);
    }        
      
}

exports.tjma = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.nomeMae){
        error.push('É preciso informar o nome completo da Mãe.'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjma.tjma(req.body);
        res.json(result);
    }        
      
}

exports.tjse = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjse.tjse(req.body);
        res.json(result);
    }        
      
}

exports.tjpa = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.nomeMae){
        error.push('É preciso informar o nome completo da Mãe.'); 
    }

    if(!req.body.endereco){
        error.push('É preciso informar o Endereço.'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjpa.tjpa(req.body);
        res.json(result);
    }        
      
}

exports.tjrn = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.nascimento){
        error.push('É preciso informar a data de Nascimento.'); 
    }

    if(!req.body.rg){
        error.push('É preciso informar o RG.'); 
    }

    if(!req.body.nomeMae){
        error.push('É preciso informar o nome completo da Mãe.'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjrn.tjrn(req.body);
        res.json(result);
    }        
      
}

exports.tjpb = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.nascimento){
        error.push('É preciso informar a data de Nascimento.'); 
    }

    if(!req.body.sexo){
        error.push('É preciso selecionar o Sexo.'); 
    }

    if(!req.body.email){
        error.push('É preciso informar o email para recebimento das certidões'); 
    }

    if(!req.body.rg){
        error.push('É preciso informar o RG.'); 
    }

    if(!req.body.ufRg){
        error.push('É preciso informar a UF do RG.'); 
    }

    if(!req.body.nomeMae){
        error.push('É preciso informar o nome completo da Mãe.'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Tjpb.tjpb(req.body);
        res.json(result);
    }        
      
}

exports.acpf = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.nascimento){
        error.push('É preciso informar a data de Nascimento.'); 
    }

    if(!req.body.rg){
        error.push('É preciso informar o RG.'); 
    }

    if(!req.body.ufRg){
        error.push('É preciso informar a UF do RG.'); 
    }

    if(!req.body.orgaoExp){
        error.push('É preciso informar o órgão expedidor do RG.'); 
    }

    if(!req.body.nomeMae){
        error.push('É preciso informar o nome completo da Mãe.'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Acpf.acpf(req.body);
        res.json(result);
    }        
      
}

exports.ctse = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.nascimento){
        error.push('É preciso informar a data de Nascimento.'); 
    }

    if(!req.body.nomeMae){
        error.push('É preciso informar o nome completo da Mãe.'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Ctse.ctse(req.body);
        res.json(result);
    }        
      
}

exports.ctcu = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Ctcu.ctcu(req.body);
        res.json(result);
    }        
      
}

exports.crf = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Crf.crf(req.body);
        res.json(result);
    }        
      
}

exports.stm = async (req, res) => {
    
    let error = [];

    if(req.body.documento == ""){
        error.push(ERRONAOSELECT);
        res.json({ erroValid: error });
        return; 
    }

    if(req.body.nome == ""){
        error.push(ERRONOMECOMPLETO); 
    }

    if(!req.body.nascimento){
        error.push('É preciso informar a data de Nascimento.'); 
    }

    if(!req.body.nomeMae){
        error.push('É preciso informar o nome completo da Mãe.'); 
    }

    const cpf = new ValidaCPF(req.body.cpf);
    if(!cpf.valida()) {
        error.push(ERROCPF);
    }
    
    if(error != ''){
        res.json({ erroValid: error })
    }else{
        const result = await Stm.stm(req.body);
        res.json(result);
    }        
      
}

exports.certidaoEnviada = (req, res) => { 
    let demail = req.params.email;
    res.render('certidaoEmail', {email: demail});
}

exports.download = (req, res) => { 
    let cpf = req.params.cpf;
    let orgao = req.params.orgao;    
    let diretorio = req.params.diretorio;    
    if (orgao == 'tjse') {
        res.download(path.resolve(__dirname, '../','../', 'files')+'/'+diretorio+'/'+cpf+orgao+'.png');
    } else {
        res.download(path.resolve(__dirname, '../','../', 'files')+'/'+diretorio+'/'+cpf+orgao+'.pdf');
    }
}


function ValidaCPF(cpfEnviado) {
    Object.defineProperty(this, 'cpfLimpo', {
      enumerable: true,
      get: function() {
        return cpfEnviado.replace(/\D+/g, '');
      }
    });
  }
  
  ValidaCPF.prototype.valida = function() {
    if(typeof this.cpfLimpo === 'undefined') return false;
    if(this.cpfLimpo.length !== 11) return false;
    if(this.isSequencia()) return false;
  
    const cpfParcial = this.cpfLimpo.slice(0, -2);
    const digito1 = this.criaDigito(cpfParcial);
    const digito2 = this.criaDigito(cpfParcial + digito1);
  
    const novoCpf = cpfParcial + digito1 + digito2;
    return novoCpf === this.cpfLimpo;
  };
  
  ValidaCPF.prototype.criaDigito = function(cpfParcial) {
    const cpfArray = Array.from(cpfParcial);
  
    let regressivo = cpfArray.length + 1;
    const total = cpfArray.reduce((ac, val) => {
      ac += (regressivo * Number(val));
      regressivo--;
      return ac;
    }, 0);
  
    const digito = 11 - (total % 11);
    return digito > 9 ? '0' : String(digito);
  };
  
  ValidaCPF.prototype.isSequencia = function() {
    const sequencia = this.cpfLimpo[0].repeat(this.cpfLimpo.length);
    return sequencia === this.cpfLimpo;
  };