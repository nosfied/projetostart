const puppeteer = require('puppeteer-extra');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const paths = require('../paths/paths');
const util = require('../util/util');

//Plugin para deixar o puppeteer 90% indetectável
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const { copyFile } = require('node:fs/promises');
const { unlink } = require('node:fs/promises');
const { mkdir } = require('node:fs/promises');
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

exports.tjce = async (dados) => {    

    console.log("TJCE Processando...");
    const SITE_URL = "https://sirece.tjce.jus.br/sirece-web/nova/solicitacao.jsf";
    const TIPOS = dados.documento;
    const CPF = dados.cpf;
    const RG = dados.rg;
    const NOME = dados.nome;
    const NOMEMAE = dados.nomeMae;        
    const NOMEPAI = dados.nomePai;
    const UFRG = dados.ufRg;
    const EMAIL = dados.email;
    const SEXO = dados.sexo;
    const NASCIMENTO = dados.nascimento[8]+dados.nascimento[9]+dados.nascimento[5]+dados.nascimento[6]+dados.nascimento[0]+dados.nascimento[1]+dados.nascimento[2]+dados.nascimento[3];        
    const COMARCA = dados.comarca;        



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
        for (const tipo of TIPOS) {
            if (tipo == 'criminal1' || tipo == 'civel1') {

                await util.limparArquivosAntigos();
                await page.goto(SITE_URL, { waitUntil: 'networkidle2' });
                await page.waitForSelector('#form-nova-solicitacao\\:avisosDialog > div.ui-dialog-content.ui-widget-content > center > button');
                await page.click('#form-nova-solicitacao\\:avisosDialog > div.ui-dialog-content.ui-widget-content > center > button', { delay: 2000 });
                await page.waitForSelector('#form-nova-solicitacao\\:escolha-solicitacao-pessoa-fisica');                
                await page.click('#form-nova-solicitacao\\:escolha-solicitacao-pessoa-fisica', { delay: 2000 });
                await page.waitForSelector('#form-nova-solicitacao\\:insercaoInstancia_label');
                await page.click('#form-nova-solicitacao\\:insercaoInstancia_label', { delay: 2000 });
                await page.keyboard.press('ArrowDown', {delay:2000});        
                await page.keyboard.press('Enter', { delay: 3000 });
                await page.keyboard.press('Tab', {delay:3000});
                await page.keyboard.press('ArrowDown', {delay:3000});        
                await page.keyboard.press('ArrowDown', {delay:3000});        
                await page.keyboard.press('Tab', {delay:3000});
                await page.keyboard.press('ArrowDown', {delay:5000});        
                await page.waitForSelector('#form-nova-solicitacao\\:avisosDialog > div.ui-dialog-content.ui-widget-content > b > center > button');                
                await page.click('#form-nova-solicitacao\\:avisosDialog > div.ui-dialog-content.ui-widget-content > b > center > button', { delay: 2000 });
                await page.waitForTimeout(3000);
                await page.click('#form-nova-solicitacao\\:insercaoComarca > div.ui-selectonemenu-trigger.ui-state-default.ui-corner-right > span', { delay: 3000 });
                await page.keyboard.type(COMARCA,{delay:150});
                await page.keyboard.press('Enter', { delay: 3000 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(NOME, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(NOMEMAE, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(NOMEPAI, { delay: 150 });
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.type(NASCIMENTO,{delay:300});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.press('ArrowDown', {delay:1000});
                await page.keyboard.press('ArrowDown', {delay:1000});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.type(CPF, { delay: 150 });
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.type(EMAIL,{delay:150});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.type(EMAIL,{delay:150});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.press('Space', {delay:1000});
                await page.waitForTimeout(5000);
                let telaCaptcha = await page.evaluate(async ()=>{        
                        
                    return document.querySelector("body > div:nth-child(17)").style.visibility;                    
                })
                console.log(telaCaptcha);
    
                if(telaCaptcha == 'visible') {        
                    console.log("TJCE: Processo interrompido pelo Captcha. Tentando solucionar...");            
                    let quebrarCaptcha = await page.solveRecaptchas();
                    console.log(quebrarCaptcha);
                    await page.click('#form-nova-solicitacao\\:btnConfirmarInclusao > span', { delay: 1000 });                           
                }else{
                    await page.click('#form-nova-solicitacao\\:btnConfirmarInclusao > span', { delay: 2000 });            
                }
                await page.waitForSelector('#btnConfirmarInclusao > span');        
                await page.click('#btnConfirmarInclusao > span', { delay: 2000 });
                await page.waitForSelector('#mensagem-certidao-online > div:nth-child(4) > div');        
                let gerada = await page.$eval('#mensagem-certidao-online > div:nth-child(4) > div', el => el.textContent);
                let certGerada = gerada.trim();                
                console.log(certGerada);
                if(certGerada == 'Certidão Gerada'){
                    browser.close();                
                    resultado.push({ cpf: `/pesquisa/enviada/${EMAIL}`, orgao: 'tjce', documento: `Certidão, AÇÕES E EXECUÇÕES CRIMINAIS` });
                    return resultado;
                }
                
            }                        

        }
    
    } catch (error) {        
        console.log("TJCE " + error);
        browser.close();
        return { erro: error, result: resultado };
    }
}