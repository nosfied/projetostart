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

exports.acpf = async (dados) => {    

    console.log("ACPF Processando...");
    const SITE_URL = "https://servicos.dpf.gov.br/antecedentes-criminais/certidao";
    const TIPOS = dados.documento;
    const CPF = dados.cpf;
    const NOME = dados.nome;
    const NASCIMENTO = dados.nascimento[8]+dados.nascimento[9]+dados.nascimento[5]+dados.nascimento[6]+dados.nascimento[0]+dados.nascimento[1]+dados.nascimento[2]+dados.nascimento[3];        
    const SEXO = dados.sexo;
    const NOMEMAE = dados.nomeMae;        
    const RG = dados.rg;
    const ORGAOEXP = dados.orgaoExp;
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
                await page.waitForSelector('#inputNome_input', { delay: 3000 });
                await page.click('#inputNome_input', { delay: 3000 });
                await page.keyboard.type(NOME, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(NOMEMAE,{delay:150});
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(RG,{delay:150});
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(ORGAOEXP, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(UFRG,{delay:150});
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(NASCIMENTO,{delay:150});
                await page.keyboard.press('Tab', {delay:2000});
                await page.keyboard.type(CPF, { delay: 150 });
                await page.keyboard.press('Tab', {delay:2000});
                await page.keyboard.press('Space', {delay:2000});
                let telaCaptcha = await page.evaluate(async ()=>{        
                        
                    return document.querySelector("body > div:nth-child(7)").style.visibility;                    
                })
                console.log(telaCaptcha);    
                if(telaCaptcha == 'visible') {        
                    console.log("ACPF: Processo interrompido pelo Captcha. Tentando solucionar...");            
                    let quebrarCaptcha = await page.solveRecaptchas();
                    console.log(quebrarCaptcha);
                    await page.waitForTimeout(6000);
                    await page.focus('#inputCpf_input', { delay: 3000 });
                    await page.keyboard.press('Tab', {delay:2000});
                    await page.keyboard.press('Tab', {delay:2000});
                    await page.keyboard.press('Tab', {delay:2000});
                    await page.keyboard.press('Tab', {delay:2000});
                    await page.keyboard.press('Tab', {delay:2000});
                    await page.keyboard.press('Tab', {delay:2000});
                    await page.keyboard.press('Enter', {delay:2000});
                }else{
                    await page.click('body > div.wrapper.ng-scope > application > div > certidao > div > div:nth-child(2) > div > div > div.panel-body > form > div > div.form-group.form-group-sm > div > button.btn.btn-primary.btn-sm', { delay: 3000 });
                }
                await page.waitForTimeout(10000);               
                //await page.waitForTimeout(2000000);
                let nomeDir = NOME.replace(/ /g, "");
                //Criação de diretório para armazenar arquivos da pesquisa
                let diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                    return dir;
                });
                await copyFile(`${paths.dirDownloadPadrao()}${process.env.BARRA}CERTIDAO-${nomeDir}.pdf`, `${diretorio}${process.env.BARRA}${CPF}acpf.pdf`);
                let pasta = diretorio.split(`files${process.env.BARRA}`);
                console.log("Arquivo ACPF, PDF gerado com sucesso.");
                browser.close();
                await unlink(`${paths.dirDownloadPadrao()}${process.env.BARRA}CERTIDAO-${nomeDir}.pdf`);
                resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'acpf', documento: 'Certidão de Antecedentes Criminais da Polícia Federal' });
                
            }
            
        }

    } catch (error) {
        console.log("ACPF " + error);
        browser.close();
        return { erro: error, result: resultado };
}
    browser.close();
    return resultado;
}