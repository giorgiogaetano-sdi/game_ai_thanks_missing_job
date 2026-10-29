'use strict';
const {execFileSync}=require('node:child_process');
const fs=require('node:fs');
const git=(...args)=>execFileSync('git',args,{encoding:'utf8',maxBuffer:16*1024*1024}).trim();
const fail=message=>{console.error(`Changelog obbligatorio: ${message}`);process.exit(1);};
const hasAddition=patch=>patch.split('\n').some(line=>line.startsWith('+')&&!line.startsWith('+++')&&line.slice(1).trim());
try {
  if(process.argv[2]==='commit') {
    if(!hasAddition(git('diff','--cached','--no-ext-diff','--no-textconv','--unified=0','--','CHANGELOG.md')))
      fail('aggiungi una nuova voce a CHANGELOG.md e preparala con git add.');
  } else if(process.argv[2]==='push') {
    const checked=new Set();
    for(const line of fs.readFileSync(0,'utf8').trim().split('\n').filter(Boolean)) {
      const [,local,,remote]=line.trim().split(/\s+/);
      if(/^0+$/.test(local))continue; // Eliminazione di un riferimento.
      let range=local;
      if(!/^0+$/.test(remote)) {
        let remoteKnown=false;
        try {git('cat-file','-e',`${remote}^{commit}`);remoteKnown=true;} catch {}
        // A remote tip may not have been fetched yet; validate all local history.
        if(remoteKnown)range=`${remote}..${local}`;
      }
      // New branches must not revalidate history already published on a remote.
      const exclusions=/^0+$/.test(remote)?['--not','--remotes']:[];
      const commits=git('rev-list','--no-merges',range,...exclusions);
      for(const hash of commits.split('\n').filter(Boolean)) {
        if(checked.has(hash))continue;
        checked.add(hash);
        const patch=git('show','--format=','--no-ext-diff','--no-textconv','--unified=0',hash,'--','CHANGELOG.md');
        if(!hasAddition(patch))fail(`il commit ${hash.slice(0,12)} non aggiunge testo a CHANGELOG.md.`);
      }
    }
  } else fail('modalità prevista: commit oppure push.');
} catch(error) {
  fail(`controllo non completato: ${error.message}`);
}
