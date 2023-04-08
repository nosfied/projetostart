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

exports.tjpi = async (dados) => {    

    console.log("TJPI Processando...");
    const SITE_URL = "https://www.tjpi.jus.br/themisconsulta/certidao";
    const TIPOS = dados.documento;
    const CPF = dados.cpf;
    const RG = dados.rg;
    const ORGAOEXP = dados.orgaoExp;
    const NOME = dados.nome;
    const NOMEMAE = dados.nomeMae;        
    const NOMEPAI = dados.nomePai;
    const ESTCIVIL = dados.estadoCivilTjPI;


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
                await page.click('#select-tipo-certidao', { delay: 2000 });
                await page.keyboard.press('ArrowDown', { delay: 1000 });
                await page.keyboard.press('ArrowDown', { delay: 1000 });
                await page.keyboard.press('ArrowDown', { delay: 1000 });
                await page.keyboard.press('Enter', { delay: 1000 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(NOME, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(CPF, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(RG, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(ORGAOEXP, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(ESTCIVIL, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(NOMEPAI, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(NOMEMAE, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type('70610909', { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type('SPO, Quadra 3, Lote 5.', { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type('Setor Policial Sul', { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type('distrito federal');
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('ArrowDown', { delay: 1000 });
                await page.keyboard.press('ArrowDown', { delay: 1000 });
                await page.keyboard.press('ArrowDown', { delay: 1000 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.press('Tab', { delay: 1000 });
                //Criação de diretório para armazenar arquivos da pesquisa
                let diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                    return dir;
                });
                let imagem = await page.screenshot({ path: `${diretorio}${process.env.BARRA}captcha.png`, clip: { x: 200, y: 660, width: 250, height: 150 }, encoding: 'base64' });
                //screenshot modo headless
                //let imagem = await page.screenshot({ path: `${diretorio}${process.env.BARRA}captcha.png`, clip:{x:380, y:600, width:240, height:65}, encoding: 'base64'});                    

                let texto_captcha = await util.resolve_captcha_normal(imagem);
                await page.keyboard.type(texto_captcha, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.press('Enter', { delay: 1000 });                
                await page.waitForTimeout(15000);
                let brasaoCertidao = await page.evaluate(() =>{
                    let brasao = document.querySelector("#img-brasao")
                    return brasao.src;
                })
                console.log(brasaoCertidao);
                if(brasaoCertidao){                    
                    diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                        return dir;
                    });
                    await page.pdf({ path: `${diretorio}${process.env.BARRA}${CPF}tjpi.pdf` });
                    let pasta = diretorio.split(`files${process.env.BARRA}`);
                    console.log("Arquivo TJPI, PDF gerado com sucesso.");
                    browser.close();
                    resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tjpi', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS' });
                    return resultado;
                }else{
                    console.log("Não foi possível atender o pedido para TJPI - Certidão Criminal 1° Grau. Tente novamente em alguns instantes.");
                    browser.close();                    
                    return { erro: "Não foi possível atender o pedido para TJPI - Certidão Criminal 1° Grau. Tente novamente em alguns instantes.", result: resultado };

                }               

            }                        

        }                           

    
    } catch (error) {        
        console.log("TJPI " + error);
        browser.close();
        return { erro: error, result: resultado };
    }
    browser.close();
    return resultado;
}