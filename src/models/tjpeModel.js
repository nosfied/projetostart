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

exports.tjpe = async (dados) => {    

    console.log("TJPE Processando...");
    const SITE_URL = "https://www.tjpe.jus.br/antecedentescriminaiscliente/xhtml/manterPessoa/tipoPessoa.xhtml";
    const TIPOS = dados.documento;
    const CPF = dados.cpf;
    const RG = dados.rg;
    const NASCIMENTO = dados.nascimento[8]+dados.nascimento[9]+dados.nascimento[5]+dados.nascimento[6]+dados.nascimento[0]+dados.nascimento[1]+dados.nascimento[2]+dados.nascimento[3];
    const NOME = dados.nome;
    const NOMEMAE = dados.nomeMae;        
    const NOMEPAI = dados.nomePai;
    const ESTCIVIL = dados.estadoCivil;
    const UFRG = dados.ufRg;

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
                await page.click('#certidaoTipoForm\\:tipopessoa\\:1', { delay: 2000 });
                await page.click('#certidaoTipoForm\\:prosseguir', { delay: 2000 });
                await page.waitForSelector('#frmPessoa\\:nome');
                await page.click('#frmPessoa\\:nome', { delay: 2000 });
                await page.keyboard.type(NOME, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(CPF, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(RG, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type('SSP', { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(UFRG, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(NASCIMENTO, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(NASCIMENTO, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type('Brasileira', { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(ESTCIVIL, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type('SPO, Quadra 3', { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type('Lote 5', { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type('Setor Policial Sul', { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type('DF');
                await page.waitForTimeout(3000);
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(NOMEMAE, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                //Criação de diretório para armazenar arquivos da pesquisa
                let diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                    return dir;
                });
                let imagem = await page.screenshot({ path: `${diretorio}${process.env.BARRA}captcha.png`, clip: { x: 70, y: 620, width: 170, height: 70 }, encoding: 'base64' });
                //screenshot modo headless
                //let imagem = await page.screenshot({ path: `${diretorio}${process.env.BARRA}captcha.png`, clip:{x:380, y:600, width:240, height:65}, encoding: 'base64'});
                let texto_captcha = await util.resolve_captcha_normal(imagem);
                await page.keyboard.type(texto_captcha, { delay: 150 });
                await page.click('#frmPessoa\\:confirmar', { delay: 2000 });
                await page.waitForSelector('#conteudo > div.certidao-texto-padrao > div > table > tbody > tr:nth-child(2) > td:nth-child(1) > span.certidao-texto-destaque-15');
                await page.waitForTimeout(3000);               
                await page.pdf({ path: `${diretorio}${process.env.BARRA}${CPF}tjpe.pdf` });
                let pasta = diretorio.split(`files${process.env.BARRA}`);
                console.log("Arquivo TJPE, PDF gerado com sucesso.");
                resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tjpe', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS 1°GRAU' });

            }                        

        }                           

    
    } catch (error) {        
        console.log("TJPE " + error);
        browser.close();
        return { erro: error, result: resultado };
    }
    browser.close();
    return resultado;
}