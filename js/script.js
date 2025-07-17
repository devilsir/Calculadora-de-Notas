
// Alterna abas principais
function mostrarAba(aba) {
  document.getElementById('abaPadrao').style.display = aba==='padrao'?'block':'none';
  document.getElementById('abaPersonalizado').style.display = aba==='personalizado'?'block':'none';
  document.getElementById('tabPadrao').classList.toggle('active', aba==='padrao');
  document.getElementById('tabPersonalizado').classList.toggle('active', aba==='personalizado');
  mostrarSubaba(aba,'instrucoes');
  mostrarHistorico(aba==='padrao'?'Padrao':'Personalizado');
}

// Alterna subabas
function mostrarSubaba(aba, sub){
  const prefix = aba==='padrao'?'Padrao':'Personalizado';
  document.getElementById(`conteudo${prefix}Instrucoes`).style.display = sub==='instrucoes'?'block':'none';
  document.getElementById(`conteudo${prefix}Calculadora`).style.display = sub==='calculadora'?'block':'none';
  document.getElementById(`subtab${prefix}Instrucoes`).classList.toggle('active', sub==='instrucoes');
  document.getElementById(`subtab${prefix}Calculadora`).classList.toggle('active', sub==='calculadora');
}


function mostrarErro(id, msg){
  const div = document.getElementById(id);
  div.className = "result error";
  div.innerText = msg;
}
function mostrarResultado(id, msg){
  const div = document.getElementById(id);
  div.className = "result";
  div.innerText = msg;
}


// Cálculo e salvamento - Aba Padrão
function calcularPadrao(){
  const nome = document.getElementById('nomeAlunoPadrao').value.trim();
  const total = parseFloat(document.getElementById('notaTotalPadrao').value);
  const media = parseFloat(document.getElementById('mediaMinimaPadrao').value);
  const qtd   = parseInt(document.getElementById('numQuestoesPadrao').value);
  const certos = parseInt(document.getElementById('acertosCompletosPadrao').value);
  const parciais = parseInt(document.getElementById('acertosParciaisPadrao').value);
  const pesoParcial = parseFloat(document.getElementById('pesoParcialPadrao').value);
  if(!nome) return mostrarErro('resultadoPadrao','Erro: Nome do aluno obrigatório.');
  const histKey = 'historico_Padrao';
  const h = JSON.parse(localStorage.getItem(histKey))||[];
  if(h.some(e=>e.nome.toLowerCase()===nome.toLowerCase())){
    return mostrarErro('resultadoPadrao','Erro: Já existe um aluno com esse nome.');
  }
  if(qtd<=0||isNaN(qtd)) return mostrarErro('resultadoPadrao','Erro: Número de questões inválido.');
  if(total<=0||isNaN(total)) return mostrarErro('resultadoPadrao','Erro: Valor total inválido.');
  const totalRes = certos+parciais;
  if(totalRes>qtd) return mostrarErro('resultadoPadrao','Erro: Soma de acertos maior que total.');
  const erros = qtd - totalRes;
  const nota = (certos + parciais*pesoParcial)*(total/qtd);
  const aprovado = nota>=media;
  const msg=`Aluno: ${nome}\nNota: ${nota.toFixed(2)}\nErros: ${erros}\nSituação: ${aprovado?'Acima da média':'Abaixo da média'}`;
  mostrarResultado('resultadoPadrao', msg);
  salvarHistorico('Padrao', nome, nota, aprovado);
  mostrarHistorico('Padrao');
}

