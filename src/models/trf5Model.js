const puppeteer = require('puppeteer-extra');
const paths = require('../paths/paths');
const util = require('../util/util');

//Plugin para deixar o puppeteer 90% indetectável
const StealthPlugin = require('puppeteer-extra-plugin-stealth');

const { copyFile } = require('node:fs/promises');
const { unlink } = require('node:fs/promises');
const { mkdir } = require('node:fs/promises');

puppeteer.use(StealthPlugin());

exports.trf5 = async (dados) => {    

    console.log("TRF5 Processando...");
    const SITE_URL = "https://certidoes.trf5.jus.br/certidoes2022/";
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
        await page.goto(SITE_URL, {waitUntil: 'networkidle2'});
        await page.hover('#j_idt56\\:j_idt57 > ul > li.ui-widget.ui-menuitem.ui-corner-all.ui-menu-parent > a', { delay: 2000 });
        await page.click('#j_idt56\\:j_idt57 > ul > li.ui-widget.ui-menuitem.ui-corner-all.ui-menu-parent > ul > li:nth-child(2) > a', { delay: 2000 });
        
        //O Serviço de consulta de processos está indisponível,
        //favor solicitar a verificação junto ao setor responsável.
        //HTTP error code: 503 (Service Unavailable)
        await page.waitForSelector('#form\\:orgaoInternet');        
        await page.click('#form\\:orgaoInternet', { delay: 2000 });
        await page.keyboard.press('ArrowDown', {delay:1000});        
        await page.keyboard.press('Enter', {delay:1000});
        await page.click('#form\\:cpfCnpj', { delay: 2000 });
        await page.keyboard.type(CPF,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});
        await page.waitForTimeout(4000);
        await page.click('#j_idt11 > span', { delay: 1000 });
        await page.waitForTimeout(3000);
        await page.click('#form\\:jcaptcha', { delay: 2000 });        
        //Criação de diretório para armazenar arquivos da pesquisa
        let diretorio = await mkdir(paths.files()+`${process.env.BARRA}`+Date.now(), {recursive:true}, (err, dir)=>{
            return dir;
        });
        let imagem = await page.screenshot({ path: `${diretorio}${process.env.BARRA}captcha.png`, clip:{x:380, y:600, width:240, height:65}, encoding: 'base64'});        
        //screenshot modo headless
        //let imagem = await page.screenshot({ path: `${diretorio}${process.env.BARRA}captcha.png`, clip:{x:380, y:600, width:240, height:65}, encoding: 'base64'});
        let texto_captcha = await util.resolve_captcha_normal(imagem);
        await page.keyboard.type(texto_captcha,{delay:150});
        await page.keyboard.press('Tab', {delay:1000});
        await page.keyboard.press('Enter', {delay:1000});
        await page.waitForTimeout(10000);
        //Verificação se captcha passou e se a tela de confirmação da certidão está presente
        for (let index = 0; index < 3; index++) {
            await page.waitForTimeout(2000);            
            let confirmacao = await page.evaluate(async ()=>{            
                let confirm = document.querySelector("#form\\:dialogCertidaoCriminal");
                let tela = confirm.style.display;
                return tela;        
            });

            let confirmacao2 = await page.evaluate(async ()=>{            
                let confirm = document.querySelector("#form\\:growl_container > div > div > div.ui-growl-message > span");
                if(confirm == null) return false;
                return confirm.textContent;        
            });
            
            if(confirmacao != 'block'){
                if (confirmacao2 == false){
                    let cont = 0;
                    while (confirmacao2 == false && confirmacao != 'block' && cont < 10) {
                        await page.waitForTimeout(3000);
                        confirmacao2 = await page.evaluate(async ()=>{            
                            let confirm = document.querySelector("#form\\:growl_container > div > div > div.ui-growl-message > span");
                            if(confirm == null) return false;
                            return confirm.textContent;        
                        });
                        confirmacao = await page.evaluate(async ()=>{            
                            let confirm = document.querySelector("#form\\:dialogCertidaoCriminal");
                            let tela = confirm.style.display;
                            return tela;        
                        });
                        cont++;
                        console.log(confirmacao2);                
                    }
                } else if(confirmacao2 == "Código da imagem inválida") {
                    await page.click('#form\\:jcaptcha', { delay: 2000 });
                    let imagem = await page.screenshot({ path: `${diretorio}${process.env.BARRA}captcha.png`, clip:{x:380, y:600, width:240, height:65}, encoding: 'base64'});
                    //screenshot modo headless
                    //let imagem = await page.screenshot({ path: `${diretorio}${process.env.BARRA}captcha.png`, clip:{x:380, y:600, width:240, height:65}, encoding: 'base64'});
                    let texto_captcha = await util.resolve_captcha_normal(imagem);
                    await page.keyboard.type(texto_captcha,{delay:150});
                    await page.keyboard.press('Tab', {delay:1000});
                    await page.keyboard.press('Enter', {delay:1000});
                    await page.waitForTimeout(10000);
                }
                
            }else{
                console.log(confirmacao);
            }                
        }
        //Clicar em sim para baixar a certidão
        await page.click('#form\\:j_idt131', { delay: 2000 });
        await page.waitForTimeout(10000);
        await copyFile(`${paths.dirDownloadPadrao()}${process.env.BARRA}certidaonegativacriminal.pdf`, `${diretorio}${process.env.BARRA}${CPF}trf5.pdf`);
        let pasta = diretorio.split(`files${process.env.BARRA}`);
        console.log("Arquivo TRF5, PDF gerado com sucesso.");
        browser.close();
        await unlink(`${paths.dirDownloadPadrao()}${process.env.BARRA}certidaonegativacriminal.pdf`);
        resultado.push({diretorio: pasta[1], cpf: CPF, orgao: 'trf5', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS 1° GRAU'});
        return resultado;
    } catch (error) {        
        console.log("TRF 5 " + error);
        browser.close();
        return { erro: error, result: resultado };
    }

}