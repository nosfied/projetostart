const puppeteer = require('puppeteer-extra');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const paths = require('../paths/paths');
const util = require('../util/util');

//Plugin para deixar o puppeteer 90% indetectável
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const { copyFile } = require('node:fs/promises');
const { unlink } = require('node:fs/promises');
const { mkdir } = require('node:fs/promises');

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

exports.tjrs = async (dados) => {    

    console.log("TJRS Processando...");
    const SITE_URL = "https://www.tjrs.jus.br/proc/alvara/";
    const TIPOS = dados.documento;
    const CPF = dados.cpf;
    const RG = dados.rg;
    const ORGAOEXP = dados.orgaoExp;
    const UFRG = dados.ufRg;
    const NOME = dados.nome;
    const SEXO = dados.sexo;
    const NASCIMENTO = dados.nascimento[8]+dados.nascimento[9]+dados.nascimento[5]+dados.nascimento[6]+dados.nascimento[0]+dados.nascimento[1]+dados.nascimento[2]+dados.nascimento[3];        
    const NOMEMAE = dados.nomeMae;        
    const NOMEPAI = dados.nomePai;
    const ENDERECO = dados.endereco;
    const ESTCIVIL = dados.estadoCivil;
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
        await util.limparArquivosAntigos();        
        await page.goto(SITE_URL, {waitUntil: 'networkidle2'});
        await page.click('#tipoDocumento', { delay: 2000 });
        await page.keyboard.press('ArrowDown', {delay:1000});
        await page.keyboard.press('ArrowDown', {delay:1000});        
        await page.keyboard.press('ArrowDown', {delay:1000});
        await page.keyboard.press('Enter', {delay:1000});                     
        await page.keyboard.press('Tab', {delay:1000});            
        await page.keyboard.type(NOME,{delay:150});
        if(SEXO == 'feminiino'){
            await page.keyboard.press('Tab', {delay:1000});
            await page.keyboard.press('ArrowDown', {delay:1000});        
            await page.keyboard.press('Tab', {delay:1000});
        }else{
            await page.keyboard.press('Tab', {delay:1000});
            await page.keyboard.press('Tab', {delay:1000});
        }            
        await page.keyboard.type(CPF,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.type(NOMEMAE,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});        
        await page.keyboard.type(NOMEPAI,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.type(dados.nascimento[8]+dados.nascimento[9]+'/'+dados.nascimento[5]+dados.nascimento[6]+'/'+dados.nascimento[0]+dados.nascimento[1]+dados.nascimento[2]+dados.nascimento[3],{delay:150});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.press('Tab', {delay:1000});        
        await page.keyboard.type(ESTCIVIL,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.type(RG,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.type(ORGAOEXP,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.type(UFRG,{delay:150});        
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.type(ENDERECO,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.press('Enter', {delay:1000});
        await page.waitForTimeout(2000);
        
            let nPedido = await page.$eval('body > strong', el => el.textContent);
        
            let printPDF = `https://www.tjrs.jus.br/proc/alvara/alvara.php?identificador=${nPedido}&t=2`;        
        
            console.log("Arquivo TJRS 1° GRAU, PDF gerado com sucesso.");
            resultado.push({cpf: printPDF, orgao: 'tjrs', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS 1° GRAU'});
            
    } catch (error) {        
        console.log("TJRS " + error);
        browser.close();
        return { erro: error, result: resultado };
    }
    browser.close();
    return resultado;
}