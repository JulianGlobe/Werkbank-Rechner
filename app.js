/* Browser-only app. No analytics, backend or external dependencies. */
(() => {
  const {recipes,calculate}=Workbench, $=id=>document.getElementById(id);
  const fmt=n=>n.toLocaleString('de-DE'), amount=(name,n)=>name==='Geld'?`${fmt(n)} $`:`${fmt(n)} ×`;
  const icons={'Materialien':'▱','Labor':'⚗','Lager & Werkstatt':'▣','Elektronik':'⌁','Ausrüstung':'⚒','Fahrzeug':'◉','Magazine':'▥'};
  const key='werkbank-plan-v1'; let plan={},category='Alle',mode='base',timer;
  try { const saved=JSON.parse(localStorage.getItem(key)||'{}'); if(saved&&typeof saved==='object') for(const r of recipes) if(Number.isSafeInteger(saved[r.id])&&saved[r.id]>0&&saved[r.id]<=999999) plan[r.id]=saved[r.id]; } catch {}
  function save(){try{localStorage.setItem(key,JSON.stringify(plan));}catch{$('save-note').textContent='Speichern im Browser ist hier nicht verfügbar.';}}
  function notify(text){$('toast').textContent=text;$('toast').classList.add('show');clearTimeout(timer);timer=setTimeout(()=>$('toast').classList.remove('show'),2500);}
  function setQty(id,value){const n=Math.min(999999,Math.max(0,Math.floor(Number(value)||0)));if(n)plan[id]=n;else delete plan[id];save();renderPlan();const input=document.querySelector(`[data-qty="${id}"]`);if(input)input.value=n||'';const card=document.querySelector(`[data-card="${id}"]`);if(card)card.classList.toggle('selected',n>0);}
  const cats=['Alle',...new Set(recipes.map(r=>r.category))];
  function renderCats(){$('categories').replaceChildren(...cats.map(c=>{const b=document.createElement('button');b.textContent=c;b.className=c===category?'active':'';b.setAttribute('aria-pressed',c===category);b.onclick=()=>{category=c;renderCats();renderRecipes();};return b;}));}
  function renderRecipes(){
    const term=$('search').value.trim().toLocaleLowerCase('de');
    const list=recipes.filter(r=>(category==='Alle'||r.category===category)&&`${r.name} ${Object.keys(r.ingredients).join(' ')}`.toLocaleLowerCase('de').includes(term));
    $('count').textContent=`${list.length} ${list.length===1?'Rezept':'Rezepte'}`;$('empty').hidden=!!list.length;
    $('recipes').innerHTML=list.map(r=>`<article class="recipe ${plan[r.id]?'selected':''}" data-card="${r.id}"><div class="item-icon" aria-hidden="true">${icons[r.category]}</div><div class="recipe-info"><div class="recipe-heading"><h3>${r.name}</h3>${r.output>1?`<span class="output">${r.output}× Ausgabe</span>`:''}${r.vip?`<span class="vip">${r.vip}</span>`:''}</div><p class="ingredients">${Object.entries(r.ingredients).map(([name,n])=>`<span>${amount(name,n)} ${name==='Geld'?'':name}</span>`).join('<span class="plus">+</span>')}</p><span class="recipe-time">${r.seconds} Sek. / Vorgang</span></div><div class="quantity"><button data-minus="${r.id}" aria-label="${r.name}: Menge verringern">−</button><input data-qty="${r.id}" type="number" min="0" max="999999" step="1" placeholder="0" value="${plan[r.id]||''}" aria-label="Gewünschte Stückzahl: ${r.name}"><button data-plus="${r.id}" aria-label="${r.name}: Menge erhöhen">+</button></div></article>`).join('');
  }
  $('recipes').addEventListener('click',e=>{const b=e.target.closest('button');if(!b)return;if(b.dataset.plus)setQty(b.dataset.plus,(plan[b.dataset.plus]||0)+1);if(b.dataset.minus)setQty(b.dataset.minus,(plan[b.dataset.minus]||0)-1);});
  $('recipes').addEventListener('input',e=>{if(e.target.dataset.qty)setQty(e.target.dataset.qty,e.target.value);});
  function duration(n){return n<60?`${n} Sek.`:`${Math.floor(n/60)} Min. ${n%60} Sek.`;}
  function renderPlan(){
    const chosen=recipes.filter(r=>plan[r.id]),result=calculate(plan),total=chosen.reduce((s,r)=>s+plan[r.id],0);
    $('badge').textContent=chosen.length;$('results').hidden=!chosen.length;$('plan-empty').hidden=!!chosen.length;
    $('selection').innerHTML=chosen.map(r=>`<div class="selected-row"><span><b>${fmt(plan[r.id])}×</b> ${r.name}</span><button data-remove="${r.id}" aria-label="${r.name} aus Plan entfernen">×</button></div>`).join('');
    $('mode-note').textContent=mode==='base'?'Alle Vorprodukte aufgelöst. Ganze Herstellvorgänge werden gemeinsam aufgerundet.':'Zutaten für die ausgewählten Rezepte, wenn du deren Vorprodukte bereits besitzt.';
    const materials=result[mode];$('materials').innerHTML=Object.entries(materials).sort(([a],[b])=>a.localeCompare(b,'de')).map(([name,n])=>`<div><dt>${name}</dt><dd>${name==='Geld'?`${fmt(n)} $`:fmt(n)}</dd></div>`).join('');
    $('steps').innerHTML=result.steps.map(s=>`<p><b>${fmt(s.batches)}×</b> ${s.name}<span>→ ${fmt(s.made)} Stück · ${duration(s.seconds)}</span></p>`).join('');
    $('surplus').innerHTML=Object.keys(result.surplus).length?`<p class="small">Übrig nach dem gesamten Plan: ${Object.entries(result.surplus).map(([name,n])=>`${fmt(n)}× ${name}`).join(', ')}.</p>`:'<p class="small">Keine Restmengen.</p>';
    $('time').textContent=duration(result.seconds);$('vip-note').hidden=!chosen.some(r=>r.vip);
    $('base-view').classList.toggle('active',mode==='base');$('direct-view').classList.toggle('active',mode==='direct');$('base-view').setAttribute('aria-pressed',mode==='base');$('direct-view').setAttribute('aria-pressed',mode==='direct');
  }
  $('selection').onclick=e=>{const b=e.target.closest('[data-remove]');if(b)setQty(b.dataset.remove,0);};
  $('base-view').onclick=()=>{mode='base';renderPlan();};$('direct-view').onclick=()=>{mode='direct';renderPlan();};
  $('reset').onclick=()=>{plan={};save();renderRecipes();renderPlan();notify('Herstellungsplan geleert');};
  $('copy').onclick=async()=>{const result=calculate(plan),text=['WERKBANK · HERSTELLUNGSPLAN',...recipes.filter(r=>plan[r.id]).map(r=>`${plan[r.id]}× ${r.name}`),'',mode==='base'?'GRUNDMATERIALIEN':'DIREKTE ZUTATEN',...Object.entries(result[mode]).map(([name,n])=>`${fmt(n)}${name==='Geld'?' $':''} ${name}`),'',`Herstellzeit inkl. Vorprodukte: ${duration(result.seconds)}`].join('\n');try{await navigator.clipboard.writeText(text);notify('Materialliste kopiert');}catch{const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([text],{type:'text/plain;charset=utf-8'}));a.download='werkbank-materialliste.txt';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);notify('Materialliste als Datei gespeichert');}};
  $('search').oninput=renderRecipes;
  document.addEventListener('keydown',e=>{if(e.key==='/'&&!['INPUT','TEXTAREA'].includes(document.activeElement.tagName)){e.preventDefault();$('search').focus();}});
  renderCats();renderRecipes();renderPlan();
})();
