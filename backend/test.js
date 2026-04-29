// MemoVoice AI — Local API Test Script
// Run AFTER the server is started: node test-api.js

const BASE_URL = process.env.TEST_URL || "http://localhost:5000";
const G="\x1b[32m",R="\x1b[31m",Y="\x1b[33m",C="\x1b[36m",Z="\x1b[0m",B="\x1b[1m";
let passed=0,failed=0;

async function test(label,fn){
  process.stdout.write(`  ${C}▶ ${label}${Z} ... `);
  try{const r=await fn();console.log(`${G}PASS${Z}`,r?`— ${r}`:"");passed++;}
  catch(e){console.log(`${R}FAIL${Z} — ${e.message}`);failed++;}
}
async function get(url){const r=await fetch(url);const d=await r.json();if(!r.ok)throw new Error(`HTTP ${r.status}: ${JSON.stringify(d)}`);return{status:r.status,data:d};}
async function post(url,body){const r=await fetch(url,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify(body)});const d=await r.json();if(!r.ok)throw new Error(`HTTP ${r.status}: ${JSON.stringify(d)}`);return{status:r.status,data:d};}

async function runTests(){
  console.log(`\n${B}═══════════════════════════════════════${Z}`);
  console.log(`${B}  MemoVoice AI — Backend Test Suite${Z}`);
  console.log(`${B}  Target: ${BASE_URL}${Z}`);
  console.log(`${B}═══════════════════════════════════════${Z}\n`);

  console.log(`${Y}[ Infrastructure ]${Z}`);
  await test("GET / root responds",async()=>{const{data}=await get(`${BASE_URL}/`);if(data.status!=="running")throw new Error("bad status");return`model=${data.model}`;});
  await test("GET /health check",async()=>{const{data}=await get(`${BASE_URL}/health`);if(data.status!=="ok")throw new Error("not ok");return`uptime=${data.uptime}`;});
  await test("GET /debug-env",async()=>{const{data}=await get(`${BASE_URL}/debug-env`);if(!data.API_KEY_SET)throw new Error("no api key");return`key=${data.API_KEY_HINT}`;});
  await test("GET /nonexistent → 404",async()=>{const r=await fetch(`${BASE_URL}/this-does-not-exist`);if(r.status!==404)throw new Error(`got ${r.status}`);return"correct 404";});

  console.log(`\n${Y}[ Gemini API ]${Z}`);
  await test("GET /test smoke test",async()=>{const{data}=await get(`${BASE_URL}/test`);if(!data.response)throw new Error("no response");return`"${data.response.slice(0,50)}" (${data.latency_ms}ms)`;});
  await test("POST /ask-ai question",async()=>{const{data}=await post(`${BASE_URL}/ask-ai`,{message:"Hello, how are you?"});if(!data.reply)throw new Error("no reply");return`"${data.reply.slice(0,50)}"`;});
  await test("POST /ask-ai meds question",async()=>{const{data}=await post(`${BASE_URL}/ask-ai`,{message:"When should I take my pills?"});if(!data.reply)throw new Error("no reply");return`${data.latency_ms}ms`;});
  await test("POST /ask-ai empty → 400",async()=>{const r=await fetch(`${BASE_URL}/ask-ai`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({})});if(r.status!==400)throw new Error(`got ${r.status}`);return"correct 400";});

  console.log(`\n${Y}[ Memory Storage ]${Z}`);
  await test("POST /memories save",async()=>{const{data}=await post(`${BASE_URL}/memories`,{text:"Beach trip 1985",person:"Daughter Sarah",category:"family"});if(!data.success)throw new Error("failed");return`id=${data.memory.id}`;});
  await test("GET /memories retrieve",async()=>{const{data}=await get(`${BASE_URL}/memories`);if(data.count===0)throw new Error("empty");return`${data.count} memories`;});

  console.log(`\n${Y}[ Medication Storage ]${Z}`);
  await test("POST /medications save",async()=>{const{data}=await post(`${BASE_URL}/medications`,{name:"Lisinopril 10mg",dosage:"1 tablet",time:"08:00",frequency:"daily"});if(!data.success)throw new Error("failed");return`id=${data.medication.id}`;});
  await test("GET /medications retrieve",async()=>{const{data}=await get(`${BASE_URL}/medications`);if(data.count===0)throw new Error("empty");return`${data.count} meds`;});

  const total=passed+failed;
  console.log(`\n${B}═══════════════════════════════════════${Z}`);
  console.log(`  ${G}${passed} passed${Z}  ${failed>0?R:""}${failed} failed${Z}  / ${total} total`);
  if(failed===0)console.log(`  ${G}${B}All tests passed! Backend is ready.${Z}`);
  else console.log(`  ${R}${B}Some tests failed — check server logs.${Z}`);
  console.log(`${B}═══════════════════════════════════════${Z}\n`);
  process.exit(failed>0?1:0);
}

runTests().catch(err=>{
  console.error(`\n${R}Cannot connect to ${BASE_URL}${Z}`);
  console.error(`${R}→ ${err.message}${Z}`);
  console.error(`\n${Y}Start the server first:  node server.js${Z}\n`);
  process.exit(1);
});