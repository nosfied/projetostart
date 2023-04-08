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

exports.crf = async (dados) => {    

    console.log("CRF Processando...");
    const SITE_URL = "https://solucoes.receita.fazenda.gov.br/Servicos/certidaointernet/PF/Emitir";
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
            if (tipo == 'certidaoRF' || tipo == 'civel') {

                await util.limparArquivosAntigos();
                await page.goto(SITE_URL, { waitUntil: 'networkidle2' });
                await page.click('#NI', { delay: 3000 });
                await page.keyboard.type(CPF, { delay: 150 });
                await page.click('#validar', { delay: 3000 });
                await page.waitForTimeout(15000);               
                // Elemento presente?
                let emitirNovamente = await page.evaluate(() => {
                    const el = document.querySelector("#FrmSelecao > a:nth-child(6)");
                    if (el)
                        return el.tagName;
                    else
                        return false;
                })
                if (emitirNovamente) {
                    await page.click('#FrmSelecao > a:nth-child(6)', { delay: 3000 });
                    await page.waitForTimeout(15000);
                }                
                //Criação de diretório para armazenar arquivos da pesquisa
                let diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                    return dir;
                });
                await copyFile(`${paths.dirDownloadPadrao()}${process.env.BARRA}Certidao-${CPF}.pdf`, `${diretorio}${process.env.BARRA}${CPF}crf.pdf`);
                let pasta = diretorio.split(`files${process.env.BARRA}`);
                console.log("Arquivo CertidaoRF, PDF gerado com sucesso.");
                browser.close();
                await unlink(`${paths.dirDownloadPadrao()}${process.env.BARRA}Certidao-${CPF}.pdf`);
                resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'crf', documento: 'Certidão Negativa de Débitos da Receita Federal' });
                
            }
            
        }

    } catch (error) {
        console.log("CRF " + error);
        browser.close();
        return { erro: error, result: resultado };
}
    browser.close();
    return resultado;
}