const puppeteer = require('puppeteer-extra');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const paths = require('../paths/paths');
const util = require('../util/util');
//Plugin para deixar o puppeteer 90% indetectável
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

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

exports.trf4 = async (dados) => {

    console.log("TRF4 Processando...");
    const SITE_URL = "https://www2.trf4.jus.br/trf4/processos/certidao/index.php";
    const CAPTCHA_SITE_KEY = "";
    const ACTION = "";
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
        await util.limparArquivosAntigos();
        await page.goto(SITE_URL);        
        await page.waitForSelector('#string_cpf');
        await page.click('#frmCertidao', {delay:2000});    
        await page.click('#string_cpf', {delay:1000});    
        await page.waitForTimeout(2000);
        await page.keyboard.type(CPF,{delay:150});
        await page.click('#frmCertidao > fieldset > b > input[type=radio]:nth-child(3)', {delay:2000});    
        await page.keyboard.press('Tab', {delay:2000});
        await page.keyboard.press('Enter', {delay:1000});    
        await page.waitForTimeout(4000);   

        let telaCaptcha = await page.evaluate(async ()=>{        
                        
            return document.querySelector("body > div:nth-child(5)").style.visibility;                    
        })
        console.log(telaCaptcha);
    
        if(telaCaptcha == 'visible') {        
            console.log("TRF4: Processo interrompido pelo Captcha. Tentando solucionar...");            
            let quebrarCaptcha = await page.solveRecaptchas();
            console.log(quebrarCaptcha);
            await page.waitForTimeout(4000);
            await page.click('#botaoEmitir', {delay:2000});
            await page.waitForTimeout(4000);   
                    
        }else{
            await page.click('#botaoEmitir', {delay:2000});
        }
        await page.waitForTimeout(4000);
        //Gerar arquivo pdf
        let botaoPrint = await page.$eval('#botaoVisualizar', bt => bt.value);
        if (botaoPrint) {
            console.log(botaoPrint);
            let printPDF = await page.evaluate(async ()=>{                  
            
                let link = window.location.href;    
                let caminho_base = "https://www2.trf4.jus.br/trf4/processos/certidao_balcao/certidao_emite_cjf.php?num_contro_certid=";
                let nCertidao = link.split('num_contro_certid=');
                let baseDoc = nCertidao[0].split('?');
                let doc = baseDoc[1].split('&');
                let nomeParte = doc[1].split('&');    
                let linkPdf = `${caminho_base}${nCertidao[1]}&${doc[0]}&${nomeParte[0]}`;
                return linkPdf
                     
            })                    
            console.log("Arquivo TRF4, PDF gerado com sucesso.");
            browser.close();
            resultado.push({cpf: printPDF, orgao: 'trf4', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS 1° GRAU'});
            return resultado; 
        }       

    } catch (error) {        
        console.log("TRF 4 " + error);
        browser.close();
        return { erro: error, result: resultado };
    }

}