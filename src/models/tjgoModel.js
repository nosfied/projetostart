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

exports.tjgo = async (dados) => {    

    console.log("TJGO Processando...");
    const SITE_URL_1GRAU_CRIMINAL = "https://projudi.tjgo.jus.br/CertidaoNegativaPositivaPublica?PaginaAtual=1&TipoArea=2&InteressePessoal=S";
    const SITE_URL_1GRAU_CIVEL = "https://projudi.tjgo.jus.br/CertidaoNegativaPositivaPublica?PaginaAtual=1&TipoArea=1&InteressePessoal=&Territorio=&Finalidade=";
    const TIPOS = dados.documento;
    const CPF = dados.cpf;
    const NOME = dados.nome;
    const NOMEMAE = dados.nomeMae;        
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
                await page.goto(SITE_URL_1GRAU_CRIMINAL, { waitUntil: 'networkidle2' });
                await page.waitForSelector('#Nome');
                await page.click('#Nome', { delay: 2000 });
                await page.keyboard.type(NOME, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(CPF, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(NOMEMAE,{delay:150});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.type(NASCIMENTO,{delay:150});
                await page.click('#divBotoesCentralizados > input[type=submit]:nth-child(1)', { delay: 2000 });
                await page.waitForTimeout(4000);
                let certidao = await page.evaluate(() =>{
                    let cert = document.querySelector("body").innerHTML;
                    return cert.length;
                })
                console.log(certidao);
                if(certidao < 300){
                    await page.waitForTimeout(3000);
                    await page.keyboard.press('Tab', { delay: 1000 });
                    await page.keyboard.press('Enter', { delay: 2000 });
                    await page.keyboard.press('Tab', { delay: 1000 });
                    await page.keyboard.press('Tab', { delay: 1000 });
                    await page.keyboard.press('Tab', { delay: 1000 });
                    await page.keyboard.press('Enter', { delay: 2000 });
                    await page.keyboard.press('Enter', { delay: 2000 });
                    await page.waitForTimeout(6000);
                    diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                        return dir;
                    });
                    await page.pdf({ path: `${diretorio}${process.env.BARRA}${CPF}tjgo.pdf` });
                    let pasta = diretorio.split(`files${process.env.BARRA}`);
                    console.log("Arquivo TJGO, PDF gerado com sucesso.");
                    browser.close();
                    resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tjgo', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS' });
                    return resultado;
                }else{
                    console.log("Não foi possível atender o pedido para TJGO - Certidão Criminal 1° Grau. Tente novamente em alguns instantes.");
                    browser.close();                    
                    return { erro: "Não foi possível atender o pedido para TJGO - Certidão Criminal 1° Grau. Tente novamente em alguns instantes.", result: resultado };

                }                             

            }                        

        }                           

    
    } catch (error) {        
        console.log("TJGO " + error);
        browser.close();
        return { erro: error, result: resultado };
    }
    browser.close();
    return resultado;
}