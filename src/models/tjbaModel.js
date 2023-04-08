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

exports.tjba = async (dados) => {    

    console.log("TJBA Processando...");
    const SITE_URL = "http://www5.tjba.jus.br/portal/certidoes-do-primeiro-grau/";
    const TIPOS = dados.documento;
    const CPF = dados.cpf;
    const RG = dados.rg;
    const ORGAOEXP = dados.orgaoExp;
    const NOME = dados.nome;
    const NOMEMAE = dados.nomeMae;        
    const NOMEPAI = dados.nomePai;
    const ENDERECO = dados.endereco;
    const ESTCIVIL = dados.estadoCivil;
    const NATURALIDADE = dados.naturalidade;
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
        await page.click('#cookie_action_close_header', { delay: 2000 });
        await page.waitForTimeout(2000);
        await page.click('body > section.grid.grid-pad > div > div.interna-sessoes-contatos.col-1-1 > p:nth-child(15) > a', { delay: 2000 });
        await page.waitForSelector('#selectModelo');
        await page.click('#selectModelo', { delay: 2000 });
        await page.keyboard.press('ArrowDown', {delay:1000});        
        await page.keyboard.press('ArrowDown', {delay:1000});
        await page.keyboard.press('Enter', {delay:1000});
        await page.click('body > main > div > div > div:nth-child(1) > div > div > div:nth-child(5) > div > div > input', { delay: 2000 });
        await page.waitForTimeout(2000);
        await page.click('#nome', { delay: 2000 });
        await page.keyboard.type(NOME,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});            
        await page.keyboard.type(NATURALIDADE,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});        
        await page.keyboard.type(ESTCIVIL,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.type(CPF,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.type(RG,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.type(ORGAOEXP,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.type(ENDERECO,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.type(NOMEMAE,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});        
        await page.keyboard.type(NOMEPAI,{delay:150});
        await page.click('body > main > div > div > div > div:nth-child(6) > div > input:nth-child(2)', { delay: 2000 });
        await page.waitForTimeout(10000);
        let certidao = await page.$eval('body > main > div.container > p:nth-child(4) > span:nth-child(2)', bt => bt.textContent);        
        if(certidao){
            let diretorio = await mkdir(paths.files()+`${process.env.BARRA}`+Date.now(), {recursive:true}, (err, dir)=>{
                return dir;
            });
            await page.pdf({ path: `${diretorio}${process.env.BARRA}${CPF}tjba.pdf`, format: 'A4' });
            let pasta = diretorio.split(`files${process.env.BARRA}`);
            console.log("Arquivo TJBA, PDF gerado com sucesso.");
            browser.close();
            resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tjba', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS' });
            return resultado;
        }                            

    
    } catch (error) {        
        console.log("TJBA " + error);
        browser.close();
        return { erro: error, result: resultado };
    }
    browser.close();
    return resultado;
}