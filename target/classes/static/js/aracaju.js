const CHAVE_API = 'AIzaSyA3k11GeQEJaOOs-8p0-h1k5ZYsUl5B5oQ';

const LOCAIS = [
  { id:1,  nome:'Arcos da Orla de Atalaia',              bairro:'Atalaia',          lat:-10.98888, lng:-37.04821, svLat:-10.98881, svLng:-37.04819, heading:90,  pitch:5,  fov:80 },
  { id:2,  nome:'Passarela do Caranguejo',               bairro:'Atalaia',          lat:-10.98570, lng:-37.04650, svLat:-10.98570, svLng:-37.04650, heading:0,   pitch:5,  fov:90 },
  { id:3,  nome:'Catedral Metropolitana de Aracaju',     bairro:'Centro',           lat:-10.91530, lng:-37.04970, svLat:-10.91560, svLng:-37.04940, heading:45,  pitch:10, fov:80 },
  { id:4,  nome:'Praça Fausto Cardoso',                  bairro:'Centro',           lat:-10.91220, lng:-37.05200, svLat:-10.91220, svLng:-37.05200, heading:180, pitch:5,  fov:90 },
  { id:5,  nome:'Mercado Municipal Antônio Franco',      bairro:'Centro',           lat:-10.91580, lng:-37.05510, svLat:-10.91580, svLng:-37.05510, heading:270, pitch:0,  fov:90 },
  { id:6,  nome:'Orla do Mosqueiro',                     bairro:'Mosqueiro',        lat:-11.07300, lng:-37.08600, svLat:-11.07300, svLng:-37.08600, heading:90,  pitch:5,  fov:90 },
  { id:7,  nome:'Parque da Sementeira',                  bairro:'Jardins',          lat:-10.92780, lng:-37.05280, svLat:-10.92780, svLng:-37.05280, heading:0,   pitch:5,  fov:90 },
  { id:8,  nome:'Terminal Rodoviário Luiz Garcia',       bairro:'Circular',         lat:-10.93990, lng:-37.07290, svLat:-10.93990, svLng:-37.07290, heading:135, pitch:5,  fov:90 },
  { id:9,  nome:'Estádio Lourival Baptista (Batistão)',  bairro:'São José',         lat:-10.92420, lng:-37.07040, svLat:-10.92420, svLng:-37.07040, heading:200, pitch:5,  fov:90 },
  { id:10, nome:'Shopping Riomar Aracaju',               bairro:'Coroa do Meio',    lat:-10.97030, lng:-37.05510, svLat:-10.97030, svLng:-37.05510, heading:0,   pitch:5,  fov:90 },
  { id:11, nome:'Projeto Tamar — Oceanário',             bairro:'Atalaia',          lat:-10.98220, lng:-37.04390, svLat:-10.98220, svLng:-37.04390, heading:270, pitch:5,  fov:90 },
  { id:12, nome:'Ponte do Imperador',                    bairro:'Centro',           lat:-10.90870, lng:-37.05440, svLat:-10.90870, svLng:-37.05440, heading:315, pitch:5,  fov:90 },
  { id:13, nome:'Igreja de São Salvador',                bairro:'Centro',           lat:-10.91950, lng:-37.05010, svLat:-10.91950, svLng:-37.05010, heading:270, pitch:10, fov:80 },
  { id:14, nome:'Campus UFS',                            bairro:'Jardim Rosa Elze', lat:-10.92420, lng:-37.10490, svLat:-10.92420, svLng:-37.10490, heading:90,  pitch:5,  fov:90 },
  { id:15, nome:'Orla Pôr do Sol',                       bairro:'Coroa do Meio',    lat:-10.96920, lng:-37.05250, svLat:-10.96920, svLng:-37.05250, heading:270, pitch:5,  fov:90 },
];

const CFG = { totalRodadas:5, tempoRodada:60, centro:[-10.9472,-37.0731], zoom:12, zoomMin:11, zoomMax:17, limites:[[-11.22,-37.32],[-10.70,-36.82]] };
const COR_CIANO = '#00e5ff';
const COR_ROSA  = '#f0176f';

const E = { rodada:0, pts:0, locais:[], chute:null, mapa:null, marcChute:null, timerID:null, tempo:0, historico:[], bloqueado:false };

function urlSV(l) {
  return `https://www.google.com/maps/embed/v1/streetview?${new URLSearchParams({ key:CHAVE_API, location:`${l.svLat},${l.svLng}`, heading:l.heading, pitch:l.pitch, fov:l.fov })}`;
}

