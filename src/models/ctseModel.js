const puppeteer = require('puppeteer-extra');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const paths = require('../paths/paths');
const util = require('../util/util');

//Plugin para deixar o puppeteer 90% indetectável
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const { copyFile } = require('node:fs/promises');
const { unlink } = require('node:fs/promises');
const { mkdir } = require('node:fs/promises');
const { readdir } = require('node:fs/promises');
const { BrowserContext, Frame } = require('puppeteer');

puppeteer.use(StealthPlugin());

puppeteer.use(
    RecaptchaPlugin({
        provider: {
            id: '2captcha',
            token: `${process.env.KEY}` // REPLACE THIS WITH YOUR OWN 2CAPTCHA API KEY
        },
        visualFeedback: true, // colorize reCAPTCHAs (violet = detected, green = solved)
        solveInactiveChallenges: true,
        solveScoreBased: true,
        solveInViewportOnly: false
    })
)

exports.ctse = async (dados) => {    

    console.log("CTSE Processando...");
    const SITE_URL = "https://www.tse.jus.br/";
    const TIPOS = dados.documento;
    const CPF = dados.cpf;
    const NASCIMENTO = dados.nascimento[8]+dados.nascimento[9]+dados.nascimento[5]+dados.nascimento[6]+dados.nascimento[0]+dados.nascimento[1]+dados.nascimento[2]+dados.nascimento[3];
    const NASCIMENTOCOMBARRA = dados.nascimento[8]+dados.nascimento[9]+'/'+dados.nascimento[5]+dados.nascimento[6]+'/'+dados.nascimento[0]+dados.nascimento[1]+dados.nascimento[2]+dados.nascimento[3];
    const NOME = dados.nome;
    const NOMEMAE = dados.nomeMae;        
    const NOMEPAI = dados.nomePai;

    let resultado = [];
    let nTitulo = '';

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: paths.googleChrome(),
        //userDataDir: paths.perfilChrome(),
        defaultViewport: false,
        ignoreHTTPSErrors: true,
        //args: [ `--proxy-server=zproxy.lum-superproxy.io:22225` ]        
    
    });    

    const page = await browser.newPage();
    // await page.authenticate({
    //     username: process.env.USER,
    //     password: process.env.PASS
    // });
    try {                         
        for (const tipo of TIPOS) {
            if (tipo == 'situacao') {

                await util.limparArquivosAntigos();
                await page.goto(SITE_URL, { waitUntil: 'networkidle2', setTimeout: 60000 });
                await page.waitForTimeout(3000);
                await page.click('#modal-lgpd > div > div > div.botao > button', { delay: 2000 });
                await page.waitForTimeout(3000);
                await page.click('#destaqueServico > li:nth-child(2) > a', { delay: 2000 });
                await page.waitForTimeout(3000);
                await page.click('#QE_NomeEleitor', { delay: 2000 });
                await page.keyboard.type(NOME, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(CPF, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(NASCIMENTO, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(NOMEMAE, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                if (NOMEPAI) {
                    await page.keyboard.type(NOMEPAI, { delay: 150 });
                } else {
                    await page.keyboard.press('Tab', { delay: 2000 });
                    await page.keyboard.press('Space', {delay:1000});
                }
                await page.click('#form-quitacao-eleitoral > fieldset > div > div.form-group.servicos__form_botao > button', { delay: 2000 });               
                await page.waitForTimeout(9000);
                //Obter número do título eleitoral
                const elementHandle = await page.$(
                    'iframe[title="Certidão de Quitação Eleitoral"]',
                );
                const frame = await elementHandle.contentFrame();
                await page.waitForTimeout(3000);
                let titulo = await frame.$eval('#viewer > div > div.textLayer > span:nth-child(195)', el => el.textContent);
                nTitulo = titulo.replace(/\s/g, '');
                console.log(nTitulo);                
                await frame.click('#secondaryToolbarToggle', { delay: 2000 });                
                await page.keyboard.press('Tab', { delay: 3000 });                
                await page.keyboard.press('Tab', { delay: 3000 });
                await page.keyboard.press('Tab', { delay: 3000 });
                await page.keyboard.press('Enter', { delay: 1000 });                
                await page.waitForTimeout(5000);                
                //Criação de diretório para armazenar arquivos da pesquisa
                diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                    return dir;
                });
                await copyFile(`${paths.dirDownloadPadrao()}${process.env.BARRA}document.pdf`, `${diretorio}${process.env.BARRA}${CPF}tseSituacao.pdf`);
                let pasta = diretorio.split(`files${process.env.BARRA}`);
                console.log("Arquivo TSE Situação Eleitoral, PDF gerado com sucesso.");
                await unlink(`${paths.dirDownloadPadrao()}${process.env.BARRA}document.pdf`);
                resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tseSituacao', documento: 'TSE Certidão - Situação Eleitoral' });                               

            } else if (tipo == 'FiliacaoSimples') {
                await util.limparArquivosAntigos();
                if (nTitulo == '' || nTitulo.length < 11) {
                    console.log(nTitulo);
                    await page.goto(SITE_URL, { waitUntil: 'networkidle2' });
                    await page.waitForTimeout(3000);
                    await page.click('#modal-lgpd > div > div > div.botao > button', { delay: 2000 });
                    await page.waitForTimeout(3000);
                    await page.click('#destaqueServico > li:nth-child(2) > a', { delay: 2000 });
                    await page.waitForTimeout(3000);
                    await page.click('#QE_NomeEleitor', { delay: 2000 });
                    await page.keyboard.type(NOME, { delay: 150 });
                    await page.keyboard.press('Tab', { delay: 2000 });
                    await page.keyboard.type(CPF, { delay: 150 });
                    await page.keyboard.press('Tab', { delay: 2000 });
                    await page.keyboard.type(NASCIMENTO, { delay: 150 });
                    await page.keyboard.press('Tab', { delay: 2000 });
                    await page.keyboard.type(NOMEMAE, { delay: 150 });
                    await page.keyboard.press('Tab', { delay: 2000 });
                    await page.keyboard.press('Tab', { delay: 2000 });
                    if (NOMEPAI) {
                        await page.keyboard.type(NOMEPAI, { delay: 150 });
                    } else {
                        await page.keyboard.press('Tab', { delay: 2000 });
                        await page.keyboard.press('Space', { delay: 1000 });
                    }
                    await page.click('#form-quitacao-eleitoral > fieldset > div > div.form-group.servicos__form_botao > button', { delay: 2000 });
                    await page.waitForTimeout(9000);
                    //Obter número do título eleitoral
                    const elementHandle = await page.$(
                        'iframe[title="Certidão de Quitação Eleitoral"]',
                    );
                    const frame = await elementHandle.contentFrame();
                    await page.waitForTimeout(3000);
                    let titulo = await frame.$eval('#viewer > div > div.textLayer > span:nth-child(195)', el => el.textContent);
                    nTitulo = titulo.replace(/\s/g, '');
                    console.log("Arquivo TSE Filiação Partidária - Simples, Número do Título Obtido: " + nTitulo);
                }
                await page.goto('https://www.tse.jus.br/servicos-eleitorais/certidoes/certidao-de-filiacao-partidaria');                
                await page.waitForTimeout(3000);                
                await page.click('#modal-lgpd > div > div > div.botao > button', { delay: 2000 });                
                await page.waitForTimeout(2000);
                const elementHandle = await page.$(
                    'iframe[src="https://filia-consulta.tse.jus.br/"]',
                );
                const frame = await elementHandle.contentFrame();
                let botao = await frame.evaluate(async ()=>{        
                        
                    return document.querySelector("body > app-root > div > app-principal > mat-sidenav-container > mat-sidenav-content > app-sub-menu-certidao > div > div > mat-card > mat-card-header > div > mat-card-title > mat-nav-list > a:nth-child(1) > span");                    
                })
                if (botao) {
                    console.log(botao);                    
                    await frame.click('body > app-root > div > app-principal > mat-sidenav-container > mat-sidenav-content > app-sub-menu-certidao > div > div > mat-card > mat-card-header > div > mat-card-title > mat-nav-list > a:nth-child(1) > span', { delay: 2000 });
                } else {
                    await frame.click('body > app-root > div > app-principal > mat-sidenav-container > mat-sidenav-content > app-menu > div > mat-grid-list > div > mat-card > mat-card-header > div > mat-card-title > mat-nav-list > a > span', { delay: 2000 });
                    await frame.click('body > app-root > div > app-principal > mat-sidenav-container > mat-sidenav-content > app-sub-menu-certidao > div > div > mat-card > mat-card-header > div > mat-card-title > mat-nav-list > a:nth-child(1) > span', { delay: 2000 });
                }
                await frame.click('#mat-input-0', { delay: 2000 });
                await page.keyboard.type(nTitulo, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(NOME, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.sendCharacter(NASCIMENTOCOMBARRA, {delay:4000});
                await page.waitForTimeout(1000);
                await frame.focus('#mat-input-3', { delay: 2000 });                
                await page.keyboard.type(NOMEMAE, { delay: 150 });
                await frame.click('#mat-input-3', { delay: 2000 });                
                await page.waitForTimeout(1000);
                await frame.click('#mat-input-4', { delay: 2000 });
                if (NOMEPAI) {
                    await page.keyboard.type(NOMEPAI, { delay: 150 });
                } else {
                    await page.keyboard.press('Tab', { delay: 2000 });
                    await page.keyboard.press('Space', {delay:1000});
                }
                await page.waitForTimeout(2000);
                await frame.focus('#mat-input-4', { delay: 2000 });                
                await frame.click('#mat-input-4', { delay: 4000 });                
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.press('Space', {delay:1000});
                await page.waitForTimeout(3000);
                let telaCaptcha = await frame.evaluate(async ()=>{        
                        
                    return document.querySelector("body > div:nth-child(8)").style.visibility;                    
                })
                console.log(telaCaptcha);
                if(telaCaptcha == 'visible') {        
                    console.log("CTSE - Filiação Simples: Processo interrompido pelo Captcha. Tentando solucionar...");            
                    let quebrarCaptcha = await frame.solveRecaptchas();
                    console.log(quebrarCaptcha);      
                    await page.waitForTimeout(3000);
                    await frame.click('body > app-root > div > app-principal > mat-sidenav-container > mat-sidenav-content > app-gerar-certidao > section > div > article > form > mat-card > mat-card-content > div:nth-child(6) > button:nth-child(3) > span.mat-button-wrapper', { delay: 2000 });
                } else {
                    await frame.click('body > app-root > div > app-principal > mat-sidenav-container > mat-sidenav-content > app-gerar-certidao > section > div > article > form > mat-card > mat-card-content > div:nth-child(6) > button:nth-child(3) > span.mat-button-wrapper', { delay: 2000 });

                }
                await page.waitForTimeout(7000);
                let pag = await browser.pages();
                await pag[2].keyboard.press('Tab', { delay: 1000 });                
                await pag[2].keyboard.press('Tab', { delay: 1000 });
                await pag[2].keyboard.press('Tab', { delay: 1000 });                
                await pag[2].keyboard.press('Enter', { delay: 2000 });
                await pag[2].keyboard.press('Enter', { delay: 2000 });
                //Criação de diretório para armazenar arquivos da pesquisa
                diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                    return dir;
                });
                await pag[2].waitForTimeout(5000);
                await pag[2].pdf({ path: `${diretorio}${process.env.BARRA}${CPF}tseFiliacaoSimples.pdf`, landscape: true });
                let pasta = diretorio.split(`files${process.env.BARRA}`);
                console.log("Arquivo TSE Filiação Partidária - Simples, PDF gerado com sucesso.");
                resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tseFiliacaoSimples', documento: 'TSE Certidão - Filiação Partidária(Simples)' });
                await pag[2].close();
            
            } else if (tipo == 'FiliacaoHistorico') {
                await util.limparArquivosAntigos();
                if (nTitulo == '' || nTitulo.length < 11) {
                    await page.goto(SITE_URL, { waitUntil: 'networkidle2', setTimeout: 60000 });
                    await page.waitForTimeout(3000);
                    await page.click('#modal-lgpd > div > div > div.botao > button', { delay: 2000 });
                    await page.waitForTimeout(3000);
                    await page.click('#destaqueServico > li:nth-child(2) > a', { delay: 2000 });
                    await page.waitForTimeout(3000);
                    await page.click('#QE_NomeEleitor', { delay: 2000 });
                    await page.keyboard.type(NOME, { delay: 150 });
                    await page.keyboard.press('Tab', { delay: 2000 });
                    await page.keyboard.type(CPF, { delay: 150 });
                    await page.keyboard.press('Tab', { delay: 2000 });
                    await page.keyboard.type(NASCIMENTO, { delay: 150 });
                    await page.keyboard.press('Tab', { delay: 2000 });
                    await page.keyboard.type(NOMEMAE, { delay: 150 });
                    await page.keyboard.press('Tab', { delay: 2000 });
                    await page.keyboard.press('Tab', { delay: 2000 });
                    if (NOMEPAI) {
                        await page.keyboard.type(NOMEPAI, { delay: 150 });
                    } else {
                        await page.keyboard.press('Tab', { delay: 2000 });
                        await page.keyboard.press('Space', { delay: 1000 });
                    }
                    await page.click('#form-quitacao-eleitoral > fieldset > div > div.form-group.servicos__form_botao > button', { delay: 2000 });
                    await page.waitForTimeout(9000);
                    //Obter número do título eleitoral
                    const elementHandle = await page.$(
                        'iframe[title="Certidão de Quitação Eleitoral"]',
                    );
                    const frame = await elementHandle.contentFrame();
                    await page.waitForTimeout(4000);
                    let titulo = await frame.$eval('#viewer > div > div.textLayer > span:nth-child(195)', el => el.textContent);
                    console.log(titulo);
                    nTitulo = titulo.replace(/\s/g, '');
                    console.log("Arquivo TSE Filiação Partidária - Histórico, Número do Título Obtido: " + nTitulo);
                }
                await page.goto('https://www.tse.jus.br/servicos-eleitorais/certidoes/certidao-de-filiacao-partidaria');                
                await page.waitForTimeout(2000);                
                await page.click('#modal-lgpd > div > div > div.botao > button', { delay: 2000 });                
                await page.waitForTimeout(4000);
                const elementHandle = await page.$(
                    'iframe[src="https://filia-consulta.tse.jus.br/"]',
                );
                const frame = await elementHandle.contentFrame();
                let botao = await frame.evaluate(async ()=>{        
                        
                    return document.querySelector("body > app-root > div > app-principal > mat-sidenav-container > mat-sidenav-content > app-sub-menu-certidao > div > div > mat-card > mat-card-header > div > mat-card-title > mat-nav-list > a:nth-child(1) > span");                    
                })
                if (botao){
                    console.log(botao);
                    await frame.click('body > app-root > div > app-principal > mat-sidenav-container > mat-sidenav-content > app-sub-menu-certidao > div > div > mat-card > mat-card-header > div > mat-card-title > mat-nav-list > a:nth-child(1) > span', { delay: 2000 });
                } else {
                    await frame.click('body > app-root > div > app-principal > mat-sidenav-container > mat-sidenav-content > app-menu > div > mat-grid-list > div > mat-card > mat-card-header > div > mat-card-title > mat-nav-list > a > span', { delay: 2000 });
                    await frame.click('body > app-root > div > app-principal > mat-sidenav-container > mat-sidenav-content > app-sub-menu-certidao > div > div > mat-card > mat-card-header > div > mat-card-title > mat-nav-list > a:nth-child(1) > span', { delay: 2000 });
                }
                await frame.click('#mat-input-0', { delay: 2000 });
                await page.keyboard.type(nTitulo, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('ArrowDown', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(NOME, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.sendCharacter(NASCIMENTOCOMBARRA, {delay:4000});
                await page.waitForTimeout(1000);
                await frame.focus('#mat-input-3', { delay: 2000 });                
                await page.keyboard.type(NOMEMAE, { delay: 150 });
                await frame.click('#mat-input-3', { delay: 2000 });                
                await page.waitForTimeout(1000);
                await frame.click('#mat-input-4', { delay: 2000 });
                if (NOMEPAI) {
                    await page.keyboard.type(NOMEPAI, { delay: 150 });
                } else {
                    await page.keyboard.press('Tab', { delay: 2000 });
                    await page.keyboard.press('Space', {delay:1000});
                }
                await page.waitForTimeout(2000);
                await frame.focus('#mat-input-4', { delay: 2000 });                
                await frame.click('#mat-input-4', { delay: 4000 });                
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.press('Space', {delay:1000});
                await page.waitForTimeout(3000);
                let telaCaptcha = await frame.evaluate(async ()=>{        
                        
                    return document.querySelector("body > div:nth-child(8)").style.visibility;                    
                })
                console.log(telaCaptcha);
                if(telaCaptcha == 'visible') {        
                    console.log("CTSE - Filiação Histórico: Processo interrompido pelo Captcha. Tentando solucionar...");            
                    let quebrarCaptcha = await frame.solveRecaptchas();
                    console.log(quebrarCaptcha);      
                    await page.waitForTimeout(3000);
                    await frame.click('body > app-root > div > app-principal > mat-sidenav-container > mat-sidenav-content > app-gerar-certidao > section > div > article > form > mat-card > mat-card-content > div:nth-child(6) > button:nth-child(3) > span.mat-button-wrapper', { delay: 2000 });
                } else {
                    await frame.click('body > app-root > div > app-principal > mat-sidenav-container > mat-sidenav-content > app-gerar-certidao > section > div > article > form > mat-card > mat-card-content > div:nth-child(6) > button:nth-child(3) > span.mat-button-wrapper', { delay: 2000 });

                }
                await page.waitForTimeout(7000);
                let pag = await browser.pages();
                await pag[2].keyboard.press('Tab', { delay: 1000 });
                await pag[2].keyboard.press('Tab', { delay: 1000 });
                await pag[2].keyboard.press('Tab', { delay: 1000 });
                await pag[2].keyboard.press('Enter', { delay: 2000 });
                await pag[2].keyboard.press('Enter', { delay: 2000 });
                await pag[2].keyboard.press('Enter', { delay: 2000 });
                await pag[2].keyboard.press('Enter', { delay: 2000 });                
                //Criação de diretório para armazenar arquivos da pesquisa
                diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                    return dir;
                });
                await pag[2].waitForTimeout(5000);
                await pag[2].pdf({ path: `${diretorio}${process.env.BARRA}${CPF}tseFiliacaoHistorico.pdf`, landscape: true });                
                let pasta = diretorio.split(`files${process.env.BARRA}`);
                console.log("Arquivo TSE Filiação Partidária - Histórico, PDF gerado com sucesso.");
                resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tseFiliacaoHistorico', documento: 'TSE Certidão - Filiação Partidária(Histórico)' });
            
            } else if (tipo == 'crimesEleitorais') {

                await util.limparArquivosAntigos();                
                await page.goto('https://www.tse.jus.br/servicos-eleitorais/certidoes/certidao-de-crimes-eleitorais');                
                await page.waitForTimeout(2000);                
                await page.click('#modal-lgpd > div > div > div.botao > button', { delay: 2000 });                
                await page.waitForTimeout(2000);
                await page.click('#CE_NomeEleitor', { delay: 2000 });
                await page.keyboard.type(NOME, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(CPF, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(NASCIMENTO, {delay:200});
                await page.waitForTimeout(1000);
                await page.focus('#CE_NomeMae', { delay: 2000 });                
                await page.keyboard.type(NOMEMAE, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                if (NOMEPAI) {
                    await page.keyboard.type(NOMEPAI, { delay: 150 });
                } else {
                    await page.keyboard.press('Tab', { delay: 2000 });
                    await page.keyboard.press('Space', {delay:1000});
                }
                await page.click('#form-crimes-eleitorais > fieldset > button', { delay: 2000 });
                await page.waitForTimeout(12000);                
                let arquivos = await readdir(`${paths.dirDownloadPadrao()}`, (err, files) =>{                    
                    return files;
                });
                let file;
                for (const arquivo of arquivos) {
                    if(arquivo.includes('certidao-crimes-eleitorais')){
                        console.log(arquivo);
                        file = arquivo;
                    }
                }
                //Criação de diretório para armazenar arquivos da pesquisa
                let diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                    return dir;
                });
                await copyFile(`${paths.dirDownloadPadrao()}${process.env.BARRA}${file}`, `${diretorio}${process.env.BARRA}${CPF}tseCrimesEleitorais.pdf`);
                let pasta = diretorio.split(`files${process.env.BARRA}`);
                await unlink(`${paths.dirDownloadPadrao()}${process.env.BARRA}${file}`);
                console.log("Arquivo TSE Certidão Crimes Eleitorais, PDF gerado com sucesso.");
                resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tseCrimesEleitorais', documento: 'TSE Certidão de Crimes Eleitorais' });
            }
        }       
    
    } catch (error) {        
        console.log("CTSE " + error);
        browser.close();
        return { erro: error, result: resultado };
    }
    browser.close();
    return resultado;
}