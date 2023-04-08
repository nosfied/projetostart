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

exports.tjes = async (dados) => {    

    console.log("TJES Processando...");
    const SITE_URL = "https://sistemas.tjes.jus.br/certidaonegativa/sistemas/certidao/CERTIDAOPESQUISA.cfm";
    const TIPOS = dados.documento;
    const CPF = dados.cpf;
    const RG = dados.rg;
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
                await page.waitForSelector('#cbInstancia');
                await page.click('#cbInstancia', { delay: 2000 });
                await page.keyboard.press('ArrowDown', { delay: 1000 });
                await page.keyboard.press('Enter', { delay: 1000 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.press('ArrowDown', { delay: 1000 });
                await page.keyboard.press('ArrowDown', { delay: 1000 });
                await page.keyboard.press('ArrowDown', { delay: 1000 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(CPF, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(NOME, { delay: 150 });
                await page.click('#btnSolicitar', { delay: 2000 });
                await page.waitForSelector('#formTeste > fieldset:nth-child(2) > table > tbody > tr:nth-child(5) > td.coluna2 > b > i');
                let gerada = await page.$eval('#formTeste > fieldset:nth-child(2) > table > tbody > tr:nth-child(5) > td.coluna2 > b > i', el => el.textContent);
                let certGerada = gerada.trim();                
                console.log(certGerada);
                if (certGerada) {
                    diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                        return dir;
                    });
                    await page.waitForTimeout(3000);
                    await page.pdf({ path: `${diretorio}${process.env.BARRA}${CPF}tjES.pdf` });
                    let pasta = diretorio.split(`files${process.env.BARRA}`);
                    console.log("Arquivo TJES, PDF gerado com sucesso.");
                    browser.close();
                    resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tjES', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS' });
                    return resultado;
                }                              

            }                        

        }                           

    
    } catch (error) {        
        console.log("TJES " + error);
        browser.close();
        return { erro: error, result: resultado };
    }
    browser.close();
    return resultado;
}