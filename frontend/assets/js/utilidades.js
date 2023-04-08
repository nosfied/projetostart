
let btLimpar = document.getElementById('btLimpar');
btLimpar.addEventListener('click', async (event)=>{
    event.preventDefault();
    document.location.reload();
})

let btProcessar = document.getElementById('btProcessar');
btProcessar.addEventListener('click', (event) =>{
    event.preventDefault();
    let botoesOrgao = document.getElementsByClassName('btOrgao');
    let selecionado = false;
    for (const btOrgao of botoesOrgao) {
        let boxs = document.getElementsByClassName(btOrgao.getAttribute('opcoes'))
        for (const bx of boxs) {
            let select = bx.getAttribute('select');
            console.log(select);
            if(select != '0'){
                selecionado = true;
            }
            if(selecionado == true) btOrgao.click();
        }
        selecionado = false;
    }
})


// Código envolvendo os botões e linhas de resultados
let botoes = document.getElementsByClassName('btnList');
for (const bt of botoes) {
    
bt.addEventListener('click', () =>{
    let opcoes = document.getElementById(bt.getAttribute('name'));
    if(opcoes.getAttribute('visibilidade') == 'nao'){
        opcoes.classList.remove('opcaoOculta');
        opcoes.setAttribute('visibilidade', 'sim');
        opcoes.style.backgroundColor = '#83b8e0';            
        bt.parentElement.parentElement.parentElement.classList.add('opcaoOculta');
    }

})
}
//funcionalidade para fechar as opções órgãos para pesquisa
let fechar = document.getElementsByClassName('fechar');
for (const fx of fechar) {
    fx.addEventListener('click', function(event){
        event.preventDefault();
        let cardOpcoes = fx.parentElement;
        let linha = cardOpcoes.parentElement;
        linha.parentElement.parentElement.parentElement.parentElement.classList.add('opcaoOculta');
        linha.parentElement.parentElement.parentElement.parentElement.setAttribute('visibilidade', 'nao');
        linha.parentElement.parentElement.parentElement.parentElement.previousElementSibling.classList.remove('opcaoOculta');
        
    });
}


// Código que marca as caixas de seleção de opções das certidões como selecionadas - 0 ou 1
let boxs = document.getElementsByClassName('box');
for (const box of boxs) {
    box.addEventListener('click', ()=>{
        let bx = box.getAttribute('select');
        if(bx == 0){
            box.setAttribute('select', '1');
        }else{
            box.setAttribute('select', '0');            
        }
    })
}

function carregaResult(result, linha, sitio, sitio2) {
    const linhaResultado = document.getElementById(linha);
    let org = linha.split('x')     
    if(!result.erroValid){
        if(!result.erro){
            linhaResultado.innerHTML = '';
            for (const res of result) {
                if(res.cpf.length > 15){
                    linhaResultado.innerHTML += `<tr><td colspan="2"><p class="msgSucesso">${res.documento}</p></td>
                    <td><a href="${res.cpf}" target="_blank">Download</a></td></tr>`
                }else{
                    linhaResultado.innerHTML += `<tr><td colspan="2"><p class="msgSucesso">${res.documento}</p></td>
                    <td colspan="2"><a href="/pesquisa/files/${res.diretorio}/${res.cpf}/${res.orgao}" target="_blank">Download</a></td></tr>`
                }                    
            }
            
        }else if(result.erro && result.result != ''){
            linhaResultado.innerHTML = '';
            for (const res of result.result) {
                if(res.cpf.length > 15){
                    linhaResultado.innerHTML += `<tr><td colspan="2"><p class="msgSucesso">${res.documento}</p></td>
                    <td><a href="${res.cpf}" target="_blank">Download</a></td></tr>`
                }else{
                    linhaResultado.innerHTML += `<tr><td colspan="2"><p class="msgSucesso">${res.documento}</p></td>
                    <td colspan="2"><a href="/pesquisa/files/${res.diretorio}/${res.cpf}/${res.orgao}" target="_blank">Download</a></td></tr>`
                }                    
            }            

            if(sitio2 == 'hg'){
                linhaResultado.innerHTML += `<tr><td colspan="2"><p class="msgErro">Não foi possível processar o pedido para ${org[1].toUpperCase()}, verifique os dados e tente novamente em alguns instantes.</p></td>
                <td colspan="2"><a href="${sitio}" target="_blank">-> Link da Busca</a><br><a href="${sitio2}" target="_blank">-> Link da Busca</a></td></tr>`
            }else{
                linhaResultado.innerHTML += `<tr><td colspan="2"><p class="msgErro">Não foi possível processar o pedido para ${org[1].toUpperCase()}, verifique os dados e tente novamente em alguns instantes.</p></td>
                <td colspan="2"><a href="${sitio}" target="_blank">-> Link da Busca</a></td></tr>`
            }                
            
        }else{
            if(sitio2 == 'hg'){                
                linhaResultado.innerHTML = `<tr><td colspan="2"><p class="msgErro">Não foi possível processar o pedido para ${org[1].toUpperCase()}, verifique os dados e tente novamente em alguns instantes.</p></td>
                <td colspan="2"><a href="${sitio}" target="_blank">-> Link da Busca</a><br><a href="${sitio2}" target="_blank">-> Link da Busca</a></td></tr>`
            }else{
                linhaResultado.innerHTML = `<tr><td colspan="2"><p class="msgErro">Não foi possível processar o pedido para ${org[1].toUpperCase()}, verifique os dados e tente novamente em alguns instantes.</p></td>
                <td colspan="2"><a href="${sitio}" target="_blank">-> Link da Busca</a></td></tr>`
            } 
        }
    }else{
        linhaResultado.innerHTML = '';
        for (const err of result.erroValid) {            
            linhaResultado.innerHTML += `<tr><td style="width: 85%;" colspan="2"><p class="msgErro">${err}</p></td>
            <td colspan="2"><p class="msgErro">ATENÇÃO!</p></td></tr>`                           
        }
        
    }
}


