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

exports.tjdf = async (dados) => {    

    console.log("TJDF Processando...");
    const SITE_URL = "https://cnc.tjdft.jus.br/solicitacao-externa";
    const sitioParaCookies = 'https://www.tjdft.jus.br/';
    const CPF = dados.cpf;
    const NOME = dados.nome;        
    const NOMEMAE = dados.nomeMae;        
    const NOMEPAI = dados.nomePai;
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
        await page.waitForTimeout(2000);
        await page.keyboard.type(CPF,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});            
        await page.keyboard.press('Tab', {delay:1000});            
        await page.keyboard.press('Tab', {delay:1000});            
        await page.keyboard.press('Tab', {delay:1000});            
        await page.keyboard.press('Tab', {delay:1000});            
        await page.keyboard.press('Tab', {delay:1000});        
        await page.keyboard.press('Enter', {delay:1000});
        await page.waitForTimeout(3000);
        let telaCaptcha = await page.evaluate(async () => {

            return document.querySelector("body > div:nth-child(3)").style.visibility;
        })

        if (telaCaptcha == 'visible') {
            console.log("TJDF: Processo interrompido pelo Captcha. Tentando solucionar...");
            let quebrarCaptcha = await page.solveRecaptchas();
            console.log(quebrarCaptcha);
            await page.waitForTimeout(2000);
            await page.click('#q-app > div > div > div > div > div.q-card__section.q-card__section--vert > div > div.q-stepper__content.q-panel-parent > div > div > div > div > div > div > button.q-btn.q-btn-item.non-selectable.no-outline.q-btn--standard.q-btn--rectangle.bg-primary.text-white.q-btn--actionable.q-focusable.q-hoverable > span.q-btn__content.text-center.col.items-center.q-anchor--skip.justify-center.row > span', { delay: 1000 });
            await page.waitForTimeout(2000);
        }else{
            await page.keyboard.press('Tab', {delay:1000});            
            await page.keyboard.press('Tab', {delay:1000});            
            await page.keyboard.press('Tab', {delay:1000});
            await page.keyboard.press('Enter', {delay:1000});
        }        
        await page.waitForTimeout(3000);
        await page.keyboard.type(NOMEMAE,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.type(NOMEPAI,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.press('Enter', {delay:1000});
        await page.waitForTimeout(3000);

        let certidao = await page.evaluate(()=>{
            
            let link1 = document.querySelector("#q-app > div > div > div > div > div.q-card__section.q-card__section--vert > div > div.q-stepper__content.q-panel-parent > div > div > div > div > div > a");
            let link2 = document.querySelector("#q-app > div > div > div > div > div.q-card__section.q-card__section--vert > div > div.q-stepper__content.q-panel-parent > div > div > div > div > div > div.q-gutter-sm > a");
            if(link1){
                return link1.href;
            }
            return link2.href;

        })

        if(certidao){
            
            console.log("Arquivo TJDF, PDF gerado com sucesso.");
        }
        
        browser.close();
        resultado.push({cpf: certidao, orgao: 'tjdf', documento: 'CERTIDÃO NEGATIVA DE DISTRIBUIÇÃO (AÇÕES CRIMINAIS)'});
        return resultado;             

    } catch (error) {        
        console.log("TJDF " + error);
        browser.close();
        return { erro: error, result: resultado };
    }

}