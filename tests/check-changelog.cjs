'use strict';
const fs=require('node:fs'),path=require('node:path'),vm=require('node:vm'),assert=require('node:assert/strict');
const source=fs.readFileSync(path.join(__dirname,'../scripts/check-changelog.cjs'),'utf8');
const local='a'.repeat(40),remote='b'.repeat(40),zero='0'.repeat(40);
function check({tip=remote,known=true,addition=true,mode='push'}={}) {
 const calls=[],errors=[];
 const execFileSync=(command,args)=>{
  assert.equal(command,'git');calls.push(args);
  if(args[0]==='cat-file'){if(!known)throw Error('missing object');return '';}
  if(args[0]==='rev-list')return local;
  if(args[0]==='show'||args[0]==='diff')return addition?'+++ b/CHANGELOG.md\n+- Modifica: esempio.':'+++ b/CHANGELOG.md\n-vecchio testo';
  throw Error('Unexpected Git command');
 };
 let exitCode=0;
 try {vm.runInNewContext(source,{
  require:name=>name==='node:child_process'?{execFileSync}:{readFileSync:()=>`refs/heads/main ${local} refs/heads/main ${tip}\n`},
  process:{argv:['node','hook',mode],exit:code=>{exitCode=code;throw Error('exit');}},
  console:{error:message=>errors.push(message)}
 });}catch(error){if(error.message!=='exit')throw error;}
 return {calls,errors,exitCode};
}
for(const [options,range] of [[{},`${remote}..${local}`],[{known:false},local],[{tip:zero},local]]) {
 const result=check(options);assert.equal(result.exitCode,0);assert.equal(result.calls.find(args=>args[0]==='rev-list')[2],range);
}
assert.equal(check({tip:zero,addition:false}).exitCode,1);
assert.deepEqual(Array.from(check({tip:zero}).calls.find(args=>args[0]==='rev-list')),['rev-list','--no-merges',local,'--not','--remotes']);
assert.deepEqual(Array.from(check({}).calls.find(args=>args[0]==='rev-list')),['rev-list','--no-merges',`${remote}..${local}`]);
assert.equal(check({tip:remote,addition:false}).exitCode,1);
assert.equal(check({mode:'commit'}).exitCode,0);
assert.equal(check({mode:'commit',addition:false}).exitCode,1);
console.log('PASS hook changelog: remoto noto, assente, branch nuovo e obbligo di aggiunta');
