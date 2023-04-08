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

exports.tjma = async (dados) => {    

    console.log("TJMA Processando...");
    const SITE_URL = "https://jurisconsult.tjma.jus.br/#/certidao-generate-state-certificate-form";
    const TIPOS = dados.documento;
    const CPF = dados.cpf;
    const NOME = dados.nome;
    const NOMEMAE = dados.nomeMae;        
    const NOMEPAI = dados.nomePai;

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
        let nPedido;
        let diretorio;
        for (const tipo of TIPOS) {
            if (tipo == 'criminal' || tipo == 'civel') {

                await util.limparArquivosAntigos();
                nPedido = await page.evaluate(async () => {
                    let elemento = document.querySelector("body > ion-app > ng-component > ion-split-pane > ion-nav > page-certidao-state-certificate-sheet > ion-content > div.scroll-content > ion-card > ion-card-content > ion-grid.borderOnTop.grid > ion-row:nth-child(3) > ion-col:nth-child(2)");
                    if (elemento) {
                        return elemento.textContent
                    }
                    return;
                })
                //console.log(nPedido);
                for (let index = 0; index < 5; index++) {
                    //console.log(nPedido);                    
                    if (nPedido) {
                        continue;
                    } else {
                        await page.goto(SITE_URL, { waitUntil: 'networkidle2' });
                        await page.waitForSelector('body > ion-app > ng-component > ion-split-pane > ion-nav > page-certidao-generate-state-certificate-form > header-page > ion-header > ion-toolbar > button');
                        await page.focus('body > ion-app > ng-component > ion-split-pane > ion-nav > page-certidao-generate-state-certificate-form > header-page > ion-header > ion-toolbar > button', { delay: 2000 });
                        await page.keyboard.press('Tab', { delay: 2000 });
                        await page.keyboard.press('Tab', { delay: 2000 });
                        await page.keyboard.press('Tab', { delay: 2000 });
                        await page.keyboard.press('Tab', { delay: 2000 });
                        await page.keyboard.press('Tab', { delay: 2000 });
                        await page.keyboard.type(CPF, { delay: 150 });
                        await page.keyboard.press('Tab', { delay: 2000 });
                        await page.keyboard.type(NOME, { delay: 150 });
                        await page.keyboard.press('Tab', { delay: 2000 });
                        await page.keyboard.type(NOMEMAE, { delay: 150 });
                        await page.keyboard.press('Tab', { delay: 2000 });
                        await page.keyboard.type(NOMEPAI, { delay: 150 });
                        await page.keyboard.press('Tab', { delay: 2000 });
                        await page.keyboard.press('Tab', { delay: 2000 });
                        //Criação de diretório para armazenar arquivos da pesquisa
                        diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                            return dir;
                        });
                        let imagem;
                        if (process.env.SO == 'linux'){
                            imagem = await page.screenshot({ path: `${diretorio}${process.env.BARRA}captcha.png`, clip: { x: 290, y: 280, width: 170, height: 70 }, encoding: 'base64'});
                        } else {
                            imagem = await page.screenshot({ path: `${diretorio}${process.env.BARRA}captcha.png`, clip: { x: 300, y: 420, width: 170, height: 70 }, encoding: 'base64'});                        
                            //screenshot modo headless
                            //let imagem = await page.screenshot({ path: `${diretorio}${process.env.BARRA}captcha.png`, clip:{x:380, y:600, width:240, height:65}, encoding: 'base64'});
                        }                        
                        let texto_captcha = await util.resolve_captcha_normal(imagem);
                        await page.keyboard.type(texto_captcha, { delay: 150 });
                        await page.click('body > ion-app > ng-component > ion-split-pane > ion-nav > page-certidao-generate-state-certificate-form > ion-content > div.scroll-content > form > ion-list > div > button', { delay: 2000 });
                        await page.waitForTimeout(30000);
                        nPedido = await page.evaluate(async () => {
                            let elemento = document.querySelector("body > ion-app > ng-component > ion-split-pane > ion-nav > page-certidao-state-certificate-sheet > ion-content > div.scroll-content > ion-card > ion-card-content > ion-grid.borderOnTop.grid > ion-row:nth-child(3) > ion-col:nth-child(2)");
                            if (elemento) {
                                return elemento.textContent
                            }
                            return;
                        })
                        if (!nPedido) {
                            console.log("TJMA: Processo interrompido pelo Captcha. Tentando solucionar...");            
                            let quebrarCaptcha = await page.solveRecaptchas();
                            console.log(quebrarCaptcha);
                            await page.click('body > ion-app > ng-component > ion-split-pane > ion-nav > page-certidao-generate-state-certificate-form > ion-content > div.scroll-content > form > ion-list > div > button', { delay: 2000 });
                            await page.waitForTimeout(30000);
                            nPedido = await page.evaluate(async () => {
                                let elemento = document.querySelector("body > ion-app > ng-component > ion-split-pane > ion-nav > page-certidao-state-certificate-sheet > ion-content > div.scroll-content > ion-card > ion-card-content > ion-grid.borderOnTop.grid > ion-row:nth-child(3) > ion-col:nth-child(2)");
                                if (elemento) {
                                    return elemento.textContent
                                }
                                return;
                            })
                        }
                    }

                }

            }
            console.log(nPedido);
            await page.pdf({ path: `${diretorio}${process.env.BARRA}${CPF}tjma.pdf` });
            let pasta = diretorio.split(`files${process.env.BARRA}`);
            console.log("Arquivo TJMA, PDF gerado com sucesso.");
            resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tjma', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS 1° GRAU' });
        }

    } catch (error) {
        console.log("TJMA " + error);
        browser.close();
        return { erro: error, result: resultado };
}
    browser.close();
    return resultado;
}