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

exports.stm = async (dados) => {    

    console.log("STM Processando...");
    const SITE_URL = "https://www.stm.jus.br/servicos-stm/certidao-negativa/emitir-certidao-negativa";
    const TIPOS = dados.documento;
    const CPF = dados.cpf;
    const NASCIMENTO = dados.nascimento[8]+dados.nascimento[9]+dados.nascimento[5]+dados.nascimento[6]+dados.nascimento[0]+dados.nascimento[1]+dados.nascimento[2]+dados.nascimento[3];
    const NOME = dados.nome;
    const NOMEMAE = dados.nomeMae;

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
            if (tipo == 'certidaostm') {

                await util.limparArquivosAntigos();
                await page.goto(SITE_URL, { waitUntil: 'networkidle2' });
                await page.waitForSelector('#c-p-bn');
                await page.click('#c-p-bn', { delay: 3000 });
                await page.waitForTimeout(3000);
                const elementHandle = await page.$(
                    'iframe[src="https://www2.stm.jus.br/ceneg_internet/emitir/index.php"]',
                );
                const frame = await elementHandle.contentFrame();
                await frame.click('body > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(1) > td.menu2 > input[type=text]', { delay: 3000 });
                await page.keyboard.type(NOME, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(CPF, { delay: 150 });
                await page.keyboard.type(dados.nascimento[8]+dados.nascimento[9], { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(dados.nascimento[5]+dados.nascimento[6], { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(dados.nascimento[0]+dados.nascimento[1]+dados.nascimento[2]+dados.nascimento[3], { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(NOMEMAE, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                //Criação de diretório para armazenar arquivos da pesquisa
                let diretorio = await mkdir(paths.files()+`${process.env.BARRA}`+Date.now(), {recursive:true}, (err, dir)=>{
                    return dir;
                });
                let imagem = await page.screenshot({ path: `${diretorio}${process.env.BARRA}captcha.png`, clip:{x:350, y:420, width:270, height:65}, encoding: 'base64'});        
                //screenshot modo headless
                //let imagem = await page.screenshot({ path: `${diretorio}${process.env.BARRA}captcha.png`, clip:{x:380, y:600, width:240, height:65}, encoding: 'base64'});               
                let texto_captcha = await util.resolve_captcha_normal(imagem);
                await page.keyboard.type(texto_captcha,{delay:150});
                await frame.click('body > form > table > tbody > tr:nth-child(2) > td > table > tbody > tr:nth-child(7) > td > input', { delay: 3000 });
                await page.waitForTimeout(15000);               
                await copyFile(`${paths.dirDownloadPadrao()}${process.env.BARRA}Certidao.pdf`, `${diretorio}${process.env.BARRA}${CPF}stm.pdf`);
                let pasta = diretorio.split(`files${process.env.BARRA}`);
                console.log("Arquivo Certidao STM, PDF gerado com sucesso.");
                browser.close();
                await unlink(`${paths.dirDownloadPadrao()}${process.env.BARRA}Certidao.pdf`);
                resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'stm', documento: 'Certidão Superior Tribunal Militar' });
                
            }
            
        }

    } catch (error) {
        console.log("STM " + error);
        browser.close();
        return { erro: error, result: resultado };
}
    browser.close();
    return resultado;
}