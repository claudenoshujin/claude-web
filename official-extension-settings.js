/* 2.0.266 扩展设置页（照 design-phone-ext-v1.html，Lulu 2026-10-03 认可）。
 * 打开扩展「配置」时画一张自己的页面：小标题 + 白卡片 + 一行一项。酒馆原来的开关、下拉、输入框、
 * 文本框、滑杆整个搬进行里（事件、ID 都不变）；按钮不搬，画一行代它点。关掉时全部搬回原处。
 * 原来的外层还在原处（藏着），酒馆按来源 / 开关显示隐藏的那些块，用 gates 同步到我们的行上。
 * 2.0.264–265 是在酒馆排版上直接套样式，扩展之间结构差太多，排不齐，这一版换成重画。 */
export function createExtensionSettings({win,t,L,make,button,icon,openEditor}) {
  const doc=win.document, sessions=new Set(), popups=new Map();
  const FIELD='input:not([type=hidden]):not([type=file]),select,textarea';
  const CONTROL='input:not([type=hidden]):not([type=file]),select,textarea,button,.menu_button,.right_menu_button,toolcool-color-picker';
  const clean=s=>(s||'').replace(/\s+/g,' ').replace(/[:：]\s*$/,'').trim();
  function textOf(n){if(!n)return '';const c=n.cloneNode(true);c.querySelectorAll('input,select,textarea,button,.menu_button,.right_menu_button,i,svg,a.notes-link,.note-link-span,.fa-solid,.fa-regular,.drag-handle,.qr--labelHint,[id$=_output],[id$=_value],.memory_disabled_hint').forEach(x=>x.remove());return clean(c.textContent);}
  const esc=s=>win.CSS?.escape?win.CSS.escape(s):String(s).replace(/["\\]/g,'\\$&');
  const hiddenSelf=n=>n.hidden||n.style.display==='none'||n.classList.contains('displayNone');
  const shown=n=>!!n&&!hiddenSelf(n);

  /* ---------- 会话：记下搬动和新建的东西，关的时候还原 ---------- */
  function session(root,plan){
    const s={root,plan,moves:[],created:[],undo:[],units:[],rows:[],secs:[],page:null,observer:null,frame:0};
    sessions.add(s);return s;
  }
  function move(s,n,host,before){
    if(!n||n===host||n.contains(host))return;
    const companion=n.matches?.('select.select2-hidden-accessible')&&n.nextElementSibling?.matches('.select2-container')?n.nextElementSibling:null;
    const mark=doc.createComment('cwx-return');n.before(mark);s.moves.push([n,mark]);
    before?host.insertBefore(n,before):host.append(n);if(companion)move(s,companion,host);
  }
  const add=(s,n)=>{s.created.push(n);return n;};
  function teardown(s){
    for(const f of s.undo.splice(0).reverse())f();
    // 酒馆重画过的块（tts 服务商设置等）原处的标记已经没了，搬出来的旧控件直接丢掉。
    for(const [n,mark] of s.moves.splice(0).reverse()){if(mark.parentNode)mark.replaceWith(n);else n.remove();}
    for(const n of s.created.splice(0))n.remove();
    s.units=[];s.rows=[];s.secs=[];s.page=null;s.restSec=null;
  }
  function close(s){
    if(s.closed)return;s.closed=true;s.observer?.disconnect();win.cancelAnimationFrame(s.frame);
    teardown(s);s.root.classList.remove('cwx-host');sessions.delete(s);if(!sessions.size)watch.disconnect();
  }

  // 原处的外层：最外面那层被我们藏了，只看酒馆自己有没有藏它（行内 display / hidden / displayNone）；里面的看算出来的样式。
  function gatesOf(start,root){const gates=[];let top=null;for(let p=start;p&&p!==root;p=p.parentElement){if(p.parentElement===root)top=p;else if(!p.matches('.inline-drawer-content,.cwx-page'))gates.push(p);}return {gates,top};}

  /* ---------- 第一遍：认控件，给每个控件找标题 ---------- */
  function labelOf(c,content){
    const own=c.closest('label');
    if(own&&own!==c&&content.contains(own)&&!own.matches('.menu_button')){const tx=textOf(own);if(tx)return {title:tx,used:[own]};}
    const forLab=c.id&&content.querySelector(`label[for="${esc(c.id)}"]`);
    // 前面紧挨着的几段字：有 label[for] 就用它当标题；没有就是第一段。标题后面的是说明（label + small + select 这种）。
    for(let p=c,depth=0;p&&p!==content&&depth<3;p=p.parentElement,depth++){
      const texts=[];
      for(let x=p.previousElementSibling;x;x=x.previousElementSibling){
        if(x.matches('br'))continue;
        if(x.matches('hr,h1,h2,h3,h4,h5,.inline-drawer-header'))break;
        if(x!==forLab&&(x.matches(CONTROL)||x.querySelector(FIELD)))break; // 标题里带个「恢复默认」小按钮不算
        const tx=textOf(x);if(tx)texts.unshift([tx,x]);
        if(x===forLab)break;
      }
      if(texts.length)return {title:texts[0][0],desc:texts.slice(1).map(x=>x[0]).join(' '),used:texts.map(x=>x[1])};
      if(p.previousElementSibling&&!p.previousElementSibling.matches('br'))break;
    }
    if(forLab&&textOf(forLab))return {title:textOf(forLab),used:[forLab]};
    return {title:clean(c.getAttribute('aria-label')||c.title?.split('\n')[0]||c.placeholder||''),used:[]};
  }
  function actionLabel(b){
    if(/_restore$/.test(b.id))return L('恢复默认');
    const own=textOf(b)||clean(b.value||'');
    return own||clean((b.getAttribute('title')||b.getAttribute('aria-label')||'').split('\n')[0]);
  }
  const danger=b=>/delete|remove|purge|trash|clear|redWarning/i.test(b.id+' '+b.className)&&!/restore/i.test(b.id);
  function scan(s,content){
    const P=s.plan,units=[],byNode=new Map(),used=new Set(),taken=new WeakSet();
    const pick=(list)=>new Set((list||[]).flatMap(sel=>[...content.querySelectorAll(sel)]));
    const skip=pick(P.skip),raw=pick(P.raw),longs=pick(P.long),lines=pick(P.line),fields=pick(P.field);
    for(const n of skip)n.querySelectorAll('*').forEach(x=>taken.add(x));
    const unit=(u,root)=>{u.root=root;Object.assign(u,gatesOf((u.input||root).parentElement,s.root));
      u.self=u.input||root;units.push(u);byNode.set(root,u);root.querySelectorAll?.('*').forEach(x=>taken.add(x));};
    for(const n of raw){if(taken.has(n))continue;unit({kind:'raw',node:n},n);}
    for(const c of content.querySelectorAll(CONTROL)){
      if(taken.has(c)||skip.has(c)||byNode.has(c)||c.closest('.cwx-page,template'))continue;
      if(c.closest('.inline-drawer-header'))continue;
      const over=P.label?.[c.id]||P.labelOf?.(c);
      if(c.type==='checkbox'||c.type==='radio'){
        const lab=c.closest('label');
        if(c.type==='radio'){
          const box=lab&&content.contains(lab)?lab:c;const extra=box===lab?[...lab.querySelectorAll('input:not([type=radio]),select')]:[];
          unit({kind:'radio',input:c,title:over||textOf(box===c?c.nextElementSibling:box),extra,name:c.name},box);continue;
        }
        if(lab&&content.contains(lab)&&!lab.querySelector('select,input:not([type=checkbox]),textarea')){
          if(lab.querySelectorAll('input[type=checkbox]').length===1){unit({kind:'toggle',input:c,title:over||textOf(lab),desc:P.desc?.[c.id]},lab);continue;}
        }
        const l=labelOf(c,content);l.used.forEach(x=>used.add(x));
        unit({kind:'toggle',input:c,title:over||l.title||textOf(c.nextElementSibling),desc:P.desc?.[c.id]},c);continue;
      }
      if(c.matches('.menu_button,.right_menu_button,button,input[type=button],input[type=submit]')){
        if(c.querySelector('input[type=checkbox]'))continue; // label.menu_button 里的开关在上面当开关处理
        unit({kind:'action',button:c,title:P.label?.[c.id]||P.labelOf?.(c)||actionLabel(c),danger:danger(c)&&!P.safe?.some(x=>c.matches(x))},c);continue;
      }
      if(c.matches('toolcool-color-picker')){const l=labelOf(c,content);l.used.forEach(x=>used.add(x));unit({kind:'color',input:c,title:over||l.title},c);continue;}
      if(c.type==='range'){
        const counter=(c.id&&content.querySelector(`[data-for="${esc(c.id)}"]`))||c.closest('.range-block')?.querySelector('input[type=number]');
        const box=c.closest('.range-block');const lab=box?.querySelector('.range-block-title');
        const l=lab?{title:textOf(lab),used:[lab]}:labelOf(c,content);l.used.forEach(x=>used.add(x));
        if(counter)taken.add(counter);
        unit({kind:'range',input:c,counter,title:over||l.title,desc:P.desc?.[c.id]},c);continue;
      }
      const l=labelOf(c,content);l.used.forEach(x=>used.add(x));
      const kind=longs.has(c)?'long':lines.has(c)?'line':fields.has(c)?'field':c.tagName==='SELECT'?'select':c.tagName==='TEXTAREA'&&(+c.getAttribute('rows')||2)>1?'long':'field';
      unit({kind,input:c,title:over||l.title,desc:P.desc?.[c.id]??(kind==='long'?'':l.desc)},c);
    }
    // 搬动之前记下哪些外层里有控件：排的时候控件已经搬走了，外层只剩字，不能当成小标题。
    const holds=new Set();for(const c of content.querySelectorAll(CONTROL))for(let p=c.parentElement;p&&p!==content;p=p.parentElement)holds.add(p);
    return {units,byNode,used,skip,holds};
  }

  /* ---------- 第二遍：按原来的顺序排进小节和卡片 ---------- */
  function build(s){
    const P=s.plan,root=s.root,content=P.content?.(root)||root.querySelector('.inline-drawer-content')||root;
    const page=add(s,make('div','cwx-page'+(P.cls?' '+P.cls:'')));s.page=page;
    const {units,byNode,used,skip,holds}=scan(s,content);s.units=units;
    let sec=null,card=null,group='';
    const newSec=(title,first)=>{sec=make('section','cwx-sec');if(title){const h=make('h3','cwx-lab',L(title));sec.append(h);}page.append(sec);s.secs.push(sec);card=null;return sec;};
    const newCard=g=>{if(!sec)newSec('');card=make('div','cwx-card'+(g==='act'?' cwx-acts':g==='danger'?' cwx-danger':''));sec.append(card);group=g;return card;};
    // 说明文字也跟着原处显示 / 隐藏（换了来源，别的来源的提示不该出来）。
    const foot=(text,src)=>{if(!sec)newSec('');const f=make('p','cwx-foot',L(text));sec.append(f);card=null;
      if(src)s.rows.push({kind:'note',row:f,self:src,...gatesOf(src,root)});};
    const placed=new Set();let one=false;
    const emit=u=>{
      if(placed.has(u))return;placed.add(u);
      const b=P.before?.[u.input?.id||u.button?.id];if(b==='|')card=null;else if(b)newSec(b);
      const row=draw(s,u);if(!row)return;u.row=row;s.rows.push(u);
      if(u.kind==='long'||u.kind==='line'){if(!sec)newSec('');sec.append(row);card=null;return;}
      const g=u.kind==='action'?(u.danger?'danger':'act'):u.kind==='raw'?'raw':'row';
      if(one){if(!card)newCard('one');card.append(row);return;}
      if(!card||group!==g||g==='danger'||g==='raw')newCard(g);card.append(row);
    };
    // 先排 plan 里写死的小节（TTS 的开关分组之类），剩下的按原来的顺序。
    for(const part of P.layout||[]){
      if(part.title!==undefined||!sec)newSec(part.title||'');else card=null;one=!!part.card;
      for(const item of part.items){
        if(typeof item==='function'){item({emit,newSec,newCard,foot,s,page,sec:()=>sec});continue;}
        if(item==='|'){card=null;continue;}
        if(item.startsWith('foot:')){foot(item.slice(5));continue;}
        for(const n of content.querySelectorAll(item)){const u=byNode.get(n)||units.find(x=>x.input===n||x.button===n);if(u)emit(u);}
      }
    }
    one=false;card=null;
    if(P.layout&&P.rest!==false){newSec(typeof P.restTitle==='function'?' ':P.restTitle||'');if(typeof P.restTitle==='function')s.restSec=sec;}
    const heading=(n,tx)=>{const map=P.heading||{};if(tx in map){if(map[tx])newSec(map[tx]);else card=null;return;}newSec(tx);};
    const visit=el=>{
      for(const ch of el.children){
        if(ch.matches('.cwx-page,template,script,style'))continue;
        const u=byNode.get(ch);if(u){if(P.rest!==false)emit(u);continue;}
        if(used.has(ch)||skip.has(ch)||P.drop?.some(sel=>ch.matches(sel)))continue;
        if(ch.matches('hr')){card=null;continue;}
        if(ch.matches('.inline-drawer-header')){if(P.rest!==false)heading(ch,textOf(ch.querySelector('b,strong')||ch));continue;}
        if(!ch.matches(CONTROL)&&!holds.has(ch)){
          const tx=textOf(ch);if(!tx||P.rest===false)continue;
          if(ch.matches('h1,h2,h3,h4,h5,strong,b,.qr--title,.title_restorable')||(tx.length<=24&&!ch.matches('small,i,p,.hint,.notes,.warning,ul')))heading(ch,tx);
          else if(!ch.matches('.warning')&&!P.noFoot)foot(tx,ch);
          continue;
        }
        visit(ch);
      }
    };
    visit(content);
    P.after?.({s,page,emit,newSec,newCard,foot,content});
    if(P.tabs)tabs(s);
    root.prepend(page);root.classList.add('cwx-host');
    sync(s);
  }
  function title(u){return L(u.title||'')||'';}
  function draw(s,u){
    const P=s.plan;
    if(u.kind==='raw'){const box=make('div','cwx-raw');move(s,u.node,box);return box;}
    if(u.kind==='action'){
      const b=button('',()=>{u.button.click();},'cwx-row cwx-act'+(u.danger?' cwx-red':''));
      if(u.danger)b.append(icon('trash'));b.append(make('span','cwx-title',title(u)||L('操作')));
      return b;
    }
    if(u.kind==='toggle'){
      const r=make('label','cwx-row cwx-tog'),info=make('span','cwx-t');info.append(make('span','cwx-title',title(u)));
      if(u.desc)info.append(make('small','cwx-desc',L(u.desc)));r.append(info);move(s,u.input,r);
      if(u.input.classList.contains('displayNone')){u.input.classList.remove('displayNone');s.undo.push(()=>u.input.classList.add('displayNone'));}
      if(P.invert?.some(sel=>u.input.matches(sel)))r.classList.add('cwx-invert');
      return r;
    }
    if(u.kind==='radio'){
      const r=make('label','cwx-row cwx-radio');r.append(make('span','cwx-title',title(u)));
      for(const x of u.extra){const w=make('span','cwx-inline');r.append(w);move(s,x,w);}
      move(s,u.input,r);return r;
    }
    if(u.kind==='select'){
      const r=make('div','cwx-row cwx-sel'),info=make('span','cwx-t');info.append(make('span','cwx-title',title(u)));if(u.desc)info.append(make('small','cwx-desc',L(u.desc)));r.append(info);move(s,u.input,r);
      return r;
    }
    if(u.kind==='range'){
      const r=make('div','cwx-row cwx-range'),head=make('div','cwx-rhead');head.append(make('span','cwx-title',title(u)));r.append(head);
      const track=make('div','cwx-track');r.append(track);move(s,u.input,track);
      // 没有数字框的滑杆（系统语音的速率、音调）右边写当前值。
      const val=u.counter?null:make('span','cwx-rval');if(u.counter)move(s,u.counter,head);else head.append(val);
      const n=u.input;u.paint=()=>{const lo=+n.min||0,hi=+n.max||100,p=Math.max(0,Math.min(100,(n.value-lo)/((hi-lo)||1)*100))+'%';if(track.style.getPropertyValue('--p')!==p){track.style.setProperty('--p',p);n.style.setProperty('--p',p);n.style.setProperty('--fill',p);}if(val&&val.textContent!==n.value)val.textContent=n.value;};
      n.addEventListener('input',u.paint);const hadStyle=n.getAttribute('style');s.undo.push(()=>{n.removeEventListener('input',u.paint);n.style.removeProperty('--p');n.style.removeProperty('--fill');if(hadStyle===null&&!n.getAttribute('style'))n.removeAttribute('style');});return r;
    }
    if(u.kind==='color'){const r=make('div','cwx-row cwx-field cwx-color');r.append(make('span','cwx-flab',title(u)));move(s,u.input,r);return r;}
    if(u.kind==='line'){
      const blk=make('div','cwx-block cwx-line'),lab=make('label','cwx-blab',title(u)),c=make('div','cwx-card'),r=make('div','cwx-row cwx-lrow');
      blk.append(lab,c);c.append(r);move(s,u.input,r);if(u.desc)blk.append(make('p','cwx-foot',L(u.desc)));return blk;
    }
    if(u.kind==='long'){
      const ta=u.input,blk=make('div','cwx-block cwx-long'),lab=make('div','cwx-blab',title(u)),c=make('div','cwx-card');
      const open=button('',()=>openEditor(ta,title(u)),'cwx-row cwx-lopen'),prev=make('span','cwx-prev'),edit=make('span','cwx-edit',L('编辑'));
      open.append(prev,edit);c.append(open);blk.append(lab,c);if(u.desc)blk.append(make('p','cwx-foot',L(u.desc)));
      const park=make('div','cwx-park');blk.append(park);move(s,ta,park);
      const paint=()=>{const v=(ta.value||'').trim();const text=v||ta.placeholder&&L('（空）')||L('（空）');if(prev.textContent!==text)prev.textContent=text;prev.classList.toggle('cwx-dim',!v);};
      paint();ta.addEventListener('input',paint);ta.addEventListener('change',paint);u.paint=paint;
      s.undo.push(()=>{ta.removeEventListener('input',paint);ta.removeEventListener('change',paint);});
      return blk;
    }
    // field：手机上「灰标签 · 黑值」，点了就地改；电脑上是右边的小输入框。
    const r=make('label','cwx-row cwx-field');r.append(make('span','cwx-flab',title(u)));move(s,u.input,r);
    if(u.input.tagName==='TEXTAREA'){u.input.classList.add('cwx-oneline');s.undo.push(()=>u.input.classList.remove('cwx-oneline'));}
    return r;
  }

  /* ---------- 同步：原来的块藏了，我们的行也藏；空卡片、空小节一起藏 ---------- */
  const cs=n=>win.getComputedStyle(n);
  function sync(s){
    if(!s.page)return;
    for(const u of s.rows){
      const self=u.proxy||u.kind==='note'?false:u.kind==='action'?cs(u.button).display==='none'||u.button.hidden:u.kind==='raw'?hiddenSelf(u.node)||(!u.node.hasAttribute('no-scripts-text')&&!u.node.matches(FIELD)&&!u.node.children.length&&!u.node.textContent.trim()):hiddenSelf(u.self);
      const off=self||u.gates.some(g=>g.hidden||cs(g).display==='none')||!!u.top&&hiddenSelf(u.top);
      if(u.row.hidden!==off)u.row.hidden=off;
      if(u.kind==='action'){const label=title(u)||L('操作'),span=u.row.querySelector('.cwx-title');if(span&&u.button.matches('input')&&span.textContent!==label)span.textContent=label;}
      u.paint?.();
    }
    // plan 自己的显隐（作者注释的层数行、数据库的批量操作……）在算空卡片 / 空小节之前做。
    s.plan.sync?.(s);
    for(const sec of s.secs){
      for(const c of sec.querySelectorAll(':scope>.cwx-card'))c.hidden=![...c.children].some(x=>!x.hidden);
      const any=[...sec.children].some(x=>!x.matches('.cwx-lab,.cwx-foot')&&!x.hidden);
      sec.hidden=!any;
    }
    const first=s.secs.find(x=>!x.hidden);for(const x of s.secs)x.classList.toggle('cwx-first',x===first);
    const rt=s.restSec?.querySelector(':scope>.cwx-lab');if(rt){const v=L(s.plan.restTitle(s.root));if(rt.textContent!==v)rt.textContent=v;}
    if(s.plan.tabs)applyTab(s);
  }
  function schedule(s,rebuild){
    if(rebuild)s.dirty=true;if(s.frame)return;
    s.frame=win.requestAnimationFrame(()=>{s.frame=0;if(s.closed)return;
      if(s.dirty){s.dirty=false;s.observer.disconnect();const body=s.page?.closest('.cw-v4-editor-body,.popup-content,dialog'),top=body?.scrollTop||0;teardown(s);build(s);if(body)body.scrollTop=top;observe(s);}
      else sync(s);});
  }
  function observe(s){
    s.observer.observe(s.root,{childList:true,subtree:true,attributes:true,attributeFilter:['style','class','hidden']});
  }
  function watchRoot(s){
    s.observer=new win.MutationObserver(list=>{
      let rebuild=false,touched=false;
      for(const m of list){
        const inPage=s.page?.contains(m.target);
        if(m.type==='childList'){
          // 酒馆往原处加了新控件（换服务商后重画设置）→ 重排；我们页面里的列表自己会变，不用管。
          if(!inPage&&[...m.addedNodes].some(n=>n.nodeType===1&&(n.matches(CONTROL)||n.querySelector(CONTROL))))rebuild=true;
          if(inPage)touched=true;
        }else if(!(inPage&&m.target.matches?.('.cwx-row,.cwx-card,.cwx-sec,.cwx-block')))touched=true;
      }
      if(rebuild)schedule(s,true);else if(touched)schedule(s);
    });
    observe(s);
  }

  /* ---------- 酒馆的弹窗（快速回复编辑、正则编辑）：同一套排法，弹窗关了就没了，不用还原 ---------- */
  const watch=new win.MutationObserver(()=>{
    for(const [root,s] of popups)if(!root.isConnected){close(s);popups.delete(root);}
    if(!doc.documentElement.hasAttribute('data-cw-v4'))return;
    for(const root of doc.querySelectorAll('dialog[open] #qr--modalEditor,dialog[open] .regex_editor')){
      if(popups.has(root))continue;
      const plan=root.id==='qr--modalEditor'?PLANS.qrEditor:PLANS.regexEditor;
      const s=session(root,plan);popups.set(root,s);root.closest('dialog')?.classList.add('cwx-popup','wide_dialogue_popup');
      build(s);watchRoot(s);
    }
  });

  /* ---------- 2.0.274「≡」里的浮窗（作者注释 / CFG / Token 概率，稿 design-options-menu-v1）----------
     酒馆把它们画成能拖的浮窗；这里等它显示出来，就把里面那块（holder）放进我们的弹出页（手机）/ 弹窗（电脑），
     按 plan 重排；浮窗本身留在原处（显示状态不变，酒馆判断开关靠它），只是看不见。关掉时把浮窗收起。 */
  const tagTab=key=>({sec})=>{const x=sec();if(x)x.dataset.cwxTab=key;};
  // 一组单选框画成一行下拉：<select> 是我们新建的，改了就代点对应的单选框；酒馆那边变了，sync 时跟着变。
  const radioPick=(name,title,labels)=>({emit,s})=>{
    const radios=[...s.root.querySelectorAll(`input[type=radio][name="${name}"]`)];if(!radios.length)return;
    const sel=make('select','text_pole cwx-proxy');for(const r of radios){const o=make('option','',L(labels[r.value]??r.value));o.value=r.value;sel.append(o);}
    sel.addEventListener('change',()=>{const r=radios.find(x=>x.value===sel.value);if(r&&!r.checked)r.click();s.plan.sync?.(s);});
    const u={kind:'select',input:sel,title,gates:[],self:sel,root:sel,proxy:true,name};
    u.paint=()=>{const r=radios.find(x=>x.checked);if(r&&sel.value!==r.value)sel.value=r.value;};
    emit(u);
  };
  // 酒馆的控件被包在单选框的 label 里（层数 / 作为），按 ID 直接拿出来排成一行。
  const pick=(id,kind,title,extra={})=>({emit,s})=>{const n=s.root.querySelector('#'+id);if(n)emit({kind,input:n,title,gates:[],self:n,root:n,...extra});};
  // 只读的一行（「距离下一次 · 0 条」）：一个只读输入框，值在 sync 里写。
  const info=(key,title)=>({emit,s})=>{const n=make('input','text_pole cwx-readonly');n.readOnly=true;n.tabIndex=-1;n.dataset.cwxInfo=key;emit({kind:'field',input:n,title,gates:[],self:n,root:n,proxy:true});};
  const rowOf=(s,n)=>s.rows.find(u=>u.input===n)?.row;
  const anDepthRows=(s,radio,depth,role)=>{const on=s.root.querySelector(`input[name="${radio}"][value="1"]`)?.checked;for(const id of [depth,role]){const r=rowOf(s,s.root.querySelector('#'+id));if(r&&r.hidden===on)r.hidden=!on;}};
  const footOf=(s,id)=>rowOf(s,s.root.querySelector('#'+id))?.querySelector('.cwx-foot');
  const setText=(n,v)=>{if(n&&n.textContent!==v)n.textContent=v;};
  const charName=()=>{try{const c=win.SillyTavern?.getContext?.();return c?.name2||'';}catch{return '';}};
  const POS={2:'主提示词之前',0:'主提示词之后',1:'聊天中的某一层'};

  /* ---------- 各扩展的排法（标题文字照稿） ---------- */
  const has=sel=>root=>!!root.querySelector(sel);
  let lastRegexRow=null,lastQrItem=null;
  const proxy=(label,target,red)=>({emit,s})=>{const b=typeof target==='function'?target():target;if(!b)return;emit({kind:'action',button:b,title:label,danger:!!red,gates:[],self:b,root:b,proxy:true});};
  const PLANS={
    vectors:{match:has('#vectors_source'),
      label:{vectors_source:'向量化来源',vectors_query:'查询消息',vectors_score_threshold:'分数阈值',vectors_force_chunk_delimiter:'区块边界',vectors_include_wi:'纳入世界书扫描',vectors_enabled_world_info:'启用世界书',vectors_enabled_files:'为文件启用',vectors_enabled_chats:'已启用聊天消息'},
      desc:{vectors_include_wi:'向量结果也能触发世界书条目'},field:['#vectors_force_chunk_delimiter'],
      before:{vectors_query:'检索',vectors_include_wi:'|'},
      heading:{'世界书设置':'世界书','World Info settings':'世界书','文件向量化设置':'文件','File vectorization settings':'文件','聊天向量化设置':'聊天','Chat vectorization settings':'聊天'}},
    tts:{match:has('#tts_provider'),
      label:{tts_enabled:'启用',tts_provider:'服务商',tts_narrate_user:'朗读用户消息',tts_auto_generation:'自动生成',tts_narrate_quoted:'只朗读引号内文本',tts_narrate_dialogues:'不朗读 *星号* 内文本',tts_narrate_translated_only:'只朗读翻译后文本',
        tts_skip_codeblocks:'跳过代码块',tts_skip_tags:'跳过标签块里的内容',tts_periodic_auto_generation:'按段朗读（流式播放时）',tts_narrate_by_paragraphs:'按段朗读（非流式时）',tts_pass_asterisks:'星号内文本交给 TTS',tts_multi_voice_enabled:'引号 / 星号用不同的声音',tts_apply_regex:'应用正则过滤',tts_regex_pattern:'正则',playback_rate:'播放速度',tts_refresh:'刷新声音列表',tts_voices:'可用声音'},
      desc:{tts_skip_tags:'<tag>跳过这里</tag>'},
      layout:[{items:['#tts_enabled','#tts_provider']},{items:['#tts_refresh','#tts_voices']},
        {title:'朗读什么',items:['#tts_narrate_user','#tts_auto_generation','#tts_narrate_quoted','#tts_narrate_dialogues','#tts_narrate_translated_only']},
        {title:'跳过',items:['#tts_skip_codeblocks','#tts_skip_tags']},{title:'流式',items:['#tts_periodic_auto_generation','#tts_narrate_by_paragraphs']},
        {title:'其他',items:['#tts_pass_asterisks','#tts_multi_voice_enabled','#tts_apply_regex','#tts_regex_pattern','#playback_rate']}],
      restTitle:root=>{const o=root.querySelector('#tts_provider')?.selectedOptions[0];return !o?'服务商设置':o.value==='System'?'系统语音':o.textContent.trim();},drop:['#tts_status:empty'],heading:{'选择文本转语音服务商':null,'Select TTS Provider':null}},
    expressions:{match:has('#expression_api'),
      label:{expression_api:'分类器',expression_translate:'分类前翻译成英文',expressions_allow_multiple:'允许关键词重复',expressions_reroll_if_same:'同一关键词再次出现时刷新表情',expression_fallback:'找不到时用',expression_custom:'自定义情绪',expression_custom_add:'添加自定义情绪',expression_custom_remove:'删除选中的自定义情绪',expression_override:'立绘文件夹'},
      raw:['#image_list','#no_chat_expressions'],skip:['#expression_override_button'],
      layout:[{title:'分类',items:['#expression_api','#expression_translate','#expressions_filter_available','#expression_llm_prompt','#expression_llm_prompt_restore','.expression_prompt_type_block input']},
        {title:'关键词',items:['#expressions_allow_multiple','#expressions_reroll_if_same']},
        {title:'情绪',items:['#expression_fallback','#expression_custom','|','#expression_custom_add','#expression_custom_remove','foot:也可以用 /emote 快捷命令设置。']},
        {title:'立绘',items:['#no_chat_expressions','#expression_override','#expression_upload_pack_button','#expression_override_cleanup_button','#image_list']}],
      rest:false},
    translate:{match:has('#translation_provider'),
      label:{translation_auto_mode:'自动翻译',translation_provider:'服务',translation_target_language:'目标语言',deepl_api_endpoint:'DeepL 接口',translate_key_button:'密钥',translate_url_button:'地址',translation_clear:'清空翻译'},
      layout:[{items:['#translation_auto_mode','#translation_provider','#deepl_api_endpoint','#translation_target_language','|','#translate_key_button','#translate_url_button','|','#translation_clear','foot:只清掉已保存的译文，不影响原文。']}],rest:false},
    caption:{match:has('#caption_source'),
      label:{caption_source:'来源',caption_template:'消息模板',caption_auto:'自动为图片添加描述',caption_refine_mode:'保存前编辑描述',caption_show_in_chat:'在聊天中显示描述'},
      desc:{caption_template:'写 {{caption}} 的地方会换成图片描述。'},long:['#caption_template']},
    memory:{match:has('#memory_contents'),
      label:{summary_source:'来源',memory_frozen:'暂停',memory_contents:'当前总结',memory_restore:'恢复上一个',summarySettingsBlockToggle:'总结设置',memory_force_summarize:'立即总结',memory_skipWIAN:'不含世界书 / 作者注释'},
      skip:['#summaryExtensionPopoutButton','.editor_maximize'],
      layout:[{items:['#summary_source','#memory_frozen','#memory_skipWIAN']},{items:['#memory_contents']},{items:['#memory_force_summarize','#memory_restore','#summarySettingsBlockToggle']}],
      restTitle:'总结设置'},
    extras:{match:root=>root.matches?.('.extensions_url_block')||!!root.querySelector('#extensions_url'),
      content:root=>root,label:{extensions_url:'地址',extensions_api_key:'密钥',extensions_autoconnect:'自动连接',extensions_connect:'连接'}},
    qr:{match:has('#qr--isEnabled'),cls:'cwx-qr',
      label:{'qr--isEnabled':'启用快速回复','qr--isCombined':'合并快速回复','qr--showPopoutButton':'电脑上显示弹出式按钮','qr--set':'集合','qr--disableSend':'禁用发送（插入输入框）','qr--placeBeforeInput':'放在输入框前面','qr--injectInput':'自动注入用户输入','qr--onlyBorderColor':'颜色只用在边框上',
        'qr--global-setListAdd':'添加全局集合','qr--chat-setListAdd':'添加聊天集合','qr--character-setListAdd':'添加角色集合','qr--set-new':'新建集合','qr--set-rename':'改名','qr--set-import':'导入','qr--set-export':'导出','qr--set-duplicate':'复制','qr--set-delete':'删除这个集合','qr--set-add':'新建按钮','qr--set-paste':'从剪贴板粘贴','qr--set-importQr':'从文件导入','qr--colorClear':'清除颜色','qr--color':'颜色'},
      desc:{'qr--injectInput':'关掉时用 {{input}} 手动插入'},safe:['#qr--colorClear'],raw:['.qr--setList','#qr--set-qrList'],
      layout:[{items:['#qr--isEnabled','#qr--isCombined','#qr--showPopoutButton']},
        {title:'正在用的集合',items:[({emit,s})=>{for(const [id,name] of [['qr--global-setList','全局'],['qr--chat-setList','聊天'],['qr--character-setList','角色']]){const n=s.root.querySelector('#'+id);if(n){n.dataset.cwxTitle=L(name);s.undo.push(()=>delete n.dataset.cwxTitle);}}},
          '#qr--global-setList','#qr--chat-setList','#qr--character-setList'],card:true},{items:['#qr--global-setListAdd','#qr--chat-setListAdd','#qr--character-setListAdd']},
        {title:'编辑集合',items:['#qr--set']},{items:['#qr--set-qrList','#qr--set-add','#qr--set-paste','#qr--set-importQr','foot:点一个按钮进去改名字和内容；按住左边的把手拖动排序。'],card:true},
        {title:'这个集合',items:['#qr--disableSend','#qr--placeBeforeInput','#qr--injectInput','#qr--color','#qr--colorClear','#qr--onlyBorderColor'],card:true},{items:['#qr--set-new','#qr--set-rename','#qr--set-import','#qr--set-export','#qr--set-duplicate','#qr--set-delete']}],
      rest:false,after:({s,page})=>qrList(s,page),sync:s=>qrList(s,s.page)},
    regex:{match:has('#saved_regex_scripts'),cls:'cwx-regex',
      label:{open_regex_editor:'新建全局正则',open_preset_editor:'新建预设正则',open_scoped_editor:'新建角色正则',import_regex:'导入正则',regex_bulk_edit:'批量编辑',open_regex_debugger:'调试工具',regex_presets:'预设',regex_preset_toggle:'启用预设正则',regex_scoped_toggle:'启用角色正则',
        regex_preset_create:'新建预设',regex_preset_update:'用当前开关更新预设',regex_preset_apply:'重新应用预设',regex_preset_delete:'删除这个预设',bulk_select_all_toggle:'全选 / 全不选',bulk_enable_regex:'启用选中的',bulk_disable_regex:'停用选中的',bulk_export_regex:'导出选中的',bulk_delete_regex:'删除选中的',
        bulk_regex_move_to_global:'移到全局',bulk_regex_move_to_preset:'移到预设',bulk_regex_move_to_scoped:'移到角色'},
      raw:['#saved_regex_scripts','#saved_preset_scripts','#saved_scoped_scripts'],
      layout:[{items:['#regex_bulk_edit','|','.regex_bulk_operations .menu_button']},
        {title:'全局',card:true,items:['#saved_regex_scripts','#open_regex_editor','foot:影响所有角色。点一条进去编辑；右边开关是启用 / 停用；按住左边的把手拖动排序。']},
        {title:'预设',card:true,items:['#regex_preset_toggle','#saved_preset_scripts','#open_preset_editor']},
        {title:'角色',card:true,items:['#regex_scoped_toggle','#saved_scoped_scripts','#open_scoped_editor']},
        {title:'正则预设',items:['#regex_presets','|','#regex_preset_create','#regex_preset_update','#regex_preset_apply','#regex_preset_delete']},
        {items:['#import_regex','#open_regex_debugger']}],
      rest:false,after:({s,page})=>regexList(s,page),sync:s=>regexList(s,s.page)},
    qrEditor:{content:root=>root,cls:'cwx-sheet',
      label:{'qr--modal-label':'标签','qr--modal-title':'提示文字','qr--modal-message':'内容','qr--modal-showLabel':'有图标时也显示标签','qr--modal-icon':'选图标',
        'qr--executeOnStartup':'启动时','qr--executeOnUser':'用户发消息后','qr--executeOnAi':'AI 回复后','qr--executeOnChatChange':'打开聊天时','qr--executeOnNewChat':'新聊天时','qr--executeOnGroupMemberDraft':'群聊成员发言前','qr--executeBeforeGeneration':'生成前',
        'qr--preventAutoExecute':'不触发别的自动执行','qr--isHidden':'隐藏按钮（只自动执行）','qr--automationId':'自动化 ID','qr--modal-execute':'立即执行','qr--ctxAdd':'添加右键菜单项',
        'qr--modal-wrap':'自动换行','qr--modal-tabSize':'Tab 宽度','qr--modal-executeShortcut':'Ctrl+Enter 执行','qr--modal-syntax':'语法高亮'},
      line:['#qr--modal-label'],long:['#qr--modal-message'],raw:['#qr--ctxEditor','#qr--modal-executeProgress','#qr--modal-executeErrors','#qr--modal-executeResult'],
      layout:[{title:'',items:['#qr--modal-label','#qr--modal-message','foot:点一下按钮就会发送这里的内容。']},
        {title:'什么时候自动执行',items:['#qr--executeOnStartup','#qr--executeOnUser','#qr--executeOnAi','#qr--executeOnChatChange','#qr--executeOnNewChat','#qr--executeOnGroupMemberDraft','#qr--executeBeforeGeneration','|','#qr--isHidden','#qr--preventAutoExecute','#qr--automationId']},
        {title:'按钮',items:['#qr--modal-title','#qr--modal-showLabel','|','#qr--modal-icon']},
        {title:'右键菜单',items:['#qr--ctxEditor','#qr--ctxAdd']},
        {title:'编辑器',items:['#qr--modal-wrap','#qr--modal-syntax','#qr--modal-executeShortcut','#qr--modal-tabSize']},
        {title:'测试',items:['#qr--modal-execute','#qr--modal-executeProgress','#qr--modal-executeErrors','#qr--modal-executeResult']},
        {items:[proxy('复制到剪贴板',()=>lastQrItem?.isConnected&&lastQrItem.querySelector('.qr--actions .fa-copy')),proxy('导出',()=>lastQrItem?.isConnected&&lastQrItem.querySelector('.qr--actions .fa-file-export'))]},
        {items:[proxy('删除这个按钮',()=>lastQrItem?.isConnected&&lastQrItem.querySelector('.qr--actions .fa-trash-can'),true)]}],
      rest:false},
    regexEditor:{content:root=>root,cls:'cwx-sheet',
      labelOf:c=>c.matches('.regex_script_name')?'名称':c.matches('.find_regex')?'查找':c.matches('.regex_replace_string')?'替换为':c.matches('.regex_trim_strings')?'修剪掉':c.matches('[name=min_depth]')?'最小深度':c.matches('[name=max_depth]')?'最大深度':c.matches('[name=substitute_regex]')?'查找里的宏':c.matches('#regex_test_mode_toggle')?'测试模式':c.matches('#regex_test_input')?'测试输入':c.matches('#regex_test_output')?'输出':'',
      line:['input.regex_script_name','input.find_regex'],long:['.regex_replace_string','.regex_trim_strings','#regex_test_input','#regex_test_output'],raw:['#regex_info_block_wrapper'],
      layout:[{items:['input.regex_script_name','input.find_regex','#regex_info_block_wrapper','.regex_replace_string','.regex_trim_strings']},
        {title:'作用于',items:['[name=replace_position]']},
        {title:'其他',items:['[name=disabled]','[name=run_on_edit]','[name=only_format_display]','[name=only_format_prompt]','|','[name=min_depth]','[name=max_depth]','[name=substitute_regex]']},
        {title:'测试',items:['#regex_test_mode_toggle','#regex_test_input','#regex_test_output']},
        {items:[proxy('导出',()=>lastRegexRow?.isConnected&&lastRegexRow.querySelector('.export_regex')),proxy('移到全局正则',()=>lastRegexRow?.isConnected&&!lastRegexRow.closest('#saved_regex_scripts')&&lastRegexRow.querySelector('.move_to_global')),proxy('移到预设正则',()=>lastRegexRow?.isConnected&&!lastRegexRow.closest('#saved_preset_scripts')&&lastRegexRow.querySelector('.move_to_preset')),proxy('移到角色正则',()=>lastRegexRow?.isConnected&&!lastRegexRow.closest('#saved_scoped_scripts')&&lastRegexRow.querySelector('.move_to_scoped'))]},
        {items:[proxy('删除这条正则',()=>lastRegexRow?.isConnected&&lastRegexRow.querySelector('.delete_regex'),true)]}],
      rest:false},
    // 作者注释：三页「本聊天 / 角色 / 默认」，每页同一套：注释、插入到哪里（位置 · 层数 · 作为）、多久插一次、纳入世界书扫描。
    an:{content:root=>root,cls:'cwx-tabbed',tabs:[['chat','本聊天'],['char','角色'],['def','默认']],
      label:{extension_floating_prompt:'注释',extension_floating_allow_wi_scan:'纳入世界书扫描',extension_floating_interval:'每几条用户消息',
        extension_use_floating_chara:'使用角色注释',extension_floating_chara:'角色的注释',extension_floating_default:'注释',extension_default_interval:'每几条用户消息'},
      desc:{extension_floating_prompt:' ',extension_floating_allow_wi_scan:'注释里的词也能触发世界书条目',extension_floating_chara:'只存在本地，导出角色卡不会带上。',extension_floating_default:' '},
      long:['#extension_floating_prompt','#extension_floating_chara','#extension_floating_default'],field:['#extension_floating_interval','#extension_default_interval'],
      layout:[
        {title:'',items:[tagTab('chat'),'#extension_floating_prompt']},
        {title:'插入到哪里',items:[tagTab('chat'),radioPick('extension_floating_position','位置',POS),pick('extension_floating_depth','field','层数'),pick('extension_floating_role','select','作为'),'foot:「层数」是从最新一条消息往上数；0 就是紧贴在最后。']},
        {title:'多久插一次',items:[tagTab('chat'),'#extension_floating_interval',info('anCounter','距离下一次'),'foot:0 是不插，1 是每条都插。']},
        {title:'',items:[tagTab('chat'),'#extension_floating_allow_wi_scan']},
        {title:'',items:[tagTab('char'),'#extension_use_floating_chara',radioPick('extension_floating_char_position','和聊天注释',{0:'替换聊天注释',1:'放在前面',2:'放在后面'})]},
        {title:'',items:[tagTab('char'),'#extension_floating_chara']},
        {title:'',items:[tagTab('def'),'#extension_floating_default']},
        {title:'插入到哪里',items:[tagTab('def'),radioPick('extension_default_position','位置',POS),pick('extension_default_depth','field','层数'),pick('extension_default_role','select','作为'),'foot:「层数」是从最新一条消息往上数；0 就是紧贴在最后。']},
        {title:'多久插一次',items:[tagTab('def'),'#extension_default_interval','foot:0 是不插，1 是每条都插。']}],
      rest:false,
      sync:s=>{
        anDepthRows(s,'extension_floating_position','extension_floating_depth','extension_floating_role');
        anDepthRows(s,'extension_default_position','extension_default_depth','extension_default_role');
        const tk=id=>(s.root.querySelector('#'+id)?.textContent||'0').trim();
        setText(footOf(s,'extension_floating_prompt'),`${tk('extension_floating_prompt_token_counter')} 个 Token。只对这个聊天生效；检查点会从上一个聊天继承。`);
        setText(footOf(s,'extension_floating_default'),`${tk('extension_floating_default_token_counter')} 个 Token。新聊天会自动带上这段注释。`);
        const name=charName();setText(rowOf(s,s.root.querySelector('#extension_floating_chara'))?.querySelector('.cwx-blab'),name?`${name} 的注释`:L('角色的注释'));
        const c=s.page?.querySelector('[data-cwx-info=anCounter]'),raw=(s.root.querySelector('#extension_floating_counter')?.textContent||'').trim();
        if(c){const v=/^\d+$/.test(raw)?raw+' 条':L('没开');if(c.value!==v)c.value=v;}
      }},
    // CFG 缩放：三页「本聊天 / 角色 / 全局」：缩放比例滑杆、负面 / 正面提示词；「合并」（原来叫 CFG 提示词级联）放在本聊天页。
    cfg:{content:root=>root,cls:'cwx-tabbed',tabs:[['chat','本聊天'],['char','角色'],['global','全局']],
      label:{chat_cfg_guidance_scale:'缩放比例',chara_cfg_guidance_scale:'缩放比例',global_cfg_guidance_scale:'缩放比例',chat_cfg_negative_prompt:'负面提示词',chara_cfg_negative_prompt:'负面提示词',global_cfg_negative_prompt:'负面提示词',
        chat_cfg_positive_prompt:'正面提示词',chara_cfg_positive_prompt:'正面提示词',global_cfg_positive_prompt:'正面提示词',groupchat_cfg_use_chara:'用角色的缩放比例',cfg_prompt_separator:'分隔符',cfg_prompt_insertion_depth:'插入深度'},
      labelOf:c=>c.name==='cfg_prompt_combine'?({0:'带上本聊天的提示词',1:'带上角色的提示词',2:'带上全局的提示词'}[c.value]||''):'',
      desc:{chat_cfg_positive_prompt:'只对这个聊天生效。缩放比例 1 是不启用；只有支持 CFG 的后端（如 KoboldCpp、Ooba）会用到。',chara_cfg_positive_prompt:'会自动用在这个角色的聊天里。',global_cfg_positive_prompt:'每个聊天默认用这里的，除非聊天或角色自己设了。'},
      long:['#chat_cfg_negative_prompt','#chat_cfg_positive_prompt','#chara_cfg_negative_prompt','#chara_cfg_positive_prompt','#global_cfg_negative_prompt','#global_cfg_positive_prompt'],field:['#cfg_prompt_separator','#cfg_prompt_insertion_depth'],
      layout:[
        {title:'',items:[tagTab('chat'),'#chat_cfg_guidance_scale','#groupchat_cfg_use_chara']},
        {title:'',items:[tagTab('chat'),'#chat_cfg_negative_prompt','#chat_cfg_positive_prompt']},
        {title:'合并',items:[tagTab('chat'),'input[name=cfg_prompt_combine]','#cfg_prompt_separator','#cfg_prompt_insertion_depth','foot:打开后，这几处的提示词会拼在一起发出去。']},
        {title:'',items:[tagTab('char'),'#chara_cfg_guidance_scale']},
        {title:'',items:[tagTab('char'),'#chara_cfg_negative_prompt','#chara_cfg_positive_prompt']},
        {title:'',items:[tagTab('global'),'#global_cfg_guidance_scale']},
        {title:'',items:[tagTab('global'),'#global_cfg_negative_prompt','#global_cfg_positive_prompt']}],
      rest:false},
    // Token 概率：上面「最后一条回复」（酒馆画的每个词，点一个选中），下面「「词」的候选」（每行 词 · 概率条 · 百分比）。
    // 内容都是酒馆随时重画的，整块原样放进卡片；概率条、中文提示在 sync 里补。
    logprobs:{content:root=>root,cls:'cwx-logprobs',raw:['#logprobs_generation_output','#logprobs_selected_top_logprobs'],
      label:{logprobsReroll:'从续写开头重新生成'},
      layout:[
        {title:'最后一条回复',items:['#logprobs_generation_output',({emit})=>{const b=make('button','');b.type='button';b.addEventListener('click',goTokenSetting);emit({kind:'action',button:b,title:'去偏好设置打开',gates:[],self:b,root:b,proxy:true,lpGo:true});},'foot:点一个词，下面列出 AI 当时考虑过的其他词。','#logprobsReroll']},
        {title:'候选',items:['#logprobs_selected_top_logprobs','foot:点一个候选：换成这个词，从这里往后重新续写。']}],
      rest:false,
      sync:s=>{
        const out=s.root.querySelector('#logprobs_generation_output'),empty=out?.querySelector('.logprobs_empty_state');
        const off=!!empty&&(empty.dataset.cwxOff==='1'||!!empty.querySelector('b'));   // 没打开功能时酒馆写「Enable <b>Request token probabilities</b>…」
        if(empty&&!empty.dataset.cwx){empty.dataset.cwx='1';if(off)empty.dataset.cwxOff='1';const tx=empty.textContent;
          empty.textContent=L(off?'Token 概率没打开。打开后，每条回复都能看到 AI 在每个词上考虑过的其他词。':/Smooth Streaming/i.test(tx)?'开着「平滑流式」时看不到 Token 概率。':/in progress/i.test(tx)?'正在生成……':'这条消息没有 Token 概率。');}
        const go=s.rows.find(u=>u.lpGo);if(go&&go.row.hidden===off)go.row.hidden=!off;
        // 有内容时那句「点一个词」才有用
        const sec0=s.secs[0],f0=sec0?.querySelector(':scope>.cwx-foot');if(f0&&f0.hidden!==!!empty)f0.hidden=!!empty;
        const list=s.root.querySelector('#logprobs_selected_top_logprobs');
        for(const c of list?.querySelectorAll('.logprobs_top_candidate')||[]){
          const sp=c.querySelectorAll(':scope>span'),pct=parseFloat(sp[1]?.textContent)||0,w=Math.max(0,Math.min(100,pct))+'%';
          if(c.style.getPropertyValue('--cwx-pct')!==w)c.style.setProperty('--cwx-pct',w);
          if(sp[1]&&!sp[1].dataset.cwx){sp[1].dataset.cwx='1';sp[1].textContent=pct.toFixed(1)+'%';}
          if(sp[0]&&sp[0].textContent==='<others>'){sp[0].textContent=L('其他');}
        }
        const sel=s.root.querySelector('.logprobs_output_token.selected')?.textContent?.trim();
        const lab=s.secs[1]?.querySelector(':scope>.cwx-lab');if(lab)setText(lab,sel?`「${sel}」的候选`:L('候选'));
      }},
    // 管理聊天文件（照 Chats 列表）：搜索框、聊天一行一条（气泡 · 名字 · 「几条消息 · 大小 · 日期」· ⋯），正在用的标「当前」；
    // 原来行右边的改名 / 导出 / 纯文本 / 删除收进 ⋯（代点原按钮）；「新聊天 / 导入聊天 / 备份」放在列表下面的蓝字行。
    chats:{content:root=>root,cls:'cwx-chats',raw:['#select_chat_search','#select_chat_div'],
      // 2.0.276（Lulu：点一条聊天，加载完后弹出页又闪一下）：酒馆加载时盖一层转圈，转完才收我们的弹出页；改成点下去就开始收。
      after:({s,page})=>{const pick=e=>{if(!e.target.closest('.select_chat_block')||e.target.closest('.cwx-more-menu'))return;win.setTimeout(()=>page.closest('dialog.cw-v4-editor')?._cwShut?.(),0);};page.addEventListener('click',pick);s.undo.push(()=>page.removeEventListener('click',pick));},
      label:{newChatFromManageScreenButton:'新聊天',chat_import_button:'导入聊天'},safe:['#select_chat_cross'],
      layout:[{title:'',items:['#select_chat_search']},{title:'',items:['#select_chat_div']},
        {title:'',items:['#newChatFromManageScreenButton','#chat_import_button',({emit,s})=>{for(const b of s.root.querySelectorAll('[name=selectChatPopupHeader]>button.menu_button,[name=selectChatPopupHeader]>.menu_button:not([id])'))emit({kind:'action',button:b,title:textOf(b)||L('操作'),gates:[],self:b,root:b});},'foot:点一条打开；⋯ 里有改名、导出、删除。']}],
      rest:false,
      sync:s=>{
        const q=s.root.querySelector('#select_chat_search');if(q&&q.placeholder!==L('搜索聊天'))q.placeholder=L('搜索聊天');
        for(const w of s.root.querySelectorAll('#select_chat_div .select_chat_block_wrapper')){
          const blk=w.querySelector('.select_chat_block');if(!blk||blk.querySelector(':scope>.cwx-chatrow'))continue;
          const name=blk.querySelector('.select_chat_block_filename')?.textContent.trim()||'';
          const num=(blk.querySelector('.chat_messages_num')?.textContent.match(/\d+/)||[''])[0];
          const size=(blk.querySelector('.chat_file_size')?.textContent||'').replace(/[(),\s]/g,'').replace(/([\d.])([KMG]?B)$/i,'$1 $2');
          const date=blk.querySelector('.chat_messages_date')?.textContent.trim()||'';
          const row=make('div','cwx-chatrow'),ic=make('span','cwx-chatic');ic.append(icon('chat'));
          const t=make('span','cwx-t'),nm=make('span','cwx-title',name),meta=make('small','cwx-desc',[num&&`${num} 条消息`,size,date].filter(Boolean).join(' · '));
          if(blk.getAttribute('highlight')==='true')nm.append(make('span','cwx-cur',L('当前')));
          t.append(nm,meta);
          const m=make('details','cwx-more-menu'),sm=make('summary','');sm.append(icon('dots'));sm.setAttribute('aria-label',L('更多'));const list=make('div','cwx-more-list');m.append(sm,list);
          m.addEventListener('click',e=>e.stopPropagation());
          for(const [label,sel,red] of [['改名','.renameChatButton'],['导出为 JSONL','.exportRawChatButton'],['导出为纯文本','.exportChatButton'],['删除','.PastChat_cross',true]]){
            const b=blk.querySelector(sel);if(!b)continue;
            list.append(button(L(label),e=>{e.stopPropagation();m.open=false;b.click();},'cwx-more-item'+(red?' cwx-red':'')));
          }
          row.append(ic,t,m);blk.prepend(row);
        }
      }},
    // 数据库（「+」→ 打开数据库，稿 design-composer-tools-v1）：搜索框、排序、批量编辑；全局 / 角色 / 聊天三组，每组一张卡片，
    // 文件一行一个（图标 · 名字 · 大小和日期 · ⋯，⋯ 里代点原来那排小图标），卡片最后一行是「添加文件」（就是酒馆原来的「添加」按钮，搬过来，菜单才贴着它）。
    dataBank:{content:root=>root,cls:'cwx-databank',
      raw:['#attachmentSearch','.globalAttachmentsList','.characterAttachmentsList','.chatAttachmentsList','.globalAttachmentsTitle .openActionModalButton','.characterAttachmentsTitle .openActionModalButton','.chatAttachmentsTitle .openActionModalButton','.actionButtonsModal'],
      label:{attachmentSort:'排序'},labelOf:c=>c.matches('.attachmentsBulkEditCheckbox')?'批量编辑':c.matches('.bulkActionSelectAll')?'全选':c.matches('.bulkActionSelectNone')?'全不选':c.matches('.bulkActionDisable')?'停用选中的':c.matches('.bulkActionEnable')?'启用选中的':c.matches('.bulkActionDelete')?'删除选中的':'',
      layout:[
        {title:'',items:['#attachmentSearch']},
        {title:'',items:['#attachmentSort','.attachmentsBulkEditCheckbox','foot:支持纯文本、PDF、Markdown、HTML、EPUB。也可以直接把文件拖进来。']},
        {title:'',items:['.bulkActionSelectAll','.bulkActionSelectNone','.bulkActionDisable','.bulkActionEnable','|','.bulkActionDelete']},
        {title:'全局',card:true,items:['.globalAttachmentsList','.globalAttachmentsTitle .openActionModalButton','foot:所有聊天、所有角色都能用。']},
        {title:'角色',card:true,items:['.characterAttachmentsList','.characterAttachmentsTitle .openActionModalButton','foot:这个角色的所有聊天都能用。只存在本地，导出角色卡不带。']},
        {title:'聊天',card:true,items:['.chatAttachmentsList','.chatAttachmentsTitle .openActionModalButton','foot:只有这个聊天能用。']},
        {title:'',items:['.actionButtonsModal']}],
      rest:false,
      after:({s,page})=>{const cb=page.querySelector('.attachmentsBulkEditCheckbox')||s.root.querySelector('.attachmentsBulkEditCheckbox');if(cb?.hidden){cb.hidden=false;s.undo.push(()=>{cb.hidden=true;});}},
      sync:s=>{
        const q=s.root.querySelector('#attachmentSearch');if(q&&q.placeholder!==L('搜索文件'))q.placeholder=L('搜索文件');
        const bulk=!!s.root.querySelector('.attachmentsBulkEditCheckbox')?.checked;
        for(const u of s.rows)if(u.kind==='action'&&u.button.closest('.attachmentBulkActionsContainer')&&u.row.hidden===bulk)u.row.hidden=!bulk;
        const nm=sel=>(s.root.querySelector(sel)?.textContent||'').trim();
        const labs=s.secs.map(x=>x.querySelector(':scope>.cwx-lab')).filter(Boolean);
        for(const lab of labs){if(lab.textContent.startsWith(L('角色'))){const n=nm('.characterAttachmentsName');setText(lab,n?L('角色')+' · '+n:L('角色'));}
          else if(lab.textContent.startsWith(L('聊天'))){setText(lab,nm('.chatAttachmentsName')?L('聊天 · 当前聊天'):L('聊天'));}}
        // 空的组也要看得见（「还没有文件」），不然只剩一行「添加文件」
        for(const u of s.rows)if(u.kind==='raw'&&u.node.matches('.attachmentsList')){const empty=!u.node.children.length;if(u.row.hidden&&empty)u.row.hidden=false;u.row.toggleAttribute('data-cwx-empty',empty);}
        for(const it of s.root.querySelectorAll('.attachmentsList .attachmentListItem')){
          if(it.querySelector(':scope>.cwx-filerow'))continue;
          const row=make('div','cwx-filerow'),ic=make('span','cwx-fileic');ic.append(icon('file'));
          const t=make('span','cwx-t'),name=make('span','cwx-title',it.querySelector('.attachmentListItemName')?.textContent||'');
          const meta=make('small','cwx-desc',[it.querySelector('.attachmentListItemSize')?.textContent,it.querySelector('.attachmentListItemCreated')?.textContent].filter(Boolean).join(' · '));
          if(it.classList.contains('disabled'))name.append(make('span','cwx-cur cwx-off',L('已停用')));
          t.append(name,meta);
          const m=make('details','cwx-more-menu'),sm=make('summary','');sm.append(icon('dots'));sm.setAttribute('aria-label',L('更多'));const list=make('div','cwx-more-list');m.append(sm,list);
          for(const [label,sel,red] of [['查看内容','.viewAttachmentButton'],['编辑','.editAttachmentButton'],['停用','.disableAttachmentButton'],['启用','.enableAttachmentButton'],['移动','.moveAttachmentButton'],['下载','.downloadAttachmentButton'],['删除','.deleteAttachmentButton',true]]){
            const b=it.querySelector(sel);if(!b||b.style.display==='none')continue;
            list.append(button(L(label),e=>{e.stopPropagation();m.open=false;b.click();},'cwx-more-item'+(red?' cwx-red':'')));
          }
          row.append(ic,t,m);it.append(row);
        }
      }},
    // Token 计数器（「+」，稿 design-composer-tools-v1）：「文本」一张大卡片直接输入；「Token 数 · 分词器」两行；有内容时才出现「分词结果」和「Token IDs」。
    tokenCounter:{content:root=>root,cls:'cwx-tokens',raw:['#token_counter_textarea','#tokenized_chunks_display','#token_counter_ids'],
      layout:[
        {title:'文本',items:['#token_counter_textarea']},
        {title:'',items:[info('tcCount','Token 数'),info('tcTok','分词器')]},
        {title:'分词结果',items:['#tokenized_chunks_display','foot:每个色块是一个 Token。']},
        {title:'Token IDs',items:['#token_counter_ids',({emit})=>{const b=make('button','');b.type='button';b.addEventListener('click',()=>{const v=doc.getElementById('token_counter_ids')?.value||doc.getElementById('token_counter_ids')?.textContent||'';win.navigator.clipboard?.writeText(v).then(()=>win.toastr?.success(L('已复制。')),()=>{});});emit({kind:'action',button:b,title:'复制',gates:[],self:b,root:b,proxy:true});}]}],
      rest:false,
      sync:s=>{
        const c=s.page?.querySelector('[data-cwx-info=tcCount]'),v=(s.root.querySelector('#token_counter_result')?.textContent||'0').trim();if(c&&c.value!==v)c.value=v;
        const tk=s.page?.querySelector('[data-cwx-info=tcTok]');if(tk&&!tk.value){const p=[...s.root.querySelectorAll('p')].find(x=>/[:：]/.test(x.textContent));const n=(p?.textContent.split(/[:：]/).slice(1).join(':')||'').trim();if(n)tk.value=n;}
        // 每个 Token 的颜色是酒馆写在行内的，被全局的 code 底色盖掉了：用行内 !important 补回来，淡一点（照稿）。
        for(const c of s.root.querySelectorAll('#tokenized_chunks_display>code:not([data-cwx])')){c.dataset.cwx='1';const bg=c.style.backgroundColor;if(bg)c.style.setProperty('background-color','color-mix(in srgb, '+bg+' 55%, transparent)','important');}
        const chunks=s.root.querySelector('#tokenized_chunks_display'),has=!!chunks&&chunks.textContent.trim()!=='—'&&chunks.textContent.trim()!=='';
        for(const u of s.rows)if(u.kind==='raw'&&u.node.matches('#tokenized_chunks_display,#token_counter_ids')&&u.row.hidden===has)u.row.hidden=!has;
        for(const u of s.rows)if(u.kind==='action'&&u.title==='复制'&&u.row.hidden===has)u.row.hidden=!has;
        for(const sec of s.secs)for(const f of sec.querySelectorAll(':scope>.cwx-foot'))if(sec.querySelector('#tokenized_chunks_display')&&f.hidden===has)f.hidden=!has;
      }},
    generic:{}
  };
  // 「去偏好设置打开」：关掉这页，打开偏好设置，用设置里的搜索找到「请求 Token 概率」那个开关并滚过去。
  function goTokenSetting(){
    const cb=doc.getElementById('request_token_probabilities');
    for(const [panel,s] of hosted)if(panel.id==='logprobsViewer')s.page?.closest('dialog.cw-v4-editor')?._cwShut?.();
    const tog=doc.getElementById('user-settings-block')?.closest('.drawer')?.querySelector(':scope>.drawer-toggle');
    if(!doc.getElementById('user-settings-block')?.classList.contains('openDrawer'))tog?.click();
    win.setTimeout(()=>{
      const q=doc.querySelector('.cw-v4-shell:not([hidden]) .cw-v4-search input');
      if(q){q.value='Token';q.dispatchEvent(new win.Event('input',{bubbles:true}));}
      win.setTimeout(()=>{const row=cb?.closest('.cw-v4-row,.checkbox_label,label')||cb;row?.scrollIntoView({block:'center'});row?.classList.add('cwx-flash');win.setTimeout(()=>row?.classList.remove('cwx-flash'),1600);},350);
    },450);
  }
  /* 分页（本聊天 / 角色 / 默认）：顶上一个分段切换，只显示那一页的小节（行内 display，外面的通用规则权重太高，CSS 压不过）。 */
  function applyTab(s){const now=s.page?.dataset.cwxTabNow;if(!now)return;for(const sec of s.secs){const off=!!sec.dataset.cwxTab&&sec.dataset.cwxTab!==now;if(off!==(sec.style.display==="none")){if(off)sec.style.setProperty("display","none","important");else sec.style.removeProperty("display");}}}
  function tabs(s){
    const list=s.plan.tabs;if(!list||!s.page)return;
    const seg=make('div','cwx-seg');seg.setAttribute('role','tablist');
    const now=s.tab||list[0][0];s.page.dataset.cwxTabNow=now;
    for(const [key,label] of list){const b=button(L(label),()=>{s.tab=key;s.page.dataset.cwxTabNow=key;applyTab(s);for(const x of seg.children)x.setAttribute('aria-selected',String(x.dataset.key===key));},'cwx-seg-btn');
      b.dataset.key=key;b.setAttribute('role','tab');b.setAttribute('aria-selected',String(key===now));seg.append(b);}
    s.page.prepend(seg);
  }
  const PANELS=[{panel:'floatingPrompt',holder:'[name=floatingPromptHolder]',title:'作者注释',plan:'an'},{panel:'cfgConfig',holder:'[name=cfgConfigHolder]',title:'CFG 缩放',plan:'cfg'},{panel:'logprobsViewer',holder:'.logprobs_panel_content',title:'Token 概率',plan:'logprobs'},
    {panel:'shadow_select_chat_popup',holder:'#select_chat_popup',title:()=>{const n=charName();return n?n+' 的聊天':'聊天记录';},plan:'chats'}];
  const hosted=new Map();
  function hostPanel(def){
    const panel=doc.getElementById(def.panel),holder=panel?.querySelector(def.holder);if(!holder||hosted.has(panel))return;
    const s=session(holder,PLANS[def.plan]);hosted.set(panel,s);panel.classList.add('cwx-panel-hosted');
    try{build(s);}catch(e){console.error('[Claude Web] panel',e);teardown(s);sessions.delete(s);hosted.delete(panel);panel.classList.remove('cwx-panel-hosted');return;}
    watchRoot(s);
    // 酒馆显示浮窗之后才（不发事件地）填值（CFG 滑杆等），晚一点再同步两次。
    win.requestAnimationFrame(()=>!s.closed&&sync(s));win.setTimeout(()=>!s.closed&&sync(s),300);
    // 弹出页 / 弹窗的样式都写在设置侧栏（#top-settings-holder）里；浮窗在侧栏外面，先把 holder 挪进侧栏里一个零大小的格子，关的时候放回去。
    const dock=make('div','cwx-panel-dock'),mark=doc.createComment('cwx-panel-return');holder.before(mark);(doc.getElementById('top-settings-holder')||doc.body).append(dock);dock.append(holder);
    openEditor(holder,typeof def.title==='function'?def.title():L(def.title),'',{onClose:()=>{close(s);if(mark.parentNode)mark.replaceWith(holder);dock.remove();hosted.delete(panel);
      // 2.0.276（Lulu：关掉后左上角闪出酒馆原来的浮窗）：酒馆给 display 加了过渡（allow-discrete），设成 none 以后还要显示一会儿；
      // 先收起，等过渡完了再去掉「藏着」的标记（期间又打开了就不动）。
      panel.style.display='none';win.setTimeout(()=>{if(!hosted.has(panel))panel.classList.remove('cwx-panel-hosted');},600);}});
  }
  // 酒馆显示浮窗（display:flex）就接过来；酒馆自己收起时，我们的弹窗也关。
  const panelWatch=new win.MutationObserver(()=>{
    if(!doc.documentElement.hasAttribute('data-cw-v4'))return;
    for(const def of PANELS){const panel=doc.getElementById(def.panel);if(!panel)continue;
      const showing=panel.style.display&&panel.style.display!=='none';
      if(showing&&!hosted.has(panel))hostPanel(def);
      else if(!showing&&hosted.has(panel))hosted.get(panel).page?.closest('dialog.cw-v4-editor')?._cwShut?.();}
  });
  for(const def of PANELS){const panel=doc.getElementById(def.panel);if(panel)panelWatch.observe(panel,{attributes:true,attributeFilter:['style']});}
  /* 酒馆用 callGenericPopup 弹的整页窗口（数据库……）：Popup 把 <dialog> 直接加在 body 下，这里只看 body 的直接子节点（不看子树，聊天流式输出时不会被叫醒）。 */
  const POPUP_PLANS=[['.dataBankAttachments','dataBank'],['.wide100p:has(>.justifyLeft>#token_counter_textarea)','tokenCounter']];
  const bodyWatch=new win.MutationObserver(list=>{
    for(const [root,s] of popups)if(!root.isConnected){close(s);popups.delete(root);}
    if(!doc.documentElement.hasAttribute('data-cw-v4'))return;
    for(const m of list)for(const d of m.addedNodes){if(d.nodeType!==1||!d.matches('dialog'))continue;
      for(const [sel,plan] of POPUP_PLANS){const root=d.querySelector(sel);if(!root||popups.has(root))continue;
        const s=session(root,PLANS[plan]);popups.set(root,s);d.classList.add('cwx-popup');
        try{build(s);}catch(e){console.error('[Claude Web] popup',e);teardown(s);popups.delete(root);continue;}watchRoot(s);}}
  });
  bodyWatch.observe(doc.body,{childList:true});

  /* 快速回复：每个按钮一行「名字 + 内容预览 · ⋯」，点整行进酒馆自己的编辑页（我们重排过）；左边把手照旧拖动排序。 */
  function li(s,n){if(n.classList.contains('cwx-li'))return;n.classList.add('cwx-li');s.undo.push(()=>n.classList.remove('cwx-li'));}
  function qrList(s,page){
    if(!page)return;
    for(const item of page.querySelectorAll('#qr--set-qrList .qr--set-item,.qr--setList .qr--item'))li(s,item);
    for(const item of page.querySelectorAll('#qr--set-qrList .qr--set-item')){
      if(item.querySelector(':scope>.cwx-qrrow'))continue;
      const label=item.querySelector('.qr--set-itemLabel'),mes=item.querySelector('.qr--set-itemMessage'),opt=item.querySelector('.qr--set-optionsContainer .qr--action');if(!label||!opt)continue;
      const r=make('button','cwx-qrrow');r.type='button';const t=make('span','cwx-t'),name=make('span','cwx-title'),prev=make('small','cwx-desc'),more=make('span','cwx-more');more.append(icon('dots'));
      t.append(name,prev);r.append(t,more);item.append(r);s.created.push(r);
      const grip=item.querySelector('.drag-handle');if(grip&&grip.parentElement!==item){move(s,grip,item,item.firstChild);}
      r.addEventListener('click',()=>{lastQrItem=item;opt.click();});
      const paint=()=>{const a=label.value||L('（空）'),b=mes?.value||'';if(name.textContent!==a)name.textContent=a;if(prev.textContent!==b)prev.textContent=b;};paint();
      label.addEventListener('input',paint);mes?.addEventListener('input',paint);s.undo.push(()=>{label.removeEventListener('input',paint);mes?.removeEventListener('input',paint);});
    }
    // 没有聊天 / 没选角色时酒馆写一句英文：改成「聊天 · 没有打开聊天」这样的灰字行。
    for(const list of page.querySelectorAll('.qr--setList'))for(const n of list.children){
      if(n.matches('.qr--item')||n.querySelector(':scope>.cwx-flab'))continue;li(s,n);
      const tx=n.textContent.trim(),v=/no active chat/i.test(tx)?'没有打开聊天':/no character/i.test(tx)?'没有选角色':tx;
      const a=make('span','cwx-flab',list.dataset.cwxTitle||''),b=make('span','cwx-dimv',L(v));n.prepend(a,b);s.created.push(a,b);
    }
    for(const item of page.querySelectorAll('.qr--setList .qr--item')){
      if(item.querySelector(':scope>.cwx-more-menu'))continue;
      const edit=item.querySelector('.fa-pencil'),del=item.querySelector('.qr--del');
      const tt=make('span','cwx-title',item.parentElement?.dataset.cwxTitle||'');const grip=item.querySelector(':scope>.drag-handle');grip?grip.after(tt):item.prepend(tt);s.created.push(tt);
      const m=make('details','cwx-more-menu'),sm=make('summary','');sm.append(icon('dots'));sm.setAttribute('aria-label',L('更多'));const list=make('div','cwx-more-list');m.append(sm,list);
      // 2.0.267（Lulu：一行里「Default ⌃⌄ + 开关 + ⋯」挤着很怪）：「显示按钮」开关挪进 ⋯，行里只留集合名；隐藏时集合名变灰。
      const vis=item.querySelector('.qr--visible input[type=checkbox]');
      if(vis){const x=button('',e=>{e.stopPropagation();m.open=false;vis.click();},'cwx-more-item');const paint=()=>{x.textContent=L(vis.checked?'隐藏这组按钮':'显示这组按钮');item.classList.toggle('cwx-qr-off',!vis.checked);};paint();vis.addEventListener('change',paint);m.addEventListener('toggle',paint);
        s.undo.push(()=>{vis.removeEventListener('change',paint);item.classList.remove('cwx-qr-off');});list.append(x);}
      for(const [label,b,red] of [['编辑这个集合',edit],['移除',del,true]])if(b){const x=button(L(label),e=>{e.stopPropagation();m.open=false;b.click();},'cwx-more-item'+(red?' cwx-red':''));list.append(x);}
      item.append(m);s.created.push(m);
    }
  }
  /* 正则：每条一行「把手 · 名字 · 开关」，点名字进编辑。酒馆的 disable_regex 勾上是停用，开关反着画（cwx-invert）。 */
  function regexList(s,page){
    if(!page)return;
    for(const item of page.querySelectorAll('.regex-script-label'))li(s,item);
    if(!s.regexClick){s.regexClick=e=>{const name=e.target.closest?.('.regex-script-label .regex_script_name');if(!name)return;const row=name.closest('.regex-script-label');lastRegexRow=row;row.querySelector('.edit_existing_regex')?.click();};
      page.addEventListener('click',s.regexClick);s.undo.push(()=>{page.removeEventListener('click',s.regexClick);s.regexClick=null;});}
  }

  function planFor(root,title){
    for(const k of ['vectors','tts','expressions','translate','caption','memory','qr','regex','extras'])if(PLANS[k].match(root))return PLANS[k];
    return PLANS.generic;
  }
  function open(root,title){
    // 自己画整套界面的扩展（酒馆助手这种）原样放进白卡片。
    if(root.id==='claude-web-settings'||root.querySelector('#claude-web-settings,[data-v-app]')||/酒馆助手|Tavern Helper|st-chatu8/i.test(title)){openEditor(root,title);return;}
    const s=session(root,planFor(root,title));
    try{build(s);}catch(e){console.error('[Claude Web] extension settings',e);teardown(s);sessions.delete(s);openEditor(root,title);return;}
    watchRoot(s);
    watch.observe(doc.body,{childList:true,subtree:true});
    openEditor(root,title,'',{onClose:()=>close(s)});
  }
  return {open,restore(){watch.disconnect();panelWatch.disconnect();bodyWatch.disconnect();for(const [panel,s] of hosted){s.page?.closest('dialog.cw-v4-editor')?._cwShut?.();panel.classList.remove('cwx-panel-hosted');}hosted.clear();for(const s of [...sessions])close(s);popups.clear();}};
}
