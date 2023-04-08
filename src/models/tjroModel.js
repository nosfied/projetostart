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

exports.tjro = async (dados) => {    

    console.log("TJRO Processando...");
    const SITE_URL = "https://www.tjro.jus.br/certidao-unificada/certidaoPublicaEmitir";
    const TIPOS = dados.documento;
    const CPF = dados.cpf;


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
                await page.waitForSelector('#cpf1');
                await page.click('#cpf1', { delay: 2000 });
                await page.keyboard.type(CPF, { delay: 150 });
                await page.click('body > div > app-root > div > div > div > app-certidao-publica-emitir-form > form > div > div.card-body > div:nth-child(2) > div.form-group.align-self-end > button', { delay: 2000 });
                await page.waitForTimeout(5000);
                let valorNome = await page.$eval('#nome', el => el.value);
                await page.click('body > div > app-root > div > div > div > app-certidao-publica-emitir-form > form > div > div.card-body > div:nth-child(4) > div > select', { delay: 2000 });
                await page.keyboard.press('ArrowDown', {delay:1000});        
                await page.keyboard.press('ArrowDown', {delay:1000});        
                await page.keyboard.press('ArrowDown', {delay:1000});        
                await page.keyboard.press('ArrowDown', {delay:1000});        
                await page.keyboard.press('Enter', {delay:1000});
                await page.click('#emitir', { delay: 2000 });
                await page.waitForTimeout(22000);
                let valorNome2 = await page.$eval('#nome', el => el.value);
                if (valorNome2 == '') {
                    //Criação de diretório para armazenar arquivos da pesquisa
                    let diretorio = await mkdir(paths.files()+`${process.env.BARRA}`+Date.now(), {recursive:true}, (err, dir)=>{
                        return dir;
                    });
                    await copyFile(`${paths.dirDownloadPadrao()}${process.env.BARRA}CERTIDAO_${valorNome}.pdf`, `${diretorio}${process.env.BARRA}${CPF}tjro.pdf`);
                    let pasta = diretorio.split(`files${process.env.BARRA}`);
                    console.log("Arquivo TJRO, PDF gerado com sucesso.");
                    browser.close();
                    await unlink(`${paths.dirDownloadPadrao()}${process.env.BARRA}CERTIDAO_${valorNome}.pdf`);
                    resultado.push({diretorio: pasta[1], cpf: CPF, orgao: 'tjro', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS'});
                    return resultado;
                } else {
                    console.log("Não foi possível atender o pedido para TJRO - Certidão Criminal 1° Grau. Tente novamente em alguns instantes.");
                    browser.close();                    
                    return { erro: "Não foi possível atender o pedido para TJRO - Certidão Criminal 1° Grau. Tente novamente em alguns instantes.", result: resultado };
                }                                              

            }                        

        }                           

    
    } catch (error) {        
        console.log("TJRO " + error);
        browser.close();
        return { erro: error, result: resultado };
    }
    browser.close();
    return resultado;
}