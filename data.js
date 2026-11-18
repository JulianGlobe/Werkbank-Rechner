(function (root) {
  const rows = [
    ['metall','Metall','Materialien',1,null,{'Metallerz':10}],
    ['metallplatten','Metallplatten','Materialien',1,3,{'Metall':2}],
    ['verstaerkt','Verstärkte Platten','Materialien',1,8,{'Metallplatten':6}],
    ['titan','Titanplatten','Materialien',1,15,{'Verstärkte Platten':4}],
    ['kabel','Kupferkabel','Materialien',2,2,{'Kupfer':1}],
    ['elektro','Elektroteile','Materialien',1,5,{'Kupferkabel':6,'Metall':1}],
    ['brenner','Laborbrenner','Labor',1,15,{'Verstärkte Platten':1,'Elektroteile':3}],
    ['kiste1','Lagerkiste T1','Lager & Werkstatt',1,15,{'Metallplatten':4,'Geld':20000}],
    ['kiste2','Lagerkiste T2','Lager & Werkstatt',1,23,{'Verstärkte Platten':1,'Geld':40000}],
    ['kiste3','Lagerkiste T3','Lager & Werkstatt',1,30,{'Titanplatten':1,'Geld':25000}],
    ['kiste4','Lagerkiste T4','Lager & Werkstatt',1,38,{'Titanplatten':2,'Geld':40000},'VIP Silber'],
    ['werkbank','Tragbare Werkbank','Lager & Werkstatt',1,23,{'Verstärkte Platten':3}],
    ['grill','Mobiler Grill','Lager & Werkstatt',1,23,{'Verstärkte Platten':3}],
    ['labor','Tragbares Chemielabor','Labor',1,30,{'Verstärkte Platten':2,'Elektroteile':8}],
    ['glas','Laborglas','Labor',5,5,{'Natron':2,'Kalk':1}],
    ['handy','Handy (Jailbreak)','Elektronik',1,10,{'Handy':1,'Elektroteile':4}],
    ['binder','Kabelbinder','Ausrüstung',3,5,{'Kevlarmaterial':2,'Kupferkabel':2}],
    ['fesseln','Fußfesseln','Ausrüstung',3,5,{'Kevlarmaterial':8,'Kupferkabel':4}],
    ['dietrich','Dietrich','Ausrüstung',1,5,{'Metall':2,'Kupferkabel':4}],
    ['dietrich2','Dietrich MK II','Ausrüstung',1,15,{'Dietrich':1,'Verstärkte Platten':1}],
    ['tablet','Racing Tablet','Elektronik',1,4,{'Kupferkabel':2,'Metall':1}],
    ['gps','GPS','Elektronik',1,5,{'Elektroteile':4,'Kupferkabel':2}],
    ['med','Erweitertes Med Kit','Ausrüstung',1,10,{'Med Kit':1,'Kevlarmaterial':8}],
    ['anzug','Strahlenschutzanzug','Ausrüstung',1,15,{'Verstärkte Platten':3}],
    ['bohrer','Bohrer','Ausrüstung',1,10,{'Metall':2,'Elektroteile':1}],
    ['thermit','Thermit','Labor',1,15,{'Schwefelsäure':1,'Ammoniak':1,'Elektroteile':1,'Metall':2}],
    ['schild','Kennzeichen','Fahrzeug',1,10,{'Verstärkte Platten':1}],
    ['reifen','Gepanzerte Reifen','Fahrzeug',1,15,{'Kevlarmaterial':20,'Geld':10000}],
    ['pistole','Magazin: Pistole','Magazine',10,2,{'Kupfer':4,'Metall':4}],
    ['revolver','Magazin: Revolver','Magazine',14,3,{'Kupfer':8,'Metall':8}],
    ['smg','Magazin: SMG','Magazine',10,3,{'Kupfer':12,'Metall':12}],
    ['sturm','Magazin: Sturmgewehr','Magazine',10,3,{'Kupfer':16,'Metall':16}],
    ['schrot','Magazin: Schrotflinte','Magazine',4,3,{'Kupfer':6,'Metall':10}],
    ['sniper','Magazin: Scharfschütze','Magazine',2,3,{'Kupfer':6,'Metall':6}],
    ['mg','Magazin: Maschinengewehr','Magazine',1,3,{'Kupfer':8,'Metall':8}]
  ];
  const recipes = rows.map(([id,name,category,output,seconds,ingredients,vip])=>({id,name,category,output,seconds,ingredients,vip}));
  const byName = Object.fromEntries(recipes.map(r=>[r.name,r]));
  const add = (map,key,n)=>map[key]=(map[key]||0)+n;
  function calculate(plan) {
    const demand={}, direct={}, steps=[], base={}, surplus={};
    for (const r of recipes) {
      const qty=Number(plan[r.id]||0);
      if (!Number.isSafeInteger(qty)||qty<0||qty>999999) throw new Error('Ungültige Menge');
      if (!qty) continue;
      add(demand,r.name,qty);
      const batches=Math.ceil(qty/r.output);
      for (const [name,n] of Object.entries(r.ingredients)) add(direct,name,n*batches);
    }
    // Parents precede their ingredients; shared intermediates are rounded only once.
    const seen=new Set(), order=[];
    function visit(r) {
      if(seen.has(r.id)) return;
      seen.add(r.id);
      for(const name of Object.keys(r.ingredients)) if(byName[name]) visit(byName[name]);
      order.push(r);
    }
    recipes.forEach(visit);
    for(const r of order.reverse()) {
      const qty=demand[r.name]||0;
      if(!qty) continue;
      const batches=Math.ceil(qty/r.output), made=batches*r.output;
      if(made>qty) surplus[r.name]=made-qty;
      steps.push({name:r.name,batches,made,seconds:r.seconds===null?null:batches*r.seconds,vip:r.vip});
      for(const [name,n] of Object.entries(r.ingredients)) add(demand,name,n*batches);
    }
    for(const [name,n] of Object.entries(demand)) if(!byName[name]) base[name]=n;
    return {direct,base,surplus,steps:steps.reverse(),seconds:steps.reduce((s,r)=>s+(r.seconds||0),0),hasUnknownTime:steps.some(r=>r.seconds===null)};
  }
  const api={recipes,calculate};
  root.Workbench=api;
  if(typeof module!=='undefined') module.exports=api;
})(typeof window!=='undefined'?window:globalThis);
