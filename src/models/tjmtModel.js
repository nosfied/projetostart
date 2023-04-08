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

exports.tjmt = async (dados) => {    

    console.log("TJMT Processando...");
    const SITE_URL = "https://sec.tjmt.jus.br/primeiro-grau/certidao-negativa-pessoa-fisica";
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
        await util.limparArquivosAntigos();        
        await page.goto(SITE_URL, {waitUntil: 'networkidle2'});        
        await page.click('#documentoRequerido', { delay: 2000 });
        await page.keyboard.type(CPF,{delay:150});
        await page.waitForTimeout(20000);
        let campoNome = await page.$eval('#nomeRequerido', el => el.value);
        console.log(campoNome);
        if (campoNome == '') browser.close();
        await page.click('#root > div > div > div.content-page > div > div:nth-child(2) > div.ant-card.ant-card-bordered.ant-card-wider-padding.ant-card-padding-transition > div > div:nth-child(4) > form > div:nth-child(1) > div > div.ant-col-sm-24 > div > div:nth-child(2) > div > div > div > div > span', { delay: 2000 });
        await page.waitForSelector('body > div:nth-child(7) > div > div > div > ul > li:nth-child(1) > span.ant-select-tree-checkbox > span');        
        await page.click('body > div:nth-child(7) > div > div > div > ul > li:nth-child(1) > span.ant-select-tree-checkbox > span', { delay: 2000 });
        await page.click('#root > div > div > div.content-page > div > div:nth-child(2) > div.ant-card.ant-card-bordered.ant-card-wider-padding.ant-card-padding-transition > div > div:nth-child(4) > form > div:nth-child(1) > div > div.ant-col-sm-24 > div > div:nth-child(4) > div > div > div > div > span > span', { delay: 2000 });
        await page.waitForSelector('body > div:nth-child(8) > div > div > div > ul > li > span.ant-select-tree-checkbox > span');        
        await page.click('body > div:nth-child(8) > div > div > div > ul > li > span.ant-select-tree-checkbox > span', { delay: 2000 });
        await page.click('#root > div > div > div.content-page > div > div:nth-child(2) > div.ant-card.ant-card-bordered.ant-card-wider-padding.ant-card-padding-transition > div > div:nth-child(4) > form > div.row > div > div > div > div > button.btn.btn-success.pull-right', { delay: 4000 });
        await page.waitForTimeout(30000);
       
        let paginas = await browser.pages();
        
        await paginas[2].waitForTimeout(3000);
        await paginas[2].keyboard.press('Tab', { delay: 1000 });
        await paginas[2].keyboard.press('Enter', { delay: 2000 });
        await paginas[2].keyboard.press('Tab', { delay: 1000 });
        await paginas[2].keyboard.press('Tab', { delay: 1000 });
        await paginas[2].keyboard.press('Enter', { delay: 2000 });
        await paginas[2].keyboard.press('Enter', { delay: 2000 });
        await paginas[2].waitForTimeout(3000);
    
        let diretorio = await mkdir(paths.files()+`${process.env.BARRA}`+Date.now(), {recursive:true}, (err, dir)=>{
            return dir;
        });
        await paginas[2].pdf({ path: `${diretorio}${process.env.BARRA}${CPF}tjmt.pdf`, height: 1100 });
        let pasta = diretorio.split(`files${process.env.BARRA}`);                    
        console.log("Arquivo TJMT, PDF gerado com sucesso.");
        browser.close();
        resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tjmt', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS' });
         
    
    } catch (error) {        
        console.log("TJMT " + error);
        browser.close();
        return { erro: error, result: resultado };
    }
    browser.close();
    return resultado;
}