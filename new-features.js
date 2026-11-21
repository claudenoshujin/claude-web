/* Device-local discovery markers; no server settings or business data. */
export function newFeature({win,make,t},key) {
  const storage='claude-web:seen-new';
  const read=()=>{try{const list=JSON.parse(win.localStorage.getItem(storage)||'[]');return Array.isArray(list)?list.filter(x=>typeof x==='string'):[];}catch{return [];}};
  const badge=make('span','new cw-new',t('新','New'));
  badge.hidden=read().includes(key);
  // Full or blocked storage must not stop the action that marks the feature seen
  // (opening All presets, saving font weight); the badge hides for this page.
  const seen=()=>{const list=read();if(!list.includes(key)){list.push(key);try{win.localStorage.setItem(storage,JSON.stringify(list));}catch{}}badge.hidden=true;};
  return {badge,seen};
}
