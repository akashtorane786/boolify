// BOOLIFY: Boolean algebra learning tool. Operators: + OR, ./* AND, ' or ! NOT.
const $ = id => document.getElementById(id);
const laws = [
["Identity Law","A + 0 = A     ·     A · 1 = A","OR with 0 and AND with 1 leave the variable unchanged."],
["Null / Domination Law","A + 1 = 1     ·     A · 0 = 0","OR with 1 is always 1; AND with 0 is always 0."],
["Idempotent Law","A + A = A     ·     A · A = A","Repeating the same variable does not change the result."],
["Complement Law","A + A' = 1     ·     A · A' = 0","A variable and its complement always produce opposite values."],
["Involution Law","(A')' = A","The complement of a complement is the original variable."],
["Commutative Law","A + B = B + A     ·     AB = BA","The order of variables does not affect the result."],
["Associative Law","(A+B)+C = A+(B+C)","Grouping does not affect OR or AND operations."],
["Distributive Law","A(B+C) = AB+AC","AND distributes over OR; the dual form also applies."],
["Absorption Law","A + AB = A     ·     A(A+B) = A","A term absorbs a larger term that already contains it."],
["De Morgan's Theorems","(A+B)' = A'B'     ·     (AB)' = A'+B'","Complementing a group flips OR to AND and complements each input."]
];
$("lawGrid").innerHTML = laws.map(([n,f,d])=>`<article class="law-card"><h3>${n}</h3><div class="law-formula">${f}</div><p>${d}</p></article>`).join("");