function iniciarJogo() {
  E.rodada=0; E.pts=0; E.historico=[]; E.locais=shuffle([...LOCAIS]).slice(0,CFG.totalRodadas);
  document.getElementById('tela-inicio').style.display='none';
  montarMapa();
  atualizarBarraPts();
  proximaRodada();
}

function montarMapa() {
  if (E.mapa) return;
  E.mapa = L.map('mapa-leaflet',{ center:CFG.centro, zoom:CFG.zoom, minZoom:CFG.zoomMin, maxZoom:CFG.zoomMax, maxBounds:CFG.limites, maxBoundsViscosity:.9, zoomControl:true, attributionControl:false });
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(E.mapa);
  E.mapa.on('click', ev => {
    if (E.bloqueado) return;
    if (E.marcChute) E.marcChute.remove();
    E.marcChute = L.marker([ev.latlng.lat,ev.latlng.lng],{icon:mkIcon(COR_CIANO,'Seu chute')}).addTo(E.mapa);
    E.chute = {lat:ev.latlng.lat,lng:ev.latlng.lng};
    document.getElementById('btn-confirmar').disabled=false;
    const d=document.getElementById('dica-mapa'); d.textContent='✓ Marcado! Confirme.'; d.classList.add('marcado');
  });
}

function mkIcon(cor,titulo) {
  return L.divIcon({ className:'', html:`<div title="${titulo}" style="width:16px;height:16px;border-radius:50%;background:${cor};border:2.5px solid #fff;box-shadow:0 0 0 2.5px ${cor},0 3px 8px rgba(0,0,0,.55);"></div>`, iconSize:[16,16], iconAnchor:[8,8] });
}

function proximaRodada() {
  E.rodada++; E.chute=null; E.bloqueado=false;
  if (E.marcChute) { E.marcChute.remove(); E.marcChute=null; }
  if (E.mapa) E.mapa.setView(CFG.centro,CFG.zoom);
  document.getElementById('btn-confirmar').disabled=true;
  const d=document.getElementById('dica-mapa'); d.textContent='Clique no mapa para marcar seu chute.'; d.classList.remove('marcado');
  atualizarDots(); atualizarHudPts();
  carregarSV(E.locais[E.rodada-1]);
  iniciarTimer();
}

function carregarSV(l) {
  const iv=document.getElementById('iframe-sv'), sk=document.getElementById('esqueleto-sv');
  sk.classList.remove('oculto'); iv.src='';
  requestAnimationFrame(()=>{ iv.src=urlSV(l); });
  iv.onload=()=>setTimeout(()=>sk.classList.add('oculto'),700);
}

function iniciarTimer() {
  clearInterval(E.timerID); E.tempo=CFG.tempoRodada; renderTimer();
  E.timerID=setInterval(()=>{ E.tempo--; renderTimer(); if(E.tempo<=0){clearInterval(E.timerID);confirmarChute(true);} },1000);
}

function renderTimer() {
  const el=document.getElementById('num-timer'), hd=document.getElementById('hud-timer');
  if(el) el.textContent=E.tempo;
  if(hd) hd.classList.toggle('urgente',E.tempo<=10);
}

function atualizarDots() {
  document.querySelectorAll('.dot').forEach((d,i)=>{ d.classList.remove('atual','feita'); if(i<E.rodada-1)d.classList.add('feita'); else if(i===E.rodada-1)d.classList.add('atual'); });
  const r=document.getElementById('label-rodada'), s=document.getElementById('label-rodada-sub');
  if(r) r.textContent=`RODADA ${E.rodada} / ${CFG.totalRodadas}`;
  if(s) s.textContent=`${CFG.totalRodadas-E.rodada} restantes`;
}

function atualizarHudPts() {
  animarContador(document.getElementById('valor-pts-sidebar'),E.pts,600,true);
}

function atualizarBarraPts() {
  const f=document.getElementById('barra-pts-fill');
  if(f) f.style.width=`${Math.min(100,(E.pts/(CFG.totalRodadas*1000))*100)}%`;
}

function confirmarChute(timeout=false) {
  if(E.bloqueado) return;
  E.bloqueado=true; clearInterval(E.timerID);
  const l=E.locais[E.rodada-1]; let dist=0,pts=0;
  if(E.chute){ dist=calcDist(E.chute.lat,E.chute.lng,l.lat,l.lng); pts=calcPts(dist); }
  E.pts+=pts; E.historico.push({l,chute:E.chute,dist,pts});
  atualizarHudPts(); atualizarBarraPts();
  mostrarResultado(l,dist,pts);
}

