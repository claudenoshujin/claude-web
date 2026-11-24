// TT parks native drawers while CW may still show their contents in an editor.
// Ownership follows the page and each editor, rather than keeping slots awake.
const PATCH = Symbol.for('claude-web.tt-panel-runtime');
const PANELS = new Set(['left-nav-panel','AdvancedFormatting','WorldInfo','user-settings-block','Backgrounds']);
const EXT = 'tt:gate:rm_extensions_block:extension_containers';
export function createTTPanelRuntime(win) {
  const owners = new Map(), moves = new Map();
  let manager, shared;
  const slotsFor = id => PANELS.has(id) ? ['panel:'+id] : id === 'rm_extensions_block' ? [EXT] : [];
  const nativeVisible = id => {
    const p = win.document.getElementById(id === EXT ? 'rm_extensions_block' : id.slice(6));
    return !!p?.classList.contains('openDrawer') && !p.classList.contains('closedDrawer');
  };
  const held = id => [...owners.values()].some(ids => ids.includes(id));
  const reseat = () => {
    for (const [node,m] of moves) {
      if (!held(m.slot) || !m.host.isConnected || node.parentNode === m.host || node.contains(m.host)) continue;
      // Only repair TT restores; native re-renders retain ownership of new nodes.
      if (node.isConnected && node.nextSibling?.nodeType === 8 && node.nextSibling.data === 'tt:panel-park:'+m.slot.slice(6)) {
        m.host.insertBefore(node,m.before?.parentNode === m.host ? m.before : null);
      }
    }
  };
  const client = {held,reseat};
  function attach() {
    const next = win.__TAURITAVERN_PANEL_RUNTIME__;
    if (!next || typeof next.setVisible !== 'function' || typeof next.reconcile !== 'function') return false;
    if (manager === next) return true;
    detach(); manager = next; shared = next[PATCH];
    if (!shared) {
      const clients = new Set(), originalVisible = next.setVisible, originalReconcile = next.reconcile;
      const setVisible = function(id,v) { return originalVisible.call(this,id,!!v || [...clients].some(c=>c.held(id))); };
      const reconcile = function(...args) { const result=originalReconcile.apply(this,args);for(const c of clients)c.reseat();return result; };
      shared={clients,originalVisible,originalReconcile,setVisible,reconcile};
      try { next[PATCH]=shared;next.setVisible=setVisible;next.reconcile=reconcile; }
      catch {
        try {if(next.setVisible===setVisible)next.setVisible=originalVisible;if(next.reconcile===reconcile)next.reconcile=originalReconcile;delete next[PATCH];}catch {}
        manager=shared=null;return false;
      }
    }
    shared.clients.add(client);return true;
  }
  function set(owner,panelId) {
    if (!attach()) return;
    const previous=owners.get(owner)||[], ids=slotsFor(panelId);
    if(ids.length)owners.set(owner,ids);else owners.delete(owner);
    for(const id of new Set([...previous,...ids])) {
      try {manager.setVisible(id,held(id)||nativeVisible(id));}catch {}
    }
    try {manager.reconcile();reseat();}catch {}
  }
  function remember(node) {
    if(!manager || !node?.parentNode)return;
    const panel=node.closest?.('.drawer-content')?.id;
    const nativeRoot=node.id==='wi-holder'||node.id==='world_popup_entries_list'?'WorldInfo':node.id==='bg_tabs'?'Backgrounds':node.id==='user-settings-block-content'?'user-settings-block':panel==='left-nav-panel'&&node.matches('.scrollableInner')?panel:panel==='AdvancedFormatting'&&node.matches('.flex-container.spaceEvenly')?panel:null;
    const slot=moves.get(node)?.slot || (nativeRoot?'panel:'+nativeRoot:null);
    if(slot)moves.set(node,{slot,host:node.parentNode,before:node.nextSibling});
  }
  function detach() {
    if(!manager || !shared)return;
    const released=new Set([...owners.values()].flat());
    owners.clear();moves.clear();shared.clients.delete(client);
    if(!shared.clients.size) {
      if(manager.setVisible===shared.setVisible)manager.setVisible=shared.originalVisible;
      if(manager.reconcile===shared.reconcile)manager.reconcile=shared.originalReconcile;
      try {delete manager[PATCH];}catch {}
    }
    for(const id of released){try {manager.setVisible(id,nativeVisible(id));}catch {}}
    try {manager.reconcile();}catch {}
    manager=shared=null;
  }
  return {set,remember,destroy:detach};
}
