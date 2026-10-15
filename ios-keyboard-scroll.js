// iOS mobile layout: decide each gesture once; keep native long-press selection.
export function installIOSKeyboardScroll({win,enabled,keyboardTarget,reset}) {
  const doc=win.document,root=doc.documentElement;
  let open=false,touching=false,point=null,timer=0,syncRaf=0,stopped=false;
  const style=doc.createElement('style');
  style.textContent=`html[data-cw-ios-scroll-guard],html[data-cw-ios-scroll-guard] body{background-color:var(--cl-canvas,#1f1f1e)!important}
html[data-cw-ios-keyboard-lock],html[data-cw-ios-keyboard-lock] body{overscroll-behavior:none!important}
html[data-cw-ios-keyboard-lock] :is(#chat,#send_textarea){overscroll-behavior:contain!important}
html[data-cw-ios-keyboard-lock] :is(#bg1,#bg_custom,#bg_animation){background:var(--cl-canvas,#1f1f1e)!important}`;
  doc.head.append(style);
  const clear=()=>{if(timer)win.clearTimeout(timer);timer=0;};
  const sync=()=>{
    const on=enabled(),layout=Math.max(root.clientHeight,win.innerHeight||0);
    open=on&&layout-(win.visualViewport?.height||layout)>80&&(keyboardTarget(doc.activeElement)||open);
    root.toggleAttribute('data-cw-ios-scroll-guard',on);root.toggleAttribute('data-cw-ios-keyboard-lock',open);
    if(!open)clear();
  };
  const displaced=()=>Math.abs(win.scrollX)>1||Math.abs(win.scrollY)>1||Math.abs(win.visualViewport?.offsetTop||0)>1;
  const scheduleRecovery=()=>{clear();if(open&&!touching&&displaced())timer=win.setTimeout(()=>{timer=0;if(open&&!touching&&displaced())reset();},150);};
  const viewport=()=>{sync();scheduleRecovery();};
  const scroll=()=>{
    clear();
    if(!syncRaf)syncRaf=win.requestAnimationFrame(()=>{syncRaf=0;if(!stopped){sync();scheduleRecovery();}});
  };
  const start=e=>{
    touching=e.touches.length>0;point=null;clear();sync();
    if(open&&e.touches.length===1){const t=e.touches[0];point={id:t.identifier,x:t.clientX,y:t.clientY,at:win.performance.now(),block:null};}
  };
  const canScroll=(target,dy,onlySelf=false)=>{
    for(let el=target;el&&el!==doc.body&&el!==root;el=onlySelf?null:el.parentElement){
      if(!/(auto|scroll|overlay)/.test(win.getComputedStyle(el).overflowY)||el.scrollHeight<=el.clientHeight+1)continue;
      if(dy>0&&el.scrollTop>1||dy<0&&el.scrollTop+el.clientHeight<el.scrollHeight-1)return true;
    }return false;
  };
  const move=e=>{
    if(!open||!point||e.touches.length!==1||e.touches[0].identifier!==point.id||!e.cancelable||e.defaultPrevented)return;
    if(point.block===null){
      const t=e.touches[0],dx=t.clientX-point.x,dy=t.clientY-point.y;
      // Ignore sub-3px jitter until the first meaningful move, then keep its decision.
      if(Math.hypot(dx,dy)<3)return;
      const textarea=e.target?.closest?.('textarea');
      if(Math.abs(dx)>=Math.abs(dy))point.block=false;
      else if(textarea){
        point.block=win.performance.now()-point.at<400&&!canScroll(textarea,dy,true);
      }else if(e.target?.closest?.('input,select,[contenteditable]:not([contenteditable="false"])'))point.block=false;
      else point.block=!canScroll(e.target,dy);
    }
    if(point.block)e.preventDefault();
  };
  const end=e=>{touching=e.touches.length>0;if(!touching){point=null;sync();scheduleRecovery();}};
  doc.addEventListener('touchstart',start,{capture:true,passive:true});doc.addEventListener('touchmove',move,{capture:true,passive:false});
  doc.addEventListener('touchend',end,{capture:true,passive:true});doc.addEventListener('touchcancel',end,{capture:true,passive:true});
  doc.addEventListener('focusin',viewport,true);doc.addEventListener('focusout',viewport,true);
  win.addEventListener('scroll',scroll,{passive:true});win.visualViewport?.addEventListener('resize',viewport,{passive:true});win.visualViewport?.addEventListener('scroll',scroll,{passive:true});sync();
  return {active:()=>open,isTouching:()=>touching,scheduleRecovery,sync,destroy(){
    stopped=true;clear();if(syncRaf)win.cancelAnimationFrame(syncRaf);syncRaf=0;open=false;touching=false;point=null;
    doc.removeEventListener('touchstart',start,true);doc.removeEventListener('touchmove',move,true);doc.removeEventListener('touchend',end,true);doc.removeEventListener('touchcancel',end,true);
    doc.removeEventListener('focusin',viewport,true);doc.removeEventListener('focusout',viewport,true);win.removeEventListener('scroll',scroll);
    win.visualViewport?.removeEventListener('resize',viewport);win.visualViewport?.removeEventListener('scroll',scroll);
    root.removeAttribute('data-cw-ios-scroll-guard');root.removeAttribute('data-cw-ios-keyboard-lock');style.remove();
  }};
}
