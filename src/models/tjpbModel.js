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

exports.tjpb = async (dados) => {    

    console.log("TJPB Processando...");
    const SITE_URL = "https://app.tjpb.jus.br/certo/paginas/publico/solicitarCertidao.jsf";
    const SITE_URL_CONSULTAR = "https://app.tjpb.jus.br/certo/paginas/publico/recuperarCertidao.jsf";
    const TIPOS = dados.documento;
    const CPF = dados.cpf;
    const NOME = dados.nome;
    const NASCIMENTO = dados.nascimento[8]+dados.nascimento[9]+dados.nascimento[5]+dados.nascimento[6]+dados.nascimento[0]+dados.nascimento[1]+dados.nascimento[2]+dados.nascimento[3];        
    const SEXO = dados.sexo;
    const NOMEMAE = dados.nomeMae;        
    const RG = dados.rg;
    const UFRG = dados.ufRg;
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
                await page.waitForSelector('#idNaturezaPessoa > tbody > tr > td:nth-child(1) > div > div.ui-radiobutton-box.ui-widget.ui-corner-all.ui-state-default > span', { delay: 3000 });                           
                await page.click('#idNaturezaPessoa > tbody > tr > td:nth-child(1) > div > div.ui-radiobutton-box.ui-widget.ui-corner-all.ui-state-default > span', { delay: 3000 });                           
                await page.waitForSelector('#idTipoCertidao > div:nth-child(1) > div:nth-child(1) > div > div.ui-chkbox-box.ui-widget.ui-corner-all.ui-state-default > span', { delay: 3000 });                           
                await page.waitForTimeout(2000);
                await page.click('#idTipoCertidao > div:nth-child(1) > div:nth-child(1) > div > div.ui-chkbox-box.ui-widget.ui-corner-all.ui-state-default > span', { delay: 3000 });                           
                await page.click('#idCpf', { delay: 3000 });                           
                await page.keyboard.type(CPF, { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(NOME, { delay: 150 });
                await page.keyboard.press('Tab', {delay:2000});
                await page.keyboard.type(NASCIMENTO,{delay:150});
                await page.waitForTimeout(3000);
                if(SEXO == 'masculino'){
                    await page.keyboard.press('Space', {delay:2000});
                    await page.keyboard.press('Tab', {delay:2000});
                }else{
                    await page.keyboard.press('ArrowRight', {delay:2000});
                    await page.keyboard.press('Tab', {delay:2000});
                }
                await page.keyboard.type(NOMEMAE,{delay:150});
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type('r', { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(RG,{delay:150});
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type('SSP', { delay: 150 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.type(UFRG,{delay:150});
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Tab', { delay: 2000 });
                await page.keyboard.press('Space', {delay:1000});
                await page.waitForTimeout(3000);
                await page.keyboard.press('Tab', { delay: 3000 });
                await page.keyboard.type('df', { delay: 150 });
                await page.keyboard.press('Tab', { delay: 3000 });
                await page.keyboard.type('Brasília', { delay: 150 });
                await page.keyboard.press('Enter', { delay: 3000 });
                await page.keyboard.press('Tab', { delay: 3000 });
                await page.keyboard.type('Setor Policial Sul', { delay: 150 });
                await page.keyboard.press('Tab', { delay: 3000 });
                await page.keyboard.type('SPO, Quadra 3, Lote 5.', { delay: 150 });
                await page.keyboard.press('Tab', { delay: 3000 });
                await page.keyboard.type('SN', { delay: 150 });
                await page.keyboard.press('Tab', { delay: 3000 });
                await page.keyboard.press('Tab', { delay: 3000 });
                await page.keyboard.type(EMAIL,{delay:150});                
                await page.click('#idBotaoEnviar', { delay: 3000 });                           
                await page.waitForTimeout(12000);
                let emitida = await page.evaluate(async ()=>{        
                    let elemento = document.querySelector("#messages > div > ul > li > span");
                    if (elemento) {
                        return elemento.textContent;
                    }
                    return;                       
                });
                console.log(emitida);
                if (emitida) {
                    await page.goto(SITE_URL_CONSULTAR, { waitUntil: 'networkidle2' });
                    await page.waitForSelector('#esqueciProtocolo > div.ui-chkbox-box.ui-widget.ui-corner-all.ui-state-default > span', { delay: 3000 });                           
                    await page.click('#esqueciProtocolo > div.ui-chkbox-box.ui-widget.ui-corner-all.ui-state-default > span', { delay: 3000 });
                    await page.click('#idCpf', { delay: 3000 });
                    await page.keyboard.type(CPF, { delay: 150 });
                    await page.keyboard.press('Tab', {delay:2000});
                    await page.keyboard.type(NASCIMENTO,{delay:150});
                    await page.keyboard.press('Tab', { delay: 3000 });
                    await page.keyboard.press('Enter', { delay: 3000 });
                    await page.waitForTimeout(9000);
                    await page.click('#tableConsultaCertidao\\:0\\:imprimirButton', { delay: 3000 });
                    await page.waitForTimeout(12000);
                } else {
                    await page.waitForTimeout(12000);
                    await page.click('#colunaTable\\:0\\:fazerDownload', { delay: 3000 });
                    await page.waitForTimeout(12000);
                }
                //Criação de diretório para armazenar arquivos da pesquisa
                let diretorio = await mkdir(paths.files() + `${process.env.BARRA}` + Date.now(), { recursive: true }, (err, dir) => {
                    return dir;
                });
                await copyFile(`${paths.dirDownloadPadrao()}${process.env.BARRA}Certidao.pdf`, `${diretorio}${process.env.BARRA}${CPF}tjpb.pdf`);
                let pasta = diretorio.split(`files${process.env.BARRA}`);
                console.log("Arquivo TJPB, PDF gerado com sucesso.");
                browser.close();
                await unlink(`${paths.dirDownloadPadrao()}${process.env.BARRA}Certidao.pdf`);
                resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'tjpb', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS 1° GRAU' });
            
            }
            
        }

    } catch (error) {
        console.log("TJPB " + error);
        browser.close();
        return { erro: error, result: resultado };
}
    browser.close();
    return resultado;
}