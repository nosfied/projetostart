const puppeteer = require('puppeteer-extra');
const RecaptchaPlugin = require('puppeteer-extra-plugin-recaptcha');
let request = require('request-promise');
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

async function pegarCookiesTrf3(){

    //implementação e credenciais bright data
    const cookieJar = request.jar();
    request = request.defaults({jar: cookieJar});
    var username = 'lum-customer-hl_31c0867f-zone-unblocker';
    var password = 'f8fx0rhf0tue';
    var port = 22225;
    var user_agent = 'Mozilla/5.0 (Windows NT 6.1) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/41.0.2228.0 Safari/537.36';
    var session_id = (1000000 * Math.random())|0;
    var super_proxy = 'http://'+username+'-country-br-session-'+session_id+':'+password+'@zproxy.lum-superproxy.io:'+port;
    var options = {
        url: 'https://web.trf3.jus.br/certidao-regional/',
        proxy: super_proxy,
        rejectUnauthorized: false,
        headers: {'User-Agent': user_agent}
    };

    let cookies = await request(options)
    .then(function(data){ console.log("ok, pagina da url"); },
        function(err){ console.error(err); });
        let cookiesTrf3 = cookieJar.getCookieString('https://web.trf3.jus.br/certidao-regional/');
        return cookiesTrf3;
}  

exports.trf3 = async (dados) =>{

    console.log("TRF3 Processando...");
    const SITE_URL = "https://www.trf3.jus.br/";
    const CAPTCHA_SITE_KEY = "6LdDCtAZAAAAAOMqmEijWlAhOAvdXLukZCLWmwkD";
    const ACTION = "t";
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
        // let cookies = await pegarCookiesTrf3();
        // console.log(cookies);    
        // await page.setRequestInterception(true);    
        // await page.on('request', request => {
        //     //Adicionar cookie válido à requisição para simular a primeira tentativa.
        //     request.continue({

        //         "headers": {
                
        //             "cookie" : `${cookies}`
        //             //`${cookies}`            
        //         }                            

        //     });        
                
        // });
        //Alterar User-Agent para como se fosse um navegador com headless:false a fim de evitar Access Denied
        //await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36');    
        await page.goto(SITE_URL);
        await page.waitForTimeout(3000);
        await page.click('body > div.cc-window.cc-banner.cc-type-info.cc-theme-classic.cc-bottom.cc-color-override--816177166 > div > a', { delay: 2000 });        
        await page.goto(SITE_URL, {waitUntil: 'networkidle2'});
        await page.waitForSelector('#conteudo > section.secao.destaques.secao-destaques.segunda-secao-destaques > div:nth-child(1) > a > div > span');
        await page.click('#conteudo > section.secao.destaques.secao-destaques.segunda-secao-destaques > div:nth-child(1) > a > div > span', {delay:2000});    
        await page.waitForTimeout(5000);            
    
        let pag = await browser.pages();
        //console.log(pag);        
        await pag[2].waitForTimeout(3000);    
        await pag[2].click('body > div > main > div > div:nth-child(1) > div > a',{delay:2000});
        await pag[2].waitForSelector('#Tipo');    
                    
        //selecionar o órgão -> clique
        await pag[2].click('#Tipo', {delay:2000});        
        await pag[2].keyboard.press('ArrowDown', {delay:1000});        
        await pag[2].keyboard.press('ArrowDown', {delay:1000});
        await pag[2].keyboard.press('Enter', {delay:1000});
        await pag[2].click('#TipoDeDocumento', {delay:2000});
        await pag[2].keyboard.press('ArrowDown', {delay:1000});        
        await pag[2].keyboard.press('Enter', {delay:1000});
        await pag[2].click('#Documento', {delay:2000});
        await pag[2].keyboard.type(CPF,{delay:100});
        await pag[2].click('#Nome', {delay:2000});
        await pag[2].keyboard.type(NOME,{delay:100});
        await pag[2].click('#TipoDeAbrangencia', {delay:2000});
        await pag[2].keyboard.press('ArrowDown', {delay:1000});        
        await pag[2].keyboard.press('ArrowDown', {delay:1000});
        await pag[2].keyboard.press('ArrowDown', {delay:1000});
        await pag[2].keyboard.press('Enter', {delay:1000});
        await pag[2].keyboard.press('Tab', {delay:3000});
        await pag[2].keyboard.press('Enter', {delay:1000});
        await pag[2].waitForTimeout(3000);
        
        //Tela Captcha presente?
        let telaCaptcha = await pag[2].$$eval('div', tags => {
            let desafioCaptcha;
            let divs = tags.map(tag => {
                if(tag.style.backgroundColor == 'rgb(255, 255, 255)' && tag.style.visibility == 'visible'){
                    return tag.style.visibility;
                }
            });
            divs.filter(tela =>{
                if(tela == 'visible')
                desafioCaptcha = tela;
            });
            return desafioCaptcha;            
        });
        console.log(telaCaptcha);

        if(telaCaptcha == 'visible') {        
            console.log("TRF3: Processo interrompido pelo Captcha. Tentando solucionar...");            
            let quebrarCaptcha = await pag[2].solveRecaptchas();
            console.log(quebrarCaptcha);
            await pag[2].waitForTimeout(4000);
            await pag[2].click('#submit', {delay:2000});                    
        }else{
            await pag[2].click('#submit', {delay:2000});
        }
        await pag[2].waitForTimeout(7000);
        //Gerar arquivo pdf
        let botaoPrint = await pag[2].$eval('#ContainerImpressaoCertidao > p:nth-child(2) > img', bt => bt.tagName);
        if(botaoPrint) {
            console.log(botaoPrint);
            let diretorio = await mkdir(paths.files()+`${process.env.BARRA}`+Date.now(), {recursive:true}, (err, dir)=>{
                return dir;
            });
            await pag[2].pdf({ path: `${diretorio}${process.env.BARRA}${CPF}trf3.pdf`, format: 'A4', scale: 0.98 });
            let pasta = diretorio.split(`files${process.env.BARRA}`);                    
            console.log("Arquivo TRF3, PDF gerado com sucesso.");
            browser.close();
            resultado.push({ diretorio: pasta[1], cpf: CPF, orgao: 'trf3', documento: 'Certidão, AÇÕES E EXECUÇÕES CRIMINAIS 1° GRAU' });
            return resultado;
        }       

    } catch (error) {        
        console.log("TRF 3 " + error);
        browser.close();
        return { erro: error, result: resultado };
    }
}           
    
    
    
    
