const puppeteer = require('puppeteer-extra');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const paths = require('../paths/paths');
const util = require('../util/util');
let request = require('request-promise');


//Plugin para deixar o puppeteer 90% indetectável
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

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

exports.trf1 = async (dados) => {

    console.log("TRF1 Processando...");
    const SITIOCOOKIES = 'https://portal.trf1.jus.br/portaltrf1/pagina-inicial.htm';
    const SITE_URL = "https://sistemas.trf1.jus.br/certidao/#/solicitacao";
    const CAPTCHA_SITE_KEY = "6Le8WeUUAAAAAEQ0sNuNgYdqVmklhQCSEKigDDDT";
    const ACTION = "t";
    const CPF = dados.cpf;
    let resultado = [];        

    const browser = await puppeteer.launch({
        headless: false,
        executablePath: paths.googleChrome(),
        //userDataDir: paths.perfilChrome()
    });
    let cookie = await util.pegarCookies(SITIOCOOKIES);
    const cookies = [{name: 'cookie', value: `${cookie}`, domain: 'https://sistemas.trf1.jus.br/certidao/#/solicitacao'}];
    console.log(cookies);

    const page = await browser.newPage();
    try {
        await util.limparArquivosAntigos();
        //await page.setCookie(...cookies);
        await page.goto(SITE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
        await page.waitForTimeout(5000);
        await page.goto(SITE_URL, { waitUntil: 'networkidle2', timeout: 60000 });
        //selecionar um tipo de certidão -> clique            
        await page.keyboard.press('Tab', { delay: 5000 });
        await page.keyboard.press('Tab', { delay: 1000 });
        await page.keyboard.press('Enter', { delay: 1000 });
        //escolher opção -> criminal            
        await page.click('#mat-option-2 > span', { delay: 2000 });
        //selecionar um órgão -> clique        
        await page.click('#mat-chip-list-input-0', { delay: 2000 });
        //escolher opção -> regionalizada 1 e 2 grau
        await page.click('#mat-option-19 > span', { delay: 2000 });
        //Pressionando a tecla Tab
        await page.keyboard.press('Tab', { delay: 1000 });
        //Clicar no campo CPF
        await page.click('#mat-input-0', { delay: 2000 });
        //Digitar o número do documento
        await page.keyboard.type(CPF, { delay: 200 });
        // Clicar no botão -> "Emitir certidão"               
        await page.click('body > pgp-root > div > pgp-certidao > pgp-solicitacao-certidao > div > form > div > div > button', { delay: 3000 });
        await page.waitForTimeout(20000);
        // Elemento presente?
        let paginaCertidao = await page.evaluate(() => {
            const el = document.getElementById('page1');
            if (el)
                return el.tagName;
            else
                return false;
        })
        if (!paginaCertidao) {
            console.log("TRF1: Processo interrompido pelo reCaptcha. Tentando solucionar...");
            const quebrarCaptcha = await page.solveRecaptchas();
            console.log(quebrarCaptcha);
            await page.waitForTimeout(5000);
            for (let index = 0; index < 8; index++) {
                if(paginaCertidao) continue;
                await page.click('body > pgp-root > div > pgp-certidao > pgp-solicitacao-certidao > pgp-trf1-header > header > div > a > img', { delay: 2000 });
                await page.waitForTimeout(1000);
                await page.click('body > pgp-root > div > pgp-certidao > pgp-certidao-inicial > div.menus > pgp-menu-principal:nth-child(1) > mat-card', { delay: 2000 });
                await page.click('#mat-select-0 > div > div.mat-select-arrow-wrapper.ng-tns-c87-1', { delay: 2000 });
                await page.click('#mat-option-2 > span', { delay: 2000 });
                await page.click('#mat-chip-list-input-0', { delay: 2000 });
                await page.keyboard.press('r', { delay: 1000 });
                await page.keyboard.press('ArrowDown', {delay:1000});
                await page.keyboard.press('Enter', { delay: 1000 });
                await page.keyboard.press('Tab', { delay: 1000 });
                //Clicar no campo CPF
                await page.click('#mat-input-0', { delay: 2000 });
                //Digitar o número do documento
                await page.keyboard.type(CPF, { delay: 200 });                
                await page.click('body > pgp-root > div > pgp-certidao > pgp-solicitacao-certidao > div > form > div > div > button', { delay: 2000 });
                console.log(index);                
                await page.waitForTimeout(20000);
                paginaCertidao = await page.evaluate(() => {
                    const el = document.getElementById('page1');
                    if (el){
                        return el.tagName;
                    }else{
                        return false;
                    }
                })                
            }
            
        }
        console.log(paginaCertidao);
        if(paginaCertidao == false){
            console.log("TRF 1: Não foi possível atender o pedido ");
            browser.close();
            return { erro: "Não foi possível atender o pedido", result: resultado };
        }
        await page.waitForTimeout(3000);
        //Remover botão imprimir e Gerar arquivo pdf                
        await page.$eval('button', el => el.remove());
        let diretorio = await mkdir(paths.files()+`${process.env.BARRA}`+Date.now(), {recursive:true}, (err, dir)=>{
            return dir;
        });
        await page.pdf({ path: `${diretorio}${process.env.BARRA}${CPF}trf1.pdf`, format: 'A4', scale: 0.98 });
        let pasta = diretorio.split(`files${process.env.BARRA}`);
        console.log("Arquivo TRF1, PDF gerado com sucesso.");
        browser.close();
        resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'trf1', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS 1° GRAU' });
        return resultado;
    } catch (error) {
        console.log("TRF 1 " + error);
        browser.close();
        return { erro: error, result: resultado };
    }

}