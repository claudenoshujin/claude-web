// Body-relative costume cells; physics, hit boxes and stored positions stay native.
const PAL={'#':'#d97757',s:'#bf684c',o:'#2b1d17',w:'#fbf8f1',e:'#ece7de',k:'#cdc6ba',K:'#1a1820',D:'#ee7d31',P:'#7a5aa6',L:'#c9b3f7',g:'#ffcd73',C:'#2b2239',R:'#a33a4a',A:'#ff8a09',W:'#fff9ef'};
const BODY=['..############..','..############..','..############..','################','################','..############..','..############..','..############..'];
const CAPE=['C..............C','CR............RC','CR.KKKKKKKKKK.RC','CC.KWKKKKKKWK.CC','CCC.KKK..KKK.CCC','CCCCC......CCCCC','CCCCCCCAACCCCCCC','CCCCCC.AA.CCCCCC','CCCC........CCCC','CCC..........CCC','CC............CC'];
const HAT=['....PPPP........','...PP..PP.......','...P....PP......','.......KK.......','......KKKK......','......KKDK......','.....KKKKKK.....','.....KDKKKK.....','....KKKKKDKK....','....KKDKKKKK....','...KKKKKKKKKK...','.KKKKKKKKKKKKKK.'];
export function halloweenPileCells(name,eyes,pose,face,by){
  let c=[];const grid=(rows,x,y)=>rows.forEach((row,j)=>[...row].forEach((ch,i)=>{if(ch!=='.')c.push([i+x,j+y,PAL[ch]||ch]);}));
  // The sheet glides at a fixed height; native pose changes must not reveal a body or feet.
  if(name==='cowboy')by=8;else grid(BODY,0,by);
  if(name==='cowboy'){
    grid(['......kkkkkk......','....kkwwwwwwkk....','...kwwwwwwwwwwk...','..kwwwwwwwwwwwek..','.kwwwwwwwwwwwwwek.',eyes==='open'?'.kwwwowwwwwwowwek.':'.kwwwwwwwwwwwwwek.',eyes==='open'?'.kwwwowwwwwwowwek.':'.kwwoowwwwwwoowek.','kwwwwwwwwwwwwwwwek','kwwwwwwwwwwwwwwwek','.kwwwwwwwwwwwwwek.','.kwwwkwwwwwkwwwek.','.kkkk.kkkkk.kkkkk.'], -1,by-4);
  }else{
    if(name==='wizard')grid(HAT,0,by-12);
    if(name==='shades')grid(CAPE,0,by-1);
    else if(eyes==='shut')grid(['..oo......oo....'],face+1,by+2);
    else if(eyes==='half')grid(['....o......o....'],face,by+2);
    else grid(['....o......o....','....o......o....'],face,by+1);
  }
  c=c.filter(([,y])=>y<=by+7);
  if(name!=='cowboy'){
    if(pose==='stand')grid(['...#.#....#.#...','...#.#....#.#...'],0,by+8);
    if(pose==='dangleA')grid(['...#.#....#.#...','...#.#..........','...#.#..........'],0,by+8);
    if(pose==='dangleB')grid(['...#.#....#.#...','..........#.#...','..........#.#...'],0,by+8);
  }
  return c;
}
