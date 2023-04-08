const express = require('express');
const bodyParser = require('body-parser');
const path = require('path');
const pesquisa = require('../src/classes/Pesquisa.js');
const { json } = require('body-parser');
const router = express.Router();

router.use(express.json());
router.use(express.urlencoded({ extended: true }));


router.get("/pesquisa/arquivos/:cpf/:orgao", (req, res)=>{ 
    let cpf = req.params.cpf;
    let orgao = req.params.orgao;    

    res.download('arquivos/'+cpf+orgao+'.pdf');
})

router.get("/pesquisa", (req, res)=>{ 
    res.render('pesquisa');
})


router.post("/pesquisa", (req, res)=>{ 
    let dnome = req.body.nome;
    let cpf = req.body.cpf;
    
    async function resposta(){
       let resp = await pesquisa.processar(cpf, dnome);       
        if(resp){
            
            res.render('resultado', {result: resp, nome: dnome});
            
        }else{
            alert("Não foi possível processar o pedido.");
        }                
    }
    resposta();  

    
})


module.exports = router;