function tokenize(s){
  s=s.replace(/\s+/g,'').replace(/[×·]/g,'.').replace(/[∨]/g,'+').replace(/[∧]/g,'.');
  const out=[]; for(let i=0;i<s.length;i++){let c=s[i].toUpperCase(); if(/[A-Z01]/.test(c))out.push(c); else if("().'!+*".includes(c))out.push(c); else throw Error(`Unsupported character: ${s[i]}`);}
  // Insert implicit AND between adjacent operands/groups, e.g. AB, A(B+C), (A+B)C
  const fixed=[]; const end=t=>/^[A-Z01]$/.test(t)||t===")"||t==="'"||t==="!";
  const start=t=>/^[A-Z01]$/.test(t)||t==="("||t==="!";
  for(let i=0;i<out.length;i++){if(i&&end(out[i-1])&&start(out[i]))fixed.push(".");fixed.push(out[i]);}
  return fixed;
}
function parse(input){
 const t=tokenize(input);let p=0;
 function primary(){let x;if(t[p]==="!"){p++;x={type:"not",x:primary()};}else if(t[p]==="("){p++;x=or();if(t[p]!==")")throw Error("Missing closing parenthesis )");p++;}else if(/^[A-Z01]$/.test(t[p]||"")){let v=t[p++];x=v==="0"||v==="1"?{type:"const",v:Number(v)}:{type:"var",v};}else throw Error("Expected a variable (A, B, C), 0, 1 or opening parenthesis.");while(t[p]==="'"||t[p]==="!"){p++;x={type:"not",x};}return x;}
 function and(){let x=primary();while(t[p]==="."||t[p]==="*"){p++;x={type:"and",a:x,b:primary()};}return x;}
 function or(){let x=and();while(t[p]==="+"){p++;x={type:"or",a:x,b:and()};}return x;}
 let x=or();if(p<t.length)throw Error(`Unexpected symbol: ${t[p]}`);return x;
}
const is=(x,t)=>x&&x.type===t;
function key(x){if(x.type==="var")return x.v;if(x.type==="const")return String(x.v);if(x.type==="not")return "!("+key(x.x)+")";return x.type+"("+key(x.a)+","+key(x.b)+")";}
function fmt(x,parent=0){if(x.type==="var"||x.type==="const")return x.v;if(x.type==="not"){let s= x.x.type==="var"||x.x.type==="const"?fmt(x.x)+"'":"("+fmt(x.x)+")'";return s;}let prec=x.type==="or"?1:2;let s=fmt(x.a,prec)+(x.type==="or"?" + ":" · ")+fmt(x.b,prec);return prec<parent?"("+s+")":s;}
function vars(x,set=new Set()){if(x.type==="var")set.add(x.v);else if(x.type==="not")vars(x.x,set);else if(x.a){vars(x.a,set);vars(x.b,set);}return [...set].sort();}
function evalAst(x,env){if(x.type==="const")return x.v;if(x.type==="var")return env[x.v];if(x.type==="not")return evalAst(x.x,env)?0:1;let a=evalAst(x.a,env),b=evalAst(x.b,env);return x.type==="and"?(a&&b?1:0):(a||b?1:0);}
function clone(x){return JSON.parse(JSON.stringify(x));}
function same(a,b){return key(a)===key(b);}
function simplifyOnce(x){
 if(x.type==="var"||x.type==="const")return [x,null];
 if(x.type==="not"){
  let [a,step]=simplifyOnce(x.x);if(step)return [{type:"not",x:a},step];
  if(is(a,"const"))return [{type:"const",v:a.v?0:1},["Complement of constant","NOT 0 = 1 and NOT 1 = 0."]];
  if(is(a,"not"))return [a.x,["Involution law","The complement of a complement returns the original variable."]];
  if(a.type==="and"||a.type==="or"){let typ=a.type==="and"?"or":"and";return [{type:typ,a:{type:"not",x:a.a},b:{type:"not",x:a.b}},["De Morgan's theorem","The complement changes AND to OR (or OR to AND) and complements each term."]];}
  return [{type:"not",x:a},null];
 }
 let [a,sa]=simplifyOnce(x.a);if(sa)return [{...x,a},sa];
 let [b,sb]=simplifyOnce(x.b);if(sb)return [{...x,b},sb];
 const typ=x.type, isNotPair=(u,v)=>is(u,"not")&&same(u.x,v)||is(v,"not")&&same(v.x,u);
 if(same(a,b))return [a,["Idempotent law",typ==="or"?"A + A = A. Repeated OR terms are removed.":"A · A = A. Repeated AND terms are removed."]];
 if(typ==="and"){
  if(is(a,"const")||is(b,"const")){let c=is(a,"const")?a:b,o=is(a,"const")?b:a;return [c.v?o:c, [c.v?"Identity law":"Null law",c.v?"A · 1 = A.":"A · 0 = 0."]];}
  if(isNotPair(a,b))return [{type:"const",v:0},["Complement law","A · A' = 0."]];
  if(is(a,"or")&& (same(a.a,b)||same(a.b,b))||is(b,"or")&&(same(b.a,a)||same(b.b,a)))return [is(a,"or")?b:a,["Absorption law","A · (A + B) = A."]];
  // A(A' + B) = AB
  if(is(a,"or")&&isNotPair(a.a,b))return [{type:"and",a:b,b:a.b},["Complement reduction","A · (A' + B) = A · B."]];
  if(is(b,"or")&&isNotPair(b.a,a))return [{type:"and",a:a,b:b.b},["Complement reduction","A · (A' + B) = A · B."]];
 }else{
  if(is(a,"const")||is(b,"const")){let c=is(a,"const")?a:b,o=is(a,"const")?b:a;return [c.v?c:o,[c.v?"Domination law":"Identity law",c.v?"A + 1 = 1.":"A + 0 = A."]];}
  if(isNotPair(a,b))return [{type:"const",v:1},["Complement law","A + A' = 1."]];
  if(is(a,"and")&&(same(a.a,b)||same(a.b,b))||is(b,"and")&&(same(b.a,a)||same(b.b,a)))return [is(a,"and")?b:a,["Absorption law","A + (A · B) = A."]];
  // A + A'B = A+B
  if(is(b,"and")&&isNotPair(b.a,a))return [{type:"or",a:a,b:b.b},["Complement reduction","A + A' · B = A + B."]];
  if(is(a,"and")&&isNotPair(a.a,b))return [{type:"or",a:b,b:a.b},["Complement reduction","A + A' · B = A + B."]];
  // AB + AC = A(B+C), including swapped factor positions
  if(is(a,"and")&&is(b,"and")){
   for(const [leftA,rightA] of [[a.a,a.b],[a.b,a.a]])for(const [leftB,rightB] of [[b.a,b.b],[b.b,b.a]])if(same(leftA,leftB))return [{type:"and",a:leftA,b:{type:"or",a:rightA,b:rightB}},["Distributive law (factoring)","A·B + A·C = A·(B + C). A common factor is taken outside."]];
  }
 }
 return [x,null];
}
function simplify(ast){let cur=ast,steps=[];for(let i=0;i<40;i++){let [next,info]=simplifyOnce(cur);if(!info||same(next,cur))break;steps.push({before:fmt(cur),after:fmt(next),law:info[0],explain:info[1]});cur=next;}return {ast:cur,steps};}
function makeEnv(vs,n){let e={};vs.forEach((v,i)=>e[v]=(n>>(vs.length-1-i))&1);return e;}
function table(ast){let vs=vars(ast);if(vs.length>5)throw Error("Please use 5 or fewer different variables for the truth table.");let rows=[];for(let i=0;i<2**vs.length;i++){let env=makeEnv(vs,i);rows.push({env,out:evalAst(ast,env)});}return {vs,rows};}
function renderTable(target,ast,compare=null){let {vs,rows}=table(ast);target.innerHTML=`<table><thead><tr>${vs.map(v=>`<th>${v}</th>`).join("")}<th>OUTPUT</th>${compare?'<th>SIMPLIFIED</th><th>CHECK</th>':''}</tr></thead><tbody>${rows.map(r=>{let other=compare?evalAst(compare,r.env):null;return `<tr>${vs.map(v=>`<td>${r.env[v]}</td>`).join("")}<td>${r.out}</td>${compare?`<td>${other}</td><td class="${other===r.out?'match':'mismatch'}">${other===r.out?'MATCH':'DIFFERENT'}</td>`:''}</tr>`}).join("")}</tbody></table>`;return {vs,rows};}