// Criação e salvamento de modelos
function criarModelo(){
  const nomeProva = document.getElementById('nomeProva').value.trim();
  const qtd = parseInt(document.getElementById('numQuestoesPersonalizado').value);
  if(!nomeProva) return alert('Nome do modelo obrigatório.');
  if(qtd<=0) return alert('Número de questões inválido.');
  let html=`<table><tr><th>Questão</th><th>Peso</th></tr>`;
  for(let i=1;i<=qtd;i++){
    html+=`<tr><td>${i}</td><td><input type="number" id="pesoQ${i}" value="1" min="0"></td></tr>`;
  }
  html+=`</table><button onclick="salvarModelo()">Salvar Modelo</button>`;
  document.getElementById('tabelaModelo').innerHTML=html;
}
function salvarModelo(){
  const nomeProva = document.getElementById('nomeProva').value.trim();
  const media = parseFloat(document.getElementById('mediaMinimaPersonalizado').value);
  const valorTotal = parseFloat(document.getElementById('valorTotalPersonalizado').value);
  const pesoParcial = parseFloat(document.getElementById('pesoParcialPersonalizado').value);
  const qtd = parseInt(document.getElementById('numQuestoesPersonalizado').value);
  if(valorTotal<=0||isNaN(valorTotal)) return alert('Erro: Valor total inválido.');
  let pesos=[];
  for(let i=1;i<=qtd;i++){
    pesos.push(parseFloat(document.getElementById(`pesoQ${i}`).value));
  }
  let modelos = JSON.parse(localStorage.getItem('modelosProva'))||{};
  modelos[nomeProva]={qtd,media,valorTotal,pesoParcial,pesos};
  localStorage.setItem('modelosProva', JSON.stringify(modelos));
  atualizarDropdownModelos();
  alert('Modelo salvo!');
}

// Monta tabela de checkboxes após selecionar modelo
function carregarModelo(){
  const nome = document.getElementById('modelosSalvos').value;
  if(!nome) return;
  const m = JSON.parse(localStorage.getItem('modelosProva'))[nome];
  let html=`<table><tr><th>Questão</th><th>Correta</th><th>Parcial</th><th>Errada</th></tr>`;
  for(let i=0;i<m.qtd;i++){
    html+=`<tr><td>${i+1}</td>
      <td><input type="checkbox" id="certaQ${i}"></td>
      <td><input type="checkbox" id="parcialQ${i}"></td>
      <td><input type="checkbox" id="erradaQ${i}"></td>
    </tr>`;
  }
  html+=`</table>`;
  document.getElementById('tabelaModelo').innerHTML=html;
}

// Cálculo e salvamento - Aba Personalizado
function calcularPersonalizado(){
  const nomeAluno = document.getElementById('nomeAlunoPersonalizado').value.trim();
  const modeloNome = document.getElementById('modelosSalvos').value;
  if(!nomeAluno) return mostrarErro('resultadoPersonalizado','Erro: Nome do aluno obrigatório.');
  if(!modeloNome) return mostrarErro('resultadoPersonalizado','Erro: Selecione um modelo.');
  const tipoKey = `Personalizado_${modeloNome}`;
  const h = JSON.parse(localStorage.getItem(`historico_${tipoKey}`))||[];
  if(h.some(e=>e.nome.toLowerCase()===nomeAluno.toLowerCase())){
    return mostrarErro('resultadoPersonalizado','Erro: Já existe um aluno com esse nome.');
  }
  const m = JSON.parse(localStorage.getItem('modelosProva'))[modeloNome];
  let totalPesos=0, obtido=0;
  for(let i=0;i<m.qtd;i++){
    totalPesos+=m.pesos[i];
    const c = document.getElementById(`certaQ${i}`).checked;
    const p = document.getElementById(`parcialQ${i}`).checked;
    const e = document.getElementById(`erradaQ${i}`).checked;
    const marc = [c,p,e].filter(x=>x).length;
    if(marc!==1){
      return mostrarErro('resultadoPersonalizado', `Erro questão ${i+1}: selecione exatamente uma opção.`);
    }
    if(c) obtido+=m.pesos[i];
    else if(p) obtido+=m.pesos[i]*m.pesoParcial;
  }
  const nota = obtido*(m.valorTotal/totalPesos);
  const aprovado = nota>=m.media;
  const msg = `Prova: ${modeloNome}\nAluno: ${nomeAluno}\nNota: ${nota.toFixed(2)}\nSituação: ${aprovado?'Acima da média':'Abaixo da média'}`;
  mostrarResultado('resultadoPersonalizado', msg);
  salvarHistorico(tipoKey, nomeAluno, nota, aprovado);
  mostrarHistorico('Personalizado');
}

// Confirma limpeza
function confirmarLimpeza(tipo){
  if(confirm('Tem certeza que deseja limpar o histórico? Esta ação não pode ser desfeita.')){
    limparHistorico(tipo);
  }
}

