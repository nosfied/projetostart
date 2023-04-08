const express = require('express');
const route = express.Router();

const homeController = require('./src/controllers/homeController');
const loginController = require('./src/controllers/loginController');
const pesquisaController = require('./src/controllers/pesquisaController');

const { loginRequired } = require('./src/middlewares/middleware');

// Rotas da home
route.get('/', homeController.index);
route.get('/prfstart', homeController.index);

// Rotas de Login
route.get('/login/index', loginController.index);
route.post('/login/login', loginController.login);
route.get('/login/logout', loginController.logout);

//Rotas da Pesquisa
route.post('/pesquisa/trf1', loginRequired, pesquisaController.trf1);
route.post('/pesquisa/trf2', loginRequired, pesquisaController.trf2);
route.post('/pesquisa/trf3', loginRequired, pesquisaController.trf3);
route.post('/pesquisa/trf4', loginRequired, pesquisaController.trf4);
route.post('/pesquisa/trf5', loginRequired, pesquisaController.trf5);
route.post('/pesquisa/tjdf', loginRequired, pesquisaController.tjdf);
route.post('/pesquisa/tjms', loginRequired, pesquisaController.tjms);
route.post('/pesquisa/tjsp', loginRequired, pesquisaController.tjsp);
route.post('/pesquisa/tjsc', loginRequired, pesquisaController.tjsc);
route.post('/pesquisa/tjrs', loginRequired, pesquisaController.tjrs);
route.post('/pesquisa/tjba', loginRequired, pesquisaController.tjba);
route.post('/pesquisa/tjpi', loginRequired, pesquisaController.tjpi);
route.post('/pesquisa/tjal', loginRequired, pesquisaController.tjal);
route.post('/pesquisa/tjap', loginRequired, pesquisaController.tjap);
route.post('/pesquisa/tjce', loginRequired, pesquisaController.tjce);
route.post('/pesquisa/tjes', loginRequired, pesquisaController.tjes);
route.post('/pesquisa/tjgo', loginRequired, pesquisaController.tjgo);
route.post('/pesquisa/tjrr', loginRequired, pesquisaController.tjrr);
route.post('/pesquisa/tjto', loginRequired, pesquisaController.tjto);
route.post('/pesquisa/tjro', loginRequired, pesquisaController.tjro);
route.post('/pesquisa/tjam', loginRequired, pesquisaController.tjam);
route.post('/pesquisa/tjac', loginRequired, pesquisaController.tjac);
route.post('/pesquisa/tjmt', loginRequired, pesquisaController.tjmt);
route.post('/pesquisa/tjpe', loginRequired, pesquisaController.tjpe);
route.post('/pesquisa/tjma', loginRequired, pesquisaController.tjma);
route.post('/pesquisa/tjse', loginRequired, pesquisaController.tjse);
route.post('/pesquisa/tjrn', loginRequired, pesquisaController.tjrn);
route.post('/pesquisa/tjpb', loginRequired, pesquisaController.tjpb);
route.post('/pesquisa/tjpa', loginRequired, pesquisaController.tjpa);
//Polícia Federal
route.post('/pesquisa/acpf', loginRequired, pesquisaController.acpf);
//TSE
route.post('/pesquisa/ctse', loginRequired, pesquisaController.ctse);
//TCU
route.post('/pesquisa/ctcu', loginRequired, pesquisaController.ctcu);
//Receita Federal
route.post('/pesquisa/crf', loginRequired, pesquisaController.crf);
//STM
route.post('/pesquisa/stm', loginRequired, pesquisaController.stm);

route.get('/pesquisa/enviada/:email', loginRequired, pesquisaController.certidaoEnviada);
route.get('/pesquisa/files/:diretorio/:cpf/:orgao', pesquisaController.download);


module.exports = route;
