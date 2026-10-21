import { processBackground } from './background-pixels.js?v=2.0.155';

// Own a foreground image inside native background layers; never replace ST's
// background URL, style, selection handlers, or any chat attachment.
export function createBackgroundFilters({win,enabled}) {
  const doc=win.document,key='claude-web:backgroundFilters',defaults={mode:'none',light:100,sat:100,pixel:12,levels:4,dots:2,ink:'#20232b'};
  const clamp=(n,min,max,fallback)=>Number.isFinite(Number(n))?Math.max(min,Math.min(max,Number(n))):fallback;
  let saved={};try{saved=JSON.parse(win.localStorage.getItem(key)||'{}')||{}}catch{}
  const settings={mode:['none','dim','desat','pixel','bayer'].includes(saved.mode)?saved.mode:'none',light:clamp(saved.light,10,150,100),sat:clamp(saved.sat,0,150,100),pixel:clamp(saved.pixel,2,40,12),levels:Math.round(clamp(saved.levels,2,10,4)),dots:Math.round(clamp(saved.dots,1,8,2)),ink:/^#[a-f0-9]{6}$/i.test(saved.ink||'')?saved.ink:defaults.ink};
  const layers=new Map(),cache=new Map(),jobs=new Map();let controls=null,worker=null,workerTried=false,jobId=0,epoch=0,timer=0,bodyObserver=null,rootObserver=null,destroyed=false;
  const schedule=()=>{win.clearTimeout(timer);timer=win.setTimeout(()=>{timer=0;void render()},120)};
  const status=text=>{if(controls)controls.querySelector('[role=status]').textContent=text};
  function persist(){try{win.localStorage.setItem(key,JSON.stringify(settings))}catch{} }
  function mount(){
    const host=doc.querySelector('#claude-web-section-background > .claude-web-section-body');if(!host||controls?.parentElement===host)return;
    controls?.remove();controls=doc.createElement('div');controls.className='cw-background-filter-controls';controls.id='cw-background-filter-controls';
    controls.innerHTML='<label for="cw-bg-effect">背景滤镜</label><select id="cw-bg-effect" class="text_pole"><option value="none">不处理</option><option value="dim">压暗</option><option value="desat">降低饱和度 / 灰度</option><option value="pixel">像素化</option><option value="bayer">Bayer 有序抖动</option></select><div data-cw-filter-params></div><button type="button" class="menu_button" data-cw-filter-reset>恢复滤镜默认</button><div class="claude-web-help">只处理背景，聊天图片保持原样。需要显示背景时，打开上方“背景透传”。滤镜先处理背景，再叠加现有模糊和透传；像素与抖动使用静态画面，关闭模糊可看清颗粒。</div><div class="claude-web-help" role="status" aria-live="polite"></div>';
    const params=controls.querySelector('[data-cw-filter-params]');
    for(const [name,label,min,max] of [['light','明暗',10,150],['sat','饱和度',0,150],['pixel','像素块大小',2,40],['levels','色阶',2,10],['dots','网点大小',1,8]]){
      const row=doc.createElement('label');row.dataset.param=name;row.htmlFor='cw-bg-'+name;row.innerHTML='<span>'+label+'</span><input type="range" id="cw-bg-'+name+'" min="'+min+'" max="'+max+'" step="1"><output></output>';params.append(row);
      row.querySelector('input').addEventListener('input',e=>{settings[name]=Number(e.target.value);present();persist();schedule()});
    }
    const ink=doc.createElement('label');ink.dataset.param='ink';ink.htmlFor='cw-bg-ink';ink.innerHTML='<span>深色底</span><input type="color" id="cw-bg-ink">';params.append(ink);ink.querySelector('input').addEventListener('input',e=>{settings.ink=e.target.value;persist();schedule()});
    controls.querySelector('select').addEventListener('change',e=>{settings.mode=e.target.value;settings.light=settings.mode==='dim'?55:100;settings.sat=settings.mode==='desat'?15:100;present();persist();schedule()});
    controls.querySelector('[data-cw-filter-reset]').addEventListener('click',()=>{Object.assign(settings,defaults);persist();present();schedule()});host.append(controls);present();
  }
  function present(){if(!controls)return;controls.querySelector('select').value=settings.mode;for(const row of controls.querySelectorAll('[data-param]')){const name=row.dataset.param;row.hidden=settings.mode==='none'||(name==='pixel'&&settings.mode!=='pixel')||(['levels','dots','ink'].includes(name)&&settings.mode!=='bayer');row.querySelector('input').value=settings[name];const out=row.querySelector('output');if(out)out.textContent=settings[name]+(['light','sat'].includes(name)?'%':'');}}
  function workerForJob(){
    if(workerTried)return worker;workerTried=true;
    if(!win.Worker||!win.OffscreenCanvas)return null;
    let url;try{url=win.URL.createObjectURL(new Blob([processBackground.toString()+';onmessage=async e=>{try{const result=await processBackground(e.data);postMessage({...result,id:e.data.id})}catch(error){postMessage({id:e.data.id,error:error.message})}}'],{type:'text/javascript'}));worker=new win.Worker(url);worker.onmessage=e=>{const job=jobs.get(e.data.id);if(!job)return;jobs.delete(e.data.id);e.data.error?job.reject(Error(e.data.error)):job.resolve(e.data)};worker.onerror=()=>{worker?.terminate();worker=null;for(const job of jobs.values())job.reject(Error('后台处理不可用'));jobs.clear()};}catch{worker=null}finally{if(url)win.URL.revokeObjectURL(url)}return worker;
  }
  async function generate(source,params){
    const cacheKey=JSON.stringify([source,params]);if(cache.has(cacheKey)){const value=cache.get(cacheKey);cache.delete(cacheKey);cache.set(cacheKey,value);return value;}
    const response=await win.fetch(source);if(!response.ok)throw Error('背景图片读取失败');const bitmap=await win.createImageBitmap(await response.blob());const w=workerForJob();let result;
    if(w){try{result=await new Promise((resolve,reject)=>{const id=++jobId;jobs.set(id,{resolve,reject});w.postMessage({...params,bitmap,id},[bitmap])})}catch{
      if(destroyed||!enabled()||settings.mode==='none')return null;
      // A transferred bitmap cannot be reused after Worker/CSP failure.
      const replacement=await win.createImageBitmap(await(await win.fetch(source)).blob());result=await processBackground({...params,bitmap:replacement});
    }}else result=await processBackground({...params,bitmap});
    if(destroyed||!enabled()||settings.mode==='none')return null;
    const value={blob:result.blob,width:result.width,height:result.height};cache.set(cacheKey,value);while(cache.size>4)cache.delete(cache.keys().next().value);return value;
  }
  function release(layer){layer.observer.disconnect();layer.node.removeEventListener('transitionend',schedule);layer.image.remove();if(layer.url)win.URL.revokeObjectURL(layer.url);}
  function clearLayers(){for(const layer of layers.values())release(layer);layers.clear();bodyObserver?.disconnect();bodyObserver=null;rootObserver?.disconnect();rootObserver=null;}
  async function render(){
    const current=++epoch;if(destroyed||!enabled()||settings.mode==='none'){clearLayers();status('滤镜已关闭');return;}
    if(!bodyObserver){bodyObserver=new win.MutationObserver(schedule);bodyObserver.observe(doc.body,{childList:true});rootObserver=new win.MutationObserver(schedule);rootObserver.observe(doc.documentElement,{attributes:true,attributeFilter:['data-cw-sheet','data-cw-sheet-anim','data-cw-v4-settings','data-claude-layout']});}
    const nodes=[...doc.querySelectorAll('body > #bg1,body > #bg_custom,body > #bg_animation')];
    for(const [node,layer]of layers)if(!nodes.includes(node)){release(layer);layers.delete(node);}
    let count=0;for(const node of nodes){
      const style=win.getComputedStyle(node),background=node.style.backgroundImage||style.backgroundImage; let urlValue=background.startsWith("url(")&&background.endsWith(")")?background.slice(4,-1):""; if(urlValue.charCodeAt(0)===34||urlValue.charCodeAt(0)===39)urlValue=urlValue.slice(1,-1); const match=urlValue?[null,urlValue]:null;let layer=layers.get(node);
      // ST animates background-image through cross-fade(). Prefer the native
      // target URL, and keep observing even while a layer is hidden or empty.
      if(!layer){const image=doc.createElement('img');image.className='cw-background-filter';image.alt='';image.setAttribute('aria-hidden','true');const observer=new win.MutationObserver(schedule);observer.observe(node,{attributes:true,attributeFilter:['style','class'],childList:true});node.addEventListener('transitionend',schedule);layer={node,image,observer,url:null,signature:''};layers.set(node,layer);}
      if(!match||style.display==='none'){if(layer.image.isConnected)layer.image.remove();if(layer.url)win.URL.revokeObjectURL(layer.url);layer.url=null;layer.signature='';continue;}
      const rect=node.getBoundingClientRect();if(!rect.width||!rect.height)continue;const source=match[1];count++;
      if(layer.image.parentNode!==node)node.append(layer.image);
      const {image}=layer;image.style.setProperty('filter','brightness('+settings.light/100+') saturate('+settings.sat/100+')','important');image.style.setProperty('image-rendering',['pixel','bayer'].includes(settings.mode)?'pixelated':'auto','important');
      const density=win.devicePixelRatio||1,params={mode:settings.mode,pixel:settings.pixel,levels:settings.levels,dots:settings.dots,ink:settings.ink,density,targetWidth:Math.ceil(rect.width*density),targetHeight:Math.ceil(rect.height*density)},signature=JSON.stringify([source,params]);
      if(layer.signature===signature)continue;
      try{
        let url=source,owned=false;if(['pixel','bayer'].includes(settings.mode)){if(params.targetWidth*params.targetHeight>20000000)throw Error('背景尺寸过大，请减小窗口或像素密度后重试');status('正在生成背景…');const result=await generate(source,params);if(current!==epoch||!result)return;url=win.URL.createObjectURL(result.blob);owned=true;}
        if(current!==epoch){if(owned)win.URL.revokeObjectURL(url);return;}const old=layer.url;image.src=url;image.dataset.cwEffect=settings.mode;layer.url=owned?url:null;layer.signature=signature;if(old)win.URL.revokeObjectURL(old);
      }catch(error){if(current!==epoch)return;image.removeAttribute('src');layer.signature='';status('滤镜未应用：'+error.message+'。原始背景保留。');return;}
    }
    if(current===epoch)status(count?(['pixel','bayer'].includes(settings.mode)?'背景已处理；换图或改参数时重新生成。':'背景滤镜已应用。'):'当前背景没有可处理的静态图片。');
  }
  const resize=()=>{if(settings.mode!=='none'&&enabled())schedule()};win.addEventListener('resize',resize);
  function stop(){win.clearTimeout(timer);timer=0;epoch++;clearLayers();cache.clear();worker?.terminate();worker=null;workerTried=false;for(const job of jobs.values())job.reject(Error('滤镜已停止'));jobs.clear();}
  return {sync(){if(destroyed)return;if(!enabled()){if(layers.size||worker||bodyObserver)stop();return;}mount();if(settings.mode!=='none'&&!bodyObserver)schedule();},destroy(){if(destroyed)return;destroyed=true;stop();win.removeEventListener('resize',resize);controls?.remove();controls=null;}};
}
