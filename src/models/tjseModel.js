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

exports.tjse = async (dados) => {    

    console.log("TJSE Processando...");
    const SITE_URL = "https://www.tjse.jus.br/portal/servicos/judiciais/certidao-online/solicitacao-de-certidao-negativa";
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
        let nPedido;
        let diretorio;
        for (const tipo of TIPOS) {
            if (tipo == 'criminal' || tipo == 'civel') {

                await util.limparArquivosAntigos();
                nPedido = await page.evaluate(async () => {
                    let elemento = document.querySelector("#blockrandom");
                    if (elemento) {
                        return elemento
                    }
                    return;
                })
                for (let index = 0; index < 10; index++) {
                    if (nPedido) {
                        continue;
                    } else {
                        await page.goto(SITE_URL, { waitUntil: 'networkidle2' });
                        await page.waitForTimeout(2000);
                        await page.click('body > div.cc-window.cc-banner.cc-type-info.cc-theme-block.cc-bottom.cc-color-override-184807090 > div > a', { delay: 2000 });
                        await page.waitForTimeout(2000);
                        await page.click('body > main > principal > content > div > div > h1', { delay: 2000 });
                        await page.keyboard.press('Tab', { delay: 2000 });
                        await page.keyboard.type('Outros Estados', { delay: 150 });
                        await page.keyboard.press('Tab', { delay: 2000 });
                        await page.keyboard.press('Tab', { delay: 2000 });
                        await page.waitForTimeout(2000);
                        await page.keyboard.type('Penal', { delay: 150 });
                        await page.keyboard.press('Tab', { delay: 2000 });
                        await page.waitForTimeout(2000);
                        await page.keyboard.type(NOME, { delay: 150 });
                        await page.keyboard.press('Tab', { delay: 2000 });
                        await page.waitForTimeout(2000);
                        await page.keyboard.type(CPF, { delay: 150 });
                        await page.keyboard.press('Tab', { delay: 2000 });
                        await page.keyboard.press('Tab', { delay: 2000 });
                        await page.keyboard.press('Tab', { delay: 2000 });                     
                        //Criação de diretório para armazenar arquivos da pesquisa
                        diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                            return dir;
                        });
                        let imagem;
                        if (process.env.SO == 'linux'){
                            imagem = await page.screenshot({ path: `${diretorio}${process.env.BARRA}captcha.png`, clip: { x: 665, y: 650, width: 170, height: 70 }, encoding: 'base64'});                            
                        } else {
                            imagem = await page.screenshot({ path: `${diretorio}${process.env.BARRA}captcha.png`, clip: { x: 765, y: 650, width: 170, height: 70 }, encoding: 'base64'});                        
                            //screenshot modo headless
                            //let imagem = await page.screenshot({ path: `${diretorio}${process.env.BARRA}captcha.png`, clip:{x:380, y:600, width:240, height:65}, encoding: 'base64'});
                        }
                        let texto_captcha = await util.resolve_captcha_normal(imagem);
                        await page.keyboard.type(texto_captcha, { delay: 150 });
                        await page.keyboard.press('Enter', { delay: 2000 });
                        await page.waitForTimeout(30000);
                        nPedido = await page.evaluate(async () => {
                            let elemento = document.querySelector("#blockrandom");
                            if (elemento) {
                                return elemento
                            }
                            return;
                        })
                    }

                }

            }
            console.log(nPedido);
            await page.waitForTimeout(3000);
            if (process.env.SO == 'linux'){
                await page.screenshot({ path: `${diretorio}${process.env.BARRA}${CPF}tjse.png`, clip: { x: 225, y: 350, width: 700, height: 800 } });                            
            } else {
                await page.screenshot({ path: `${diretorio}${process.env.BARRA}${CPF}tjse.png`, clip: { x: 325, y: 350, width: 700, height: 800 } });
            }
            let pasta = diretorio.split(`files${process.env.BARRA}`);
            console.log("Arquivo TJSE, PDF gerado com sucesso.");
            resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tjse', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS 1° GRAU' });
        }

    } catch (error) {
        console.log("TJSE " + error);
        browser.close();
        return { erro: error, result: resultado };
}
    browser.close();
    return resultado;
}