let botoesOrgao = document.getElementsByClassName('btOrgao');
for (const btao of botoesOrgao) {
    btao.addEventListener('click', async (event)=>{
        event.preventDefault();
        let rota = btao.getAttribute('rota');
        let link = btao.getAttribute('link');
        let link2 = btao.getAttribute('link2');
        let opcaoPesq = btao.getAttribute('opcoes');
        let valorComarca = btao.getAttribute('comarca');

        const linhaResultado = document.getElementById(opcaoPesq);
        linhaResultado.innerHTML = `<td colspan="4"><div id="prog" class="progress">
        <div class="progress-bar progress-bar-striped progress-bar-animated" aria-label="Example with label" role="progressbar" aria-valuenow="100" aria-valuemin="0" aria-valuemax="100" style="width: 100%">Processando... Pode levar alguns minutos, Aguarde!</div>   </div></td>`

        let opcoesPesq = document.getElementsByClassName(opcaoPesq);
        
        let linkOrgao = document.getElementById(link);
        let linkOrgao2 = false;
        let valorLinkOrgao2 = document.getElementById(link2);
        if (valorLinkOrgao2 != null){
            linkOrgao2 = valorLinkOrgao2;
        }
        let docs = [];
        for (const op of opcoesPesq) {
            if(op.getAttribute('select') == '1'){
                docs.push(op.getAttribute('value'))
            }
        }

        let generosPesq = document.getElementsByClassName('generoPesq');
        let genero;
        for (const generoPesq of generosPesq) {
            if(generoPesq.checked){
                genero = generoPesq.value;
            }
        }

        let comarca = document.getElementById(valorComarca).value;        
        let ufRg = document.getElementById('ufRg').value;        
        let estadoCivil = document.getElementById('estadoCivil').value;        
        let nome = document.getElementById('pesquisaNome');
        let dtNascimento = document.getElementById('dtNascimento');
        let rg = document.getElementById('pesquisaRg');
        let nomeMae = document.getElementById('nomeMae');
        let nomePai = document.getElementById('nomePai');
        let cpf = document.getElementById('pesquisaCpf');
        let token = document.getElementById('token');        
        let email = document.getElementById('pesquisaEmail');
        let orgaoExp = document.getElementById('orgaoExp');        
        let endereco = document.getElementById('endereco');        
        let naturalidade = document.getElementById('naturalidade');        
        let estadoCivilTjPI = document.getElementById('estadoCivilTjPI').value;        

        let objeto = {
            "_csrf": token.value,
            "nome": nome.value,
            "nomeMae": nomeMae.value,
            "nomePai": nomePai.value,
            "cpf": cpf.value,
            "rg": rg.value,
            "documento": docs,
            "sexo": genero,
            "nascimento": dtNascimento.value,
            "comarca": comarca,
            "email": email.value,
            "orgaoExp": orgaoExp.value,
            "ufRg": ufRg,
            "endereco": endereco.value,
            "estadoCivil": estadoCivil,
            "naturalidade": naturalidade.value,
            "estadoCivilTjPI": estadoCivilTjPI,

        }            
        let body = JSON.stringify(objeto);       
        
          try {            
            
            let result = await fetch(rota, {
                method: 'post',
                body: body,
                credentials: 'include',
                headers: new Headers({ 
                    'Accept': 'application/json',
                    'Content-Type': 'application/json',                   
                    'XSRF-TOKEN': token.value
                  })
            })
            let pResult = await result.json();
            carregaResult(pResult, opcaoPesq, linkOrgao.value, linkOrgao2.value);            

          } catch(e) {
            console.log(e);
          }           

    })
}
