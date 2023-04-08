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

exports.tjsc = async (dados) => {    

    console.log("TJSC Processando...");
    const SITE_URL = "https://certidoes.tjsc.jus.br/";
    const TIPOS = dados.documento;
    const CPF = dados.cpf;
    const RG = dados.rg;
    const NOME = dados.nome;
    const NASCIMENTO = dados.nascimento[8]+dados.nascimento[9]+dados.nascimento[5]+dados.nascimento[6]+dados.nascimento[0]+dados.nascimento[1]+dados.nascimento[2]+dados.nascimento[3];        
    const NOMEMAE = dados.nomeMae;        
    const NOMEPAI = dados.nomePai;
    const ESTCIVIL = dados.estadoCivil;
    const EMAIL = dados.email;
    const ORGEXP = dados.orgaoExp;
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
            if(tipo == 'criminal1' || tipo == 'civel1'){
                                
                await util.limparArquivosAntigos();        
                await page.goto(SITE_URL, {waitUntil: 'networkidle2'});
                await page.waitForTimeout(2000);
                await page.click('#form_certidao > div > div:nth-child(1) > div > div > div > input[type=checkbox]:nth-child(3)', { delay: 2000 });                
                await page.waitForTimeout(2000);
                await page.click('#form_certidao > div > div:nth-child(2) > div > div > div > input[type=checkbox]:nth-child(3)', { delay: 2000 });
                await page.waitForTimeout(2000);
                await page.click('#form_certidao > div > div:nth-child(3) > div > div > div > input', { delay: 2000 });
                await page.keyboard.type(NOME,{delay:150});
                await page.keyboard.press('Tab', {delay:1000});            
                await page.keyboard.press('ArrowDown', {delay:1000});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.type(CPF,{delay:150});
                await page.keyboard.press('Tab', {delay:1000});            
                await page.keyboard.type(RG,{delay:150});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.type(ORGEXP,{delay:150});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.type(ESTCIVIL,{delay:150});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.type(NOMEMAE,{delay:150});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.type(NOMEPAI,{delay:150});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.type(NASCIMENTO,{delay:150});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.type('Distrito Federal',{delay:150});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.type('BRASÍLIA',{delay:150});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.type('SPO, QUADRA 3, Lote 5',{delay:150});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.type(EMAIL,{delay:150});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.type('CONCURSO',{delay:150});
                await page.keyboard.press('Tab', {delay:1000});
                await page.keyboard.press('Space', {delay:1000});                
                await page.waitForTimeout(4000);
                let telaCaptcha = await page.evaluate(async ()=>{        
                        
                    return document.querySelector("body > div:nth-child(40)").style.visibility;                    
                })
                console.log(telaCaptcha);            
                if(telaCaptcha == 'visible') {        
                    console.log("TJSC: Processo interrompido pelo Captcha. Tentando solucionar...");            
                    let quebrarCaptcha = await page.solveRecaptchas();
                    console.log(quebrarCaptcha);
                    await page.click('#form_certidao > div > div:nth-child(16) > div > div > div > input[type=checkbox]', { delay: 2000 });
                    await page.click('#enviar', { delay: 1000 });                           
                }else{
                    await page.click('#form_certidao > div > div:nth-child(16) > div > div > div > input[type=checkbox]', { delay: 2000 });
                    await page.click('#enviar', { delay: 1000 });
                }                
                await page.waitForTimeout(5000);
                let pedido = await page.evaluate(async ()=>{        
                        
                    return document.querySelector("body > div.page-wrapper > div.page-wrapper-row.full-height > div > div > div > div.page-content > div > div > div > div.portlet.box.default > div.portlet-body > div > div > div > div > div > p:nth-child(3)").textContent;                    
                })
                if (pedido) {
                    await page.waitForTimeout(300000);
                    let el1 = await pedido.split('Pedido:');
                    let el2 = await el1[1].split('Tipo');
                    let nPedido = await el2[0].trim();
                    await page.goto('https://certidoes.tjsc.jus.br/download', {waitUntil: 'networkidle2'});
                    await page.click('body > div.page-wrapper > div.page-wrapper-row.full-height > div > div > div > div.page-content > div > div > div > div.portlet.box.default > div.portlet-body > form > div > div:nth-child(1) > div > div > div > input', { delay: 2000 });                
                    await page.keyboard.type(nPedido, {delay:150});
                    await page.keyboard.press('Tab', {delay:1000});
                    await page.keyboard.type(CPF,{delay:150});
                    await page.keyboard.press('Tab', {delay:1000});
                    await page.keyboard.press('Space', {delay:1000});                
                    await page.waitForTimeout(4000);
                    let telaCaptcha = await page.evaluate(async ()=>{        
                        
                        return document.querySelector("body > div:nth-child(38)").style.visibility;                    
                    })
                    console.log(telaCaptcha);            
                    if(telaCaptcha == 'visible') {        
                        console.log("TJSC: Processo interrompido pelo Captcha. Tentando solucionar...");            
                        let quebrarCaptcha = await page.solveRecaptchas();
                        console.log(quebrarCaptcha);
                        await page.click('body > div.page-wrapper > div.page-wrapper-row.full-height > div > div > div > div.page-content > div > div > div > div.portlet.box.default > div.portlet-body > form > div > div:nth-child(4) > div > div > div > input', { delay: 1000 });                           
                    }else{
                        await page.click('body > div.page-wrapper > div.page-wrapper-row.full-height > div > div > div > div.page-content > div > div > div > div.portlet.box.default > div.portlet-body > form > div > div:nth-child(4) > div > div > div > input', { delay: 1000 });
                    }                
                    await page.waitForTimeout(5000);
                    let instrucoes = await page.evaluate(async ()=>{        
                        
                        return document.querySelector("body > div.page-wrapper > div.page-wrapper-row.full-height > div > div > div > div.page-content > div > div > div > div.portlet.box.default > div.portlet-body > form > div > div > div > div > div > p:nth-child(4)").textContent;                    
                    })
                    console.log(instrucoes);
                    if (instrucoes) {
                        let el1 = await instrucoes.split('O seu pedido');
                        let el2 = await el1[1].split('Por favor');
                        let mensage = await el2[0].trim();
                        if (mensage == 'está em processamento.') {
                            //Criação de diretório para armazenar arquivos da pesquisa
                            diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                                return dir;
                            });
                            await page.pdf({ path: `${diretorio}${process.env.BARRA}${CPF}tjsc.pdf` });
                            let pasta = diretorio.split(`files${process.env.BARRA}`);
                            console.log("Arquivo TJSC 1° GRAU, PDF gerado com sucesso.");
                            resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tjsc', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS 1° GRAU'});
                        }
                    } else {
                        await page.waitForTimeout(5000);
                        let gerada = await page.url();                        
                        let el1 = await gerada.split('numero=');
                        let el2 = await el1[1].split('+&cpfcnpj');
                        let ncertidao = await el2[0].trim();
                        if (ncertidao == nPedido) {
                            //Criação de diretório para armazenar arquivos da pesquisa
                            diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                                return dir;
                            });
                            await page.pdf({ path: `${diretorio}${process.env.BARRA}${CPF}tjsc.pdf` });
                            let pasta = diretorio.split(`files${process.env.BARRA}`);
                            console.log("Arquivo TJSC 1° GRAU, PDF gerado com sucesso.");
                            resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tjsc', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS 1° GRAU'});
                        }
                        
                    }
                }
            
            }
        }
    } catch (error) {        
        console.log("TJSC " + error);
        browser.close();
        return { erro: error, result: resultado };
    }
    browser.close();
    return resultado;
}