import { halloweenIcons as I, halloweenIconWeight as IW } from './halloween-icons.js?v=2.0.160-halloween2';
import { createHalloweenSprites } from './halloween-sprites.js?v=2.0.160-halloween2';
import { buildHalloweenRig } from './halloween-rig.js?v=2.0.160-halloween2';
import { halloweenCSS, iconRules } from './halloween-style.js?v=2.0.160-halloween2';
import { halloweenPileCells } from './halloween-pile.js?v=2.0.160-halloween2';

export function createHalloweenScene({win,getContext,ambient,getClawdState,prefs}) {
  const doc=win.document,root=doc.documentElement,art=createHalloweenSprites(doc);
  const rig=buildHalloweenRig();rig.pileCells=halloweenPileCells;
  const owned=new Set(),timers=new Set(),animations=new Set(),listeners=[],copies=new Map(),anchors=new Map(),icons=new Map(),corners=new Map();
  const pressedPointers=new Set();
  const pendingDialogDecorations=new Map();
  const activeDeletes=new Set();
  const motion=win.matchMedia('(prefers-reduced-motion: reduce)');
  let dead=false,epoch=0,scheduler=0,raf=0,pail=null,ghost=null,spider=null,welcome=null,lastAction=0,submit=null,deletion=null,webKey='',submitTimer=0,deleteTimer=0,validAfter=win.performance.now(),lastCalm=null;
  let pailRatio=null,pailFloorOffset=null,pailDrag=null,pailSkipClick=false,pailLayout=null,pailResizeObserver=null,pailQrObserver=null,pailForm=null,pailQr=null,candyBusy=false;
  const pailObserved=new Set();
  let pailSmallObserver=null,pailSmallForm=null,pailSmallPile=null,pailSmallFrame=0;
  const calm=()=>motion.matches||root.dataset.claudeMotion==='off';
  const visible=()=>!dead&&!doc.hidden;
  const moving=()=>visible()&&!calm();
  const rootFlag=(key,value)=>{if(root.dataset[key]!==value)root.dataset[key]=value;};
  const modal=()=>[...doc.querySelectorAll('dialog[open],.cw-v4-editor-dialog[open],.cw-menu:not([hidden]),#options,#extensionsMenu')].some(n=>n.getClientRects().length>0&&win.getComputedStyle(n).visibility!=='hidden');
  let viewport={right:win.innerWidth,bottom:win.innerHeight};
  const panel=()=>doc.querySelector('.cw-v4-shell:not([hidden])');
  let generationSafeKey='';
  function quickReplyRects(){return [...doc.querySelectorAll('#qr--bar button,#qr--bar .qr--button')].map(n=>n.getBoundingClientRect()).filter(r=>r.width&&r.height);}
  function smallClawdRects(){return [...doc.querySelectorAll('#send_form .clawd-pile-c')].map(n=>n.getBoundingClientRect()).filter(r=>r.width&&r.height);}
  function clipQuickReplies(layer,bounds,blocks=quickReplyRects()){
    if(!bounds&&!blocks.length)return;
    bounds=bounds||{left:0,top:0,...viewport};
    const outer={left:Math.max(0,bounds.left),top:Math.max(0,bounds.top),right:Math.min(viewport.right,bounds.right),bottom:Math.min(viewport.bottom,bounds.bottom)};
    const rect=r=>`M${r.left} ${r.top}H${r.right}V${r.bottom}H${r.left}Z`;
    let path=rect(outer);for(const b of blocks){const r={left:Math.max(outer.left,b.left),top:Math.max(outer.top,b.top),right:Math.min(outer.right,b.right),bottom:Math.min(outer.bottom,b.bottom)};if(r.right>r.left&&r.bottom>r.top)path+=rect(r);}
    layer.style.clipPath=`path(evenodd, "${path}")`;
  }
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
  function remove(n){if(!n)return;for(const a of animations){const t=a.effect?.target;if(t&&(t===n||n.contains(t)))a.cancel();}for(const child of owned)if(child===n||n.contains(child))owned.delete(child);n.remove();}
  function animate(el,frames,options,done){
    if(!moving()||typeof el.animate!=='function'){if(done)later(done,options.duration||0);return null;}
    try{const a=el.animate(frames,options);animations.add(a);a.onfinish=()=>{animations.delete(a);done?.();};a.oncancel=()=>animations.delete(a);return a;}catch{done?.();return null;}
  }
  function picture(sprite,parent,scale=2,cls='hw-pixels'){const n=node('img',cls,doc.createDocumentFragment());n.width=Math.round(sprite.w*scale);n.height=Math.round(sprite.h*scale);n.src=sprite.url;n.alt='';n.draggable=false;parent.append(n);return n;}
  const svg=(key,mask=false,flicker=false)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="${mask?'black':'currentColor'}" stroke-width="${1.35*(IW[key]||1)}" stroke-linecap="round" stroke-linejoin="round"><style>.t{stroke-width:1}.e{stroke-width:1.8}.k{stroke-width:2.7}.kb{fill:${mask?'none':'var(--cl-surface,#fff)'}}${flicker?'.fl path{transform-box:fill-box;transform-origin:50% 100%;animation:flick 1.6s ease-in-out infinite}@keyframes flick{0%,100%{transform:scale(1,1)}30%{transform:scale(.9,1.12)}60%{transform:scale(1.05,.92)}}':''}</style>${I[key]}</svg>`;
  const url=(key,flicker=false)=>`url("data:image/svg+xml,${encodeURIComponent(svg(key,true,flicker))}")`;
  function buildStyle(){
    const style=node('style','cw-halloween-style',doc.head);
    const scope='html[data-cw-halloween="on"]'+Array.from({length:8},(_,i)=>`:not(#cw-hw-${i})`).join('');
    let css=halloweenCSS.replaceAll('html[data-cw-halloween="on"]',scope)+`\n${scope}{--cw-hw-skull:${url('tombs')};}`;
    for(const [selector,key,kind='before']of iconRules){
      if(kind==='native'){css+=`${scope} ${selector}{background-color:currentColor!important;mask:${url(key)} center/contain no-repeat!important;-webkit-mask:${url(key)} center/contain no-repeat!important}${scope} ${selector}::before{visibility:hidden!important}`;continue;}
      if(kind==='self'){css+=`${scope} ${selector}{background:currentColor!important;mask:${url(key)} center/contain no-repeat!important;-webkit-mask:${url(key)} center/contain no-repeat!important;font-size:0!important}${scope} ${selector}>svg{visibility:hidden!important}${scope}[data-claude-ui="classic"] ${selector}{display:inline-block!important;width:20px!important;height:20px!important}`;continue;}
      if(kind==='svg')continue;
      else if(['#options_button','#extensionsMenuButton','body.cw-v4-filled:not(.claude-generation-active) #send_but','body:not(.cw-v4-filled):not(.claude-generation-active) #send_but','.clawd-fake-mic'].includes(selector))css+=`${scope} ${selector}::${kind}{mask-image:${url(key)}!important;-webkit-mask-image:${url(key)}!important}`;
      else css+=`${scope} ${selector}::${kind}{content:""!important;background:currentColor!important;mask:${url(key)} center/contain no-repeat!important;-webkit-mask:${url(key)} center/contain no-repeat!important}`;
    }
    for(const [selector,key,kind='before']of iconRules)if(key==='candles'){
      const target=selector+'.hw-flicker'+(['native','self','svg'].includes(kind)?'':'::'+kind);
      css+=`${scope} ${target}{mask-image:${url(key,true)}!important;-webkit-mask-image:${url(key,true)}!important}`;
    }
    const legacyIcons='#options_button,#extensionsMenuButton,#send_but,.mes_copy,.mes_edit,.mes_narrate,.mes_edit_delete,.claude-user-message-edit,.claude-user-message-delete,.clawd-fake-mic';
    css+=`${scope}[data-claude-ui="classic"] :is(${legacyIcons})::before{display:inline-block!important;width:18px!important;height:18px!important}`;
    const legs=[[[-1.8,-.6],[-5.6,-4.2],[-8.6,-2.2]],[[-2.3,.6],[-6.6,-1.4],[-9.4,1.6]],[[-2.3,1.9],[-6.6,2.6],[-8.9,5.7]],[[-1.8,3.1],[-5.1,5.6],[-6.6,8.6]]];
    const spiderSVG='<svg xmlns="http://www.w3.org/2000/svg" viewBox="-11 -9 22 20" fill="black" stroke="black" stroke-width=".8" stroke-linecap="round">'+legs.map(p=>[1,-1].map(k=>'<path fill="none" d="M'+p.map(([x,y])=>x*k+' '+y).join('L')+'"/>').join('')).join('')+'<ellipse cx="0" cy="1.4" rx="2.9" ry="3.3"/><circle cx="0" cy="-2.5" r="1.9"/></svg>';
    css+=`${scope}{--cw-hw-spider:url("data:image/svg+xml,${encodeURIComponent(spiderSVG)}")}`;
    const pumpkin='<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20"><path d="M10 4.4c-4.5 0-7.7 2.6-7.7 6s3.2 6 7.7 6 7.7-2.6 7.7-6-3.2-6-7.7-6Z" fill="white" stroke="#d6d3cb" stroke-width=".7"/><path d="M7 4.9c-1.2 1.4-1.2 9.6 0 11M13 4.9c1.2 1.4 1.2 9.6 0 11" fill="none" stroke="#e2dfd8" stroke-width=".7"/><path d="M10 4.5c-.2-1.3.3-2.4 1.6-3" fill="none" stroke="#8b8a7c" stroke-width="1.4"/><path d="M6.2 10.1l1.45-2.2 1.45 2.2ZM10.9 10.1l1.45-2.2 1.45 2.2ZM6.1 12.2h7.8l-1.05 2-1.2-1-1.15 1.1-1.15-1.1-1.2 1Z" fill="#2a78d6"/></svg>';
    css+=`${scope}{--cw-hw-select:var(--cw-v4-icon-chevd);--cw-hw-pumpkin:url("data:image/svg+xml,${encodeURIComponent(pumpkin)}")}`;
    css+=`${scope} .hw-icon-muted::before,${scope} .hw-icon-muted>svg,${scope} svg.hw-icon-muted{opacity:0!important}${scope} .hw-icon-muted.hw-icon-self{color:transparent!important}.hw-icon-effect,.hw-icon-effect *{pointer-events:none!important;user-select:none}`;
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
    for(const [n]of icons)if(!n.isConnected)icons.delete(n);
  }
  let welcomeState=null,chatDecorationState=null;
  function local(parent,cls,x,y,w,h){const n=node('span',cls,parent);Object.assign(n.style,{position:'absolute',left:x+'px',top:y+'px'});if(w!=null)n.style.width=w+'px';if(h!=null)n.style.height=h+'px';return n;}
  function decoLater(state,fn,ms){const id=later(()=>{state.timers.delete(id);if(state.node.isConnected)fn();},ms);state.timers.add(id);return id;}
  function decoLegs(state,art,ms){if(moving()&&ambient()&&state.node.isConnected)art.animateLegs(ms);}
  function clearDeco(state){if(!state)return;for(const id of state.timers)cancel(id);for(const id of state.frames)win.cancelAnimationFrame(id);remove(state.node);}
  function clearWelcome(){if(welcomeState?.ast){const {ast,visibility,priority}=welcomeState;if(visibility)ast.style.setProperty('visibility',visibility,priority);else ast.style.removeProperty('visibility');}clearDeco(welcomeState);welcomeState=null;welcome=null;webKey='';}
  function clearChatDecoration(){clearDeco(chatDecorationState);chatDecorationState=null;}
  function welcomeWeb(hero){
    const ast=hero?.querySelector('.asterisk'),r=ast?.getBoundingClientRect();if(!r?.width){clearWelcome();return;}
    const ph=root.dataset.claudeLayout==='mobile',top=ph?56:0,hub=ph?48:66,active=moving()&&ambient(),P=palette(),cx=r.left+r.width/2;
    let offset=0;try{offset=new win.DOMMatrix(win.getComputedStyle(ast).transform).m42;}catch{}
    const rest=r.top+r.height/2-top-offset-hub-(root.classList.contains('hw-typing')?58:0),size=r.width,key=[cx,top,hub,size,active,P.night].join(':');
    if(welcomeState?.ast===ast&&key===webKey){welcomeState.rest=rest;welcomeState.thread.style.height=Math.max(0,rest-size/2)+'px';welcomeState.body.style.top=rest-size/2+'px';return;}
    clearWelcome();webKey=key;welcome=node('span','hw-live-web');Object.assign(welcome.style,{position:'fixed',left:cx-60+'px',top:top+'px',width:'120px',height:Math.max(hub+60,hub+rest+size)+'px',pointerEvents:'none',zIndex:'50',overflow:'visible'});
    const state=welcomeState={node:welcome,ast,visibility:ast.style.getPropertyValue('visibility'),priority:ast.style.getPropertyPriority('visibility'),timers:new Set(),frames:new Set(),rest};ast.style.setProperty('visibility','hidden','important');
    let seed=7;const R=()=>{seed|=0;seed=seed+0x6D2B79F5|0;let t=Math.imul(seed^seed>>>15,1|seed);t=t+Math.imul(t^t>>>7,61|t)^t;return((t^t>>>14)>>>0)/4294967296;};
    const web=sv('svg',{width:120,height:Math.max(hub+60,hub+rest+size)},welcome);Object.assign(web.style,{position:'absolute',left:'0',top:'0',overflow:'visible'});
    const spokes=[-160,-116,-70,-28,16,60,104,146].map(a0=>{const a=(a0+(R()-.5)*10)*RAD,dx=Math.cos(a),dy=Math.sin(a);return {dx,dy,anchor:dy<-.6,len:dy<-.6?hub/-dy:44+R()*12};}),rings=[12,22,32].map(r=>r*(1+(R()-.5)*.08)),point=(s,d)=>[60+s.dx*d,hub+s.dy*d],points=[];
    const line=(d,width,opacity,delay)=>{const n=sv('path',{d,pathLength:1,fill:'none',stroke:P.thread,'stroke-linecap':'round','stroke-width':width,opacity},web);if(active){n.style.strokeDasharray='1';n.style.strokeDashoffset='0';animate(n,[{strokeDashoffset:1},{strokeDashoffset:0}],{duration:420,delay,easing:'cubic-bezier(.3,.6,.4,1)',fill:'backwards'});}};
    spokes.forEach((s,i)=>{const[x,y]=point(s,s.len);line(`M60 ${hub}Q${60+s.dx*s.len/2-s.dy*(R()-.5)*2.2} ${hub+s.dy*s.len/2+s.dx*(R()-.5)*2.2} ${x} ${y}`,1.2,1,i*35);});
    rings.forEach((d,k)=>{for(let i=0;i<spokes.length;i++){if(k===rings.length-1&&R()<.22)continue;const[a,b]=point(spokes[i],d),[c,e]=point(spokes[(i+1)%8],d);line(`M${a} ${b}Q${60+((a+c)/2-60)*.8} ${hub+((b+e)/2-hub)*.8} ${c} ${e}`,1,.8,250+k*120+i*12);}});
    const dot=(x,y,r,delay)=>{const n=sv('circle',{cx:x,cy:y,r,fill:P.night?'rgba(217,119,87,.9)':'rgba(217,119,87,.82)'},web);n.style.transformBox='fill-box';n.style.transformOrigin='center';if(active)animate(n,[{transform:'scale(0)'},{offset:.7,transform:'scale(1.25)'},{transform:'scale(1)'}],{duration:260,delay,fill:'backwards'});points.push([x,y]);};
    spokes.forEach(s=>{const[x,y]=point(s,rings[2]);dot(x,y,1.8,620);if(!s.anchor){const[a,b]=point(s,s.len);dot(a,b,3,700);points.push(point(s,rings[1]));}});dot(60,hub,3.6,550);
    const hanger=local(welcome,'hw-web-hanger',60,hub,0,0),thread=local(hanger,'hw-web-thread',0,0,1,Math.max(0,rest-size/2)),body=local(hanger,'hw-web-star',-size/2,rest-size/2,size,size);thread.style.background=P.thread;body.innerHTML=asteriskMarkup(size);state.thread=thread;state.body=body;hanger.style.transformOrigin='0 0';if(active)hanger.style.animation='hw-web-sway 4.8s ease-in-out infinite';
    if(active){animate(body,[{transform:`translateY(${-rest}px) scale(.55)`},{offset:.76,transform:'translateY(6px) scale(1)'},{offset:.9,transform:'translateY(-2px)'},{transform:'translateY(0)'}],{duration:650,delay:750,fill:'backwards'});animate(thread,[{transform:'scaleY(0)'},{transform:'scaleY(1)'}],{duration:650,delay:750,fill:'backwards'});thread.style.transformOrigin='top';
      const climb=()=>{const frames=[{transform:'translateY(0)'},{offset:.13,transform:'translateY(-7px)'},{offset:.26,transform:'translateY(-14px)'},{offset:.39,transform:'translateY(-21px)'},{offset:.76,transform:'translateY(-21px)'},{transform:'translateY(0)'}];animate(body,frames,{duration:2440,easing:'ease-out'});animate(thread,frames.map(f=>({...f,transform:`scaleY(${1-(parseFloat((f.transform.match(/-?\d+/)||['0'])[0])*-1)/Math.max(1,state.rest-size/2)})`})),{duration:2440,easing:'ease-out'});decoLater(state,()=>animate(hanger,[{transform:'rotate(0deg)'},{offset:.2,transform:'rotate(1.8deg)'},{offset:.4,transform:'rotate(-1deg)'},{offset:.6,transform:'rotate(.55deg)'},{offset:.8,transform:'rotate(-.25deg)'},{transform:'rotate(0deg)'}],{duration:1600}),1850);decoLater(state,climb,rnd(10000,15000));};decoLater(state,climb,rnd(10000,15000));
    }
    const spiderArt=nodeSpider(P,ph?16:18),crawler=local(welcome,'hw-web-crawler',0,0,ph?16:18,ph?16:18);crawler.append(spiderArt.svg);let current=points[1]||[60,hub];const place=p=>`translate(${p[0]-(ph?8:9)}px,${p[1]-(ph?16:18)*.33}px)`;crawler.style.transform=place(current);
    if(active){const walk=()=>{const near=points.filter(p=>p!==current&&Math.hypot(p[0]-current[0],p[1]-current[1])>4&&Math.hypot(p[0]-current[0],p[1]-current[1])<30),to=near.length?near[Math.random()*near.length|0]:current;animate(crawler,[{transform:place(current)},{transform:place(to)}],{duration:800,easing:'ease-in-out'},()=>{crawler.style.transform=place(to);current=to;});decoLegs(state,spiderArt,800);decoLater(state,walk,rnd(3000,6000));};decoLater(state,walk,rnd(3000,6000));}
  }
  function chatDecoration(){
    const chat=doc.getElementById('chat'),visibleChat=chat?.children.length&&!welcomeState&&root.dataset.cwV4Settings!=='open'&&chat.getClientRects().length;
    if(!visibleChat){clearChatDecoration();return;}
    const active=moving()&&ambient(),P=palette(),key=[win.innerWidth,win.innerHeight,active,P.night].join(':');if(chatDecorationState?.key===key)return;clearChatDecoration();
    const ph=root.dataset.claudeLayout==='mobile',r=chat.getBoundingClientRect(),column=[...chat.querySelectorAll('.mes[is_user="false"] .mes_text')].at(-1)?.getBoundingClientRect(),header=doc.querySelector('.cw-v4-chat-head')?.getBoundingClientRect(),x=ph?win.innerWidth-10:(Math.min(r.right,column?.right||r.right)+win.innerWidth)/2,y=header?.bottom||56,len=ph?16:60,size=ph?13:18,n=at(node('span','hw-chat-deco'),x,y,0,0);n.style.zIndex='50';n.style.pointerEvents='none';
    const state=chatDecorationState={node:n,timers:new Set(),frames:new Set(),key},thread=local(n,'hw-chat-thread',0,0,1,len),body=local(n,'hw-chat-spider',-size/2,len-size*2.4/36,size,size),art=nodeSpider(P,size);thread.style.background=P.thread;thread.style.transformOrigin='top';body.append(art.svg);
    if(active){const slide=()=>{const d=ph?7:9,positions=[0,d,-d*.34,d*.16,-d*.07,d*.025,0],offsets=[0,.36,.55,.69,.81,.91,1];animate(body,positions.map((v,i)=>({offset:offsets[i],transform:`translateY(${v}px)`})),{duration:1900});animate(thread,positions.map((v,i)=>({offset:offsets[i],transform:`scaleY(${(len+v)/len})`})),{duration:1900});decoLegs(state,art,1900);decoLater(state,slide,rnd(9000,13000));};decoLater(state,slide,rnd(9000,13000));}
  }

  function anchor(host,type){
    const found=anchors.get(host);if(found?.isConnected)return found;
    const n=node('span','hw-anchor hw-'+type,host);anchors.set(host,n);
    if(type==='web')n.innerHTML='<svg viewBox="0 0 90 75" fill="none" stroke="currentColor" stroke-width=".7"><path d="M0 0 90 0M0 0 83 22M0 0 65 49M0 0 33 69M0 0V75M0 17Q7 16 9 2M0 35Q16 35 19 5M0 55Q25 54 30 8M0 73Q39 70 44 12M9 2Q12 11 17 13M19 5Q23 21 32 24M30 8Q34 34 47 35M44 12Q50 43 65 49M17 13Q20 20 19 29M32 24Q36 35 33 44M47 35Q53 49 49 61M65 49Q72 60 65 69M19 29Q13 35 8 35M33 44Q22 56 12 55M49 61Q40 72 33 69"/></svg>';
    return n;
  }
  function decorateHost(host,fade=false){
    const fresh=[];
    if(!anchors.get(host)?.isConnected)fresh.push(anchor(host,'web'));
    if(!host.matches('.cw-v4-head')&&!corners.get(host)?.isConnected){const corner=node('span','hw-corner-ghost',doc.createDocumentFragment());picture(art.sheet({awake:true}),corner,1.4);corners.set(host,corner);host.append(corner);fresh.push(corner);}
    if(fade)for(const n of fresh)animate(n,[{opacity:0},{opacity:1}],{duration:160,easing:'ease-out'});
  }
  function clearPendingDialogDecorations(){
    for(const state of pendingDialogDecorations.values()){cancel(state.timer);if(state.idle!=null)win.cancelIdleCallback?.(state.idle);}
    pendingDialogDecorations.clear();
  }
  function decorateDialogLater(host){
    if(pendingDialogDecorations.has(host)||(anchors.get(host)?.isConnected&&corners.get(host)?.isConnected))return;
    const state={timer:0,idle:null},token=epoch;pendingDialogDecorations.set(host,state);
    state.timer=later(()=>{
      const add=()=>{pendingDialogDecorations.delete(host);if(!dead&&epoch===token&&host.isConnected&&host.closest('dialog[open]'))decorateHost(host,true);};
      if(typeof win.requestIdleCallback==='function')state.idle=win.requestIdleCallback(add,{timeout:500});else add();
    },350);
  }
  function staticScenes(){
    if(dead)return;

    for(const [host,n]of anchors)if(!host.isConnected){remove(n);anchors.delete(host);}
    const typing=!!doc.getElementById('send_textarea')?.value;if(typing!==root.classList.contains('hw-typing'))root.classList.toggle('hw-typing',typing);
    rootFlag('cwHwAmbient',ambient()?'on':'off');rootFlag('cwHwCalm',calm()?'on':'off');dressIcons();
    const settingsOpen=root.dataset.cwV4Settings==='open';if(settingsOpen||!moving()||!ambient()){stopCandles();stopIconEffects();}else{scheduleCandles();scheduleIconEffects();}if(settingsOpen)startDrawerSpider();else stopDrawerSpider();
    if(!settingsOpen){welcomeWeb(doc.querySelector('.clawd-welcome-hero'));chatDecoration();safeGeneration();}
    // Generation words use the native placeholder; the original footer retains its layout.
    // Local anchors only: native popup ancestry and focus stay untouched.
    for(const host of doc.querySelectorAll('#options,.cw-menu:not([hidden]),dialog[open] .popup-content,.cw-v4-shell .cw-v4-head')){
      if(host.closest('dialog[open]'))decorateDialogLater(host);else decorateHost(host);
    }
    for(const [host,corner]of corners)if(!host.isConnected){remove(corner);corners.delete(host);}
    if(!settingsOpen)positionPail();
  }
  function pailSpot(layout,wanted){
    const {r,blocks,soft=[],top}=layout,avoid=[...blocks,...soft],min=r.left,max=Math.max(min,r.right-21),x=clamp(wanted,min,max),over=(left,y)=>avoid.some(b=>left<b.right&&left+21>b.left&&y<b.bottom&&y+24>b.top);
    const xs=[x,min,max,...avoid.flatMap(b=>[b.left-25,b.right+4])].map(v=>clamp(v,min,max)).filter(v=>!over(v,top)).sort((a,b)=>Math.abs(a-x)-Math.abs(b-x));
    const left=xs.length?xs[0]:x;return {left,top:xs.length?top:safeTop(left,top,21,24,blocks)};
  }
  function savePail(){if(pailRatio!=null)prefs?.setItem('claude-web:halloween-pail-x',pailRatio.toFixed(6));}
  function bindSmallClawds(form){
    const pile=form.querySelector('.clawd-pile');if(form===pailSmallForm&&pile===pailSmallPile)return;
    pailSmallObserver??=new win.MutationObserver(records=>{if(dead||pailSmallFrame||!records.some(r=>[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&(n.matches('.clawd-pile-c,.clawd-pile')||n.querySelector('.clawd-pile-c,.clawd-pile')))))return;pailSmallFrame=win.requestAnimationFrame(()=>{pailSmallFrame=0;if(!dead)positionPail();});});
    pailSmallObserver.disconnect();pailSmallForm=form;pailSmallPile=pile;
    pailSmallObserver.observe(form,{childList:true});if(pile)pailSmallObserver.observe(pile,{childList:true});
  }
  function bindPailLayout(form){
    const qr=doc.getElementById('qr--bar');
    if(form!==pailForm||qr!==pailQr){pailResizeObserver?.disconnect();pailQrObserver?.disconnect();pailObserved.clear();pailForm=form;pailQr=qr;
      pailResizeObserver=typeof win.ResizeObserver==='function'?new win.ResizeObserver(()=>positionPail()):null;
      pailQrObserver=new win.MutationObserver(rs=>{if(rs.some(r=>r.target.closest?.('#qr--bar')||[...r.addedNodes,...r.removedNodes].some(n=>n.nodeType===1&&(n.id==='qr--bar'||n.querySelector?.('#qr--bar')))))positionPail();});
      pailQrObserver.observe(form,{childList:true,subtree:true});if(qr&&!form.contains(qr))pailQrObserver.observe(qr,{childList:true,subtree:true});}
    for(const n of [form,qr,...(qr?.querySelectorAll('button,.qr--button')||[])])if(n&&!pailObserved.has(n)){pailObserved.add(n);pailResizeObserver?.observe(n);}
  }
  function finishPailDrag(e){if(!pailDrag||e.pointerId!==pailDrag.id)return;const moved=pailDrag.moved;pailDrag=null;pailSkipClick=moved;if(moved)savePail();try{pail.releasePointerCapture(e.pointerId);}catch{}positionPail();}
  function positionPail(state){
    // Clawd coordinates no longer move the independent bucket, even at landing.
    if(state||pailDrag||dead)return;const form=doc.getElementById('send_form');if(!form)return;bindSmallClawds(form);const r=form.getBoundingClientRect();if(!r.width){pail?.style.setProperty('display','none','important');return;}
    if(pailRatio==null||pailFloorOffset==null){const big=form.querySelector('.clawd-composer-clawd'),b=big?.getBoundingClientRect(),s=getClawdState?.()||{x:0,y:0};if(!b?.width)return;
      const stored=prefs?.getItem('claude-web:halloween-pail-x'),value=stored==null?NaN:Number(stored);pailRatio=Number.isFinite(value)?clamp(value,0,1):(b.left-s.x+44-r.left)/r.width;pailFloorOffset=b.bottom-s.y-25-r.top;}
    const layout=pailLayout={r,blocks:quickReplyRects(),soft:smallClawdRects(),top:r.top+pailFloorOffset},spot=pailSpot(layout,r.left+pailRatio*r.width);
    if(!pail){pail=node('button','hw-anchor hw-pail');pail.setAttribute('aria-label','撒糖');picture(art.pail(),pail,3);
      on(pail,'pointerdown',e=>{if(e.button!==0)return;pailSkipClick=false;const rect=(pailForm||form).getBoundingClientRect();pailDrag={id:e.pointerId,x:e.clientX,y:e.clientY,left:parseFloat(pail.style.left),moved:false,layout:{r:rect,blocks:quickReplyRects(),soft:smallClawdRects(),top:rect.top+pailFloorOffset}};try{pail.setPointerCapture(e.pointerId);}catch{}},{passive:true});
      on(pail,'pointermove',e=>{const d=pailDrag;if(!d||d.id!==e.pointerId)return;if(Math.hypot(e.clientX-d.x,e.clientY-d.y)>4)d.moved=true;if(!d.moved)return;e.preventDefault();const p=pailSpot(d.layout,d.left+e.clientX-d.x);pailRatio=clamp((p.left-d.layout.r.left)/d.layout.r.width,0,1);pail.style.left=p.left+'px';pail.style.top=p.top+'px';},{passive:false});
      on(pail,'pointerup',finishPailDrag,{passive:true});on(pail,'pointercancel',finishPailDrag,{passive:true});}
    for(const [key,value]of [['left',spot.left+'px'],['top',spot.top+'px'],['display','block']])if(pail.style.getPropertyValue(key)!==value)pail.style.setProperty(key,value,key==='display'?'important':'');
    pail.disabled=!visible();const title=calm()?'已减少动态效果，轻点糖桶':'撒糖；按住可左右拖动';if(pail.title!==title)pail.title=title;bindPailLayout(form);
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
    const r=box.getBoundingClientRect(),scrollTop=box.scrollTop,computed=win.getComputedStyle(box),keys=['font','fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing','paddingTop','paddingRight','paddingBottom','paddingLeft','whiteSpace','wordBreak','overflowWrap','textAlign','direction','tabSize','boxSizing','borderTopWidth','borderLeftWidth','borderRightWidth','borderBottomWidth','color'],cs=Object.fromEntries(keys.map(key=>[key,computed[key]])),mirror=node('div','hw-text-mirror',doc.createDocumentFragment());
    for(const key of keys)mirror.style[key]=cs[key];
    Object.assign(mirror.style,{position:'fixed',left:r.left+'px',top:r.top-scrollTop+'px',width:r.width+'px',height:'auto',minHeight:r.height+'px',visibility:'hidden',pointerEvents:'none',whiteSpace:'pre-wrap',borderStyle:'solid',borderColor:'transparent'});
    mirror.textContent=box.value;const text=mirror.firstChild,runes=[];let offset=0;for(const c of box.value){runes.push({c,offset});offset+=c.length;}
    doc.body.append(mirror);
    const range=doc.createRange(),measure=i=>{const c=runes[i];range.setStart(text,c.offset);range.setEnd(text,c.offset+c.c.length);return range.getBoundingClientRect();},search=test=>{let lo=0,hi=runes.length;while(lo<hi){const mid=(lo+hi)>>1;if(test(measure(mid)))hi=mid;else lo=mid+1;}return lo;},start=search(b=>b.bottom>r.top),end=search(b=>b.top>=r.bottom),visibleChars=[];
    for(let i=start;i<end;i++){const {c}=runes[i];if(!c.trim())continue;const b=measure(i);if(b.width&&b.right>r.left&&b.left<r.right)visibleChars.push({c,x:b.left,y:b.top,w:b.width,h:b.height});}
    const phone=root.dataset.claudeLayout==='mobile';visibleChars.sort((a,b)=>Math.abs(a.y-b.y)>2?a.y-b.y:a.x-b.x);const chars=visibleChars.slice(0,phone?40:80);
    clearSend();if(!chars.length){remove(mirror);return null;}
    const layer=sendLayer=node('div','hw-flight-layer hw-fx',doc.createDocumentFragment());
    let remainder=null;if(phone&&visibleChars.length>40){remainder=at(node('div','hw-flight-rest',layer),r.left,r.top,r.width,r.height);remainder.style.overflow='hidden';const masks=[];for(const c of chars){let row=masks.find(b=>Math.abs(b.top-c.y)<3);if(!row)masks.push(row={left:c.x,right:c.x+c.w,top:c.y,bottom:c.y+c.h});else{row.left=Math.min(row.left,c.x);row.right=Math.max(row.right,c.x+c.w);row.top=Math.min(row.top,c.y);row.bottom=Math.max(row.bottom,c.y+c.h);}}remainder.style.clipPath=`path("M0 0H${r.width}V${r.height}H0Z ${masks.map(c=>`M${c.left-r.left} ${c.top-r.top}V${c.bottom-r.top}H${c.right-r.left}V${c.top-r.top}Z`).join(' ')}")`;Object.assign(mirror.style,{position:'absolute',left:'0',top:-scrollTop+'px',visibility:'visible'});remainder.append(mirror);}else remove(mirror);
    for(const c of chars){c.n=at(node('span','hw-flight-char',layer),c.x,c.y,c.w,c.h);Object.assign(c.n.style,{font:cs.font,letterSpacing:cs.letterSpacing,color:cs.color,lineHeight:c.h+'px',whiteSpace:'pre'});c.n.textContent=c.c;}
    const sparks=Array.from({length:phone?6:10},()=>{const n=node('span','hw-flight-spark',layer);n.style.display='none';n.innerHTML=star4(10);Object.assign(n.firstElementChild.style,{width:'100%',height:'100%'});return {n,busy:false};});
    doc.body.append(layer);return {layer,chars,sparks,remainder,phone};
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
    submit=null;cancel(submitTimer);submitTimer=0;action();clipQuickReplies(snap.layer);const gap=clamp(.36/snap.chars.length,.012,.03);
    if(snap.remainder)animate(snap.remainder,[{opacity:1},{opacity:0}],{duration:240,fill:'forwards'},()=>remove(snap.remainder));
    if(typeof snap.layer.animate!=='function')return animate(snap.layer,[{opacity:1},{opacity:0}],{duration:150},clearSend);
    const parts=snap.chars.map((c,i)=>({...c,delay:i*gap,T:rnd(.66,.8),h1:rnd(.88,1.12),jx:rnd(-3,3),jy:rnd(-3,3),r0:rnd(4,8),ph:rnd(0,2*Math.PI),done:false}));let nextSpark=0;
    const pose=(p,t)=>{let dx=0,dy=0,rot=0,sx=1,sy=1,opacity=1;if(t<.08){const v=Math.sin(Math.PI*t/.08);dy=1.5*v;sx=1+.1*v;sy=1-.14*v;}else{const u=Math.min(1,(t-.08)/(p.T-.08));dx=8+92*u+p.jx*u;dy=-74*p.h1*Math.pow(u,.82)+p.jy*u;rot=p.r0*Math.sin(Math.PI*u)-6*u+3*u*Math.sin(p.ph+12*t);sx=sy=1-.65*u*u*u;opacity=u<.35?1:1-(u-.35)/.65;}return {dx,dy,transform:`translate(${dx}px,${dy}px) rotate(${rot}deg) scale(${sx},${sy})`,opacity};};
    const last=parts.reduce((a,b)=>a.delay+a.T>b.delay+b.T?a:b),end=last.delay+last.T;
    for(const p of parts){const times=[0,.08-.000001,.08,p.T];for(let t=1/60;t<p.T;t+=1/60)times.push(t);times.sort((a,b)=>a-b);const frames=times.map(t=>{const v=pose(p,t);return {offset:t/p.T,transform:v.transform,opacity:v.opacity};});
      animate(p.n,frames,{delay:p.delay*1000,duration:p.T*1000,easing:'linear',fill:'forwards'},p===last?()=>later(()=>{if(sendLayer===snap.layer)clearSend();},360):undefined);
      later(()=>{if(p.n.isConnected)p.n.style.color='#D97757';},(p.delay+.08)*1000);
    }
    for(const slot of snap.sparks){at(slot.n,0,0,10,10);slot.n.style.display='block';slot.n.style.opacity='0';slot.until=0;}
    let emitted=0;for(nextSpark=.035;nextSpark<end&&emitted<(snap.phone?6:Infinity);nextSpark+=.035){const live=parts.filter(p=>nextSpark-p.delay>.15&&nextSpark-p.delay<p.T),slot=snap.sparks.find(s=>s.until<=nextSpark);if(!live.length||!slot)continue;emitted++;
      const p=live[Math.random()*live.length|0],v=pose(p,nextSpark-p.delay),x=p.x+p.w/2+v.dx+rnd(-5,5)-5,y=p.y+p.h/2+v.dy+rnd(-4,4)-5,k=rnd(5,10)/10,duration=rnd(300,420);slot.until=nextSpark+duration/1000;
      animate(slot.n,[{transform:`translate(${x}px,${y}px) scale(0) rotate(0deg)`,opacity:1},{offset:.45,transform:`translate(${x}px,${y}px) scale(${k*1.15}) rotate(45deg)`,opacity:1},{transform:`translate(${x}px,${y}px) scale(0) rotate(90deg)`,opacity:.9}],{delay:nextSpark*1000,duration,easing:'ease-out'});
    }
  }
  function captureDelete(message){
    if(!moving()||!message)return;const c=getContext(),id=Number(message.getAttribute('mesid')),data=c?.chat?.[id];if(!data)return;
    finishDelete(deletion);const rect=message.getBoundingClientRect(),clone=message.cloneNode(true);clone.removeAttribute('id');for(const n of clone.querySelectorAll('[id]'))n.removeAttribute('id');
    const controls='.mes_buttons,.extraMesButtons,.mes_edit_buttons,.swipe_left,.swipe_right,.swipes-counter';
    for(const n of clone.querySelectorAll(controls))n.remove();
    const originals=[message,...message.querySelectorAll('*')].filter(n=>n===message||!n.closest(controls)),clones=[clone,...clone.querySelectorAll('*')],forceMoth=clones.length>600;
    for(let i=0;i<clones.length;i++){
      const n=clones[i];if(!forceMoth){const cs=win.getComputedStyle(originals[i]);for(const p of cs)n.style.setProperty(p,cs.getPropertyValue(p),'important');}
      n.style.setProperty('pointer-events','none','important');n.style.setProperty('animation','none','important');n.style.setProperty('transition','none','important');
    }
    for(const n of clone.querySelectorAll('video,audio'))try{n.pause();}catch{}clone.inert=true;clone.setAttribute('aria-hidden','true');clone.dataset.cwHalloweenOwned='';
    const chat=doc.getElementById('chat'),previousRect=message.previousElementSibling?.getBoundingClientRect(),next=message.nextElementSibling,nextRect=next?.getBoundingClientRect();
    const outerHeight=Math.max(0,nextRect?nextRect.top-(previousRect?.bottom??rect.top):rect.height),nextTop=nextRect?nextRect.top+(chat?.scrollTop||0):null;
    const view=chat?.getBoundingClientRect(),left=Math.max(0,view?.left||0,rect.left),top=Math.max(0,view?.top||0,rect.top),right=Math.min(viewport.right,view?.right??viewport.right,rect.right),bottom=Math.min(viewport.bottom,view?.bottom??viewport.bottom,rect.bottom),visibleRect={left,top,right:Math.max(left,right),bottom:Math.max(top,bottom),width:Math.max(0,right-left),height:Math.max(0,bottom-top)};
    deletion={data,chat:c.chat,message,outerHeight,next,nextTop,scrollHeight:chat?.scrollHeight||0,scrollTop:chat?.scrollTop||0,swipes:data.swipes?.length||0,rect,visibleRect,forceMoth,clone,at:Date.now()};deleteTimer=later(()=>finishDelete(deletion),60000);return deletion;
  }
  function finishDelete(token){
    // CW calls this in its native-delete finally block; a started effect owns its own lifetime.
    if(token&&deletion===token&&!activeDeletes.has(token))clearDelete(token);
  }
  function clearDelete(token){
    if(!token)return;
    if(deletion===token){deletion=null;cancel(deleteTimer);deleteTimer=0;}
    win.cancelAnimationFrame(token.collapseFrame);token.collapseFrame=0;
    if(token.collapseIdle!=null)win.cancelIdleCallback?.(token.collapseIdle);token.collapseIdle=null;
    cancel(token.collapseTimer);token.collapseTimer=0;
    remove(token.layer);remove(token.clone);remove(token.spacer);activeDeletes.delete(token);
  }
  function endDeleteEffect(snap){
    if(!activeDeletes.has(snap))return;
    remove(snap.layer);snap.layer=null;snap.effectDone=true;
    if(snap.gapDone)clearDelete(snap);
  }
  function startDeleteCollapse(snap){
    if(!activeDeletes.has(snap))return;
    const done=()=>{remove(snap.spacer);snap.spacer=null;snap.gapDone=true;if(snap.effectDone)clearDelete(snap);};
    if(!snap.spacer?.isConnected){done();return;}
    const collapse=()=>{
      if(dead||!activeDeletes.has(snap))return;
      if(!snap.spacer?.isConnected){done();return;}
      animate(snap.spacer,[{height:snap.outerHeight+'px'},{height:'0px'}],{duration:280,easing:'ease-in-out',fill:'forwards'},done);
    };
    // Yield after the copied message disappears; its fixed effect layer finishes independently.
    snap.collapseFrame=win.requestAnimationFrame(()=>{
      snap.collapseFrame=0;if(dead||!activeDeletes.has(snap))return;
      if(typeof win.requestIdleCallback==='function')snap.collapseIdle=win.requestIdleCallback(()=>{snap.collapseIdle=null;collapse();},{timeout:80});
      else snap.collapseTimer=later(()=>{snap.collapseTimer=0;collapse();},80);
    });
  }
  function removedDelete(records){
    const snap=deletion,chat=doc.getElementById('chat');
    if(!snap||!moving()||snap.chat!==getContext()?.chat||Date.now()-snap.at>60000||snap.message.isConnected)return;
    const record=records.find(r=>r.target===chat&&[...r.removedNodes].includes(snap.message));if(!record)return;
    const spacer=node('div','hw-delete-spacer',doc.createDocumentFragment());
    Object.assign(spacer.style,{height:snap.outerHeight+'px',minHeight:'0',margin:'0',padding:'0',border:'0',boxSizing:'border-box',flexShrink:'0',overflow:'hidden',pointerEvents:'none'});
    chat.insertBefore(spacer,record.nextSibling?.parentNode===chat?record.nextSibling:null);snap.spacer=spacer;chat.scrollTop=snap.scrollTop;
    // Neighbor margins/gaps may survive replacement; settle the real flow position before this callback can paint.
    if(snap.next?.parentNode===chat&&snap.nextTop!=null){
      const delta=snap.nextTop-(snap.next.getBoundingClientRect().top+chat.scrollTop);
      snap.outerHeight=Math.max(0,snap.outerHeight+delta);spacer.style.height=snap.outerHeight+'px';chat.scrollTop=snap.scrollTop;
    }else if(!snap.next&&chat.lastElementChild===spacer){
      // At the bottom, lost trailing margin reduces scrollHeight and clamps scrollTop before any neighbor can be measured.
      snap.outerHeight=Math.max(0,snap.outerHeight+snap.scrollHeight-chat.scrollHeight);
      spacer.style.height=snap.outerHeight+'px';chat.scrollTop=snap.scrollTop;
    }
    playDelete(snap);
  }
  function deleteChoice(forceMoth=false){let choice=forceMoth?'B':Math.random()<.5?'A':'B';if(!forceMoth&&deleteHistory.length>=2&&deleteHistory.at(-1)===choice&&deleteHistory.at(-2)===choice)choice=choice==='A'?'B':'A';deleteHistory.push(choice);if(deleteHistory.length>4)deleteHistory.shift();return choice;}
  function deleteStar(layer,x,y){const size=rnd(6,10),a=rnd(0,Math.PI*2),d=rnd(22,44),n=at(node('span','hw-delete-spark',layer),x-size/2,y-size/2,size,size);n.innerHTML=star4(size);animate(n,[{transform:'translate(0,0) scale(0)',opacity:1},{offset:.5,transform:`translate(${Math.cos(a)*d*.6}px,${Math.sin(a)*d*.6}px) scale(1) rotate(45deg)`,opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d}px) scale(0) rotate(90deg)`,opacity:.8}],{duration:540,easing:'ease-out'},()=>remove(n));}
  function deleted(){
    // Element removals start synchronously in the childList observer; this is the swipe fallback.
    const snap=deletion,c=getContext();if(!snap||!snap.message.isConnected||!moving()||snap.chat!==c?.chat||Date.now()-snap.at>60000||!(!c.chat.includes(snap.data)||(snap.data.swipes?.length||0)<snap.swipes))return;
    playDelete(snap);
  }
  function playDelete(snap){
    if(deletion!==snap)return;
    activeDeletes.add(snap);
    deletion=null;cancel(deleteTimer);deleteTimer=0;action();const original=snap.rect,r=snap.visibleRect||original,blocks=quickReplyRects(),layer=at(node('div','hw-deletion-layer hw-fx',doc.createDocumentFragment()),0,0,viewport.right,viewport.bottom);
    // Animate an uncopied wrapper: copied !important transform/opacity/filter must stay faithful without overriding WAAPI.
    const piece=node('div','hw-delete-crop',doc.createDocumentFragment()),clipped=r.width!==original.width||r.height!==original.height;
    for(const [key,value]of Object.entries({position:'absolute',left:original.left-r.left+'px',top:original.top-r.top+'px',width:original.width+'px',height:original.height+'px','box-sizing':'border-box',margin:'0'}))snap.clone.style.setProperty(key,value,'important');
    piece.style.setProperty('overflow',clipped?'hidden':'visible','important');piece.append(snap.clone);
    layer.dataset.hwDelete=deleteChoice(snap.forceMoth);clipQuickReplies(layer,{left:r.left-50,top:r.top-50,right:r.right+50,bottom:r.bottom+50},blocks);layer.append(piece);owned.add(snap.clone);
    for(const [key,value]of Object.entries({position:'absolute',left:r.left+'px',top:r.top+'px',width:r.width+'px',height:r.height+'px',margin:'0','box-sizing':'border-box','transform-origin':'50% 50%','pointer-events':'none'}))piece.style.setProperty(key,value,'important');
    const cx=r.left+r.width/2,cy=r.top+r.height/2,night=root.dataset.claudeIntegratedTheme==='night';doc.body.append(layer);
    if(layer.dataset.hwDelete==='A'){
      animate(piece,[{transform:'scale(1) rotate(0deg)',opacity:1},{offset:.55,transform:'scale(.34) rotate(6deg)',opacity:1},{transform:'scale(.03) rotate(16deg)',opacity:0}],{duration:300,easing:'cubic-bezier(.55,0,.85,.4)',fill:'forwards'},()=>startDeleteCollapse(snap));
      later(()=>{const size=root.dataset.claudeLayout==='mobile'?28:30,n=at(node('span','hw-delete-asterisk',layer),cx-size/2,cy-size/2,size,size);n.innerHTML=asteriskMarkup(size);animate(n,[{transform:'scale(0) rotate(0deg)',opacity:1},{offset:.32,transform:'scale(1.2) rotate(70deg)',opacity:1},{offset:.52,transform:'scale(1) rotate(110deg)',opacity:1},{transform:'scale(.1) rotate(210deg)',opacity:0}],{duration:580,easing:'cubic-bezier(.3,.7,.4,1)',fill:'forwards'});},210);
      later(()=>{for(let i=0;i<8;i++){const a=i/8*Math.PI*2+rnd(0,.6),d=28*rnd(.55,1.05),size=rnd(12,22),n=at(node('span','hw-delete-puff',layer),cx-size/2,cy-size/2,size,size);n.style.background=`radial-gradient(circle,${night?'rgba(198,188,216,.55)':'rgba(122,110,148,.34)'} 0 52%,transparent 72%)`;animate(n,[{transform:'scale(.3)',opacity:1},{transform:`translate(${Math.cos(a)*d}px,${Math.sin(a)*d-8}px) scale(1.35)`,opacity:0}],{duration:rnd(460,640),easing:'cubic-bezier(.2,.8,.3,1)'},()=>remove(n));}for(let i=0;i<6;i++)deleteStar(layer,cx,cy);},510);
      snap.layer=layer;later(()=>endDeleteEffect(snap),1150);
    }else{
      animate(piece,[{opacity:1,transform:'translateY(0)',filter:'blur(0px)'},{opacity:0,transform:'translateY(-4px)',filter:'blur(1.5px)'}],{duration:440,easing:'ease-in',fill:'forwards'},()=>startDeleteCollapse(snap));
      const count=clamp(Math.round(r.width*r.height/9000),4,root.dataset.claudeLayout==='mobile'?5:8);for(let i=0;i<count;i++)later(()=>{const size=rnd(19,27)*(root.dataset.claudeLayout==='mobile'?.9:1),x=r.left+14+rnd(0,Math.max(0,r.width-28)),y=r.top+12+rnd(0,Math.max(0,r.height-24)),m=at(node('span','hw-delete-moth',layer),x-size/2,y-size/2,size,size);m.innerHTML=mothMarkup(size,night);const dx=rnd(-30,30),dy=-rnd(34,74),rot=dx*.4,w=rnd(-10,10);animate(m,[{transform:'scale(.5)',opacity:0},{offset:.2,transform:`translate(${dx*.2+w}px,${dy*.22}px) rotate(${rot*.4}deg)`,opacity:1},{offset:.58,transform:`translate(${dx*.55-w}px,${dy*.6}px) rotate(${-rot*.3}deg) scale(.96)`,opacity:1},{transform:`translate(${dx}px,${dy}px) rotate(${rot}deg) scale(.8)`,opacity:0}],{duration:rnd(780,1000),easing:'cubic-bezier(.3,.1,.4,1)',fill:'forwards'});const wings=m.querySelector('.mw');wings.style.transformBox='fill-box';wings.style.transformOrigin='center';animate(wings,[{transform:'scaleX(1)'},{transform:'scaleX(.22)'},{transform:'scaleX(1)'}],{duration:rnd(110,140),iterations:9});},i*45+rnd(0,60));snap.layer=layer;later(()=>endDeleteEffect(snap),1400);
    }
  }

  const asteriskMarkup=size=>`<svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size}" viewBox="0 0 256 257"><path d="M50.2278481,170.321013 L100.585316,142.063797 L101.427848,139.601013 L100.585316,138.24 L98.1225316,138.24 L89.6972152,137.721519 L60.921519,136.943797 L35.9696203,135.906835 L11.795443,134.610633 L5.70329114,133.31443 L0,125.796456 L0.583291139,122.037468 L5.70329114,118.602532 L13.0268354,119.250633 L29.2293671,120.352405 L53.5331646,122.037468 L71.161519,123.07443 L97.28,125.796456 L101.427848,125.796456 L102.011139,124.111392 L100.585316,123.07443 L99.4835443,122.037468 L74.3372152,104.992405 L47.116962,86.9751899 L32.8587342,76.6055696 L25.1463291,71.3559494 L21.2577215,66.4303797 L19.5726582,55.6718987 L26.5721519,47.9594937 L35.9696203,48.6075949 L38.3675949,49.2556962 L47.8946835,56.5792405 L68.2450633,72.3281013 L94.8172152,91.9007595 L98.7058228,95.1412658 L100.261266,94.0394937 L100.455696,93.2617722 L98.7058228,90.3453165 L84.2531646,64.2268354 L68.8283544,37.6546835 L61.958481,26.636962 L60.1437975,20.0263291 C59.4956962,17.3043038 59.0420253,15.0359494 59.0420253,12.2491139 L67.0136709,1.42582278 L71.4207595,-1.42108547e-14 L82.0496203,1.42582278 L86.521519,5.31443038 L93.1321519,20.4151899 L103.825823,44.2005063 L120.417215,76.5407595 L125.277975,86.1326582 L127.87038,95.0116456 L128.842532,97.7336709 L130.527595,97.7336709 L130.527595,96.1782278 L131.888608,77.9665823 L134.416203,55.6070886 L136.878987,26.8313924 L137.721519,18.7301266 L141.739747,9.00860759 L149.711392,3.75898734 L155.933165,6.74025316 L161.053165,14.0637975 L160.340253,18.7949367 L157.294177,38.5620253 L151.331646,69.5412658 L147.443038,90.2805063 L149.711392,90.2805063 L152.303797,87.6881013 L162.803038,73.7539241 L180.431392,51.718481 L188.208608,42.9691139 L197.282025,33.3124051 L203.114937,28.7108861 L214.132658,28.7108861 L222.233924,40.7655696 L218.604557,53.2091139 L207.262785,67.596962 L197.865316,79.7812658 L184.38481,97.9281013 L175.959494,112.44557 L176.737215,113.612152 L178.746329,113.417722 L209.207089,106.936709 L225.668861,103.955443 L245.306329,100.585316 L254.185316,104.733165 L255.157468,108.945823 L251.657722,117.56557 L230.659241,122.75038 L206.031392,127.675949 L169.348861,136.360506 L168.89519,136.684557 L169.413671,137.332658 L185.940253,138.888101 L193.004557,139.276962 L210.308861,139.276962 L242.519494,141.674937 L250.94481,147.248608 L256,154.053671 L255.157468,159.238481 L242.195443,165.849114 L224.696709,161.701266 L183.866329,151.979747 L169.867342,148.48 L167.923038,148.48 L167.923038,149.646582 L179.588861,161.053165 L200.976203,180.366582 L227.742785,205.253671 L229.103797,211.410633 L225.668861,216.271392 L222.039494,215.752911 L198.513418,198.059747 L189.44,190.088101 L168.89519,172.783797 L167.534177,172.783797 L167.534177,174.598481 L172.265316,181.533165 L197.282025,219.123038 L198.578228,230.659241 L196.763544,234.418228 L190.282532,236.686582 L183.153418,235.39038 L168.506329,214.84557 L153.40557,191.708354 L141.221266,170.969114 L139.730633,171.811646 L132.536709,249.259747 L129.166582,253.213165 L121.389367,256.19443 L114.908354,251.268861 L111.473418,243.297215 L114.908354,227.548354 L119.056203,207.003544 L122.426329,190.671392 L125.472405,170.385823 L127.287089,163.64557 L127.157468,163.191899 L125.666835,163.386329 L110.371646,184.38481 L87.1048101,215.817722 L68.6987342,235.52 L64.2916456,237.269873 L56.6440506,233.316456 L57.356962,226.252152 L61.6344304,219.96557 L87.1048101,187.560506 L102.46481,167.469367 L112.380759,155.868354 L112.315949,154.183291 L111.732658,154.183291 L44.0708861,198.124557 L32.0162025,199.68 L26.8313924,194.819241 L27.4794937,186.847595 L29.9422785,184.25519 L50.2926582,170.256203 L50.2278481,170.321013 Z" fill="#D97757"/></svg>`;
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

  const RAD=Math.PI/180;
  function palette(){const night=root.dataset.claudeIntegratedTheme==='night';return {night,clay:'#D97757',paper:night?'#EAE6DC':'#FAF9F5',thread:night?'rgba(217,119,87,.6)':'rgba(185,87,58,.5)'};}
  function sv(tag,attrs,parent){const n=doc.createElementNS('http://www.w3.org/2000/svg',tag);for(const[k,v]of Object.entries(attrs||{}))n.setAttribute(k,v);n.dataset.cwHalloweenOwned='';n.setAttribute('aria-hidden','true');n.style.pointerEvents='none';owned.add(n);if(parent)parent.append(n);return n;}
function blobPath(cx, cy, r, jit, seed) {
  let s = seed || 7; const rr = () => { s = (s * 9301 + 49297) % 233280; return s / 233280; };
  const n = 8, pts = [];
  for (let i = 0; i < n; i++) { const a = i / n * Math.PI * 2, R = r * (1 + (rr() - .5) * 2 * jit); pts.push([cx + Math.cos(a) * R, cy + Math.sin(a) * R]); }
  let d = '';
  for (let i = 0; i < n; i++) {
    const p = pts[i], q = pts[(i + 1) % n], m = [(p[0] + q[0]) / 2, (p[1] + q[1]) / 2];
    if (i === 0) { const pm = pts[n - 1]; d += 'M' + ((pm[0] + p[0]) / 2).toFixed(2) + ' ' + ((pm[1] + p[1]) / 2).toFixed(2); }
    d += ' Q' + p[0].toFixed(2) + ' ' + p[1].toFixed(2) + ' ' + m[0].toFixed(2) + ' ' + m[1].toFixed(2);
  }
  return d + 'Z';
}

function nodeSpider(P, size) {
  const svg = sv('svg', { width: size, height: size, viewBox: '-18 -12 36 36' }); svg.style.overflow = 'visible';
  const C = P.clay, LEGS = [], angs = [140, 163, 196, 222];
  const g = sv('g', {}, svg);
  for (const side of [-1, 1]) for (let i = 0; i < 4; i++) {
    const a = side < 0 ? angs[i] : 180 - angs[i];
    const L = { side, i, a, hx: side * 2, hy: 2.2 + i * 1.05, l1: 7.4 - Math.abs(i - 1.5) * .5, l2: 8.8 - Math.abs(i - 1.5) * .7 };
    L.path = sv('path', { fill: 'none', stroke: C, 'stroke-width': 1.6, 'stroke-linecap': 'round', 'stroke-linejoin': 'round' }, g);
    L.knee = sv('circle', { r: 1.55, fill: C }, g); L.foot = sv('circle', { r: 1.35, fill: C }, g);
    LEGS.push(L);
  }
  sv('path', { d: 'M0 -1 L0 6.6', stroke: C, 'stroke-width': 2.6, 'stroke-linecap': 'round' }, g);   // 肚子和脑袋之间连一笔，像节点之间的线
  sv('path', { d: blobPath(0, -3.4, 6.4, .07, 11), fill: C }, g);
  sv('path', { d: blobPath(0, 8.4, 3.7, .08, 23), fill: C }, g);
  sv('circle', { cx: -1.35, cy: 8.8, r: .95, fill: P.paper }, g); sv('circle', { cx: 1.35, cy: 8.8, r: .95, fill: P.paper }, g);
  sv('circle', { cx: -2.2, cy: -5.4, r: 1.1, fill: P.paper, opacity: .55 }, g);   // 肚子上一点高光
  function legPose(L,time,tuck,splay,poke){
      const wig = Math.sin(time * 5.2 + L.i * 1.7 + L.side) * 4;
      let a = L.a - L.side * tuck * 34 + L.side * splay * 18 + wig;
      if (L.i === 0) a += L.side * poke * 40;
      const kx = L.hx + Math.cos(a * RAD) * L.l1, ky = L.hy + Math.sin(a * RAD) * L.l1 - 2.6;
      const b = a + L.side * (26 - tuck * 18);
      const fx = kx + Math.cos(b * RAD) * L.l2, fy = ky + Math.sin(b * RAD) * L.l2 + 1.2;
      return {d:'M' + L.hx.toFixed(2) + ' ' + L.hy.toFixed(2) + 'L' + kx.toFixed(2) + ' ' + ky.toFixed(2) + 'L' + fx.toFixed(2) + ' ' + fy.toFixed(2),kx:kx.toFixed(2),ky:ky.toFixed(2),fx:fx.toFixed(2),fy:fy.toFixed(2)};
  }
  function legs(time,tuck,splay,poke){
    for(const L of LEGS){const p=legPose(L,time,tuck,splay,poke);L.path.setAttribute('d',p.d);L.knee.setAttribute('cx',p.kx);L.knee.setAttribute('cy',p.ky);L.foot.setAttribute('cx',p.fx);L.foot.setAttribute('cy',p.fy);}
  }
  function animateLegs(ms){
    // Same leg geometry sampled at 60 Hz, played by the browser without idle JS frames.
    const count=Math.ceil(ms/1000*60),options={duration:ms,easing:'linear'};
    for(const L of LEGS){const frames=Array.from({length:count+1},(_,i)=>({offset:i/count,...legPose(L,i/count*ms/1000*2.6,.25,0,0)}));
      animate(L.path,frames.map(p=>({offset:p.offset,d:`path("${p.d}")`})),options);
      animate(L.knee,frames.map(p=>({offset:p.offset,cx:p.kx+'px',cy:p.ky+'px'})),options);
      animate(L.foot,frames.map(p=>({offset:p.offset,cx:p.fx+'px',cy:p.fy+'px'})),options);
    }
  }
  legs(0, 0, 0, 0);
  return { svg, legs, animateLegs };
}
  let idleThreshold=rnd(30000,60000),lastPrank=0;
  function clearPrank(){if(!ghost)return;const old=ghost;ghost=null;for(const id of old.timers)cancel(id);for(const a of old.anims)a?.cancel();remove(old.node);}
  function maybePrank(){
    const state=getClawdState?.(),box=doc.getElementById('send_textarea');
    if(!moving()||!ambient()||ghost||pressedPointers.size||state?.held||state?.dragging||state?.airborne||root.dataset.cwV4Settings==='open'||root.dataset.cwGenerating==='1'||Date.now()-lastAction<idleThreshold||Date.now()-lastPrank<240000)return false;
    if(!box||box.value||doc.activeElement===box||!box.getClientRects().length||modal()||panel())return false;
    const r=box.getBoundingClientRect(),cs=win.getComputedStyle(box),formCS=win.getComputedStyle(doc.getElementById('send_form')),layer=at(node('div','hw-prank hw-fx'),r.left,r.top,r.width,r.height);
    Object.assign(layer.style,{background:cs.backgroundColor==='rgba(0, 0, 0, 0)'?formCS.backgroundColor:cs.backgroundColor,overflow:'hidden'});
    const line=node('span','hw-prank-line',layer);Object.assign(line.style,{position:'absolute',inset:'0',padding:cs.padding,font:cs.font,lineHeight:cs.lineHeight,letterSpacing:cs.letterSpacing,color:cs.color,display:'flex',alignItems:'flex-start',boxSizing:'border-box'});
    const text=node('span','hw-prank-text',line),cursor=node('span','hw-prank-cursor',line);picture(art.sheet({awake:true}),cursor,1.2);Object.assign(cursor.style,{display:'inline-block',marginLeft:'3px',transform:'translateY(-4px)'});
    const current=ghost={node:layer,timers:[],anims:[]},word='boo～';lastPrank=Date.now();let i=0;
    const wait=(fn,ms)=>current.timers.push(later(()=>{if(ghost===current)fn();},ms));
    const play=(frames,opts)=>current.anims.push(animate(cursor,frames,opts));
    const erase=()=>{if(i){text.textContent=word.slice(0,--i);wait(erase,110);}else{play([{transform:'translateY(-4px) rotate(0deg)',opacity:1},{offset:.3,transform:'translateY(-6px) rotate(-12deg)',opacity:1},{offset:.6,transform:'translateY(-4px) rotate(10deg)',opacity:1},{transform:'translateY(-14px) rotate(0deg)',opacity:0}],{duration:700,fill:'forwards'});wait(clearPrank,760);}};
    const type=()=>{if(i<word.length){text.textContent=word.slice(0,++i);wait(type,rnd(160,230));}else wait(erase,800);};wait(type,300);return true;
  }
  function stopDrawerSpider(){
    const s=spider;if(!s)return;spider=null;for(const id of s.timers)cancel(id);s.timers.clear();remove(s.node);
  }
  function drawerLater(s,fn,ms){
    const id=later(()=>{s.timers.delete(id);if(spider===s)fn();},ms);s.timers.add(id);return id;
  }
  function drawerSpiderRound(s){
    if(spider!==s||!visible()||root.dataset.cwV4Settings!=='open')return stopDrawerSpider();
    const next=()=>drawerLater(s,()=>drawerSpiderRound(s),rnd(7000,12000));
    if(modal()){next();return;}
    const host=panel();if(!host){next();return;}
    const r=host.getBoundingClientRect(),head=host.querySelector('.cw-v4-head')?.getBoundingClientRect();
    if(!r.width||!r.height){next();return;}
    const x=r.left+r.width*rnd(.45,.9),top=head?.bottom??r.top,depth=Math.min(rnd(110,240),Math.max(0,r.height-60));
    const drop=.7,hold=rnd(2,3.5),rise=.6,T=drop+hold+rise,duration=T*1000,count=Math.ceil(T*60),body=[],thread=[],shape=[];
    for(let i=0;i<=count;i++){
      const t=T*i/count,offset=i/count;let y;
      if(t<=drop){const q=t/drop;if(q<=.72)y=depth*1.08*(q/.72)**2;else{const v=(q-.72)/.28;y=depth*(1+.08*(1-v)**2*Math.cos(2*Math.PI*v));}}
      else if(t<=drop+hold)y=depth+3*Math.sin((t-drop)*Math.PI*2/1.6);
      else{const q=(t-drop-hold)/rise;y=(depth+3*Math.sin(hold*Math.PI*2/1.6))*(1-q*q);}
      const squash=Math.max(0,1-Math.abs(t-drop*.72)/.06);
      body.push({offset,transform:`translateY(${y}px)`});thread.push({offset,transform:`scaleY(${Math.max(0,y)})`});shape.push({offset,transform:`scale(${1+.08*squash},${1-.08*squash})`});
    }
    const options={duration,easing:'linear'};
    animate(s.node,[{transform:`translate(${x}px,${top}px)`,opacity:1},{offset:.999,transform:`translate(${x}px,${top}px)`,opacity:1},{transform:`translate(${x}px,${top}px)`,opacity:0}],options);
    animate(s.body,body,options);animate(s.thread,thread,options);animate(s.shape,shape,options);s.art.animateLegs(duration);
    drawerLater(s,next,duration);
  }
  function startDrawerSpider(){
    if(!visible()||root.dataset.cwV4Settings!=='open'){stopDrawerSpider();return;}
    const still=calm()||!ambient()||typeof win.Element.prototype.animate!=='function';
    if(spider?.still===still)return;stopDrawerSpider();
    const host=panel();if(!host)return;
    const size=root.dataset.claudeLayout==='mobile'?32:36,fragment=doc.createDocumentFragment(),n=node('span','hw-node-spider hw-fx',fragment),thread=node('span','hw-node-thread',n),body=node('span','hw-node-body',n),shape=node('span','hw-node-art',body),art=nodeSpider(palette(),size);
    Object.assign(n.style,{left:'0',top:'0',width:'0',height:'0',opacity:still?'1':'0',pointerEvents:'none'});
    Object.assign(thread.style,{position:'absolute',left:'0',top:'0',width:'1px',height:'1px',transformOrigin:'top',transform:still?'scaleY(90)':'scaleY(0)',background:palette().thread});
    Object.assign(body.style,{position:'absolute',left:-size/2+'px',top:-size*2.4/36+'px',width:size+'px',height:size+'px',transform:still?'translateY(90px)':'translateY(0)'});
    Object.assign(shape.style,{position:'absolute',left:'0',top:'0',width:size+'px',height:size+'px'});shape.append(art.svg);
    if(still){const r=host.getBoundingClientRect(),head=host.querySelector('.cw-v4-head')?.getBoundingClientRect();n.style.transform=`translate(${r.left+r.width*.75}px,${head?.bottom??r.top}px)`;}
    const s=spider={node:n,thread,body,shape,art,still,timers:new Set()};doc.body.append(fragment);
    if(!still)drawerLater(s,()=>drawerSpiderRound(s),rnd(1200,2500));
  }

  function candyMotion(w,h,x0,y0,vx,vy,floorY){
    const dt=1/240,frames=[],bounces=[];let x=x0,y=y0,a=0,wv=(Math.random()<.5?-1:1)*rnd(380,760),t=0,landed=false,fadeFrom=null,lastSample=-1;
    while(t<3.2){
      if(!landed){vy+=1150*dt;x+=vx*dt;y+=vy*dt;a+=wv*dt;if(y+h>=floorY){y=floorY-h;const impact=vy;if(impact>48){vy=-impact*.38;vx*=.68;wv*=.45;bounces.push({t,k:Math.min(.28,impact/1250)});}else{vy=0;landed=true;}}}
      else{vx*=Math.exp(-dt*9);x+=vx*dt;const target=Math.round(a/180)*180;a+=(target-a)*Math.min(1,dt*18);}
      if(landed&&Math.abs(vx)<4&&fadeFrom==null)fadeFrom=t;const fadeStart=(fadeFrom??9e9)+.65,opacity=t<fadeStart?1:Math.max(0,1-(t-fadeStart)/.6);
      if(t-lastSample>=1/60-1e-9){lastSample=t;let sx=1,sy=1;for(const b of bounces){const d=t-b.t;if(d>=0&&d<.09){const k=b.k*(1-d/.09);sx=1+k;sy=1-k;}}frames.push({t,x:x-x0,y:y-y0,ang:a,sx,sy,opacity});}
      if(opacity<=0)break;t+=dt;
    }return {frames,bounces,T:t};
  }
  function candy(event){
    if(!visible()||!event.target.closest?.('.hw-pail')||modal())return;if(pailSkipClick&&event.detail>0){pailSkipClick=false;return;}pailSkipClick=false;if(candyBusy)return;action();
    if(calm()){if(typeof pail.animate==='function'){const a=pail.animate([{transform:'rotate(0deg)'},{transform:'rotate(-3deg)'},{transform:'rotate(0deg)'}],{duration:160,easing:'ease-out'});animations.add(a);a.onfinish=a.oncancel=()=>animations.delete(a);}return;}
    const r=pail.getBoundingClientRect(),form=doc.getElementById('send_form').getBoundingClientRect(),blocks=quickReplyRects(),layer=at(node('div','hw-candy-layer hw-fx',doc.createDocumentFragment()),0,0,viewport.right,viewport.bottom),floor=form.top,mx=r.left+r.width/2,my=r.top+5;
    clipQuickReplies(layer,undefined,blocks);animate(pail,[{transform:'translateY(0) scale(1,1)'},{transform:'translateY(1px) scale(1.12,.86)',offset:.35},{transform:'translateY(-2px) scale(.96,1.05)',offset:.7},{transform:'translateY(0) scale(1,1)'}],{duration:260});
    let longest=0;const kinds=[0,1,0,2,0];for(let i=0;i<5;i++){
      const sprite=art.candy(kinds[i],art.CANDY_PAIRS[(i+Math.floor(rnd(0,6)))%6]),w=sprite.w*3,h=sprite.h*3,x0=mx-w/2,y0=my-h/2,n=at(picture(sprite,layer,3,'hw-pixels hw-candy'),x0,y0,w,h);n.style.opacity='0';
      const vx=(i/4*2-1)*rnd(105,135)+rnd(-18,18),vy=-rnd(235,300),{frames,bounces,T}=candyMotion(w,h,x0,y0,vx,vy,floor),delay=i*35;
      const kf=frames.map(f=>({offset:Math.min(1,f.t/T),opacity:f.opacity,transform:`translate(${f.x.toFixed(2)}px,${f.y.toFixed(2)}px) rotate(${f.ang.toFixed(1)}deg) scale(${f.sx.toFixed(3)},${f.sy.toFixed(3)})`,easing:'linear'}));kf[0].offset=0;kf.at(-1).offset=1;animate(n,kf,{duration:T*1000,delay,fill:'forwards'},()=>remove(n));
      if(bounces[0]){const f=frames.find(q=>q.t>=bounces[0].t)||frames.at(-1),x=x0+f.x+w/2;for(let k=0;k<4;k++){const dust=at(node('span','hw-candy-dust',layer),x,floor-2,2,2);dust.style.background=palette().night?'rgba(236,231,222,.55)':'rgba(120,110,100,.45)';dust.style.opacity='0';animate(dust,[{transform:'translate(0,0)',opacity:1},{transform:`translate(${(k<2?-1:1)*rnd(4,9)}px,${-rnd(2,5)}px)`,opacity:0}],{delay:delay+bounces[0].t*1000,duration:rnd(260,360),easing:'ease-out'},()=>remove(dust));}}
      longest=Math.max(longest,delay+T*1000);
    }
    doc.body.append(layer);candyBusy=true;later(()=>{remove(layer);candyBusy=false;},longest+50);
  }
  let candleTimer=0,candleEnd=0;const flickering=new Set();
  function clearCandleFlicker(){cancel(candleEnd);candleEnd=0;for(const n of flickering)n.classList.remove('hw-flicker');flickering.clear();}
  function stopCandles(){cancel(candleTimer);candleTimer=0;clearCandleFlicker();}
  function scheduleCandles(){
    if(candleTimer||!moving()||!ambient()||root.dataset.cwV4Settings==='open')return;
    candleTimer=later(()=>{candleTimer=0;
      if(!moving()||!ambient()||root.dataset.cwV4Settings==='open'){stopCandles();return;}
      clearCandleFlicker();
      for(const [selector,key]of iconRules)if(key==='candles')for(const n of doc.querySelectorAll(selector))if(n.getClientRects().length){n.classList.add('hw-flicker');flickering.add(n);}
      if(flickering.size)candleEnd=later(clearCandleFlicker,3200);scheduleCandles();
    },rnd(8000,14000));
  }
  let iconEffectTimer=0,iconEffect=null,lastIconEffect='';
  const iconEffectKinds=['drift','ghost','possess','clawd','candy'];
  function stopIconEffect(){
    const state=iconEffect;if(!state)return;iconEffect=null;
    for(const id of state.timers)cancel(id);for(const a of state.anims)a?.cancel();
    state.source.classList.remove('hw-icon-muted','hw-icon-self');remove(state.node);
  }
  function stopIconEffects(){cancel(iconEffectTimer);iconEffectTimer=0;stopIconEffect();}
  function iconEffectAllowed(){const box=doc.getElementById('send_textarea');return moving()&&ambient()&&!pressedPointers.size&&Date.now()-lastAction>=6500&&root.dataset.cwV4Settings!=='open'&&root.dataset.cwGenerating!=='1'&&!box?.value&&!modal();}
  function iconEffectTargets(){
    const targets=[],seen=new Set();
    for(const [selector,key,kind='before']of iconRules)for(const n of doc.querySelectorAll(selector)){
      const source=kind==='svg'?(n.matches('svg')?n:n.querySelector('svg')):n;
      if(!source||seen.has(source)||source.closest('.cw-v4-shell,dialog,.cw-menu,#options,#extensionsMenu,[hidden]'))continue;
      const button=source.closest('button,[role="button"],.drawer-toggle,.interactable,#options_button,#extensionsMenuButton,.mes_buttons>div,.extraMesButtons>div')||source;
      if(button.matches(':disabled,[aria-disabled="true"]'))continue;
      const r=source.getClientRects()[0];if(!r||!r.width||!r.height||r.bottom<=0||r.right<=0||r.top>=viewport.bottom||r.left>=viewport.right)continue;
      if(source.checkVisibility&&!source.checkVisibility({checkOpacity:true,checkVisibilityCSS:true}))continue;
      const hit=doc.elementFromPoint(r.left+r.width/2,r.top+r.height/2);if(!hit||!(hit===source||source.contains(hit)||button.contains(hit)))continue;
      seen.add(source);targets.push({source,button,key,kind,r:{left:r.left,top:r.top,width:r.width,height:r.height}});
    }return targets;
  }
  function playIconEffect(kind,target){
    if(!iconEffectAllowed()||typeof win.Element.prototype.animate!=='function')return false;
    const choices=target?[target]:iconEffectTargets();if(!choices.length)return false;
    const chosen=choices[Math.random()*choices.length|0],{source,key,r}=chosen,cs=win.getComputedStyle(source);
    if(cs.visibility==='hidden'||+cs.opacity===0)return false;
    const pseudo=chosen.kind==='before'?win.getComputedStyle(source,'::before'):null,size=Math.min(32,parseFloat(pseudo?.width)||Math.min(r.width,r.height)||20),cx=r.left+r.width/2,cy=r.top+r.height/2;
    stopIconEffect();const fragment=doc.createDocumentFragment(),layer=at(node('div','hw-icon-effect hw-fx',fragment),0,0,viewport.right,viewport.bottom);
    layer.dataset.hwIconEffect=kind;layer.style.color=cs.color;
    const proxy=at(node('span','hw-icon-proxy',layer),cx-size/2,cy-size/2,size,size);proxy.innerHTML=svg(key);Object.assign(proxy.style,{display:'block',transformOrigin:'50% 50%'});Object.assign(proxy.firstChild.style,{display:'block',width:'100%',height:'100%',overflow:'visible'});
    const state=iconEffect={node:layer,source,anims:new Set(),timers:new Set()};
    const wait=(fn,ms)=>{const id=later(()=>{state.timers.delete(id);if(iconEffect===state)fn();},ms);state.timers.add(id);return id;};
    const play=(n,frames,options)=>{const a=animate(n,frames,options);if(a)state.anims.add(a);return a;};
    const k=(offset,x,y,angle=0,scale=1,opacity=1)=>({offset,transform:`translate(${x}px,${y}px) rotate(${angle}deg) scale(${scale})`,opacity});
    let duration=4000;
    if(kind==='drift'){
      const direction=cx<viewport.right*.55?1:-1,dx=direction*rnd(95,130),up=-rnd(9,15);
      play(proxy,[k(0,0,0),k(.14,dx*.08,up*.45,6*direction,1,.92),k(.42,dx,up,-6*direction,1,.82),k(.58,dx,up*.55,4,1,.82),k(.72,dx,up*.85,-4,1,.82),k(.9,dx*.25,up*.3,3,1,.95),k(1,0,0)],{duration,easing:'ease-in-out',composite:'add'});
    }else if(kind==='ghost'){
      duration=3800;const sp=art.sheet({awake:true}),S=Math.max(18,size*1.45),g=at(node('span','hw-icon-ghost',layer),cx-S/2,cy-S/2,S,S),ox=sp.ox,oy=sp.oy;
      g.innerHTML=`<svg viewBox="0 0 ${sp.w} ${sp.h}" style="width:100%;height:100%;overflow:visible;image-rendering:pixelated"><image href="${sp.url}" width="${sp.w}" height="${sp.h}"/><rect x="${ox+3}" y="${oy+1}" width="10" height="2" fill="#fbf8f1"/><g class="hw-ghost-look"><g class="hw-ghost-eyes" fill="#2b1d17"><rect x="${ox+4}" y="${oy+1}" width="1" height="2"/><rect x="${ox+11}" y="${oy+1}" width="1" height="2"/></g></g></svg>`;
      g.style.opacity='0';const look=g.querySelector('.hw-ghost-look'),eyes=g.querySelector('.hw-ghost-eyes');eyes.style.transformOrigin='12px 11.9px';
      const lift=-(size*.5+S*.6),direction=cx>viewport.right-90?-1:1,far=lift-58;
      play(g,[k(0,0,0,0,.25,0),k(.1,0,lift*1.15,0,1.08),k(.16,0,lift),k(.3,4*direction,lift-1,7*direction),{...k(.42,-3*direction,lift,-6*direction),easing:'ease-in'},k(.6,14*direction,lift-18,8*direction,.97,.85),k(.8,27*direction,lift-38,-6*direction,.93,.45),k(1,38*direction,far,6*direction,.88,0)],{duration,easing:'ease-in-out'});
      play(look,[{transform:'translateX(0)'},{offset:750/3800,transform:'translateX(-.9px)',easing:'steps(1,end)'},{offset:1350/3800,transform:'translateX(.9px)',easing:'steps(1,end)'},{offset:1700/3800,transform:`translateX(${direction*.9}px)`},{transform:`translateX(${direction*.9}px)`}],{duration});
      play(eyes,[{transform:'scaleY(1)'},{transform:'scaleY(.12)'},{transform:'scaleY(1)'}],{delay:1150,duration:170,easing:'ease-in-out'});
      play(proxy,[{transform:'scale(1)'},{offset:.04,transform:'scale(1.16,.8)'},{offset:.1,transform:'scale(.94,1.08)'},{offset:.16,transform:'scale(1)'},{transform:'scale(1)'}],{duration});
    }else if(kind==='possess'){
      duration=1640;const spin=[{transform:'rotate(0deg)'},{transform:'rotate(900deg)'}],opts={duration:1400,easing:'cubic-bezier(.55,0,.25,1)'};
      for(const [i,opacity]of [.45,.28,.15].entries()){const trail=proxy.cloneNode(true);trail.classList.add('hw-icon-trail');trail.style.opacity='0';layer.append(trail);play(trail,[{transform:'rotate(0deg)',opacity},{offset:.85,opacity},{transform:'rotate(900deg)',opacity:0}],{...opts,delay:45*(i+1)});}
      play(proxy,spin,opts);wait(()=>play(proxy,[0,1.6,-1.6,0].map(x=>({transform:`translateX(${x}px)`})),{duration:240}),1400);
    }else if(kind==='clawd'){
      duration=3200;const sprites=[art.clawd(),art.clawd({look:-1}),art.clawd({look:1}),art.clawd({blink:true})],cell=1.5,W=sprites[0].w*cell,H=sprites[0].h*cell,box=at(node('span','hw-icon-clawd',layer),cx-W/2,cy-H/2-1,W,H);
      box.style.opacity='0';box.style.transformOrigin='50% 100%';
      const pose=t=>t<580||t>=2550?0:t<1730?1:t<2400?2:3;
      for(const [i,sp]of sprites.entries()){const n=picture(sp,box,cell);Object.assign(n.style,{position:'absolute',left:'0',top:'0'});play(n,Array.from({length:193},(_,j)=>({offset:j/192,opacity:pose(j/192*duration)===i?1:0})),{duration,easing:'linear'});}
      const t=(offset,x,y,sx,sy,opacity=1)=>({offset,transform:`translate(${x}px,${y}px) scale(${sx},${sy})`,opacity});
      play(proxy,[{opacity:1},{offset:.08,opacity:0},{offset:.9,opacity:0},{opacity:1}],{duration,easing:'ease-in-out'});
      play(box,[t(0,0,4,.6,.4,0),t(.08,0,-2,1.08,1.12),t(.14,0,0,1,1),t(.18,0,0,1,1),t(.24,-1.5,0,1,1),t(.48,-1.5,0,1,1),t(.54,1.5,0,1,1),t(.72,1.5,0,1,1),t(.78,0,0,1,1),t(.9,0,4,.6,.4,0),t(1,0,4,.6,.4,0)],{duration,easing:'ease-in-out'});
    }else if(kind==='candy'){
      duration=2100;const count=2+(Math.random()*2|0),floor=cy+size*.55;
      for(let i=0;i<count;i++){const sp=art.candy(Math.random()*3|0,art.CANDY_PAIRS[Math.random()*art.CANDY_PAIRS.length|0]),w=sp.w*2,h=sp.h*2,x=cx-w/2,y=cy-h/2,n=at(picture(sp,layer,2,'hw-pixels hw-icon-candy'),x,y,w,h),delay=120+i*80,m=candyMotion(w,h,x,y,(i%2?1:-1)*rnd(26,62),rnd(-230,-170),floor);
        n.style.opacity='0';const frames=m.frames.map(f=>({offset:Math.min(1,f.t/m.T),transform:`translate(${f.x}px,${f.y}px) rotate(${f.ang}deg) scale(${f.sx},${f.sy})`,opacity:f.opacity}));frames[0].offset=0;frames.at(-1).offset=1;play(n,frames,{duration:m.T*1000,delay,fill:'forwards'});duration=Math.max(duration,m.T*1000+delay);}
      play(proxy,[{transform:'scale(1)'},{offset:.25,transform:'scale(1.18,.78)'},{offset:.5,transform:'translateY(-2px) scale(.9,1.14)'},{offset:.75,transform:'scale(1.04,.96)'},{transform:'scale(1)'}],{duration:520,easing:'ease-out'});
    }
    source.classList.add('hw-icon-muted');if(['self','native'].includes(chosen.kind))source.classList.add('hw-icon-self');
    doc.body.append(fragment);wait(stopIconEffect,duration+40);lastIconEffect=kind;return true;
  }
  function scheduleIconEffects(){
    if(iconEffectTimer||!moving()||!ambient()||root.dataset.cwV4Settings==='open')return;
    iconEffectTimer=later(()=>{iconEffectTimer=0;const kinds=iconEffectKinds.filter(k=>k!==lastIconEffect);playIconEffect(kinds[Math.random()*kinds.length|0]);scheduleIconEffects();},rnd(15000,24000));
  }
  function activity(){lastAction=Date.now();idleThreshold=rnd(30000,60000);}
  function action(){activity();clearPrank();stopIconEffect();}
  function tick(){scheduler=0;if(dead)return;maybePrank();scheduler=later(tick,1000);}
  function schedule(){if(scheduler||!visible()||calm()||!ambient())return;scheduler=later(tick,1000);}
  function reset(){
    // CHAT_CHANGED cancels the timer pool; discard cached decoration states too.
    clearWelcome();clearChatDecoration();clearPendingDialogDecorations();clearDelete(deletion);for(const snap of [...activeDeletes])clearDelete(snap);
    clearSend();stopCandles();stopIconEffects();candyBusy=false;
    pressedPointers.clear();
    epoch++;validAfter=win.performance.now();for(const id of timers)win.clearTimeout(id);timers.clear();scheduler=0;
    for(const a of animations)a.cancel();animations.clear();clearPrank();stopDrawerSpider();
    for(const [b,state]of copies){delete b.dataset.cwHalloweenCopy;remove(state.status);}copies.clear();
    for(const n of [...owned])if(n.classList.contains('hw-fx')||n.closest?.('.hw-fx'))remove(n);
    submit=null;deletion=null;submitTimer=deleteTimer=0;if(!dead){if(!doc.hidden)staticScenes();schedule();}
  }
  const observer=new win.MutationObserver(records=>{
    removedDelete(records);
    if(records.every(r=>r.target.closest?.('[data-cw-halloween-owned]')||[...r.addedNodes,...r.removedNodes].every(n=>n.nodeType===1&&n.hasAttribute?.('data-cw-halloween-owned'))))return;
    if(!raf)raf=win.requestAnimationFrame(()=>{raf=0;if(!dead)staticScenes();});
  });
  let settingsWasOpen=root.dataset.cwV4Settings==='open';
  const settingsObserver=new win.MutationObserver(()=>{
    const open=root.dataset.cwV4Settings==='open',closed=settingsWasOpen&&!open;settingsWasOpen=open;if(open)startDrawerSpider();else stopDrawerSpider();
    if(closed&&!dead&&!raf)raf=win.requestAnimationFrame(()=>{raf=0;if(!dead)staticScenes();});
  });
  function stopAmbient(){cancel(scheduler);scheduler=0;clearPrank();stopCandles();stopIconEffects();}
  function sync(){if(dead)return;const nowCalm=calm();if(nowCalm!==lastCalm){lastCalm=nowCalm;if(nowCalm)reset();}staticScenes();if(!moving()||!ambient())stopAmbient();else schedule();}
  return {rig,install(){
    lastAction=Date.now();lastCalm=calm();buildStyle();staticScenes();schedule();
    const shell=doc.getElementById('chat');if(shell)observer.observe(shell,{childList:true});
    // Popup creation is observed shallowly; never scan streaming message subtrees.
    observer.observe(doc.body,{childList:true});
    settingsObserver.observe(root,{attributes:true,attributeFilter:['data-cw-v4-settings']});
    on(doc,'cw-clawd-pile-drop',()=>positionPail());
    on(doc,'cw-copy-result',copyResult);on(doc,'pointerdown',e=>{pressedPointers.add(e.pointerId);action();},{capture:true,passive:true});
    on(doc,'pointerup',e=>pressedPointers.delete(e.pointerId),{capture:true,passive:true});on(doc,'pointercancel',e=>pressedPointers.delete(e.pointerId),{capture:true,passive:true});on(win,'blur',()=>{pressedPointers.clear();activity();});
    on(doc,'click',candy);on(doc,'focusin',e=>{if(e.target.id==='send_textarea')action();},{capture:true,passive:true});on(doc,'wheel',activity,{capture:true,passive:true});
    on(doc,'pointerup',rememberSend,{capture:true,passive:true});on(doc,'click',rememberSend,{capture:true,passive:true});on(doc,'keydown',e=>{action();rememberSend(e);},{capture:true,passive:true});
    on(doc,'pointermove',activity,{passive:true});on(doc,'scroll',activity,{capture:true,passive:true});
    on(doc,'input',e=>{if(e.target.id==='send_textarea'){const value=!!e.target.value;if(value!==root.classList.contains('hw-typing')){root.classList.toggle('hw-typing',value);welcomeWeb(doc.querySelector('.clawd-welcome-hero'));}}},{passive:true});
    on(doc,'click',e=>{if(e.target.closest?.('.popup-button-cancel,#dialogue_del_mes_cancel'))finishDelete(deletion);const m=e.target.closest?.('.mes_edit_delete,.claude-user-message-delete');if(m)captureDelete(m.closest('.mes'));if(e.target.closest?.('#dialogue_del_mes_ok'))captureDelete([...doc.querySelectorAll('#chat>.mes:has(input.del_checkbox:checked)')].at(-1)||doc.querySelector('#chat>.mes:last-child'));},{capture:true,passive:true});
    on(doc,'visibilitychange',()=>{reset();if(!doc.hidden)staticScenes();});on(win,'resize',()=>{viewport={right:win.innerWidth,bottom:win.innerHeight};reset();webKey='';generationSafeKey='';if(pailDrag){savePail();pailDrag=null;}staticScenes();},{passive:true});on(motion,'change',()=>{lastCalm=calm();reset();staticScenes();});
    doc.fonts?.ready.then(()=>{if(!dead){webKey='';staticScenes();}});
  },sync,sent,deleted,captureDelete,finishDelete,reset,positionClawd:positionPail,
  stats:()=>({timers:timers.size,animations:animations.size,nodes:[...owned].filter(n=>n.isConnected).length,prank:!!ghost,spider:!!spider,sendRaf:!!sendFrame,spiderRaf:!!spider?.frame,decoRaf:(welcomeState?.frames.size||0)+(chatDecorationState?.frames.size||0)}),
  destroy(){if(dead)return;dead=true;reset();pailResizeObserver?.disconnect();pailQrObserver?.disconnect();pailSmallObserver?.disconnect();win.cancelAnimationFrame(pailSmallFrame);pailSmallFrame=0;pailSmallForm=pailSmallPile=null;pailObserved.clear();pailDrag=null;observer.disconnect();settingsObserver.disconnect();win.cancelAnimationFrame(raf);listeners.splice(0).forEach(f=>f());for(const[n,s]of icons){if(s.kind==='svg'&&n.innerHTML===s.installed){n.innerHTML=s.html;if(s.box===null)n.removeAttribute('viewBox');else n.setAttribute('viewBox',s.box);if(s.stroke===null)n.removeAttribute('stroke-width');else n.setAttribute('stroke-width',s.stroke);}if(s.kind==='text'&&s.text.data===s.installed)s.text.data=s.original;if(s.kind==='mask'){if(s.mask)n.style.setProperty('mask-image',s.mask,s.maskP);else n.style.removeProperty('mask-image');}}icons.clear();for(const n of owned)n.remove();owned.clear();anchors.clear();root.classList.remove('hw-typing');root.style.removeProperty('--cw-hw-rig-lift');}
  };
}
