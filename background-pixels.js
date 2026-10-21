// Independent preview algorithm. No fork code is imported or copied.
export async function processBackground({bitmap,mode,pixel,levels,dots,ink,targetWidth,targetHeight,density=1}){
 const width=Math.max(1,Math.ceil(targetWidth)),height=Math.max(1,Math.ceil(targetHeight));
 const make=(w,h)=>typeof OffscreenCanvas!=='undefined'?new OffscreenCanvas(w,h):Object.assign(document.createElement('canvas'),{width:w,height:h});
 const canvas=make(width,height),ctx=canvas.getContext('2d',{willReadFrequently:mode==='bayer'}),cover=Math.max(width/bitmap.width,height/bitmap.height),sw=width/cover,sh=height/cover,sx=(bitmap.width-sw)/2,sy=(bitmap.height-sh)/2;
 if(mode==='pixel'){
  const block=Math.max(1,Math.round(pixel*density)),small=make(Math.ceil(width/block),Math.ceil(height/block));
  small.getContext('2d').drawImage(bitmap,sx,sy,sw,sh,0,0,small.width,small.height);
  ctx.imageSmoothingEnabled=false;ctx.drawImage(small,0,0,small.width*block,small.height*block);
 }else ctx.drawImage(bitmap,sx,sy,sw,sh,0,0,width,height);
 bitmap.close?.();dots=Math.max(1,Math.round(dots*density));
 if(mode==='bayer'){const image=ctx.getImageData(0,0,width,height),data=image.data,matrix=[0,8,2,10,12,4,14,6,3,11,1,9,15,7,13,5],base=ink.match(/[a-f0-9]{2}/gi).map(x=>parseInt(x,16));for(let y=0;y<height;y++)for(let x=0;x<width;x++){const threshold=(matrix[(Math.floor(y/dots)%4)*4+Math.floor(x/dots)%4]+.5)/16-.5,i=(y*width+x)*4;for(let c=0;c<3;c++){const q=Math.max(0,Math.min(levels-1,Math.round(data[i+c]/255*(levels-1)+threshold)))/(levels-1);data[i+c]=base[c]+q*(255-base[c])}}ctx.putImageData(image,0,0);}
 const blob=canvas.convertToBlob?await canvas.convertToBlob({type:'image/png'}):await new Promise(r=>canvas.toBlob(r,'image/png'));return {blob,width:canvas.width,height:canvas.height};
}
