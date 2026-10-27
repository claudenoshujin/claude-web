import { halloweenIcons as I } from './halloween-icons.js?v=2.0.160-halloween2';
import { createHalloweenSprites } from './halloween-sprites.js?v=2.0.160-halloween2';
import { buildHalloweenRig } from './halloween-rig.js?v=2.0.160-halloween2';
import { halloweenCSS, iconRules } from './halloween-style.js?v=2.0.160-halloween2';
import { halloweenPileCells } from './halloween-pile.js?v=2.0.160-halloween2';

export function createHalloweenScene({win,getContext,ambient,getClawdState}) {
  const doc=win.document,root=doc.documentElement,art=createHalloweenSprites(doc);
  const rig=buildHalloweenRig();rig.pileCells=halloweenPileCells;
  const owned=new Set(),timers=new Set(),animations=new Set(),listeners=[],copies=new Map(),anchors=new Map(),icons=new Map(),corners=new Map();
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
  const svg=(key,mask=false)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="${mask?'black':'currentColor'}" stroke-width="1.35" stroke-linecap="round" stroke-linejoin="round"><style>.t{stroke-width:1}.e{stroke-width:1.8}.k{stroke-width:2.7}.kb{fill:${mask?'none':'var(--cl-surface,#fff)'}}</style>${I[key]}</svg>`;
  const url=key=>`url("data:image/svg+xml,${encodeURIComponent(svg(key,true))}")`;
  function buildStyle(){
    const style=node('style','cw-halloween-style',doc.head);
    const scope='html[data-cw-halloween="on"]'+Array.from({length:8},(_,i)=>`:not(#cw-hw-${i})`).join('');
    const variables={search:'search',note:'grimoire',scale:'scale',pie:'pie',flagline:'batflag',users:'ghosts',file:'scroll',book:'spellbook',bookmark:'batflag',sliders:'pfilter',plug:'batplug',type:'hatA',image:'moonpic',puzzle:'candy',card:'gcard',palette:'mirror',window:'webwin',chat:'gbubble',wave:'candles',terminal:'spiderterm',user:'witchuser',mic:'gmic',voice:'candles',down:'chevd',chevd:'chevd',close:'bones',menu:'hamburger',import:'pailIn',export:'pailOut',trash:'cauldron',save:'floppyMoon',saveplus:'floppyStar',ghost:'ghost',dots:'p3',copy:'tombs',play:'candycorn',pencil:'quill',retry:'reroll'};
    let css=halloweenCSS.replaceAll('html[data-cw-halloween="on"]',scope)+'\n'+scope+'{'+Object.entries(variables).map(([key,value])=>`--cw-v4-icon-${key}:${url(value)}!important;`).join('')+`--cw-hw-skull:${url('skull')};}`;
    for(const [selector,key,kind='before']of iconRules){
      if(kind==='self'){css+=`${scope}[data-claude-ui="classic"] ${selector}::before{content:""!important;display:inline-block!important;width:20px!important;height:20px!important;background:var(--cl-icon,currentColor)!important;mask:${url(key)} center/contain no-repeat!important;-webkit-mask:${url(key)} center/contain no-repeat!important}`;continue;}
      if(kind==='svg')continue;
      else if(['#options_button','#extensionsMenuButton','body.cw-v4-filled:not(.claude-generation-active) #send_but','body:not(.cw-v4-filled):not(.claude-generation-active) #send_but','.clawd-fake-mic'].includes(selector))css+=`${scope} ${selector}::${kind}{mask-image:${url(key)}!important;-webkit-mask-image:${url(key)}!important}`;
      else css+=`${scope} ${selector}::${kind}{content:""!important;background:currentColor!important;mask:${url(key)} center/contain no-repeat!important;-webkit-mask:${url(key)} center/contain no-repeat!important}`;
    }
    for(const [key,value]of Object.entries(variables))css+=`html[data-cw-halloween="on"] .cw-v4-icon[data-cw-icon="${key}"]{background:currentColor;mask:${url(value)} center/contain no-repeat;-webkit-mask:${url(value)} center/contain no-repeat}html[data-cw-halloween="on"] .cw-v4-icon[data-cw-icon="${key}"]>svg{visibility:hidden}`;
    css+=`${scope}[data-claude-layout="mobile"] body.cw-v4-filled:not(.claude-generation-active) #send_but::before{mask-image:${url('broomUp')}!important;-webkit-mask-image:${url('broomUp')}!important}`;
    const legacyIcons='#options_button,#extensionsMenuButton,#send_but,.mes_copy,.mes_edit,.mes_narrate,.mes_edit_delete,.claude-user-message-edit,.claude-user-message-delete,.clawd-fake-mic';
    css+=`${scope}[data-claude-ui="classic"] :is(${legacyIcons})::before{display:inline-block!important;width:18px!important;height:18px!important}${scope}[data-claude-ui="classic"].hw-typing body:not(.claude-generation-active) #send_but::before{mask-image:${url(root.dataset.claudeLayout==='mobile'?'broomUp':'send')}!important;-webkit-mask-image:${url(root.dataset.claudeLayout==='mobile'?'broomUp':'send')}!important}`;
    const legs=[[[-1.8,-.6],[-5.6,-4.2],[-8.6,-2.2]],[[-2.3,.6],[-6.6,-1.4],[-9.4,1.6]],[[-2.3,1.9],[-6.6,2.6],[-8.9,5.7]],[[-1.8,3.1],[-5.1,5.6],[-6.6,8.6]]];
    const spiderSVG='<svg xmlns="http://www.w3.org/2000/svg" viewBox="-11 -9 22 20" fill="black" stroke="black" stroke-width=".8" stroke-linecap="round">'+legs.map(p=>[1,-1].map(k=>'<path fill="none" d="M'+p.map(([x,y])=>x*k+' '+y).join('L')+'"/>').join('')).join('')+'<ellipse cx="0" cy="1.4" rx="2.9" ry="3.3"/><circle cx="0" cy="-2.5" r="1.9"/></svg>';
    css+=`${scope}{--cw-hw-spider:url("data:image/svg+xml,${encodeURIComponent(spiderSVG)}")}`;
    const pumpkin='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 4.4c-4.5 0-7.7 2.6-7.7 6s3.2 6 7.7 6 7.7-2.6 7.7-6-3.2-6-7.7-6Z" fill="white" stroke="#d6d3cb" stroke-width=".7"/><path d="M7 4.9c-1.2 1.4-1.2 9.6 0 11M13 4.9c1.2 1.4 1.2 9.6 0 11" fill="none" stroke="#e2dfd8" stroke-width=".7"/><path d="M10 4.5c-.2-1.3.3-2.4 1.6-3" fill="none" stroke="#8b8a7c" stroke-width="1.4"/><path d="M6.2 10.1l1.45-2.2 1.45 2.2ZM10.9 10.1l1.45-2.2 1.45 2.2ZM6.1 12.2h7.8l-1.05 2-1.2-1-1.15 1.1-1.15-1.1-1.2 1Z" fill="#2a78d6"/></svg>';
    css+=`${scope}{--cw-hw-select:${url('chevd')};--cw-hw-pumpkin:url("data:image/svg+xml,${encodeURIComponent(pumpkin)}")}`;
    style.textContent=css;
  }
  function dressIcons(){
    for(const button of doc.querySelectorAll('.clawd-mobile-new-chat'))if(!icons.has(button)){
      const text=[...button.childNodes].find(n=>n.nodeType===3);if(text&&/^[+＋]\s*/.test(text.data)){const original=text.data,installed=original.replace(/^[+＋]\s*/,'');text.data=installed;icons.set(button,{kind:'text',text,original,installed});}
    }
    const svgMap=[['.cw-web-new>svg','newchat'],['.cw-web-more>svg','more'],['.cw-web-search>svg','search'],['.cw-web-apps>svg','papps'],['.cw-web-proj>svg','chevd'],['.cw-web-filter>svg','pfilter'],['.cw-desk-seg>.cw-on>svg','chattab'],['.cw-desk-seg>span:not(.cw-on)>svg','codetab'],['.cw-desk-tool>svg:nth-child(2)','sidetoggle'],['.cw-v4-chat-more>svg','p3'],['.cw-v4-chat-name+svg','chevd'],['.cw-b34-paper-button>svg','scroll']];
    for(const [selector,key]of svgMap)for(const n of doc.querySelectorAll(selector)){
      let old=icons.get(n);if(old?.kind==='svg'&&n.innerHTML===old.installed)continue;
      if(!old){old={kind:'svg',html:n.innerHTML,box:n.getAttribute('viewBox'),stroke:n.getAttribute('stroke-width')};icons.set(n,old);}
      n.setAttribute('viewBox','0 0 20 20');n.setAttribute('stroke-width','1.35');n.innerHTML=I[key].replaceAll('class="t"','stroke-width="1"').replaceAll('class="e"','stroke-width="1.8"').replaceAll('class="k"','stroke-width="2.7"').replaceAll('class="kb"','fill="var(--cl-surface,#fff)"');old.installed=n.innerHTML;
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
    dressIcons();welcomeWeb(doc.querySelector('.clawd-welcome-hero'));
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
  function rememberSend(event){
    if(!moving()||modal())return;
    const t=event.target,box=doc.getElementById('send_textarea');if(!box?.value.trim())return;
    if(event.type==='keydown'&&(t!==box||event.key!=='Enter'||event.isComposing))return;
    if(event.type!=='keydown'&&!t.closest?.('#send_but,#send_form [type="submit"]'))return;
    const chat=getContext()?.chat;cancel(submitTimer);submit={text:box.value,rect:box.getBoundingClientRect(),chat,length:chat?.length||0,at:Date.now()};submitTimer=later(()=>{submit=null;submitTimer=0;},15000);
  }
  function sent(id){
    const snap=submit,c=getContext(),message=c?.chat?.[Number(id)];
    if(!snap||!moving()||snap.chat!==c?.chat||Date.now()-snap.at>15000||Number(id)<snap.length||!message?.is_user||message.mes!==snap.text)return;
    submit=null;cancel(submitTimer);submitTimer=0;
    action();const r=snap.rect,actor=node('span','hw-send hw-fx');actor.style.left=Math.max(8,r.left)+'px';actor.style.top=Math.max(48,r.top-26)+'px';
    picture(art.witch({awake:true}),actor,2);
    const broom=node('span','hw-broom',actor);broom.innerHTML='<i class="hw-shaft"></i><i class="hw-grip hw-grip-l"></i><i class="hw-grip hw-grip-r"></i><i class="hw-bristles"></i>';
    const text=node('span','hw-send-text',actor);text.textContent=snap.text.slice(0,120);text.style.maxWidth=Math.max(30,r.width-70)+'px';
    animate(actor,[{opacity:0,transform:'translateX(-25px)'},{offset:.15,opacity:1,transform:'translateX(0)'},{offset:.75,opacity:1,transform:`translateX(${Math.min(r.width*.7,420)}px)`},{opacity:0,transform:`translateX(${Math.min(r.width,550)}px) translateY(-25px)`}],{duration:1300,easing:'ease-in-out',fill:'forwards'},()=>remove(actor));
  }
  function captureDelete(message){
    if(!moving()||!message)return;const c=getContext(),id=Number(message.getAttribute('mesid')),data=c?.chat?.[id];if(!data)return;
    cancel(deleteTimer);deletion={data,chat:c.chat,length:c.chat.length,swipes:data.swipes?.length||0,rect:message.getBoundingClientRect(),at:Date.now(),text:String(data.mes||'')};deleteTimer=later(()=>{deletion=null;deleteTimer=0;},60000);return deletion;
  }
  function finishDelete(token){if(token&&deletion===token){deletion=null;cancel(deleteTimer);deleteTimer=0;}}
  function deleted(){
    const snap=deletion,c=getContext();
    if(!snap||!moving()||snap.chat!==c?.chat||Date.now()-snap.at>60000||!(!c.chat.includes(snap.data)||(snap.data.swipes?.length||0)<snap.swipes))return;
    deletion=null;cancel(deleteTimer);deleteTimer=0;
    action();const r=snap.rect,form=doc.getElementById('send_form')?.getBoundingClientRect();if(!form)return;
    const x=Math.max(32,Math.min(win.innerWidth-90,r.left+r.width*.5)),y=Math.max(64,Math.min(form.top-100,r.top+30));
    const actor=node('span','hw-delete hw-fx');actor.style.left=x-35+'px';actor.style.top=y+'px';picture(art.sheet({awake:true}),actor,2);
    const page=node('span','hw-delete-page',actor);page.textContent=snap.text.slice(0,90);
    const pot=node('span','hw-delete-pot hw-fx');pot.style.left=x+'px';pot.style.top=Math.max(y+70,Math.min(form.top-35,win.innerHeight-70))+'px';pot.innerHTML=svg('cauldron');
    const dy=parseFloat(pot.style.top)-y-35;
    animate(actor,[{opacity:0,transform:'scale(.8)'},{offset:.12,opacity:1,transform:'scale(1)'},{offset:.65,opacity:1,transform:`translate(-18px,${dy}px)`},{offset:.85,opacity:1,transform:`translate(-12px,${dy-5}px) rotate(10deg)`},{opacity:0,transform:`translate(-12px,${dy}px)`}],{duration:1900,easing:'ease-in-out',fill:'forwards'},()=>remove(actor));
    animate(page,[{transform:'scale(1)'},{offset:.65,transform:'scale(.65)'},{offset:.8,opacity:1,transform:'translate(14px,12px) scale(.3)'},{opacity:0,transform:'translate(14px,28px) scale(.1)'}],{duration:1700,fill:'forwards'});
    later(()=>animate(pot,[{opacity:1},{offset:.5,opacity:1,transform:'translateY(-3px)'},{opacity:0,transform:'translateY(-8px)'}],{duration:700,fill:'forwards'},()=>remove(pot)),1600);
  }
  function clearGhost(expected){if(!ghost||(expected&&ghost.node!==expected))return;const old=ghost;ghost=null;for(const a of old.node.getAnimations?.({subtree:true})||[])a.cancel();for(const a of old.anims)a?.cancel();remove(old.node);}
  function appear(){
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
    on(doc,'cw-copy-result',copyResult);on(doc,'pointerdown',e=>{if(!e.target.closest?.('.hw-roaming'))action();if(panel())trackSpider(e,true);},{capture:true,passive:true});
    on(doc,'click',candy);
    on(doc,'pointerup',rememberSend,{capture:true,passive:true});on(doc,'click',rememberSend,{capture:true,passive:true});on(doc,'keydown',e=>{if(!e.target.closest?.('.hw-roaming'))action();rememberSend(e);},{capture:true,passive:true});
    on(doc,'pointermove',trackSpider,{passive:true});on(doc,'pointercancel',clearSpider,{passive:true});on(doc,'scroll',()=>{clearSpider();clearGhost();},{capture:true,passive:true});
    on(doc,'input',e=>{if(e.target.id==='send_textarea'){const value=!!e.target.value;if(value!==root.classList.contains('hw-typing')){root.classList.toggle('hw-typing',value);welcomeWeb(doc.querySelector('.clawd-welcome-hero'));}}},{passive:true});
    on(doc,'click',e=>{if(e.target.closest?.('.popup-button-cancel,#dialogue_del_mes_cancel'))finishDelete(deletion);const m=e.target.closest?.('.mes_edit_delete,.claude-user-message-delete');if(m)captureDelete(m.closest('.mes'));if(e.target.closest?.('#dialogue_del_mes_ok'))captureDelete(doc.querySelector('#chat>.mes:has(input.del_checkbox:checked)')||doc.querySelector('#chat>.mes:last-child'));},{capture:true,passive:true});
    on(doc,'visibilitychange',()=>{reset();});on(win,'resize',()=>{reset();webKey='';pailBase=null;staticScenes();},{passive:true});on(win,'blur',clearSpider);on(motion,'change',()=>{lastCalm=calm();reset();staticScenes();});
    doc.fonts?.ready.then(()=>{if(!dead){webKey='';staticScenes();}});
  },sync,sent,deleted,captureDelete,finishDelete,reset,positionClawd:positionPail,
  stats:()=>({timers:timers.size,animations:animations.size,nodes:[...owned].filter(n=>n.isConnected).length,ghost:!!ghost,spider:!!spider}),
  destroy(){if(dead)return;dead=true;reset();observer.disconnect();win.cancelAnimationFrame(raf);listeners.splice(0).forEach(f=>f());for(const[n,s]of icons){if(s.kind==='svg'&&n.innerHTML===s.installed){n.innerHTML=s.html;if(s.box===null)n.removeAttribute('viewBox');else n.setAttribute('viewBox',s.box);if(s.stroke===null)n.removeAttribute('stroke-width');else n.setAttribute('stroke-width',s.stroke);}if(s.kind==='text'&&s.text.data===s.installed)s.text.data=s.original;if(s.kind==='mask'){if(s.mask)n.style.setProperty('mask-image',s.mask,s.maskP);else n.style.removeProperty('mask-image');}}icons.clear();for(const n of owned)n.remove();owned.clear();anchors.clear();root.classList.remove('hw-typing');}
  };
}