// Salvamento de histórico com média e valor total
function salvarHistorico(tipo, nome, nota, aprovado){
  let h = JSON.parse(localStorage.getItem(`historico_${tipo}`))||[];
  let media, valorTotal;
  if(tipo==='Padrao'){
    media = parseFloat(document.getElementById('mediaMinimaPadrao').value);
    valorTotal = parseFloat(document.getElementById('notaTotalPadrao').value);
  } else {
    const mdl = tipo.replace('Personalizado_','');
    const m = JSON.parse(localStorage.getItem('modelosProva'))[mdl];
    media = m.media;
    valorTotal = m.valorTotal;
  }
  h.push({
    data: new Date().toLocaleString(),
    nome, nota: nota.toFixed(2), sit: aprovado?'Acima da média':'Abaixo da média',
    media, valorTotal
  });
  localStorage.setItem(`historico_${tipo}`, JSON.stringify(h));
}

// Exibe histórico com media e valor total
function mostrarHistorico(tipo){
  let key = tipo==='Personalizado'?null:tipo;
  if(tipo==='Personalizado'){
    const mdl = document.getElementById('modelosSalvos').value;
    if(!mdl){
      document.getElementById('historicoPersonalizado').innerText='Selecione um modelo para ver o histórico.';
      return;
    }
    key = `Personalizado_${mdl}`;
  }
  const h = JSON.parse(localStorage.getItem(`historico_${key}`))||[];
  const div = tipo==='Padrao'?document.getElementById('historicoPadrao'):document.getElementById('historicoPersonalizado');
  if(h.length===0){
    div.innerText = 'Nenhum histórico salvo.';
    return;
  }
  let txt = 'Histórico:\n';
  h.slice(-10).reverse().forEach(e=>{
    txt += `\n[${e.data}]\nAluno: ${e.nome}\nNota: ${e.nota}\nSituação: ${e.sit}\nMédia da prova: ${e.media}\nValor total: ${e.valorTotal}\n`;
  });
  div.innerText = txt;
}

// Limpar histórico
function limparHistorico(tipo){
  let key = tipo==='Personalizado'?`Personalizado_${document.getElementById('modelosSalvos').value}`:tipo;
  localStorage.removeItem(`historico_${key}`);
  mostrarHistorico(tipo);
}

// Exportar CSV
function exportarCSV(tipo){
  let key = tipo === 'Personalizado' 
    ? `Personalizado_${document.getElementById('modelosSalvos').value}` 
    : tipo;

  const h = JSON.parse(localStorage.getItem(`historico_${key}`)) || [];
  if(h.length === 0){
    alert('Nenhum histórico.');
    return;
  }

  let csv = 'Data;Aluno;Nota;Situação;Média da prova;Valor total\n';
  h.forEach(e => {
    csv += `${e.data};${e.nome};${e.nota};${e.sit};${e.media};${e.valorTotal}\n`;
  });

  // Cria BOM
  const BOM = new Uint8Array([0xEF, 0xBB, 0xBF]);
  const blob = new Blob([BOM, csv], {type: 'text/csv;charset=utf-8;'});

  const link = document.createElement('a');
  link.href = URL.createObjectURL(blob);
  link.download = 'historico.csv';
  link.click();
}
function excluirModelo() {
  const modeloNome = document.getElementById('modelosSalvos').value;
  if(!modeloNome){
    alert('Selecione um modelo para excluir.');
    return;
  }
  if(confirm('Tem certeza que deseja excluir este modelo?\nO histórico também será deletado e perdido.')){
    let modelos = JSON.parse(localStorage.getItem('modelosProva')) || {};
    delete modelos[modeloNome];
    localStorage.setItem('modelosProva', JSON.stringify(modelos));
    localStorage.removeItem(`historico_Personalizado_${modeloNome}`);
    atualizarDropdownModelos();
    document.getElementById('tabelaModelo').innerHTML = '';
    document.getElementById('historicoPersonalizado').innerText = 'Nenhum histórico salvo.';
    alert('Modelo e histórico excluídos.');
  }
}


// Inicialização
function atualizarDropdownModelos(){
  const sel = document.getElementById('modelosSalvos');
  sel.innerHTML = '<option value="">Selecione</option>';
  const modelos = JSON.parse(localStorage.getItem('modelosProva'))||{};
  for(const nome in modelos){
    sel.innerHTML += `<option value="${nome}">${nome}</option>`;
  }
}

atualizarDropdownModelos();
mostrarHistorico('Padrao');
