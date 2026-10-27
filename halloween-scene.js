import { halloweenIcons as I, halloweenIconWeight as IW } from './halloween-icons.js?v=2.0.160-halloween2';
import { createHalloweenSprites } from './halloween-sprites.js?v=2.0.160-halloween2';
import { buildHalloweenRig } from './halloween-rig.js?v=2.0.160-halloween2';
import { halloweenCSS, iconRules } from './halloween-style.js?v=2.0.160-halloween2';
import { halloweenPileCells } from './halloween-pile.js?v=2.0.160-halloween2';

export function createHalloweenScene({win,getContext,ambient,getClawdState}) {
  const doc=win.document,root=doc.documentElement,art=createHalloweenSprites(doc);
  const rig=buildHalloweenRig();rig.pileCells=halloweenPileCells;
  const owned=new Set(),timers=new Set(),animations=new Set(),listeners=[],copies=new Map(),anchors=new Map(),icons=new Map(),corners=new Map();
  const pressedPointers=new Set();
  const motion=win.matchMedia('(prefers-reduced-motion: reduce)');
  let dead=false,epoch=0,scheduler=0,raf=0,pail=null,pailBase=null,pailAirborne=false,ghost=null,spider=null,welcome=null,lastAction=0,submit=null,deletion=null,webKey='',submitTimer=0,deleteTimer=0,validAfter=win.performance.now(),lastCalm=null;
  const calm=()=>motion.matches||root.dataset.claudeMotion==='off';
  const visible=()=>!dead&&!doc.hidden;
  const moving=()=>visible()&&!calm();
  const modal=()=>[...doc.querySelectorAll('dialog[open],.cw-v4-editor-dialog[open],.cw-menu:not([hidden]),#options,#extensionsMenu')].some(n=>n.getClientRects().length>0&&win.getComputedStyle(n).visibility!=='hidden');
  let spiderModalValid=false,spiderModalValue=false,spiderModalFrame=0;
  function spiderModal(){
    if(!spiderModalValid){spiderModalValue=modal();spiderModalValid=true;spiderModalFrame=win.requestAnimationFrame(()=>{spiderModalFrame=0;spiderModalValid=false;});}
    return spiderModalValue;
  }
  const panel=()=>doc.querySelector('.cw-v4-shell:not([hidden])');
  let generationSafeKey='';
  function quickReplyRects(){return [...doc.querySelectorAll('#qr--bar button,#qr--bar .qr--button')].map(n=>n.getBoundingClientRect()).filter(r=>r.width&&r.height);}
  function safeTop(x,y,w,h,blocks=quickReplyRects()){
    for(const r of blocks)if(x<r.right&&x+w>r.left&&y<r.bottom&&y+h>r.top)y=Math.min(y,r.top-h-4);
    return y;
  }
  function safeGeneration(){
    const big=doc.querySelector('#send_form>.clawd-composer-clawd'),clip=big?.dataset.clawdClip||'',key=[root.dataset.cwGenerating,clip,win.innerWidth,win.innerHeight].join(':');
    if(key===generationSafeKey)return;generationSafeKey=key;
    if(!big||!/^((sit)?write|done|stopped|error|recover)/i.test(clip)){root.style.removeProperty('--cw-hw-rig-lift');return;}
    const r=big.getBoundingClientRect(),top=r.top-40,h=85,w=90,x=r.left-15;
    const y=safeTop(x,top,w,h);root.style.setProperty('--cw-hw-rig-lift',(y-top)+'px');
  }
  const later=(fn,ms)=>{const token=epoch,id=win.setTimeout(()=>{timers.delete(id);if(!dead&&token===epoch)fn();},ms);timers.add(id);return id;};
  const cancel=id=>{win.clearTimeout(id);timers.delete(id);};
  function on(target,type,fn,options){target.addEventListener(type,fn,options);listeners.push(()=>target.removeEventListener(type,fn,options));}
  function node(tag,cls,parent=doc.body){const n=doc.createElement(tag);n.className=cls;n.dataset.cwHalloweenOwned='';if(tag==='button')n.type='button';else n.setAttribute('aria-hidden','true');parent.append(n);owned.add(n);return n;}
  function remove(n){if(!n)return;for(const child of owned)if(child===n||n.contains(child))owned.delete(child);n.remove();}
  function animate(el,frames,options,done){
    if(!moving()||typeof el.animate!=='function'){if(done)later(done,options.duration||0);return null;}
    try{const a=el.animate(frames,options);animations.add(a);a.onfinish=()=>{animations.delete(a);done?.();};a.oncancel=()=>animations.delete(a);return a;}catch{done?.();return null;}
  }
  function picture(sprite,parent,scale=2,cls='hw-pixels'){const n=node('img',cls,parent);n.src=sprite.url;n.alt='';n.draggable=false;n.style.width=sprite.w*scale+'px';n.style.height=sprite.h*scale+'px';return n;}
  const svg=(key,mask=false)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="${mask?'black':'currentColor'}" stroke-width="${1.35*(IW[key]||1)}" stroke-linecap="round" stroke-linejoin="round"><style>.t{stroke-width:1}.e{stroke-width:1.8}.k{stroke-width:2.7}.kb{fill:${mask?'none':'var(--cl-surface,#fff)'}}</style>${I[key]}</svg>`;
  const url=key=>`url("data:image/svg+xml,${encodeURIComponent(svg(key,true))}")`;
  function buildStyle(){
    const style=node('style','cw-halloween-style',doc.head);
    const scope='html[data-cw-halloween="on"]'+Array.from({length:8},(_,i)=>`:not(#cw-hw-${i})`).join('');
    let css=halloweenCSS.replaceAll('html[data-cw-halloween="on"]',scope)+`\n${scope}{--cw-hw-skull:${url('tombs')};}`;
    for(const [selector,key,kind='before']of iconRules){
      if(kind==='self'){css+=`${scope}[data-claude-ui="classic"] ${selector}::before{content:""!important;display:inline-block!important;width:20px!important;height:20px!important;background:var(--cl-icon,currentColor)!important;mask:${url(key)} center/contain no-repeat!important;-webkit-mask:${url(key)} center/contain no-repeat!important}`;continue;}
      if(kind==='svg')continue;
      else if(['#options_button','#extensionsMenuButton','body.cw-v4-filled:not(.claude-generation-active) #send_but','body:not(.cw-v4-filled):not(.claude-generation-active) #send_but','.clawd-fake-mic'].includes(selector))css+=`${scope} ${selector}::${kind}{mask-image:${url(key)}!important;-webkit-mask-image:${url(key)}!important}`;
      else css+=`${scope} ${selector}::${kind}{content:""!important;background:currentColor!important;mask:${url(key)} center/contain no-repeat!important;-webkit-mask:${url(key)} center/contain no-repeat!important}`;
    }
    const legacyIcons='#options_button,#extensionsMenuButton,#send_but,.mes_copy,.mes_edit,.mes_narrate,.mes_edit_delete,.claude-user-message-edit,.claude-user-message-delete,.clawd-fake-mic';
    css+=`${scope}[data-claude-ui="classic"] :is(${legacyIcons})::before{display:inline-block!important;width:18px!important;height:18px!important}`;
    const legs=[[[-1.8,-.6],[-5.6,-4.2],[-8.6,-2.2]],[[-2.3,.6],[-6.6,-1.4],[-9.4,1.6]],[[-2.3,1.9],[-6.6,2.6],[-8.9,5.7]],[[-1.8,3.1],[-5.1,5.6],[-6.6,8.6]]];
    const spiderSVG='<svg xmlns="http://www.w3.org/2000/svg" viewBox="-11 -9 22 20" fill="black" stroke="black" stroke-width=".8" stroke-linecap="round">'+legs.map(p=>[1,-1].map(k=>'<path fill="none" d="M'+p.map(([x,y])=>x*k+' '+y).join('L')+'"/>').join('')).join('')+'<ellipse cx="0" cy="1.4" rx="2.9" ry="3.3"/><circle cx="0" cy="-2.5" r="1.9"/></svg>';
    css+=`${scope}{--cw-hw-spider:url("data:image/svg+xml,${encodeURIComponent(spiderSVG)}")}`;
    const pumpkin='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 4.4c-4.5 0-7.7 2.6-7.7 6s3.2 6 7.7 6 7.7-2.6 7.7-6-3.2-6-7.7-6Z" fill="white" stroke="#d6d3cb" stroke-width=".7"/><path d="M7 4.9c-1.2 1.4-1.2 9.6 0 11M13 4.9c1.2 1.4 1.2 9.6 0 11" fill="none" stroke="#e2dfd8" stroke-width=".7"/><path d="M10 4.5c-.2-1.3.3-2.4 1.6-3" fill="none" stroke="#8b8a7c" stroke-width="1.4"/><path d="M6.2 10.1l1.45-2.2 1.45 2.2ZM10.9 10.1l1.45-2.2 1.45 2.2ZM6.1 12.2h7.8l-1.05 2-1.2-1-1.15 1.1-1.15-1.1-1.2 1Z" fill="#2a78d6"/></svg>';
    css+=`${scope}{--cw-hw-select:var(--cw-v4-icon-chevd);--cw-hw-pumpkin:url("data:image/svg+xml,${encodeURIComponent(pumpkin)}")}`;
    style.textContent=css;
  }
  function dressIcons(){
    for(const button of doc.querySelectorAll('.clawd-mobile-new-chat'))if(!icons.has(button)){
      const text=[...button.childNodes].find(n=>n.nodeType===3);if(text&&/^[+＋]\s*/.test(text.data)){const original=text.data,installed=original.replace(/^[+＋]\s*/,'');text.data=installed;icons.set(button,{kind:'text',text,original,installed});}
    }
    const svgMap=[['.cw-web-new>svg','newchat'],['.cw-desk-seg>.cw-on>svg','chattab'],['.cw-b34-paper-button>svg','paper']];
    for(const [selector,key]of svgMap)for(const n of doc.querySelectorAll(selector)){
      let old=icons.get(n);if(old?.kind==='svg'&&n.innerHTML===old.installed)continue;
      if(!old){old={kind:'svg',html:n.innerHTML,box:n.getAttribute('viewBox'),stroke:n.getAttribute('stroke-width')};icons.set(n,old);}
      n.setAttribute('viewBox','0 0 20 20');n.setAttribute('stroke-width',String(1.35*(IW[key]||1)));n.innerHTML=I[key].replaceAll('class="t"','stroke-width="1"').replaceAll('class="e"','stroke-width="1.8"').replaceAll('class="k"','stroke-width="2.7"').replaceAll('class="kb"','fill="var(--cl-surface,#fff)"');old.installed=n.innerHTML;
    }
    for(const [selector,key,kind]of iconRules)if(kind==='self'&&root.dataset.claudeUi!=='classic')for(const n of doc.querySelectorAll(selector)){
      if(!icons.has(n))icons.set(n,{kind:'mask',mask:n.style.getPropertyValue('mask-image'),maskP:n.style.getPropertyPriority('mask-image'),webkit:n.style.getPropertyValue('-webkit-mask-image'),webkitP:n.style.getPropertyPriority('-webkit-mask-image')});
      const value=url(key);if(n.style.getPropertyValue('mask-image')!==value)n.style.setProperty('mask-image',value,'important');
    }
    for(const [n]of icons)if(!n.isConnected)icons.delete(n);
  }
  function welcomeWeb(hero){
    const ast=hero?.querySelector('.asterisk'),r=ast?.getBoundingClientRect();
    if(!r||!r.width){remove(welcome);welcome=null;webKey='';return;}
    const top=root.dataset.claudeLayout==='mobile'?56:0,hub=root.dataset.claudeLayout==='mobile'?48:66;
    let offset=0;try{offset=new win.DOMMatrix(win.getComputedStyle(ast).transform).m42;}catch{}
    const end=r.top+r.height/2-top-offset-(root.classList.contains('hw-typing')?58:0),cx=r.left+r.width/2,key=[cx,top,hub].join(':');
    if(welcome&&key===webKey){const thread=welcome.querySelector('.hw-live-thread');const height=Math.max(0,end-hub-19)+'px';if(thread.style.height!==height)thread.style.height=height;thread.style.transition=calm()?'none':'height .2s';return;}webKey=key;
    if(!welcome)welcome=node('span','hw-live-web');welcome.style.cssText=`position:fixed!important;left:${cx-60}px!important;top:${top}px!important;width:120px!important;height:${hub+60}px!important;pointer-events:none!important;z-index:2998!important;color:#d97757!important;opacity:.65!important;overflow:visible!important;`;
    let seed=7;const R=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
    const spokes=[-160,-116,-70,-28,16,60,104,146].map(a0=>{const a=(a0+(R()-.5)*10)*Math.PI/180,dx=Math.cos(a),dy=Math.sin(a);return {dx,dy,len:dy<-.6?hub/-dy:44+R()*12};});
    const point=(s,d)=>[60+s.dx*d,hub+s.dy*d],rings=[12,22,32].map(r=>r*(1+(R()-.5)*.08));let shapes='';
    for(const s of spokes){const[x,y]=point(s,s.len);shapes+=`<path d="M60 ${hub}Q${60+s.dx*s.len/2-s.dy*(R()-.5)*2.2} ${hub+s.dy*s.len/2+s.dx*(R()-.5)*2.2} ${x} ${y}" stroke-width="1.2"/>`;if(s.dy>=-.6)shapes+=`<circle cx="${x}" cy="${y}" r="3" fill="currentColor" stroke="none"/>`;}
    for(const d of rings)for(let i=0;i<spokes.length;i++){const[a,b]=point(spokes[i],d),[c,e]=point(spokes[(i+1)%8],d);shapes+=`<path d="M${a} ${b}Q${60+((a+c)/2-60)*.8} ${hub+((b+e)/2-hub)*.8} ${c} ${e}" stroke-width="1" opacity=".8"/>`;}
    shapes+=`<circle cx="60" cy="${hub}" r="3.6" fill="currentColor"/>`;
    const image=doc.createElement('img');image.alt='';image.style.cssText='width:100%!important;height:100%!important;max-width:none!important;display:block!important;';image.src='data:image/svg+xml,'+encodeURIComponent(`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 120 ${hub+60}" fill="none" stroke="#d97757">${shapes.replaceAll('currentColor','#d97757')}</svg>`);
    const thread=doc.createElement('span');thread.className='hw-live-thread';thread.style.cssText=`position:absolute;left:59.6px;top:${hub}px;width:.8px;height:${Math.max(0,end-hub-19)}px;background:#d97757;transition:${calm()?'none':'height .2s'};pointer-events:none;`;welcome.replaceChildren(image,thread);
  }
  function anchor(host,type){
    const found=anchors.get(host);if(found?.isConnected)return found;
    const n=node('span','hw-anchor hw-'+type,host);anchors.set(host,n);
    if(type==='web')n.innerHTML='<svg viewBox="0 0 90 75" fill="none" stroke="currentColor" stroke-width=".7"><path d="M0 0 90 0M0 0 83 22M0 0 65 49M0 0 33 69M0 0V75M0 17Q7 16 9 2M0 35Q16 35 19 5M0 55Q25 54 30 8M0 73Q39 70 44 12M9 2Q12 11 17 13M19 5Q23 21 32 24M30 8Q34 34 47 35M44 12Q50 43 65 49M17 13Q20 20 19 29M32 24Q36 35 33 44M47 35Q53 49 49 61M65 49Q72 60 65 69M19 29Q13 35 8 35M33 44Q22 56 12 55M49 61Q40 72 33 69"/></svg>';
    return n;
  }
  function staticScenes(){
    if(dead)return;
    for(const [host,n]of anchors)if(!host.isConnected){remove(n);anchors.delete(host);}
    const typing=!!doc.getElementById('send_textarea')?.value;if(typing!==root.classList.contains('hw-typing'))root.classList.toggle('hw-typing',typing);
    dressIcons();welcomeWeb(doc.querySelector('.clawd-welcome-hero'));safeGeneration();
    const form=doc.getElementById('send_form');
    // Generation words use the native placeholder; the original footer retains its layout.
    // Local anchors only: native popup ancestry and focus stay untouched.
    for(const host of doc.querySelectorAll('#options,.cw-menu:not([hidden]),dialog[open] .popup-content,.cw-v4-shell .cw-v4-head')){
      anchor(host,'web');
      if(host.matches('.cw-v4-head'))continue;
      if(!corners.get(host)?.isConnected){const corner=node('span','hw-corner-ghost',host);picture(art.sheet({awake:true}),corner,1.4);corners.set(host,corner);}
    }
    for(const [host,corner]of corners)if(!host.isConnected){remove(corner);corners.delete(host);}
    positionPail();
  }
  function positionPail(state){
    if(state?.airborne){pailAirborne=true;return;}
    if(!state&&pailAirborne)return;
    const big=doc.querySelector('#send_form .clawd-composer-clawd');
    if(!big){remove(pail);pail=null;pailBase=null;return;}
    let left,top;
    if(state){
      if(!pailBase)return;
      left=pailBase.left+state.x+44;top=pailBase.bottom+state.y-25;
    }else{
      const r=big.getBoundingClientRect();if(!r.width){remove(pail);pail=null;pailBase=null;return;}
      const current=getClawdState?.()||{x:0,y:0};
      left=r.left+44;top=r.bottom-25;pailBase={left:r.left-current.x,bottom:r.bottom-current.y};
    }
    // A peer button avoids nesting an interactive control inside the Clawd button.
    if(!pail){pail=node('button','hw-anchor hw-pail');pail.setAttribute('aria-label','撒糖');picture(art.pail(),pail,3);}
    const oldLeft=parseFloat(pail.style.left),oldTop=parseFloat(pail.style.top),landing=pailAirborne;
    pailAirborne=false;pail.style.left=left+'px';pail.style.top=top+'px';
    if(landing&&!calm()&&Number.isFinite(oldLeft)&&Number.isFinite(oldTop))animate(pail,[{transform:`translate(${oldLeft-left}px,${oldTop-top}px)`},{offset:.5,transform:`translate(${(oldLeft-left)*.45}px,${(oldTop-top)*.45-12}px)`},{transform:'translate(0,0)'}],{duration:280,easing:'ease-out'});
    pail.disabled=!moving();pail.title=calm()?'已减少动态效果，暂停撒糖':'撒糖';
  }
  function copyResult(event){
    const {button,success,startedAt}=event.detail||{};if(!button?.isConnected||!visible()||!Number.isFinite(startedAt)||startedAt<validAfter)return;
    let state=copies.get(button);if(state){cancel(state.timer);remove(state.status);}
    copies.delete(button);delete button.dataset.cwHalloweenCopy;
    if(!success)return;
    button.dataset.cwHalloweenCopy='success';
    const status=node('span','hw-sr',button);status.removeAttribute('aria-hidden');status.setAttribute('role','status');status.textContent='已复制';
    copies.set(button,{status,timer:later(()=>{delete button.dataset.cwHalloweenCopy;remove(status);copies.delete(button);},1500)});
  }
  const clamp=(v,a,b)=>Math.max(a,Math.min(b,v)),rnd=(a,b)=>a+Math.random()*(b-a);
  let sendFrame=0,sendLayer=null,deleteHistory=[];
  const star4=(size,color='#D97757')=>`<svg width="${size}" height="${size}" viewBox="-10 -10 20 20"><path d="M0-10C1.3-3 3-1.3 10 0 3 1.3 1.3 3 0 10-1.3 3-3 1.3-10 0-3-1.3-1.3-3 0-10Z" fill="${color}"/></svg>`;
  function at(n,x,y,w,h){Object.assign(n.style,{position:'fixed',left:x+'px',top:y+'px'});if(w!=null)n.style.width=w+'px';if(h!=null)n.style.height=h+'px';return n;}
  function clearSend(){win.cancelAnimationFrame(sendFrame);sendFrame=0;remove(sendLayer);sendLayer=null;}
  function sendSnapshot(box){
    const r=box.getBoundingClientRect(),cs=win.getComputedStyle(box),mirror=node('div','hw-text-mirror');
    for(const key of ['font','fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing','paddingTop','paddingRight','paddingBottom','paddingLeft','whiteSpace','wordBreak','overflowWrap','textAlign','direction','tabSize','boxSizing','borderTopWidth','borderLeftWidth','borderRightWidth','borderBottomWidth'])mirror.style[key]=cs[key];
    Object.assign(mirror.style,{position:'fixed',left:r.left+'px',top:r.top-box.scrollTop+'px',width:r.width+'px',height:'auto',minHeight:r.height+'px',visibility:'hidden',pointerEvents:'none',whiteSpace:'pre-wrap',borderStyle:'solid',borderColor:'transparent'});
    const spans=Array.from(box.value,c=>{const n=doc.createElement('span');n.textContent=c;mirror.append(n);return n;});
    const chars=spans.map(n=>{const b=n.getBoundingClientRect();return {c:n.textContent,x:b.left,y:b.top,w:b.width,h:b.height};}).filter(c=>c.c.trim()&&c.w&&c.y+c.h>r.top&&c.y<r.bottom&&c.x+c.w>r.left&&c.x<r.right).sort((a,b)=>Math.abs(a.y-b.y)>2?a.y-b.y:a.x-b.x).slice(0,80);
    remove(mirror);clearSend();if(!chars.length)return null;
    const layer=sendLayer=node('div','hw-flight-layer hw-fx');
    for(const c of chars){c.n=at(node('span','hw-flight-char',layer),c.x,c.y,c.w,c.h);Object.assign(c.n.style,{font:cs.font,letterSpacing:cs.letterSpacing,color:cs.color,lineHeight:c.h+'px',whiteSpace:'pre'});c.n.textContent=c.c;}
    return {layer,chars};
  }
  function rememberSend(event){
    const t=event.target;if(event.type==='keydown'&&(t?.id!=='send_textarea'||event.key!=='Enter'||event.isComposing))return;
    if(event.type!=='keydown'&&!t.closest?.('#send_but,#send_form [type="submit"]'))return;
    if(!moving())return;const box=doc.getElementById('send_textarea');if(!box?.value.trim()||modal())return;
    if(submit&&submit.text===box.value&&Date.now()-submit.at<250)return;
    const snap=sendSnapshot(box);if(!snap)return;const chat=getContext()?.chat;cancel(submitTimer);submit={...snap,text:box.value,chat,length:chat?.length||0,at:Date.now()};
    submitTimer=later(()=>{submit=null;submitTimer=0;if(sendLayer)animate(sendLayer,[{opacity:1},{opacity:0}],{duration:150},clearSend);},1500);
  }
  function sent(id){
    const snap=submit,c=getContext(),message=c?.chat?.[Number(id)];if(!snap||!moving()||snap.chat!==c?.chat||Date.now()-snap.at>1500||Number(id)<snap.length||!message?.is_user||message.mes!==snap.text)return;
    submit=null;cancel(submitTimer);submitTimer=0;action();const gap=clamp(.36/snap.chars.length,.012,.03),start=win.performance.now();
    const parts=snap.chars.map((c,i)=>({...c,delay:i*gap,T:rnd(.66,.8),h1:rnd(.88,1.12),jx:rnd(-3,3),jy:rnd(-3,3),r0:rnd(4,8),ph:rnd(0,2*Math.PI),done:false}));let nextSpark=0;
    const frame=now=>{
      sendFrame=0;if(!moving()||sendLayer!==snap.layer)return clearSend();const elapsed=(now-start)/1000;let alive=0;
      for(const p of parts){if(p.done)continue;alive++;const t=elapsed-p.delay;if(t<0)continue;let dx=0,dy=0,rot=0,sx=1,sy=1,opacity=1;
        if(t<.08){const v=Math.sin(Math.PI*t/.08);dy=1.5*v;sx=1+.1*v;sy=1-.14*v;}else{const u=Math.min(1,(t-.08)/(p.T-.08));if(u>=1){p.done=true;remove(p.n);continue;}dx=8+92*u+p.jx*u;dy=-74*p.h1*Math.pow(u,.82)+p.jy*u;rot=p.r0*Math.sin(Math.PI*u)-6*u+3*u*Math.sin(p.ph+12*t);sx=sy=1-.65*u*u*u;opacity=u<.35?1:1-(u-.35)/.65;}
        if(!p.tint&&t>.06){p.tint=true;p.n.style.transition='color .3s';p.n.style.color='#D97757';}p.ax=p.x+p.w/2+dx;p.ay=p.y+p.h/2+dy;
        p.n.style.transform=`translate(${dx}px,${dy}px) rotate(${rot}deg) scale(${sx},${sy})`;p.n.style.opacity=String(opacity);
      }
      if(elapsed>=nextSpark){nextSpark=elapsed+.035;const live=parts.filter(p=>!p.done&&elapsed-p.delay>.15);if(live.length){const p=live[Math.random()*live.length|0],size=rnd(5,10),n=at(node('span','hw-flight-spark',snap.layer),p.ax+rnd(-5,5)-size/2,p.ay+rnd(-4,4)-size/2,size,size);n.innerHTML=star4(size);animate(n,[{transform:'scale(0) rotate(0deg)',opacity:1},{offset:.45,transform:'scale(1.15) rotate(45deg)',opacity:1},{transform:'scale(0) rotate(90deg)',opacity:.9}],{duration:rnd(300,420),easing:'ease-out'},()=>remove(n));}}
      if(alive)sendFrame=win.requestAnimationFrame(frame);else later(()=>{if(sendLayer===snap.layer)clearSend();},360);
    };sendFrame=win.requestAnimationFrame(frame);
  }
  function captureDelete(message){
    if(!moving()||!message)return;const c=getContext(),id=Number(message.getAttribute('mesid')),data=c?.chat?.[id];if(!data)return;
    finishDelete(deletion);const rect=message.getBoundingClientRect(),clone=message.cloneNode(true);clone.removeAttribute('id');for(const n of clone.querySelectorAll('[id]'))n.removeAttribute('id');
    const originals=[message,...message.querySelectorAll('*')],clones=[clone,...clone.querySelectorAll('*')];
    for(let i=0;i<originals.length;i++){const cs=win.getComputedStyle(originals[i]),n=clones[i];for(const key of ['font','color','backgroundColor','display','padding','margin','border','borderRadius','boxSizing','textAlign','whiteSpace','wordBreak','overflowWrap'])n.style[key]=cs[key];n.style.setProperty('pointer-events','none','important');n.style.setProperty('animation','none','important');n.style.setProperty('transition','none','important');if(n.matches('img,video,canvas')){const r=originals[i].getBoundingClientRect();n.style.width=r.width+'px';n.style.height=r.height+'px';}}
    for(const n of clone.querySelectorAll('video,audio'))try{n.pause();}catch{}clone.inert=true;clone.setAttribute('aria-hidden','true');clone.dataset.cwHalloweenOwned='';
    deletion={data,chat:c.chat,swipes:data.swipes?.length||0,rect,clone,at:Date.now()};deleteTimer=later(()=>finishDelete(deletion),60000);return deletion;
  }
  function finishDelete(token){if(token&&deletion===token){remove(token.clone);deletion=null;cancel(deleteTimer);deleteTimer=0;}}
  function deleteChoice(){let choice=Math.random()<.5?'A':'B';if(deleteHistory.length>=2&&deleteHistory.at(-1)===choice&&deleteHistory.at(-2)===choice)choice=choice==='A'?'B':'A';deleteHistory.push(choice);if(deleteHistory.length>4)deleteHistory.shift();return choice;}
  function deleteStar(layer,x,y){const size=rnd(6,10),a=rnd(0,Math.PI*2),d=rnd(22,44),n=at(node('span','hw-delete-spark',layer),x-size/2,y-size/2,size,size);n.innerHTML=star4(size);animate(n,[{transform:'translate(0,0) scale(0)',opacity:1},{offset:.5,transform:`translate(${Math.cos(a)*d*.6}px,${Math.sin(a)*d*.6}px) scale(1) rotate(45deg)`,opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) scale(0) rotate(90deg)`,opacity:.8}],{duration:540,easing:'ease-out'},()=>remove(n));}
  function deleted(){
    const snap=deletion,c=getContext();if(!snap||!moving()||snap.chat!==c?.chat||Date.now()-snap.at>60000||!(!c.chat.includes(snap.data)||(snap.data.swipes?.length||0)<snap.swipes))return;
    deletion=null;cancel(deleteTimer);deleteTimer=0;action();const r=snap.rect,layer=at(node('div','hw-deletion-layer hw-fx'),0,0,win.innerWidth,win.innerHeight),piece=snap.clone;layer.dataset.hwDelete=deleteChoice();layer.style.clipPath=`inset(${Math.max(0,r.top-50)}px ${Math.max(0,win.innerWidth-r.right-50)}px ${Math.max(0,win.innerHeight-r.bottom-50)}px ${Math.max(0,r.left-50)}px)`;layer.append(piece);owned.add(piece);
    Object.assign(piece.style,{position:'absolute',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',margin:'0',transformOrigin:'50% 50%',pointerEvents:'none'});const cx=r.left+r.width/2,cy=r.top+r.height/2,night=root.dataset.claudeIntegratedTheme==='night';
    if(layer.dataset.hwDelete==='A'){
      animate(piece,[{transform:'scale(1) rotate(0deg)',opacity:1},{offset:.55,transform:'scale(.34) rotate(6deg)',opacity:1},{transform:'scale(.03) rotate(16deg)',opacity:0}],{duration:300,easing:'cubic-bezier(.55,0,.85,.4)',fill:'forwards'});
      later(()=>{const size=root.dataset.claudeLayout==='mobile'?28:30,n=at(node('span','hw-delete-asterisk',layer),cx-size/2,cy-size/2,size,size);n.innerHTML=asteriskMarkup(size);animate(n,[{transform:'scale(0) rotate(0deg)',opacity:1},{offset:.32,transform:'scale(1.2) rotate(70deg)',opacity:1},{offset:.52,transform:'scale(1) rotate(110deg)',opacity:1},{transform:'scale(.1) rotate(210deg)',opacity:0}],{duration:580,easing:'cubic-bezier(.3,.7,.4,1)',fill:'forwards'});},210);
      later(()=>{for(let i=0;i<8;i++){const a=i/8*Math.PI*2+rnd(0,.6),d=28*rnd(.55,1.05),size=rnd(12,22),n=at(node('span','hw-delete-puff',layer),cx-size/2,cy-size/2,size,size);n.style.background=`radial-gradient(circle,${night?'rgba(198,188,216,.55)':'rgba(122,110,148,.34)'} 0 52%,transparent 72%)`;animate(n,[{transform:'scale(.3)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d-8}px) scale(1.35)`,opacity:0}],{duration:rnd(460,640),easing:'cubic-bezier(.2,.8,.3,1)'},()=>remove(n));}for(let i=0;i<6;i++)deleteStar(layer,cx,cy);},510);
      later(()=>remove(layer),1150);
    }else{
      animate(piece,[{opacity:1,transform:'translateY(0)',filter:'blur(0px)'},{opacity:0,transform:'translateY(-4px)',filter:'blur(1.5px)'}],{duration:440,easing:'ease-in',fill:'forwards'});
      const count=clamp(Math.round(r.width*r.height/9000),4,8);for(let i=0;i<count;i++)later(()=>{const size=rnd(19,27)*(root.dataset.claudeLayout==='mobile'?.9:1),x=r.left+14+rnd(0,Math.max(0,r.width-28)),y=r.top+12+rnd(0,Math.max(0,r.height-24)),m=at(node('span','hw-delete-moth',layer),x-size/2,y-size/2,size,size);m.innerHTML=mothMarkup(size,night);const dx=rnd(-30,30),dy=-rnd(34,74),rot=dx*.4,w=rnd(-10,10);animate(m,[{transform:'scale(.5)',opacity:0},{offset:.2,transform:`translate(${dx*.2+w}px,${dy*.22}px) rotate(${rot*.4}deg)`,opacity:1},{offset:.58,transform:`translate(${dx*.55-w}px,${dy*.6}px) rotate(${-rot*.3}deg) scale(.96)`,opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(${rot}deg) scale(.8)`,opacity:0}],{duration:rnd(780,1000),easing:'cubic-bezier(.3,.1,.4,1)',fill:'forwards'});const wings=m.querySelector('.mw');wings.style.transformBox='fill-box';wings.style.transformOrigin='center';animate(wings,[{transform:'scaleX(1)'},{transform:'scaleX(.22)'},{transform:'scaleX(1)'}],{duration:rnd(110,140),iterations:9});},i*45+rnd(0,60));later(()=>remove(layer),1400);
    }
  }

  const asteriskMarkup=size=>`<svg width="${size}" height="${size}" viewBox="0 0 256 257"><path d="M50.2278481,170.321013 L100.585316,142.063797 L101.427848,139.601013 L100.585316,138.24 L98.1225316,138.24 L89.6972152,137.721519 L60.921519,136.943797 L35.9696203,135.906835 L11.795443,134.610633 L5.70329114,133.31443 L0,125.796456 L0.583291139,122.037468 L5.70329114,118.602532 L13.0268354,119.250633 L29.2293671,120.352405 L53.5331646,122.037468 L71.161519,123.07443 L97.28,125.796456 L101.427848,125.796456 L102.011139,124.111392 L100.585316,123.07443 L99.4835443,122.037468 L74.3372152,104.992405 L47.116962,86.9751899 L32.8587342,76.6055696 L25.1463291,71.3559494 L21.2577215,66.4303797 L19.5726582,55.6718987 L26.5721519,47.9594937 L35.9696203,48.6075949 L38.3675949,49.2556962 L47.8946835,56.5792405 L68.2450633,72.3281013 L94.8172152,91.9007595 L98.7058228,95.1412658 L100.261266,94.0394937 L100.455696,93.2617722 L98.7058228,90.3453165 L84.2531646,64.2268354 L68.8283544,37.6546835 L61.958481,26.636962 L60.1437975,20.0263291 C59.4956962,17.3043038 59.0420253,15.0359494 59.0420253,12.2491139 L67.0136709,1.42582278 L71.4207595,-1.42108547e-14 L82.0496203,1.42582278 L86.521519,5.31443038 L93.1321519,20.4151899 L103.825823,44.2005063 L120.417215,76.5407595 L125.277975,86.1326582 L127.87038,95.0116456 L128.842532,97.7336709 L130.527595,97.7336709 L130.527595,96.1782278 L131.888608,77.9665823 L134.416203,55.6070886 L136.878987,26.8313924 L137.721519,18.7301266 L141.739747,9.00860759 L149.711392,3.75898734 L155.933165,6.74025316 L161.053165,14.0637975 L160.340253,18.7949367 L157.294177,38.5620253 L151.331646,69.5412658 L147.443038,90.2805063 L149.711392,90.2805063 L152.303797,87.6881013 L162.803038,73.7539241 L180.431392,51.718481 L188.208608,42.9691139 L197.282025,33.3124051 L203.114937,28.7108861 L214.132658,28.7108861 L222.233924,40.7655696 L218.604557,53.2091139 L207.262785,67.596962 L197.865316,79.7812658 L184.38481,97.9281013 L175.959494,112.44557 L176.737215,113.612152 L178.746329,113.417722 L209.207089,106.936709 L225.668861,103.955443 L245.306329,100.585316 L254.185316,104.733165 L255.157468,108.945823 L251.657722,117.56557 L230.659241,122.75038 L206.031392,127.675949 L169.348861,136.360506 L168.89519,136.684557 L169.413671,137.332658 L185.940253,138.888101 L193.004557,139.276962 L210.308861,139.276962 L242.519494,141.674937 L250.94481,147.248608 L256,154.053671 L255.157468,159.238481 L242.195443,165.849114 L224.696709,161.701266 L183.866329,151.979747 L169.867342,148.48 L167.923038,148.48 L167.923038,149.646582 L179.588861,161.053165 L200.976203,180.366582 L227.742785,205.253671 L229.103797,211.410633 L225.668861,216.271392 L222.039494,215.752911 L198.513418,198.059747 L189.44,190.088101 L168.89519,172.783797 L167.534177,172.783797 L167.534177,174.598481 L172.265316,181.533165 L197.282025,219.123038 L198.578228,230.659241 L196.763544,234.418228 L190.282532,236.686582 L183.153418,235.39038 L168.506329,214.84557 L153.40557,191.708354 L141.221266,170.969114 L139.730633,171.811646 L132.536709,249.259747 L129.166582,253.213165 L121.389367,256.19443 L114.908354,251.268861 L111.473418,243.297215 L114.908354,227.548354 L119.056203,207.003544 L122.426329,190.671392 L125.472405,170.385823 L127.287089,163.64557 L127.157468,163.191899 L125.666835,163.386329 L110.371646,184.38481 L87.1048101,215.817722 L68.6987342,235.52 L64.2916456,237.269873 L56.6440506,233.316456 L57.356962,226.252152 L61.6344304,219.96557 L87.1048101,187.560506 L102.46481,167.469367 L112.380759,155.868354 L112.315949,154.183291 L111.732658,154.183291 L44.0708861,198.124557 L32.0162025,199.68 L26.8313924,194.819241 L27.4794937,186.847595 L29.9422785,184.25519 L50.2926582,170.256203 L50.2278481,170.321013 Z" fill="#D97757"/></svg>`;
function mothMarkup(s, night) { const P={moth:night?'#C4BAA8':'#DED4C4',inkDark:'#141413',clay:'#D97757'};
  return '<svg width="' + s + '" height="' + s + '" viewBox="-12 -11 24 22" style="overflow:visible"><g class="mw">'
    + '<path d="M0 -2 C-4 -9 -11 -9.4 -11.6 -4 C-12 0 -6 1.2 0 1 Z" fill="' + P.moth + '" stroke="' + P.inkDark + '" stroke-width=".8" stroke-linejoin="round"/>'
    + '<path d="M0 -2 C4 -9 11 -9.4 11.6 -4 C12 0 6 1.2 0 1 Z" fill="' + P.moth + '" stroke="' + P.inkDark + '" stroke-width=".8" stroke-linejoin="round"/>'
    + '<path d="M0 0 C-3 1 -8 3.2 -7.2 7.2 C-5.2 9.2 -1.2 5.2 0 2 Z" fill="' + P.moth + '" stroke="' + P.inkDark + '" stroke-width=".8" stroke-linejoin="round"/>'
    + '<path d="M0 0 C3 1 8 3.2 7.2 7.2 C5.2 9.2 1.2 5.2 0 2 Z" fill="' + P.moth + '" stroke="' + P.inkDark + '" stroke-width=".8" stroke-linejoin="round"/>'
    + '<circle cx="-6.6" cy="-4.2" r="1.3" fill="' + P.clay + '"/><circle cx="6.6" cy="-4.2" r="1.3" fill="' + P.clay + '"/>'
    + '<path d="M-3.6 -6.4 L-9 -5.2 M3.6 -6.4 L9 -5.2" stroke="' + P.inkDark + '" stroke-width=".5" opacity=".6"/>'
    + '</g><ellipse cx="0" cy="1" rx="1.4" ry="5.2" fill="' + P.inkDark + '"/>'
    + '<path d="M-.5 -4 C-2 -8 -3.4 -9.2 -5.2 -9.8 M.5 -4 C2 -8 3.4 -9.2 5.2 -9.8" stroke="' + P.inkDark + '" stroke-width=".7" fill="none" stroke-linecap="round"/></svg>';
}

  function clearGhost(expected){if(!ghost||(expected&&ghost.node!==expected))return;const old=ghost;ghost=null;for(const a of old.node.getAnimations?.({subtree:true})||[])a.cancel();for(const a of old.anims)a?.cancel();remove(old.node);}
  function appear(){
    const state=getClawdState?.();if(pressedPointers.size||state?.held||state?.dragging||state?.airborne)return false;
    if(!moving()||!ambient()||ghost||panel()||modal()||root.dataset.cwGenerating==='1'||Date.now()-lastAction<6500)return false;
    const form=doc.getElementById('send_form')?.getBoundingClientRect(),chat=doc.getElementById('chat')?.getBoundingClientRect();if(!form||!chat)return false;
    const minX=Math.max(8,chat.left+8),maxX=Math.min(win.innerWidth-52,chat.right-50),maxY=Math.min(form.top-70,win.innerHeight-100);if(maxX<minX||maxY<90)return false;
    let x,y,valid=false;
    // Only use blank gutters; never place a hit target over message text/buttons.
    for(let i=0;i<12;i++){
      x=minX+Math.random()*(maxX-minX);y=90+Math.random()*(maxY-90);
      const points=[[x,y],[x+22,y+24],[x+43,y+45]];
      if(points.every(([a,b])=>!doc.elementsFromPoint(a,b).some(n=>n.matches?.('.mes_text,.mes_text *,button,input,textarea,.mes_buttons,.mes_buttons *')))){valid=true;break;}
    }
    if(!valid)return false;
    const n=node('button','hw-roaming hw-fx');n.setAttribute('aria-label','戳一下床单 Clawd');n.style.left=x+'px';n.style.top=y+'px';const body=picture(art.sheet({awake:true}),n,2);
    ghost={node:n,anims:[],busy:false};
    const peek=Math.random()<.55;
    ghost.anims.push(animate(n,[{opacity:0,transform:'translateY(8px)'},{offset:.2,opacity:1,transform:'translateY(0)'},{offset:.7,opacity:1,transform:'translateY(-10px)'},{opacity:0,transform:'translateY(-18px)'}],{duration:5200,easing:'ease-in-out',fill:'forwards'},()=>clearGhost(n)));
    ghost.anims.push(animate(body,[{transform:`translateY(${peek?30:6}px)`},{offset:.22,transform:'translateY(0)'},{offset:.52,transform:'translateY(-2px) rotate(-5deg)'},{offset:.7,transform:'rotate(4deg)'},{transform:`translateY(${peek?12:-5}px)`}],{duration:5200,easing:'ease-in-out',fill:'forwards'}));
    n.addEventListener('click',()=>boo(n,body));return true;
  }
  function boo(target,base){
    if(!ghost||ghost.busy||!moving())return;
    ghost.busy=true;ghost.anims.forEach(a=>a?.pause());target.style.overflow='visible';base.style.visibility='hidden';
    const success=Math.random()<.5;target.dataset.booOutcome=success?'success':'slip';
    const body=node('span','hw-boo-body',target),cloth=picture(art.sheet({awake:true}),body,2),head=node('span','hw-boo-head',body),label=node('span','hw-boo-label',body);label.textContent='Boo!';
    const left=node('i','hw-boo-hand hw-boo-left',body),right=node('i','hw-boo-hand hw-boo-right',body);
    animate(body,[{transform:'scale(1)'},{offset:.12,transform:'translateY(2px) scale(1.05,.86)'},{offset:.25,transform:'translateY(-3px) scale(1.1)'},{offset:.7,transform:'translateY(0)'},{transform:'scale(1)'}],{duration:success?2200:2400,easing:'ease-in-out',fill:'forwards'},()=>clearGhost(target));
    if(!success){
      animate(cloth,[{transform:'translateY(0)',clipPath:'inset(0)'},{offset:.32,transform:'translateY(0)',clipPath:'inset(0)'},{offset:.46,transform:'translateY(14px)',clipPath:'inset(56% 0 0 0)'},{offset:.72,transform:'translateY(14px)',clipPath:'inset(56% 0 0 0)'},{offset:.85,transform:'translateY(-2px)',clipPath:'inset(0)'},{transform:'translateY(0)',clipPath:'inset(0)'}],{duration:2400,fill:'forwards'});
      animate(head,[{opacity:0},{offset:.33,opacity:0},{offset:.43,opacity:1},{offset:.74,opacity:1},{offset:.85,opacity:0},{opacity:0}],{duration:2400,fill:'forwards'});
    }
    for(const [hand,sgn]of [[left,-1],[right,1]])animate(hand,[{transform:'translate(0,0)',background:'#fbf8f1'},{offset:.24,transform:`translate(${sgn*5}px,-14px)`,background:'#fbf8f1'},{offset:.46,transform:`translate(${sgn*5}px,-14px)`,background:success?'#fbf8f1':'#d97757'},{offset:.65,transform:`translate(${sgn*5}px,-14px)`,background:success?'#fbf8f1':'#d97757'},{offset:.74,transform:'translate(0,6px)',background:success?'#fbf8f1':'#d97757'},{offset:.85,transform:'translate(0,-12px)',background:'#fbf8f1'},{transform:'translate(0,0)',background:'#fbf8f1'}],{duration:success?2200:2400,fill:'forwards'});
  }
  function clearSpider(){if(!spider)return;remove(spider);spider=null;}
  function trackSpider(e,tap=false){
    if((!tap&&(e.buttons||e.pointerType==='touch'))||root.dataset.cwV4Settings!=='open')return clearSpider();
    if(!moving()||!ambient())return clearSpider();
    // Native panels deliberately keep their original drawer ancestry. Use the
    // real shell boundary, rather than assuming controls are shell descendants.
    const host=panel();if(!host||spiderModal())return clearSpider();
    const r=host.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return clearSpider();
    if(!spider){spider=node('span','hw-spider hw-fx',host);const witch=picture(art.witch({awake:true}),spider,2);witch.classList.add('hw-puppet');spider.insertAdjacentHTML('beforeend','<i class="hw-puppet-eyes"></i><i class="hw-puppet-paw"></i><i class="hw-puppet-paw hw-puppet-paw-r"></i><i class="hw-spider-thread"></i><i class="hw-spider-body"></i>');}
    spider.style.left=Math.max(r.left+50,Math.min(r.right-38,e.clientX))+'px';spider.style.top=Math.max(root.dataset.claudeLayout==='mobile'?60:42,r.top)+'px';
    if(tap){const old=spider;animate(spider.querySelector('.hw-spider-body'),[{transform:'translateY(0)'},{offset:.5,transform:'translateY(7px)'},{transform:'translateY(0)'}],{duration:450});later(()=>{if(spider===old)clearSpider();},1000);}
  }
  function candy(event){
    if(!moving()||!event.target.closest?.('.hw-pail')||modal())return;
    action();const r=event.target.closest('.hw-pail').getBoundingClientRect();
    for(let i=0;i<7;i++){const c=picture(art.candy(i%3,art.CANDY_PAIRS[i%6]),doc.body,2,'hw-candy hw-fx');c.style.left=r.left+'px';c.style.top=r.top+'px';const dx=(Math.random()-.5)*140;animate(c,[{opacity:1,transform:'translate(0,0)'},{offset:.35,opacity:1,transform:`translate(${dx*.5}px,-${25+Math.random()*30}px) rotate(90deg)`},{opacity:0,transform:`translate(${dx}px,80px) rotate(220deg)`}],{duration:1000+i*40,easing:'ease-in',fill:'forwards'},()=>remove(c));}
  }
  function action(){lastAction=Date.now();clearGhost();clearSpider();}
  function tick(){scheduler=0;if(dead)return;appear();scheduler=later(tick,(7+Math.random()*5)*1000);}
  function schedule(){if(scheduler||!visible()||calm()||!ambient())return;scheduler=later(tick,3000);}
  function reset(){
    clearSend();
    pressedPointers.clear();
    win.cancelAnimationFrame(spiderModalFrame);spiderModalFrame=0;spiderModalValid=false;
    epoch++;validAfter=win.performance.now();for(const id of timers)win.clearTimeout(id);timers.clear();scheduler=0;
    for(const a of animations)a.cancel();animations.clear();clearGhost();clearSpider();
    for(const [b,state]of copies){delete b.dataset.cwHalloweenCopy;remove(state.status);}copies.clear();
    for(const n of [...owned])if(n.classList.contains('hw-fx')||n.closest?.('.hw-fx'))remove(n);
    submit=null;deletion=null;submitTimer=deleteTimer=0;if(!dead)schedule();
  }
  const observer=new win.MutationObserver(records=>{
    if(records.every(r=>r.target.closest?.('[data-cw-halloween-owned]')||[...r.addedNodes,...r.removedNodes].every(n=>n.nodeType===1&&n.hasAttribute?.('data-cw-halloween-owned'))))return;
    if(!raf)raf=win.requestAnimationFrame(()=>{raf=0;if(!dead)staticScenes();});
  });
  function stopAmbient(){cancel(scheduler);scheduler=0;clearGhost();clearSpider();}
  function sync(){if(dead)return;const nowCalm=calm();if(nowCalm!==lastCalm){lastCalm=nowCalm;if(nowCalm)reset();}staticScenes();if(!moving()||!ambient())stopAmbient();else schedule();}
  return {rig,install(){
    lastCalm=calm();buildStyle();staticScenes();schedule();
    const shell=doc.getElementById('chat');if(shell)observer.observe(shell,{childList:true});
    // Popup creation is observed shallowly; never scan streaming message subtrees.
    observer.observe(doc.body,{childList:true});
    on(doc,'cw-copy-result',copyResult);on(doc,'pointerdown',e=>{pressedPointers.add(e.pointerId);if(!e.target.closest?.('.hw-roaming'))action();if(panel())trackSpider(e,true);},{capture:true,passive:true});
    on(doc,'pointerup',e=>pressedPointers.delete(e.pointerId),{capture:true,passive:true});on(doc,'pointercancel',e=>pressedPointers.delete(e.pointerId),{capture:true,passive:true});on(win,'blur',()=>pressedPointers.clear());
    on(doc,'click',candy);
    on(doc,'pointerup',rememberSend,{capture:true,passive:true});on(doc,'click',rememberSend,{capture:true,passive:true});on(doc,'keydown',e=>{if(!e.target.closest?.('.hw-roaming'))action();rememberSend(e);},{capture:true,passive:true});
    on(doc,'pointermove',trackSpider,{passive:true});on(doc,'pointercancel',clearSpider,{passive:true});on(doc,'scroll',()=>{clearSpider();clearGhost();},{capture:true,passive:true});
    on(doc,'input',e=>{if(e.target.id==='send_textarea'){const value=!!e.target.value;if(value!==root.classList.contains('hw-typing')){root.classList.toggle('hw-typing',value);welcomeWeb(doc.querySelector('.clawd-welcome-hero'));}}},{passive:true});
    on(doc,'click',e=>{if(e.target.closest?.('.popup-button-cancel,#dialogue_del_mes_cancel'))finishDelete(deletion);const m=e.target.closest?.('.mes_edit_delete,.claude-user-message-delete');if(m)captureDelete(m.closest('.mes'));if(e.target.closest?.('#dialogue_del_mes_ok'))captureDelete([...doc.querySelectorAll('#chat>.mes:has(input.del_checkbox:checked)')].at(-1)||doc.querySelector('#chat>.mes:last-child'));},{capture:true,passive:true});
    on(doc,'visibilitychange',()=>{reset();});on(win,'resize',()=>{reset();webKey='';generationSafeKey='';pailBase=null;staticScenes();},{passive:true});on(win,'blur',clearSpider);on(motion,'change',()=>{lastCalm=calm();reset();staticScenes();});
    doc.fonts?.ready.then(()=>{if(!dead){webKey='';staticScenes();}});
  },sync,sent,deleted,captureDelete,finishDelete,reset,positionClawd:positionPail,
  stats:()=>({timers:timers.size,animations:animations.size,nodes:[...owned].filter(n=>n.isConnected).length,ghost:!!ghost,spider:!!spider,sendRaf:!!sendFrame}),
  destroy(){if(dead)return;dead=true;reset();observer.disconnect();win.cancelAnimationFrame(raf);listeners.splice(0).forEach(f=>f());for(const[n,s]of icons){if(s.kind==='svg'&&n.innerHTML===s.installed){n.innerHTML=s.html;if(s.box===null)n.removeAttribute('viewBox');else n.setAttribute('viewBox',s.box);if(s.stroke===null)n.removeAttribute('stroke-width');else n.setAttribute('stroke-width',s.stroke);}if(s.kind==='text'&&s.text.data===s.installed)s.text.data=s.original;if(s.kind==='mask'){if(s.mask)n.style.setProperty('mask-image',s.mask,s.maskP);else n.style.removeProperty('mask-image');}}icons.clear();for(const n of owned)n.remove();owned.clear();anchors.clear();root.classList.remove('hw-typing');root.style.removeProperty('--cw-hw-rig-lift');}
  };
}
