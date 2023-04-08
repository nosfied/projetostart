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

exports.tjac = async (dados) => {    

    console.log("TJAC Processando...");
    const SITE_URL = "https://esaj.tjac.jus.br/sco/abrirCadastro.do";
    const CPF = dados.cpf;
    const NOME = dados.nome;
    const SEXO = dados.sexo;
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
        await page.keyboard.press('Enter', {delay:1000});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.type(NOME,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});            
        await page.keyboard.type(CPF,{delay:150});
        if(SEXO == 'masculino'){
            await page.keyboard.press('Tab', {delay:1000});
            await page.keyboard.press('Tab', {delay:1000});
            await page.keyboard.press('Space', {delay:1000});
        }else{
            await page.keyboard.press('Tab', {delay:1000});
            await page.keyboard.press('Tab', {delay:1000});
            await page.keyboard.press('ArrowRight', {delay:1000});
        }
        await page.click('#identity\\.solicitante\\.deEmail', { delay: 2000 });    
        await page.keyboard.type(EMAIL,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.press('Space', {delay:1000});
        await page.waitForTimeout(3000);
        let telaCaptcha = await page.evaluate(async ()=>{        
                        
            return document.querySelector("body > div:nth-child(15)").style.visibility;                    
        })
        console.log(telaCaptcha);
        if(telaCaptcha == 'visible') {        
            console.log("TJAC: Processo interrompido pelo Captcha. Tentando solucionar...");            
            let quebrarCaptcha = await page.solveRecaptchas();
            console.log(quebrarCaptcha);      
            await page.waitForTimeout(3000);
            await page.focus('#identity\\.solicitante\\.deEmail', { delay: 2000 });
            await page.keyboard.press('Tab', {delay:1000});
            await page.keyboard.press('Space', {delay:1000});
            await page.keyboard.press('Tab', {delay:1000});
            await page.keyboard.press('Tab', {delay:1000});
            await page.keyboard.press('Tab', {delay:1000});
            await page.keyboard.press('Space', {delay:1000});        
            await page.keyboard.press('Tab', {delay:1000});
            await page.keyboard.press('Enter', {delay:1000});            
        } else {
            await page.keyboard.press('Tab', {delay:1000});
            await page.keyboard.press('Tab', {delay:1000});
            await page.keyboard.press('Tab', {delay:1000});
            await page.keyboard.press('Space', {delay:1000});        
            await page.focus('#pbEnviar', { delay: 3000 });
            await page.click('#pbEnviar', { delay: 2000 });
        }            
        await page.waitForTimeout(3000);
        let confirmacao = await page.evaluate(async ()=>{        
                        
            let elemento = document.querySelector("#btnSim");
            if (elemento) {
                return elemento
            }
            return null;                    
        })
        if (confirmacao != null) {
            await page.evaluate(async ()=>{        
                        
                let el = document.querySelector("#btnSim");
                el.click();                    
            })    
            console.log(confirmacao);
        }
        await page.waitForSelector('body > table:nth-child(4) > tbody > tr > td > form > div:nth-child(2) > table.secaoFormBody > tbody > tr:nth-child(1) > td:nth-child(2) > span');
        let nPedido = await page.$eval('body > table:nth-child(4) > tbody > tr > td > form > div:nth-child(2) > table.secaoFormBody > tbody > tr:nth-child(1) > td:nth-child(2) > span', el => el.textContent);
        let dtPedido = await page.$eval('body > table:nth-child(4) > tbody > tr > td > form > div:nth-child(2) > table.secaoFormBody > tbody > tr:nth-child(2) > td:nth-child(2) > span', el => el.textContent);
        let cpf = await page.$eval('body > table:nth-child(4) > tbody > tr > td > form > div:nth-child(3) > table.secaoFormBody > tbody > tr:nth-child(4) > td:nth-child(2) > table > tbody > tr > td > span > span', el => el.textContent);
        let printPDF = ` https://esaj.tjac.jus.br/sco/realizarDownload.do?entity.nuPedido=${nPedido}&entity.dtPedido=${dtPedido}&entity.tpPessoa=F&entity.nuCpf=${cpf}`;        
        console.log("Arquivo TJAC criminal 1° GRAU, PDF gerado com sucesso.");
        await page.waitForTimeout(20000);
        resultado.push({cpf: printPDF, orgao: 'tjac', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS 1° GRAU'});
    
    } catch (error) {        
        console.log("TJAC " + error);
        browser.close();
        return { erro: error, result: resultado };
    }
    browser.close();
    return resultado;
}