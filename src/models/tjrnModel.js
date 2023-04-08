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

exports.tjrn = async (dados) => {    

    console.log("TJRN Processando...");
    const SITE_URL = "https://apps.tjrn.jus.br/certidoes/f/public/form.xhtml";
    const SITE_URL_ACOMPANHAR = "https://apps.tjrn.jus.br/certidoes/f/public/list.xhtml";
    const TIPOS = dados.documento;
    const CPF = dados.cpf;
    const RG = dados.rg;
    const NASCIMENTO = dados.nascimento[8]+dados.nascimento[9]+dados.nascimento[5]+dados.nascimento[6]+dados.nascimento[0]+dados.nascimento[1]+dados.nascimento[2]+dados.nascimento[3];
    const NOME = dados.nome;
    const NOMEMAE = dados.nomeMae;        
    const ESTCIVIL = dados.estadoCivil;
    const EMAIL = dados.email;

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
                await page.click('#frmSave\\:somTipoCertidao > div.ui-selectonemenu-trigger.ui-state-default.ui-corner-right > span', { delay: 2000 });
                await page.keyboard.press('ArrowDown', { delay: 2000 });
                await page.keyboard.press('ArrowDown', { delay: 2000 });
                await page.keyboard.press('Enter', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(NOME, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(RG, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type('SSP', { delay: 150 });
                await page.keyboard.press('Tab', { delay: 1000 });
                await page.keyboard.type(CPF, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(NASCIMENTO, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(NOMEMAE, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type('Brasilia', { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type('DF');
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(EMAIL, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Space', {delay:1000});
                await page.waitForTimeout(3000);
                let telaCaptcha = await page.evaluate(async ()=>{        
                        
                    return document.querySelector("body > div:nth-child(8)").style.visibility;                    
                })
                console.log(telaCaptcha);    
                if(telaCaptcha == 'visible') {        
                    console.log("TJRN: Processo interrompido pelo Captcha. Tentando solucionar...");            
                    let quebrarCaptcha = await page.solveRecaptchas();
                    console.log(quebrarCaptcha);
                    await page.click('#frmSave\\:btnSaveAndClean', { delay: 2000 });
                }else{
                    await page.click('#frmSave\\:btnSaveAndClean', { delay: 2000 });
                }
                await page.waitForTimeout(4000);
                let result = await page.evaluate(async () => {
                    let elemento = document.querySelector("#messages > div > ul > li > span");
                    if (elemento) {
                        return elemento.textContent
                    }
                    return;
                });
                let el = result.trim();
                console.log(el.length);
                await page.goto(SITE_URL_ACOMPANHAR, { waitUntil: 'networkidle2' });
                if (el.length == 141) {
                    await page.waitForTimeout(30000);
                    let el1 = await el.split('foi:');
                    let el2 = await el1[1].split('. Será');
                    let nPedido = await el2[0].trim();
                    console.log(nPedido);
                    await page.click('#frmSearch\\:iptNumPedido', { delay: 2000 });
                    await page.keyboard.type(nPedido, { delay: 150 });
                    await page.click('#frmSearch\\:btnSearch', { delay: 2000 });
                    await page.waitForTimeout(5000);
                    let botao = await page.evaluate(async ()=>{        
                        return document.querySelector("#frmSearchList\\:dtTable\\:0\\:btnImprimir > span.ui-button-text.ui-c");                       
                    });
                    for (let index = 0; index < 10; index++) {
                        if (botao) {
                            continue
                        } else {
                            await page.waitForTimeout(10000);
                            await page.click('#frmSearch\\:btnSearch', { delay: 2000 });
                            await page.waitForTimeout(4000);
                            botao = await page.evaluate(async ()=>{        
                                return document.querySelector("#frmSearchList\\:dtTable\\:0\\:btnImprimir > span.ui-button-text.ui-c");                       
                            });                        }
                        
                    }
                    await page.click('#frmSearchList\\:dtTable\\:0\\:btnImprimir > span.ui-button-text.ui-c', { delay: 2000 });
                    
                } else {
                    await page.waitForTimeout(10000);
                    await page.click('#frmSearch\\:imCPF', { delay: 2000 });
                    await page.keyboard.type(CPF, { delay: 150 });
                    await page.click('#frmSearch\\:btnSearch', { delay: 2000 });
                    await page.waitForTimeout(5000);                   
                    let certSolicitada = await page.evaluate(async ()=>{        
                        
                        let cert = document.querySelector("#frmSearchList\\:dtTable_data > tr > td:nth-child(8) > span");
                        return cert.textContent;                    
                    })
                    console.log(certSolicitada);
                    if (certSolicitada && certSolicitada == 'Solicitada'){
                        //Criação de diretório para armazenar arquivos da pesquisa
                        let diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                            return dir;
                        });
                        await page.pdf({ path: `${diretorio}${process.env.BARRA}${CPF}tjrn.pdf` });
                        let pasta = diretorio.split(`files${process.env.BARRA}`);
                        console.log("Arquivo TJRN, PDF gerado com sucesso.");
                        browser.close();
                        resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tjrn', documento: 'EXISTE SOLICITAÇÃO PENDENTE - Certidão Criminal 1° GRAU' });
                    } else {
                        await page.click('#frmSearchList\\:dtTable\\:0\\:btnImprimir > span.ui-button-text.ui-c', { delay: 2000 });
                        await page.waitForTimeout(5000);
                    }
                    
                }                 
                await page.waitForTimeout(9000);
                let nCertidao = await page.$eval('#frmSearchList\\:dtTable_data > tr.ui-widget-content.ui-datatable-even > td:nth-child(2)', el => el.textContent);                
                let certidao = nCertidao.replace('/','_');
                console.log(certidao);
                //Criação de diretório para armazenar arquivos da pesquisa
                let diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                    return dir;
                });
                await copyFile(`${paths.dirDownloadPadrao()}${process.env.BARRA}Certidão -${certidao}.pdf`, `${diretorio}${process.env.BARRA}${CPF}tjrn.pdf`);
                let pasta = diretorio.split(`files${process.env.BARRA}`);
                console.log("Arquivo TJRN, PDF gerado com sucesso.");
                browser.close();
                await unlink(`${paths.dirDownloadPadrao()}${process.env.BARRA}Certidão -${certidao}.pdf`);
                resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tjrn', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS 1° GRAU' });           
                                               

            }                        

        }
    
    } catch (error) {        
        console.log("TJRN " + error);
        browser.close();
        return { erro: error, result: resultado };
    }
    browser.close();
    return resultado;
}