$("simplifyBtn").addEventListener("click",()=>{
 $("errorBox").textContent="";try{
  const original=parse($("expression").value), result=simplify(clone(original)), stats=table(original);
  $("result").textContent=fmt(result.ast);$("resultNote").textContent=result.steps.length? "Simplification completed using Boolean algebra laws.":"This expression is already in a simplified form (using the supported laws).";
  $("stepCount").textContent=result.steps.length;$("variableCount").textContent=stats.vs.length;$("rowCount").textContent=stats.rows.length;
  $("steps").innerHTML=result.steps.length?result.steps.map((s,i)=>`<div class="step-item"><div class="step-number">${i+1}</div><div class="step-content"><div class="step-equation">${s.before} <span style="color:#6f9ed2">→</span> ${s.after}</div><div class="step-law">${s.law.toUpperCase()}</div><div class="step-explain">${s.explain}</div></div></div>`).join(""):'<div class="steps-empty">No supported law was needed. Try one of the example expressions to see a worked solution.</div>';
  renderTable($("verification"),original,result.ast);
 }catch(e){$("errorBox").textContent=e.message;}
});
$("clearBtn").addEventListener("click",()=>{$("expression").value="";$("errorBox").textContent="";});
document.querySelectorAll("[data-example]").forEach(b=>b.addEventListener("click",()=>{$("expression").value=b.dataset.example;$("simplifyBtn").click();}));
$("generateTruth").addEventListener("click",()=>{try{$("truthError").textContent="";renderTable($("truthTableOutput"),parse($("truthExpression").value));}catch(e){$("truthError").textContent=e.message;$("truthTableOutput").innerHTML="";}});
document.querySelectorAll(".nav-btn").forEach(b=>b.addEventListener("click",()=>{document.querySelectorAll(".nav-btn").forEach(x=>x.classList.toggle("active",x===b));document.querySelectorAll(".page").forEach(x=>x.classList.toggle("active",x.id===b.dataset.page));$("pageTitle").textContent=({simplifier:"Boolean Simplifier",truth:"Truth Table Generator",laws:"Boolean Laws Library",gates:"Logic Gate Simulator",quiz:"Practice Quiz"})[b.dataset.page];}));

