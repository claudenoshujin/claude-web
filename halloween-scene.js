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
  function clipQuickReplies(layer,bounds={left:0,top:0,right:win.innerWidth,bottom:win.innerHeight},blocks=quickReplyRects()){
    const outer={left:Math.max(0,bounds.left),top:Math.max(0,bounds.top),right:Math.min(win.innerWidth,bounds.right),bottom:Math.min(win.innerHeight,bounds.bottom)};
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
  function picture(sprite,parent,scale=2,cls='hw-pixels'){const n=node('img',cls,parent);n.src=sprite.url;n.alt='';n.draggable=false;n.style.width=sprite.w*scale+'px';n.style.height=sprite.h*scale+'px';return n;}
  const svg=(key,mask=false)=>`<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20" fill="none" stroke="${mask?'black':'currentColor'}" stroke-width="${1.35*(IW[key]||1)}" stroke-linecap="round" stroke-linejoin="round"><style>.t{stroke-width:1}.e{stroke-width:1.8}.k{stroke-width:2.7}.kb{fill:${mask?'none':'var(--cl-surface,#fff)'}}</style>${I[key]}</svg>`;
  const url=key=>`url("data:image/svg+xml,${encodeURIComponent(svg(key,true))}")`;
  function buildStyle(){
    const style=node('style','cw-halloween-style',doc.head);
    const scope='html[data-cw-halloween="on"]'+Array.from({length:8},(_,i)=>`:not(#cw-hw-${i})`).join('');
    let css=halloweenCSS.replaceAll('html[data-cw-halloween="on"]',scope)+`\n${scope}{--cw-hw-skull:${url('tombs')};}`;
    for(const [selector,key,kind='before']of iconRules){
      if(kind==='self'){css+=`${scope} ${selector}{background:currentColor!important;mask:${url(key)} center/contain no-repeat!important;-webkit-mask:${url(key)} center/contain no-repeat!important;font-size:0!important}${scope} ${selector}>svg{visibility:hidden!important}${scope}[data-claude-ui="classic"] ${selector}{display:inline-block!important;width:20px!important;height:20px!important}`;continue;}
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
    const asteriskURL='url("data:image/svg+xml,'+encodeURIComponent(asteriskMarkup(12))+'")';
    css+=`${scope} #chat>.mes.last_mes[is_user="false"] .mes_text>p:last-child::after{content:"";display:inline-block;width:12px;height:12px;margin-left:.3em;background-image:${asteriskURL};background-size:contain;background-repeat:no-repeat;vertical-align:baseline;animation:hw-signature 4.8s ease-in-out infinite;pointer-events:none}${scope}[data-claude-layout="mobile"] #chat>.mes.last_mes[is_user="false"] .mes_text>p:last-child::after{width:11px;height:11px}${scope}[data-cw-generating="1"] #chat>.mes.last_mes[is_user="false"] .mes_text>p:last-child::after,${scope} body.claude-generation-active #chat>.mes.last_mes[is_user="false"] .mes_text>p:last-child::after{display:none}${scope}[data-cw-hw-ambient="off"] #chat>.mes.last_mes[is_user="false"] .mes_text>p:last-child::after,${scope}[data-cw-hw-calm="on"] #chat>.mes.last_mes[is_user="false"] .mes_text>p:last-child::after{animation:none;opacity:.95}`;
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
  function decoLegs(state,art,ms){const start=win.performance.now();let id=0;const frame=now=>{state.frames.delete(id);if(!moving()||!ambient()||!state.node.isConnected)return;const t=(now-start)/1000;art.legs(t*2.6,.25,0,0);if(now-start<ms){id=win.requestAnimationFrame(frame);state.frames.add(id);}else art.legs(0,0,0,0);};id=win.requestAnimationFrame(frame);state.frames.add(id);}
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
  function staticScenes(){
    if(dead)return;
    for(const [host,n]of anchors)if(!host.isConnected){remove(n);anchors.delete(host);}
    const typing=!!doc.getElementById('send_textarea')?.value;if(typing!==root.classList.contains('hw-typing'))root.classList.toggle('hw-typing',typing);
    root.dataset.cwHwAmbient=ambient()?'on':'off';root.dataset.cwHwCalm=calm()?'on':'off';dressIcons();welcomeWeb(doc.querySelector('.clawd-welcome-hero'));chatDecoration();safeGeneration();
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
    const blocks=quickReplyRects(),r=box.getBoundingClientRect(),cs=win.getComputedStyle(box),mirror=node('div','hw-text-mirror');
    for(const key of ['font','fontFamily','fontSize','fontWeight','fontStyle','lineHeight','letterSpacing','paddingTop','paddingRight','paddingBottom','paddingLeft','whiteSpace','wordBreak','overflowWrap','textAlign','direction','tabSize','boxSizing','borderTopWidth','borderLeftWidth','borderRightWidth','borderBottomWidth'])mirror.style[key]=cs[key];
    Object.assign(mirror.style,{position:'fixed',left:r.left+'px',top:r.top-box.scrollTop+'px',width:r.width+'px',height:'auto',minHeight:r.height+'px',visibility:'hidden',pointerEvents:'none',whiteSpace:'pre-wrap',borderStyle:'solid',borderColor:'transparent'});
    const spans=Array.from(box.value,c=>{const n=doc.createElement('span');n.textContent=c;mirror.append(n);return n;});
    const chars=spans.map(n=>{const b=n.getBoundingClientRect();return {c:n.textContent,x:b.left,y:b.top,w:b.width,h:b.height};}).filter(c=>c.c.trim()&&c.w&&c.y+c.h>r.top&&c.y<r.bottom&&c.x+c.w>r.left&&c.x<r.right).sort((a,b)=>Math.abs(a.y-b.y)>2?a.y-b.y:a.x-b.x).slice(0,80);
    remove(mirror);clearSend();if(!chars.length)return null;
    const layer=sendLayer=node('div','hw-flight-layer hw-fx');clipQuickReplies(layer,undefined,blocks);
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
    submit=null;cancel(submitTimer);submitTimer=0;action();clipQuickReplies(snap.layer);const gap=clamp(.36/snap.chars.length,.012,.03),start=win.performance.now();
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
    deletion=null;cancel(deleteTimer);deleteTimer=0;action();const r=snap.rect,blocks=quickReplyRects(),layer=at(node('div','hw-deletion-layer hw-fx'),0,0,win.innerWidth,win.innerHeight),piece=snap.clone;layer.dataset.hwDelete=deleteChoice();clipQuickReplies(layer,{left:r.left-50,top:r.top-50,right:r.right+50,bottom:r.bottom+50},blocks);layer.append(piece);owned.add(piece);
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
  function legs(time, tuck, splay, poke) {
    for (const L of LEGS) {
      const wig = Math.sin(time * 5.2 + L.i * 1.7 + L.side) * 4;
      let a = L.a - L.side * tuck * 34 + L.side * splay * 18 + wig;
      if (L.i === 0) a += L.side * poke * 40;
      const kx = L.hx + Math.cos(a * RAD) * L.l1, ky = L.hy + Math.sin(a * RAD) * L.l1 - 2.6;
      const b = a + L.side * (26 - tuck * 18);
      const fx = kx + Math.cos(b * RAD) * L.l2, fy = ky + Math.sin(b * RAD) * L.l2 + 1.2;
      L.path.setAttribute('d', 'M' + L.hx.toFixed(2) + ' ' + L.hy.toFixed(2) + 'L' + kx.toFixed(2) + ' ' + ky.toFixed(2) + 'L' + fx.toFixed(2) + ' ' + fy.toFixed(2));
      L.knee.setAttribute('cx', kx.toFixed(2)); L.knee.setAttribute('cy', ky.toFixed(2));
      L.foot.setAttribute('cx', fx.toFixed(2)); L.foot.setAttribute('cy', fy.toFixed(2));
    }
  }
  legs(0, 0, 0, 0);
  return { svg, legs };
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
    const text=node('span','hw-prank-text',line),cursor=node('span','hw-prank-cursor',line);picture(art.sheet({awake:true}),cursor,1.2);Object.assign(cursor.style,{display:'inline-block',marginLeft:'3px',transform:'translateY(-1px)'});
    const current=ghost={node:layer,timers:[],anims:[]},word='boo～';lastPrank=Date.now();let i=0;
    const wait=(fn,ms)=>current.timers.push(later(()=>{if(ghost===current)fn();},ms));
    const play=(frames,opts)=>current.anims.push(animate(cursor,frames,opts));
    const erase=()=>{if(i){text.textContent=word.slice(0,--i);wait(erase,110);}else{play([{transform:'translateY(-1px) rotate(0deg)',opacity:1},{offset:.3,transform:'translateY(-3px) rotate(-12deg)',opacity:1},{offset:.6,transform:'translateY(-1px) rotate(10deg)',opacity:1},{transform:'translateY(-14px) rotate(0deg)',opacity:0}],{duration:700,fill:'forwards'});wait(clearPrank,760);}};
    const type=()=>{if(i<word.length){text.textContent=word.slice(0,++i);play([{transform:'translateY(-1px)'},{transform:'translateY(-4px)'},{transform:'translateY(-1px)'}],{duration:160});wait(type,rnd(160,230));}else wait(erase,800);};wait(type,300);return true;
  }
  function clearDrawerSpider(){if(!spider)return;win.cancelAnimationFrame(spider.frame);for(const id of spider.timers)cancel(id);remove(spider.node);spider=null;}
  function runDrawerSpider(){
    const s=spider;if(!s||s.frame||!moving())return;let last=0;
    const frame=now=>{
      s.frame=0;if(spider!==s||!moving()||root.dataset.cwV4Settings!=='open')return clearDrawerSpider();const dt=Math.min(.04,last?(now-last)/1000:.016);last=now;const pv=s.v;
      s.ax+=(s.tx-s.ax)*(1-Math.exp(-dt/(s.tap?.035:.09)));
      for(let rem=dt;rem>0;){const h=Math.min(.012,rem);rem-=h;
        if(s.mode==='drop'){const brake=14*(s.target-s.L);s.v=Math.min(2200,s.v+7000*h,Math.max(brake,800));s.L+=s.v*h;if(s.L>=s.target)s.mode='on';}
        else if(s.mode==='up'){s.v=Math.max(-2200,s.v-7000*h);s.L+=s.v*h;if(s.L<=0)return clearDrawerSpider();}
        else if(s.travel){const d=s.target-s.L,want=Math.sign(d)*Math.min(2200,Math.max(14*Math.abs(d),520)),a=14000*h;s.v+=clamp(want-s.v,-a,a);s.L+=s.v*h;if(d*(s.target-s.L)<=0)s.travel=false;}
        else{s.v+=(-260*(s.L-s.target)-7*s.v)*h;s.L+=s.v*h;}
      }
      if(s.tap&&!s.tap.hit&&!s.tap.wind&&s.mode==='on'&&!s.travel){const tp=s.tap;tp.hit=true;s.v=0;s.sq=.45;s.poke=1;const ripple=at(node('span','hw-node-ripple hw-fx'),tp.x-5,tp.y-5,10,10);ripple.style.border='1.6px solid #D97757';ripple.style.borderRadius='50%';animate(ripple,[{transform:'scale(.4)',opacity:.95},{transform:'scale(4.6)',opacity:0}],{duration:480,easing:'cubic-bezier(.2,.7,.3,1)'},()=>remove(ripple));s.timers.push(later(()=>{if(spider!==s||s.tap!==tp)return;s.tap=null;if(s.phone)s.timers.push(later(()=>releaseDrawerSpider(),1200));else{s.tx=clamp(tp.fx+10,s.minX,s.maxX);s.target=clamp(tp.fy-s.top-25,14,s.maxL);}runDrawerSpider();},150));}
      const acc=(s.v-pv)/Math.max(dt,.001),free=s.mode==='drop'&&s.v<2190&&acc>3000,q=free||(s.mode==='drop'&&acc>=0)||s.travel?-.2*Math.min(1,Math.abs(s.v)/2200):clamp(-acc/16000,-.45,.45);s.sq+=(q-s.sq)*(1-Math.exp(-dt/.02));s.poke=Math.max(0,s.poke-dt*3);s.clock+=dt;
      s.node.style.left=s.ax+'px';s.thread.style.height=Math.max(0,s.L)+'px';s.body.style.top=s.L-s.attach+'px';s.body.style.transform=`scale(${1+s.sq*.75},${1-s.sq})`;s.art.legs(s.clock,s.mode==='drop'||s.mode==='up'||s.travel?clamp(Math.abs(s.v)/1300,0,1):clamp(-s.sq*2.4,0,1),clamp(s.sq*2.4,0,1),s.poke);
      if(s.mode==='drop'||s.mode==='up'||s.travel||Math.abs(s.v)>=1||Math.abs(s.L-s.target)>=.5||Math.abs(s.ax-s.tx)>=.5||Math.abs(s.sq)>.005||s.poke>.01)s.frame=win.requestAnimationFrame(frame);
    };s.frame=win.requestAnimationFrame(frame);
  }
  function releaseDrawerSpider(){if(!spider)return;spider.tap=null;spider.travel=false;spider.mode='up';runDrawerSpider();}
  function moveDrawerSpider(e,tap=false){
    if((!tap&&(e.buttons||e.pointerType==='touch'))||root.dataset.cwV4Settings!=='open'){if(spider){if(e.buttons||e.pointerType==='touch')clearDrawerSpider();else releaseDrawerSpider();}return;}
    if(!moving())return clearDrawerSpider();const host=panel();if(!host||spiderModal())return clearDrawerSpider();const r=host.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)return releaseDrawerSpider();
    const phone=e.pointerType==='touch'||root.dataset.claudeLayout==='mobile',size=phone?32:36;
    if(!spider){const n=at(node('span','hw-node-spider hw-fx'),e.clientX,r.top,0,0),thread=node('span','hw-node-thread',n),body=node('span','hw-node-body',n),art=nodeSpider(palette(),size);Object.assign(thread.style,{position:'absolute',left:'0',top:'0',width:'1px',background:palette().thread});Object.assign(body.style,{position:'absolute',left:-size/2+'px',width:size+'px',height:size+'px'});body.append(art.svg);spider={node:n,thread,body,art,top:r.top,minX:r.left+18,maxX:r.right-18,maxL:r.height-46,phone,attach:size*2.4/36,ax:e.clientX,tx:e.clientX,L:0,v:0,target:14,sq:0,mode:'drop',travel:false,tap:null,poke:0,clock:0,frame:0,timers:[]};}
    const s=spider;s.top=r.top;s.node.style.top=r.top+'px';s.minX=r.left+18;s.maxX=r.right-18;s.maxL=r.height-46;
    if(tap){if(s.tap)s.tap=null;const tp=s.tap={x:e.clientX,y:e.clientY,fx:e.clientX,fy:e.clientY,hit:false,wind:false};s.tx=clamp(e.clientX,s.minX,s.maxX);const target=clamp(e.clientY-s.top-(size*.66-s.attach)+4,14,s.maxL+20);if(s.mode==='on'){tp.wind=true;s.target=s.L-16;s.timers.push(later(()=>{if(spider!==s||s.tap!==tp)return;tp.wind=false;s.target=target;s.travel=true;runDrawerSpider();},90));}else s.target=target;}
    else if(s.tap){s.tap.fx=e.clientX;s.tap.fy=e.clientY;}
    else{const target=clamp(e.clientY-s.top-25,14,s.maxL);s.tx=clamp(e.clientX+10,s.minX,s.maxX);if(s.mode==='on'&&Math.abs(target-s.L)>40)s.travel=true;if(s.mode==='up')s.mode='on';s.target=target;}
    runDrawerSpider();
  }

  function candy(event){
    if(!moving()||!event.target.closest?.('.hw-pail')||modal())return;
    action();const r=event.target.closest('.hw-pail').getBoundingClientRect();
    for(let i=0;i<7;i++){const c=picture(art.candy(i%3,art.CANDY_PAIRS[i%6]),doc.body,2,'hw-candy hw-fx');c.style.left=r.left+'px';c.style.top=r.top+'px';const dx=(Math.random()-.5)*140;animate(c,[{opacity:1,transform:'translate(0,0)'},{offset:.35,opacity:1,transform:`translate(${dx*.5}px,-${25+Math.random()*30}px) rotate(90deg)`},{opacity:0,transform:`translate(${dx}px,80px) rotate(220deg)`}],{duration:1000+i*40,easing:'ease-in',fill:'forwards'},()=>remove(c));}
  }
  function action(){lastAction=Date.now();idleThreshold=rnd(30000,60000);clearPrank();}
  function tick(){scheduler=0;if(dead)return;maybePrank();scheduler=later(tick,1000);}
  function schedule(){if(scheduler||!visible()||calm()||!ambient())return;scheduler=later(tick,1000);}
  function reset(){
    clearSend();
    pressedPointers.clear();
    win.cancelAnimationFrame(spiderModalFrame);spiderModalFrame=0;spiderModalValid=false;
    epoch++;validAfter=win.performance.now();for(const id of timers)win.clearTimeout(id);timers.clear();scheduler=0;
    for(const a of animations)a.cancel();animations.clear();clearPrank();clearDrawerSpider();
    for(const [b,state]of copies){delete b.dataset.cwHalloweenCopy;remove(state.status);}copies.clear();
    for(const n of [...owned])if(n.classList.contains('hw-fx')||n.closest?.('.hw-fx'))remove(n);
    submit=null;deletion=null;submitTimer=deleteTimer=0;if(!dead)schedule();
  }
  const observer=new win.MutationObserver(records=>{
    if(records.every(r=>r.target.closest?.('[data-cw-halloween-owned]')||[...r.addedNodes,...r.removedNodes].every(n=>n.nodeType===1&&n.hasAttribute?.('data-cw-halloween-owned'))))return;
    if(!raf)raf=win.requestAnimationFrame(()=>{raf=0;if(!dead)staticScenes();});
  });
  function stopAmbient(){cancel(scheduler);scheduler=0;clearPrank();}
  function sync(){if(dead)return;const nowCalm=calm();if(nowCalm!==lastCalm){lastCalm=nowCalm;if(nowCalm)reset();}staticScenes();if(!moving()||!ambient())stopAmbient();else schedule();}
  return {rig,install(){
    lastAction=Date.now();lastCalm=calm();buildStyle();staticScenes();schedule();
    const shell=doc.getElementById('chat');if(shell)observer.observe(shell,{childList:true});
    // Popup creation is observed shallowly; never scan streaming message subtrees.
    observer.observe(doc.body,{childList:true});
    on(doc,'cw-copy-result',copyResult);on(doc,'pointerdown',e=>{pressedPointers.add(e.pointerId);action();if(root.dataset.cwV4Settings==='open')moveDrawerSpider(e,true);},{capture:true,passive:true});
    on(doc,'pointerup',e=>pressedPointers.delete(e.pointerId),{capture:true,passive:true});on(doc,'pointercancel',e=>pressedPointers.delete(e.pointerId),{capture:true,passive:true});on(win,'blur',()=>{pressedPointers.clear();action();});
    on(doc,'click',candy);on(doc,'focusin',e=>{if(e.target.id==='send_textarea')action();},{capture:true,passive:true});on(doc,'wheel',action,{capture:true,passive:true});
    on(doc,'pointerup',rememberSend,{capture:true,passive:true});on(doc,'click',rememberSend,{capture:true,passive:true});on(doc,'keydown',e=>{action();rememberSend(e);},{capture:true,passive:true});
    on(doc,'pointermove',e=>{action();moveDrawerSpider(e);},{passive:true});on(doc,'pointercancel',clearDrawerSpider,{passive:true});on(doc,'scroll',()=>{action();clearDrawerSpider();},{capture:true,passive:true});
    on(doc,'input',e=>{if(e.target.id==='send_textarea'){const value=!!e.target.value;if(value!==root.classList.contains('hw-typing')){root.classList.toggle('hw-typing',value);welcomeWeb(doc.querySelector('.clawd-welcome-hero'));}}},{passive:true});
    on(doc,'click',e=>{if(e.target.closest?.('.popup-button-cancel,#dialogue_del_mes_cancel'))finishDelete(deletion);const m=e.target.closest?.('.mes_edit_delete,.claude-user-message-delete');if(m)captureDelete(m.closest('.mes'));if(e.target.closest?.('#dialogue_del_mes_ok'))captureDelete([...doc.querySelectorAll('#chat>.mes:has(input.del_checkbox:checked)')].at(-1)||doc.querySelector('#chat>.mes:last-child'));},{capture:true,passive:true});
    on(doc,'visibilitychange',()=>{reset();if(!doc.hidden)staticScenes();});on(win,'resize',()=>{reset();webKey='';generationSafeKey='';pailBase=null;staticScenes();},{passive:true});on(win,'blur',clearDrawerSpider);on(motion,'change',()=>{lastCalm=calm();reset();staticScenes();});
    doc.fonts?.ready.then(()=>{if(!dead){webKey='';staticScenes();}});
  },sync,sent,deleted,captureDelete,finishDelete,reset,positionClawd:positionPail,
  stats:()=>({timers:timers.size,animations:animations.size,nodes:[...owned].filter(n=>n.isConnected).length,prank:!!ghost,spider:!!spider,sendRaf:!!sendFrame,spiderRaf:!!spider?.frame,decoRaf:(welcomeState?.frames.size||0)+(chatDecorationState?.frames.size||0)}),
  destroy(){if(dead)return;dead=true;reset();observer.disconnect();win.cancelAnimationFrame(raf);listeners.splice(0).forEach(f=>f());for(const[n,s]of icons){if(s.kind==='svg'&&n.innerHTML===s.installed){n.innerHTML=s.html;if(s.box===null)n.removeAttribute('viewBox');else n.setAttribute('viewBox',s.box);if(s.stroke===null)n.removeAttribute('stroke-width');else n.setAttribute('stroke-width',s.stroke);}if(s.kind==='text'&&s.text.data===s.installed)s.text.data=s.original;if(s.kind==='mask'){if(s.mask)n.style.setProperty('mask-image',s.mask,s.maskP);else n.style.removeProperty('mask-image');}}icons.clear();for(const n of owned)n.remove();owned.clear();anchors.clear();root.classList.remove('hw-typing');root.style.removeProperty('--cw-hw-rig-lift');}
  };
}
