const paths = require('../paths/paths');
const { readdir } = require('node:fs');
const { rm } = require('node:fs/promises');
let request = require('request-promise');



exports.limparArquivosAntigos = async function () {
    
    readdir(paths.files(), async (err, files)=>{
        for (const file of files){
            
            if(file < (Date.now() - 60*60*1000)){
                rm(paths.files()+`${process.env.BARRA}`+file, {recursive:true, force:true});
            }                
        } 
    });
}

//Função para aguardar intervalo de tempo    
async function sleep(millisecondsCount) {
    if (!millisecondsCount) {
        return;
    }
    return new Promise(resolve => setTimeout(resolve, millisecondsCount)).catch();
}

//Função que faz requição para o 2captcha
async function curl(options){

    return new Promise((resolve, reject) => {
        request(options, (err, res, body) => {
            if(err)
                return reject(err);
            resolve(body);    
        });
    });

}

exports.resolve_captcha_normal = async function (imagem){
    
    const KEY_2CAPTCHA = `${process.env.KEY}`;
    let url = `http://2captcha.com/in.php`;    
    let body = {
        "method": "base64",
        "key": KEY_2CAPTCHA,
        "body": imagem        
    };
    body = JSON.stringify(body);

    let response = await curl({
        url: url,
        method: "POST",
        body: body
    });
        
    let resposta = response.split('|');                       
    let captcha_id = resposta[1];
    console.log("Deu certo, id captcha: "+captcha_id);  
        
    while (1) {
            
        await sleep(10000);
        console.log("Verificando se o Captcha está pronto...");

        let result = await curl({
        url: `http://2captcha.com/res.php?key=${process.env.KEY}&action=get&id=${captcha_id}&json=true`,
        method: "GET"
        });
        let resultado = JSON.parse(result);
        console.log(resultado);

        if(resultado.status == 1)
            return resultado.request;
        else if(resultado.request != 'CAPCHA_NOT_READY')
            return false;
    }      

}

exports.pegarCookies = async function (sitio){

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
        url: sitio,
        proxy: super_proxy,
        rejectUnauthorized: false,
        headers: {'User-Agent': user_agent}
    };

    let cookies = await request(options)
    .then(function(data){ console.log("ok, pagina da url"); },
        function(err){ console.error(err); });
        let cookiesTrf3 = cookieJar.getCookieString(sitio);
        return cookiesTrf3;
}