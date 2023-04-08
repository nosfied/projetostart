const puppeteer = require('puppeteer-extra');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const paths = require('../paths/paths');
const util = require('../util/util');

//Plugin para deixar o puppeteer 90% indetectável
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const { copyFile } = require('node:fs/promises');
const { unlink } = require('node:fs/promises');
const { mkdir } = require('node:fs/promises');

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

exports.tjsp = async (dados) => {    

    console.log("TJSP Processando...");
    const SITE_URL = "https://esaj.tjsp.jus.br/sco/abrirCadastro.do";
    const TIPOS = dados.documento;
    const CPF = dados.cpf;
    const RG = dados.rg;
    const NOME = dados.nome;
    const SEXO = dados.sexo;
    const NASCIMENTO = dados.nascimento[8]+dados.nascimento[9]+dados.nascimento[5]+dados.nascimento[6]+dados.nascimento[0]+dados.nascimento[1]+dados.nascimento[2]+dados.nascimento[3];        
    const NOMEMAE = dados.nomeMae;        
    const NOMEPAI = dados.nomePai;   
    const EMAIL = dados.email;
    let resultado = [];

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: paths.googleChrome(),
        //userDataDir: paths.perfilChrome(),
        defaultViewport: false,
        ignoreHTTPSErrors: true        
    
    });
    const page = await browser.newPage();
                
    try {                         
        await util.limparArquivosAntigos();        
        await page.goto(SITE_URL, {waitUntil: 'networkidle2'});        
        await page.click('#cdModelo', { delay: 2000 });    
        await page.keyboard.press('ArrowDown', {delay:1000});
        await page.keyboard.press('ArrowDown', {delay:1000});        
        await page.keyboard.press('ArrowDown', {delay:1000});        
        await page.keyboard.press('ArrowDown', {delay:1000});        
        await page.keyboard.press('ArrowDown', {delay:1000});
        await page.keyboard.press('ArrowDown', {delay:1000});
        await page.keyboard.press('Enter', {delay:1000});                     
        await page.keyboard.press('Tab', {delay:1000});            
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.type(NOME,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});            
        await page.keyboard.type(CPF,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});            
        await page.keyboard.type(RG,{delay:150});
        if(SEXO == 'masculino'){
            await page.keyboard.press('Tab', {delay:1000});
            await page.keyboard.press('Space', {delay:1000});
            await page.keyboard.press('Tab', {delay:1000});
        }else{
            await page.keyboard.press('Tab', {delay:1000});
            await page.keyboard.press('ArrowRight', {delay:1000});
            await page.keyboard.press('Tab', {delay:1000});
        }                
        await page.keyboard.type(NOMEMAE,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});        
        await page.keyboard.type(NOMEPAI,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.type(NASCIMENTO,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.type(EMAIL,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.press('Space', {delay:1000});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.press('Enter', {delay:1000});
        await page.waitForTimeout(2000);
        let captchaPresente = await page.evaluate(() =>{
            let elemento = document.getElementById('spwTabelaMensagem');
            if(elemento) return elemento.textContent;
            return false;
        })
        console.log(captchaPresente);
        if(captchaPresente != false){
            let confirmCaptchaPresente = true;
            for (let index = 0; index < 6; index++) {
                if(confirmCaptchaPresente == false) continue;
                await page.waitForTimeout(7000);
                await page.keyboard.press('F5', {delay:1000});
                await page.click('#pbEnviar', { delay: 2000 });
                await page.waitForTimeout(2000);
                confirmCaptchaPresente = await page.evaluate(() =>{
                    let elemento = document.getElementById('spwTabelaMensagem');
                    if(elemento) return true;
                    return false;
                })                        
                console.log(index);                                       
            }
        }
        let jaPedido = await page.evaluate(() =>{
            return document.getElementById('popupModalDiv');
        })

        if(!jaPedido){
            let nPedido = await page.$eval('body > table:nth-child(7) > tbody > tr > td > form > div:nth-child(2) > table.secaoFormBody > tbody > tr:nth-child(1) > td:nth-child(2) > span', el => el.textContent);
            let dtPedido = await page.$eval('body > table:nth-child(7) > tbody > tr > td > form > div:nth-child(2) > table.secaoFormBody > tbody > tr:nth-child(2) > td:nth-child(2) > span', el => el.textContent);
            let cpf = await page.$eval('body > table:nth-child(7) > tbody > tr > td > form > div:nth-child(3) > table.secaoFormBody > tbody > tr:nth-child(4) > td:nth-child(2) > table > tbody > tr > td > span:nth-child(1) > span', el => el.textContent);
        
            let printPDF = `https://esaj.tjsp.jus.br/sco/realizarDownload.do?entity.nuPedido=${nPedido}&entity.dtPedido=${dtPedido}&entity.tpPessoa=F&entity.nuCpf=${cpf}`;        
        
            console.log("Arquivo TJSP 1° GRAU, PDF gerado com sucesso.");
            resultado.push({cpf: printPDF, orgao: 'tjsp', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS 1° GRAU'});
        }else{
            console.log("Arquivo TJSP 1° GRAU, Já existe um pedido anterior.");
            resultado.push({cpf: SITE_URL, orgao: 'tjsp', documento: 'Já existe um pedido anterior para Certidão, AÇÕES E EXECUÇÕES CRIMINAIS 1° GRAU, verifique seu email.'});
        }                            

    
    } catch (error) {        
        console.log("TJSP " + error);
        browser.close();
        return { erro: error, result: resultado };
    }
    browser.close();
    return resultado;
}