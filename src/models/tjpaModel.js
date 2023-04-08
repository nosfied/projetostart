const puppeteer = require('puppeteer-extra');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const paths = require('../paths/paths');
const util = require('../util/util');

//Plugin para deixar o puppeteer 90% indetectável
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const { copyFile } = require('node:fs/promises');
const { unlink } = require('node:fs/promises');
const { mkdir } = require('node:fs/promises');
const { readdir } = require('node:fs/promises');
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

exports.tjpa = async (dados) => {    

    console.log("TJPA Processando...");
    const SITE_URL = "https://consultas.tjpa.jus.br/certidao/pages/pesquisaGeralCentralCertidao.action";
    const TIPOS = dados.documento;
    const CPF = dados.cpf;
    const NOME = dados.nome;
    const SEXO = dados.sexo;
    const NOMEMAE = dados.nomeMae;        
    const ENDERECO = dados.endereco;        

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
            if (tipo == 'criminal' || tipo == 'civel') {
                
                await util.limparArquivosAntigos();
                await page.goto(SITE_URL, { waitUntil: 'networkidle2' });
                await page.click('#formCertidao > div:nth-child(2) > input', { delay: 3000 });
                await page.keyboard.type(NOME, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(NOMEMAE,{delay:150});
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(ENDERECO,{delay:150});
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(CPF, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                let diretorio;
                let imagem;
                let texto_captcha;
                //Criação de diretório para armazenar arquivos da pesquisa
                diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                    return dir;
                });
                await page.click('#formCertidao > div.tj-form-buttons > div > div > div > a > i', { delay: 3000 });
                await page.waitForTimeout(2000);
                imagem = await page.screenshot({ path: `${diretorio}${process.env.BARRA}captcha.png`, clip: { x: 220, y: 470, width: 170, height: 70 }, encoding: 'base64' });
                //screenshot modo headless
                //let imagem = await page.screenshot({ path: `${diretorio}${process.env.BARRA}captcha.png`, clip:{x:380, y:600, width:240, height:65}, encoding: 'base64'});
                texto_captcha = await util.resolve_captcha_normal(imagem);
                await page.click('#formCertidao > div.tj-form-buttons > div > div > div > input', { delay: 3000 });
                await page.keyboard.type(texto_captcha, { delay: 150 });
                await page.click('#formCertidao > div.tj-form-buttons > input.tj-btn-default', { delay: 3000 });
                await page.waitForTimeout(9000);
                diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                    return dir;
                });
                await copyFile(`${paths.dirDownloadPadrao()}${process.env.BARRA}certidaoAntecedentesCriminais.pdf`, `${diretorio}${process.env.BARRA}${CPF}tjpa.pdf`);
                let pasta = diretorio.split(`files${process.env.BARRA}`);
                console.log("Arquivo TJPA, PDF gerado com sucesso.");
                browser.close();
                await unlink(`${paths.dirDownloadPadrao()}${process.env.BARRA}certidaoAntecedentesCriminais.pdf`);
                resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tjpa', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS 1° GRAU' });
            
            }
            
        }

    } catch (error) {
        console.log("TJPA " + error);
        browser.close();
        return { erro: error, result: resultado };
}
    browser.close();
    return resultado;
}