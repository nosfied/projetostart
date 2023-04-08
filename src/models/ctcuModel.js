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

exports.ctcu = async (dados) => {    

    console.log("CTCU Processando...");
    const SITE_URL_1 = "https://contasirregulares.tcu.gov.br/ordsext/f?p=105:21:::NO:3,4,5::&cs=3YHKce9GUx-Va5aXOPtKx-FhtvwI";
    const SITE_URL_2 = "https://portal.tcu.gov.br/carta-de-servicos/";
    const SITE_URL_3 = "https://contas.tcu.gov.br/certidao/Web/Certidao/NadaConsta/home.faces";
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
            if (tipo == 'irregulares') {

                await util.limparArquivosAntigos();
                await page.goto(SITE_URL_1, { waitUntil: 'networkidle2' });
                await page.click('#P21_FINS_ELEITORAIS > label:nth-child(3)', { delay: 2000 });
                await page.waitForTimeout(3000);
                await page.click('#P21_CPF_CJI', { delay: 2000 });
                await page.keyboard.type(CPF, { delay: 150 });
                await page.click('#B55138095812122870', { delay: 2000 });
                await page.waitForTimeout(7000);
                let nPedido = await page.$eval('#R2923796125692067287 > div.t-Region-bodyWrap > div.t-Region-body > font > font > p', el => el.textContent);
                let pedido = await nPedido.split('certidão: ');
                let nomeArquivo = await pedido[1].split('Atenção: qualquer');
                await page.waitForTimeout(3000);
                await page.click('#R2923796125692067287 > div.t-Region-bodyWrap > div.t-Region-body > div:nth-child(5) > a', { delay: 2000 });                
                await page.waitForTimeout(9000);                                
                //Criação de diretório para armazenar arquivos da pesquisa
                let diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                    return dir;
                });
                await copyFile(`${paths.dirDownloadPadrao()}${process.env.BARRA}Certidao ${nomeArquivo[0]}.pdf`, `${diretorio}${process.env.BARRA}${CPF}tcuIrregulares.pdf`);
                let pasta = diretorio.split(`files${process.env.BARRA}`);
                console.log("Arquivo TCU Certidão de Contas Julgadas Irregulares, PDF gerado com sucesso.");
                await unlink(`${paths.dirDownloadPadrao()}${process.env.BARRA}Certidao ${nomeArquivo[0]}.pdf`);                
                resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tcuIrregulares', documento: 'TCU Certidão - Contas Julgadas Irregulares' });                               

            } else if (tipo == 'inabilitados') {
                await util.limparArquivosAntigos();
                await page.goto(SITE_URL_2, { waitUntil: 'networkidle2' });
                await page.click('body > div.cookies > div > div.cookies-btn > input');
                await page.click('body > main > article > div:nth-child(3) > div > div > p');
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Enter', { delay: 2000 });                
                await page.click('#lista-servicos > div:nth-child(13) > p > a', { delay: 2000 });
                await page.waitForTimeout(9000);
                let pag = await browser.pages();
                await pag[2].waitForSelector('#\\31 _menubar_2i', { delay: 2000 });
                await pag[2].click('#\\31 _menubar_2i', { delay: 2000 });
                await pag[2].waitForTimeout(2000);
                await pag[2].click('#P3_TIPO_RELACAO > div > div > div:nth-child(1) > label', { delay: 2000 });
                await pag[2].waitForTimeout(3000);
                await pag[2].click('#P3_CPF', { delay: 2000 });
                await pag[2].keyboard.type(CPF, { delay: 150 });
                await pag[2].click('#B29782782691410319827', { delay: 2000 });
                await pag[2].waitForTimeout(7000);                
                // Elemento presente?
                let paginaCertidao = await pag[2].evaluate(() => {
                    const el = document.querySelector("#R20507205424713788697 > div.t-Region-bodyWrap > div.t-Region-body > div:nth-child(9) > a");
                    if (el)
                        return el.tagName;
                    else
                        return false;
                })
                if (!paginaCertidao) {
                    await pag[2].solveRecaptchas();
                    await pag[2].click('#B29782782691410319827', { delay: 2000 });
                    for (let index = 0; index < 6; index++) {
                        console.log(paginaCertidao);
                        if (paginaCertidao) continue;                        
                        await pag[2].click('#B29782783085601319828', { delay: 2000 });
                        await pag[2].waitForSelector('#P3_TIPO_RELACAO > div > div > div:nth-child(1) > label', { delay: 2000 });
                        await pag[2].click('#P3_TIPO_RELACAO > div > div > div:nth-child(1) > label', { delay: 2000 });
                        await pag[2].waitForTimeout(3000);
                        await pag[2].click('#P3_CPF', { delay: 2000 });
                        await pag[2].keyboard.type(CPF, { delay: 150 });
                        await pag[2].click('#B29782782691410319827', { delay: 2000 });
                        await pag[2].waitForTimeout(7000);
                        // Elemento presente?
                        paginaCertidao = await pag[2].evaluate(() => {
                            const el = document.querySelector('#R20507205424713788697 > div.t-Region-bodyWrap > div.t-Region-body > div:nth-child(9) > a');
                            if (el)
                                return el.tagName;
                            else
                                return false;
                        })
                        
                    }
                }                
                await pag[2].click('#R20507205424713788697 > div.t-Region-bodyWrap > div.t-Region-body > div:nth-child(9) > a', { delay: 2000 });                
                await pag[2].waitForTimeout(20000);                                
                //Criação de diretório para armazenar arquivos da pesquisa
                let diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                    return dir;
                });
                await copyFile(`${paths.dirDownloadPadrao()}${process.env.BARRA}Certidao negativa.pdf`, `${diretorio}${process.env.BARRA}${CPF}tcuInabilitados.pdf`);
                let pasta = diretorio.split(`files${process.env.BARRA}`);
                console.log("Arquivo TCU Certidão Negativa de Inabilitados, PDF gerado com sucesso.");
                await unlink(`${paths.dirDownloadPadrao()}${process.env.BARRA}Certidao negativa.pdf`);                
                resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tcuInabilitados', documento: 'TCU Certidão Negativa de Inabilitados' });
            
            } else if (tipo == 'processos') {
                await util.limparArquivosAntigos();
                await page.goto(SITE_URL_3, { waitUntil: 'networkidle2' });
                await page.click('#formEmitirCertidaoNadaConsta\\:txtCpfOuCnpj', { delay: 2000 });
                await page.keyboard.type(CPF, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Space', {delay:1000});
                let telaCaptcha = await page.evaluate(async ()=>{        
                        
                    return document.querySelector("body > div:nth-child(12)").style.visibility;                    
                })
                console.log(telaCaptcha);    
                if(telaCaptcha == 'visible') {        
                    console.log("TCU Processos: Processo interrompido pelo Captcha. Tentando solucionar...");            
                    let quebrarCaptcha = await page.solveRecaptchas();
                    console.log(quebrarCaptcha);
                    await page.waitForTimeout(6000);
                    await page.focus('#formEmitirCertidaoNadaConsta\\:txtCpfOuCnpj', { delay: 2000 });
                    //await page.click('#formEmitirCertidaoNadaConsta\\:txtCpfOuCnpj', { delay: 2000 });
                    await page.keyboard.press('Tab', { delay: 2000 });
                    await page.keyboard.press('Tab', { delay: 2000 });
                    await page.keyboard.press('Tab', { delay: 2000 });
                    await page.keyboard.press('Tab', { delay: 2000 });
                    await page.keyboard.press('Tab', { delay: 2000 });
                    await page.keyboard.press('Enter', { delay: 2000 });
                }else{
                    await page.click('#formEmitirCertidaoNadaConsta\\:btnEmitirCertidao', { delay: 2000 });
                }
                await page.waitForTimeout(20000);                
                //Criação de diretório para armazenar arquivos da pesquisa
                let diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                    return dir;
                });
                await page.pdf({ path: `${diretorio}${process.env.BARRA}${CPF}tcuProcessos.pdf`, format: 'A4' });
                let pasta = diretorio.split(`files${process.env.BARRA}`);
                console.log("Arquivo TCU Certidão Negativa de Processos, PDF gerado com sucesso.");
                resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tcuProcessos', documento: 'TCU Certidão Negativa de Processos' });
            
            }
        }       
    
    } catch (error) {        
        console.log("CTCU " + error);
        browser.close();
        return { erro: error, result: resultado };
    }
    browser.close();
    return resultado;
}