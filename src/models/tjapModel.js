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

exports.tjap = async (dados) => {    

    console.log("TJAP Processando...");
    const SITE_URL = "http://tucujuris.tjap.jus.br/tucujuris/pages/certidao-publica/certidao-publica.html";
    const TIPOS = dados.documento;
    const CPF = dados.cpf;
    const RG = dados.rg;
    const NOME = dados.nome;
    const NOMEMAE = dados.nomeMae;        
    const NOMEPAI = dados.nomePai;
    const UFRG = dados.ufRg;
    const SEXO = dados.sexo;
    const NASCIMENTO = dados.nascimento[8]+dados.nascimento[9]+dados.nascimento[5]+dados.nascimento[6]+dados.nascimento[0]+dados.nascimento[1]+dados.nascimento[2]+dados.nascimento[3];

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
                await page.waitForSelector('#main-content > div > section > form > div:nth-child(1) > div:nth-child(4) > div > input');
                await page.click('#main-content > div > section > form > div:nth-child(1) > div:nth-child(4) > div > input', { delay: 2000 });
                await page.keyboard.type(NOME, { delay: 150 });
                await page.waitForTimeout(2000);
                if(SEXO == 'masculino'){
                    await page.keyboard.press('Tab', {delay:1000});
                    await page.keyboard.press('Space', {delay:1000});
                    //await page.keyboard.press('Tab', {delay:1000});
                }else{
                    await page.keyboard.press('Tab', {delay:1000});
                    await page.keyboard.press('ArrowRight', {delay:1000});
                    //await page.keyboard.press('Tab', {delay:1000});
                }
                await page.keyboard.press('Tab', {delay:4000});
                if (process.env.SO == 'linux'){
                    const NASC = dados.nascimento[5]+dados.nascimento[6]+dados.nascimento[8]+dados.nascimento[9]+dados.nascimento[0]+dados.nascimento[1]+dados.nascimento[2]+dados.nascimento[3];
                    await page.keyboard.type(NASC,{delay:200});
                } else {
                    await page.keyboard.type(NASCIMENTO,{delay:200});
                }
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(NOMEMAE, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(NOMEPAI, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(CPF, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(RG, { delay: 150 });
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.type(UFRG,{delay:150});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.type(`${CPF}@gmail.com`,{delay:150});
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.press('Enter', { delay: 2000 });
                await page.waitForTimeout(5000);
                let telaCaptcha = await page.evaluate(async ()=>{        
                        
                    return document.querySelector("body > div:nth-child(12)").style.visibility;                    
                })
                console.log(telaCaptcha);    
                if(telaCaptcha == 'visible') {        
                    console.log("TJAP: Processo interrompido pelo Captcha. Tentando solucionar...");            
                    let quebrarCaptcha = await page.solveRecaptchas();
                    console.log(quebrarCaptcha);
                    await page.click('#main-content > div > section > form > div.row.espaco-abaixo-2x > div > input', { delay: 2000 });
                }                
                await page.waitForTimeout(9000);
                let nCertidao = await page.$eval('#main-content > div > section > div:nth-child(3) > div.row > div:nth-child(1) > h3 > span > span', el => el.textContent);                
                await page.click('#main-content > div > section > div:nth-child(3) > div.tela-download > div > div > a', { delay: 2000 });
                await page.waitForTimeout(9000);
                console.log(nCertidao);
                //Criação de diretório para armazenar arquivos da pesquisa
                let diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                    return dir;
                });
                await copyFile(`${paths.dirDownloadPadrao()}${process.env.BARRA}certidao-${nCertidao}.pdf`, `${diretorio}${process.env.BARRA}${CPF}tjap.pdf`);
                let pasta = diretorio.split(`files${process.env.BARRA}`);
                console.log("Arquivo TJAP, PDF gerado com sucesso.");
                browser.close();
                await unlink(`${paths.dirDownloadPadrao()}${process.env.BARRA}certidao-${nCertidao}.pdf`);
                resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tjap', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS' });
                return resultado;
            }                        

        }                           

    
    } catch (error) {        
        console.log("TJAP " + error);
        browser.close();
        return { erro: error, result: resultado };
    }
}