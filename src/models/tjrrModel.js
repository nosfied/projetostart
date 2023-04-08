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

exports.tjrr = async (dados) => {    

    console.log("TJRR Processando...");
    const SITE_URL = "http://www.tjrr.jus.br/index.php/servicos/certidao-negativa";
    const TIPOS = dados.documento;
    const CPF = dados.cpf;
    const NOME = dados.nome;


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
                await page.waitForSelector('#menu > li:nth-child(3) > a > span');
                await page.click('#menu > li:nth-child(3) > a > span', { delay: 2000 });
                await page.waitForSelector('#tipo-certidao');
                await page.click('#tipo-certidao', { delay: 2000 });
                await page.keyboard.press('ArrowDown', {delay:1000});
                await page.keyboard.press('Enter', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(NOME, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(CPF, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.press('Space', {delay:1000});
                let telaCaptcha = await page.evaluate(async ()=>{        
                        
                    return document.querySelector("body > div:nth-child(13)").style.visibility;                    
                })
                console.log(telaCaptcha);
                if(telaCaptcha == 'visible') {        
                    console.log("TJRR: Processo interrompido pelo Captcha. Tentando solucionar...");            
                    let quebrarCaptcha = await page.solveRecaptchas();
                    console.log(quebrarCaptcha);
                    await page.waitForTimeout(2000);
                    await page.click('#form > div > div > div > a', {delay:2000});
                    await page.focus('#cpf', {delay:1000});
                    await page.keyboard.press('Tab', { delay: 1000 });
                    await page.keyboard.press('Tab', { delay: 1000 });
                    await page.keyboard.press('Tab', { delay: 1000 });
                    await page.keyboard.press('Tab', { delay: 1000 });
                    await page.keyboard.press('Enter', { delay: 1000 });
                    await page.waitForTimeout(15000);                            
                }else{
                    await page.click('#form > div > div > div > a', {delay:2000});
                    await page.waitForTimeout(15000);
                }
                let certidao = await page.evaluate(() =>{
                    let cert = document.querySelector("body").innerHTML;
                    return cert.length;
                })
                console.log(certidao);
                if(certidao < 300){
                    await page.keyboard.press('Tab', { delay: 1000 });
                    await page.keyboard.press('Enter', { delay: 2000 });
                    await page.keyboard.press('Tab', { delay: 1000 });
                    await page.keyboard.press('Tab', { delay: 1000 });
                    await page.keyboard.press('Enter', { delay: 2000 });
                    await page.keyboard.press('Enter', { delay: 2000 });
                    await page.waitForTimeout(3000);
                    diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                        return dir;
                    });
                    await page.pdf({ path: `${diretorio}${process.env.BARRA}${CPF}tjrr.pdf` });
                    let pasta = diretorio.split(`files${process.env.BARRA}`);
                    console.log("Arquivo TJRR, PDF gerado com sucesso.");
                    browser.close();
                    resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tjrr', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS' });
                    return resultado;
                }else{
                    console.log("Não foi possível atender o pedido para TJRR - Certidão Criminal 1° Grau. Tente novamente em alguns instantes.");
                    browser.close();                    
                    return { erro: "Não foi possível atender o pedido para TJRR - Certidão Criminal 1° Grau. Tente novamente em alguns instantes.", result: resultado };

                }                                            

            }                        

        }                           

    
    } catch (error) {        
        console.log("TJRR " + error);
        browser.close();
        return { erro: error, result: resultado };
    }
    browser.close();
    return resultado;
}