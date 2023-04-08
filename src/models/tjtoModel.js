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

exports.tjto = async (dados) => {    

    console.log("TJTO Processando...");
    const SITE_URL = "https://eproc1.tjto.jus.br/eprocV2_prod_1grau/externo_controlador.php?acao=cj_online&acao_origem=&acao_retorno=cj";
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
            if (tipo == 'criminal1' || tipo == 'civel1') {

                await util.limparArquivosAntigos();
                await page.goto(SITE_URL, { waitUntil: 'networkidle2' });
                await page.waitForSelector('#txtCpfCnpj');
                await page.click('#txtCpfCnpj', { delay: 2000 });
                await page.keyboard.type(CPF, { delay: 150 });
                await page.click('#competenciaCriminal', { delay: 2000 });
                await page.click('#sbmNovo', { delay: 2000 });
                await page.waitForSelector('#lblResultado');
                let gerada = await page.$eval('#lblResultado', el => el.textContent);
                let link = gerada.split('número ');
                let nCertidao = link[1].split('.Para');
                console.log(nCertidao[0]);
                let printPDF = `https://eproc1.tjto.jus.br/eprocV2_prod_1grau/externo_controlador.php?acao=visualizar_pdf_certidao_judicial&idCertidao=${nCertidao[0]}`;
                console.log("Arquivo TJTO, PDF gerado com sucesso.");
                browser.close();
                resultado.push({cpf: printPDF, orgao: 'tjto', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS'});
                return resultado;                                              

            }                        

        }                           

    
    } catch (error) {        
        console.log("TJTO " + error);
        browser.close();
        return { erro: error, result: resultado };
    }
    browser.close();
    return resultado;
}