const gateState={and:{a:0,b:0},or:{a:0,b:0},not:{a:0},nand:{a:0,b:0},nor:{a:0,b:0},xor:{a:0,b:0},xnor:{a:0,b:0},combo:{a:0,b:0}};
function updateGates(){
 ["and","or","not","nand","nor","xor","xnor","combo"].forEach(g=>{
  let s=gateState[g],a=s.a,b=s.b;
  let out=g==="and"?(a&b):g==="or"?(a|b):g==="not"?(1-a):g==="nand"?(1-(a&b)):g==="nor"?(1-(a|b)):g==="xor"?(a^b):g==="xnor"?(1-(a^b)):((a&b)|(1-a));
  $(g+"Output").textContent=out;
  document.querySelectorAll(`[data-gate="${g}"]`).forEach(btn=>{let v=s[btn.dataset.input];btn.textContent=v;btn.classList.toggle("on",!!v);});
 });
}
document.querySelectorAll(".toggle").forEach(btn=>btn.addEventListener("click",()=>{let s=gateState[btn.dataset.gate];s[btn.dataset.input]=1-s[btn.dataset.input];updateGates();}));
updateGates();

const questions=[
 {q:"Which law simplifies A + A to A?",o:["Complement law","Idempotent law","Identity law","Absorption law"],a:1,e:"Idempotent law: A + A = A and A · A = A."},
 {q:"What is the value of A · A'?",o:["0","1","A","A'"],a:0,e:"A and its complement cannot both be 1. Therefore A · A' = 0."},
 {q:"Which is De Morgan's correct theorem?",o:["(A+B)' = A'+B'","(A+B)' = A'B'","(AB)' = A'B'","A+B = AB"],a:1,e:"De Morgan: (A+B)' = A'B' and (AB)' = A'+B'."},
 {q:"Simplify A + A·B.",o:["A·B","B","A","1"],a:2,e:"Absorption law: A + A·B = A."},
 {q:"What is A + 0 equal to?",o:["0","1","A'","A"],a:3,e:"Identity law: OR with 0 leaves the variable unchanged."}
];let qi=0,score=0,answered=false;
function showQuestion(){let q=questions[qi];$("quizProgress").textContent=`QUESTION ${String(qi+1).padStart(2,"0")} / 05`;$("quizScore").textContent="SCORE: "+score;$("questionText").textContent=q.q;$("options").innerHTML=q.o.map((o,i)=>`<button class="option" data-answer="${i}">${String.fromCharCode(65+i)}. ${o}</button>`).join("");$("quizFeedback").textContent="";$("nextQuestion").disabled=true;$("nextQuestion").textContent=qi===4?"Finish quiz":"Next question →";answered=false;document.querySelectorAll(".option").forEach(b=>b.addEventListener("click",()=>{if(answered)return;answered=true;let chosen=Number(b.dataset.answer);document.querySelectorAll(".option").forEach((x,i)=>{if(i===q.a)x.classList.add("correct");else if(i===chosen)x.classList.add("wrong");});if(chosen===q.a){score++;$("quizFeedback").textContent="Correct! "+q.e;}else $("quizFeedback").textContent="Not quite. "+q.e;$("quizScore").textContent="SCORE: "+score;$("nextQuestion").disabled=false;}));}
$("nextQuestion").addEventListener("click",()=>{if(qi===4){$("questionText").textContent=`Quiz complete — you scored ${score} out of 5!`;$("options").innerHTML="";$("quizFeedback").textContent="Refresh the page to try again.";$("nextQuestion").disabled=true;}else{qi++;showQuestion();}});showQuestion();
// Load a worked example on first visit.
$("simplifyBtn").click();