function mostrarResultado(l,dist,pts) {
  const ov=document.createElement('div'); ov.className='overlay-resultado';
  const divM=document.createElement('div'); divM.id='mapa-resultado';
  const pan=document.createElement('div'); pan.className='painel-resultado';
  const pct=Math.round((pts/1000)*100);
  const ultima=E.rodada>=CFG.totalRodadas;
  const dtxt=dist<1000?`${Math.round(dist)} m do local`:`${(dist/1000).toFixed(2)} km do local`;
  pan.innerHTML=`
    <div class="resultado-pts-bloco"><p class="rotulo">PONTOS GANHOS</p><p class="valor" id="val-pts-rodada">0</p></div>
    <div class="barra-pts-resultado"><div class="barra-pts-resultado-fill" id="barra-res-fill"></div></div>
    <div class="resultado-dist"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s-8-4.5-8-11.8A8 8 0 0 1 12 2a8 8 0 0 1 8 8.2c0 7.3-8 11.8-8 11.8z"/><circle cx="12" cy="10" r="3"/></svg>${E.chute?dtxt:'Sem chute — 0 pontos'}</div>
    <div class="resultado-local-info"><p class="rotulo">LOCAL CORRETO</p><p class="nome">${l.nome}</p><p class="bairro">${l.bairro} — Aracaju, SE</p></div>
    <p class="resultado-totais">TOTAL: <span>${E.pts.toLocaleString('pt-BR')}</span> PTS · ${E.rodada}/${CFG.totalRodadas}</p>
    <button class="btn-proxima" id="btn-proxima">${ultima?'VER RESULTADO FINAL':'PRÓXIMA RODADA →'}</button>`;
  const mod=document.createElement('div'); mod.className='modal-resultado';
  mod.appendChild(divM); mod.appendChild(pan); ov.appendChild(mod); document.body.appendChild(ov);
  const mr=L.map('mapa-resultado',{center:[l.lat,l.lng],zoom:13,zoomControl:true,attributionControl:false});
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',{maxZoom:19}).addTo(mr);
  L.marker([l.lat,l.lng],{icon:mkIcon(COR_ROSA,l.nome)}).bindTooltip(l.nome,{permanent:true,direction:'top',offset:[0,-12]}).addTo(mr);
  if(E.chute){
    L.marker([E.chute.lat,E.chute.lng],{icon:mkIcon(COR_CIANO,'Seu chute')}).bindTooltip('Seu chute',{permanent:true,direction:'top',offset:[0,-12]}).addTo(mr);
    L.polyline([[E.chute.lat,E.chute.lng],[l.lat,l.lng]],{color:'#ffe500',weight:2,dashArray:'7 7',opacity:.85}).addTo(mr);
    mr.fitBounds(L.featureGroup([L.marker([E.chute.lat,E.chute.lng]),L.marker([l.lat,l.lng])]).getBounds().pad(.35));
  }
  setTimeout(()=>{ animarContador(document.getElementById('val-pts-rodada'),pts,900); setTimeout(()=>{ const f=document.getElementById('barra-res-fill'); if(f)f.style.width=pct+'%'; },120); },200);
  document.getElementById('btn-proxima').addEventListener('click',()=>{ mr.remove(); ov.remove(); if(ultima)encerrarJogo(); else proximaRodada(); });
}

function encerrarJogo() {
  const ac=E.historico.filter(h=>h.chute&&h.dist<500).length;
  window.location.href=`fim-de-jogo.html?${new URLSearchParams({ jogo:'ARACAJU GEOGUESSR', slug:'aracaju', pontos:E.pts, acertos:ac, erros:CFG.totalRodadas-ac, tempo:Math.max(0,(CFG.totalRodadas*CFG.tempoRodada)-E.tempo) })}`;
}

function calcDist(a,b,c,d){ const R=6371000,dL=rad(c-a),dG=rad(d-b),x=Math.sin(dL/2)**2+Math.cos(rad(a))*Math.cos(rad(c))*Math.sin(dG/2)**2; return R*2*Math.atan2(Math.sqrt(x),Math.sqrt(1-x)); }
function calcPts(m){ if(m<=100)return 1000; if(m>=8000)return 0; return Math.round(1000*Math.exp(-m/2500)); }
function rad(g){ return g*Math.PI/180; }
function shuffle(a){ for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]];} return a; }

document.addEventListener('DOMContentLoaded', async () => {
  const sessao = await exigirSessao();
  if (!sessao) return;
  montarCabecalho(sessao.nomeUsuario);
  document.getElementById('btn-iniciar-jogo').addEventListener('click', iniciarJogo);
  document.getElementById('btn-confirmar').addEventListener('click', () => confirmarChute(false));
});
