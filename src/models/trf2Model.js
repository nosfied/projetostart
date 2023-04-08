const puppeteer = require('puppeteer-extra');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
const paths = require('../paths/paths');
const util = require('../util/util');

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

exports.trf2 = async (dados) =>{

    console.log("TRF2 Processando...");
    const SITE_URL = "https://certidoes.trf2.jus.br/certidoes/#/principal/solicitar";
    const CAPTCHA_SITE_KEY = "6LfX_x4UAAAAAM9iOUil8y2DwMe1IYLspfznPGij";
    const CPF = dados.cpf;
    let resultado = [];        

    const browser = await puppeteer.launch({
        headless: true,
        executablePath: paths.googleChrome(),
        //userDataDir: paths.perfilChrome()

    });
    const page = await browser.newPage();
    try {
        await util.limparArquivosAntigos();
        await page.goto(SITE_URL);
        await page.waitForSelector('#router-view-principal > div > div > div');
        //selecionar o órgão -> clique            
        await page.click('#router-view-principal > div > div > div', { delay: 2000 });
        await page.click('#router-view-principal > div > div > div > div:nth-child(2) > div.md-field.md-theme-default.md-invalid.md-layout-item > div > i', { delay: 2000 });
        //escolher opção -> seção judiciária do RJ
        await page.keyboard.press('ArrowDown', { delay: 1000 });
        await page.keyboard.press('ArrowDown', { delay: 1000 });
        await page.keyboard.press('ArrowDown', { delay: 1000 });
        await page.keyboard.press('Enter', { delay: 1000 });
        //campo cpf -> clique        
        await page.click('#identificacao', { delay: 2000 });
        //Digitar o número do documento
        await page.keyboard.type(CPF, { delay: 50 });
        //clicar no botão Emitir
        await page.click('#router-view-principal > div > div > div > div.container-acoes > div.md-card-actions.md-alignment-right > button', { delay: 3000 });

        await page.waitForTimeout(3000);

        let telaCaptcha = await page.evaluate(async () => {

            return document.querySelector("body > div:nth-child(7)").style.visibility;
        })

        if (telaCaptcha == 'visible') {
            console.log("TRF2: Processo interrompido pelo Captcha. Tentando solucionar...");
            let quebrarCaptcha = await page.solveRecaptchas();
            console.log(quebrarCaptcha);
        }

        await page.waitForTimeout(7000);
        //Clicar na página e Gerar arquivo pdf
        await page.click('#app > div > div:nth-child(3) > div > div.folha-a4 > div > div > div.cabecalho > p:nth-child(1) > strong > img', { delay: 2000 });
        let diretorio = await mkdir(paths.files()+`${process.env.BARRA}`+Date.now(), {recursive:true}, (err, dir)=>{
            return dir;
        });
        await page.pdf({ path: `${diretorio}${process.env.BARRA}${CPF}trf2.pdf`, format: 'A4', scale: 0.98 });
        let pasta = diretorio.split(`files${process.env.BARRA}`);
        console.log("Arquivo TRF2, PDF gerado com sucesso.");
        browser.close();
        resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'trf2', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS 1° GRAU' });
        return resultado;
    } catch (error) {
        console.log("TRF 2 " + error);
        browser.close();
        return { erro: error, result: resultado };
    }
}           
    
    
    
    
