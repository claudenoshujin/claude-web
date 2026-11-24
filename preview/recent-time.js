// One timestamp policy for recent-chat ordering, act numbers and sidebar dates.
export function parseRecentTime(value) {
  const text=String(value??'').trim();if(!text)return null;
  if(/^[0-9]+$/.test(text)){
    if(text.length!==10&&text.length!==13)return null;
    const ms=Number(text)*(text.length===10?1000:1);return Number.isFinite(new Date(ms).getTime())?ms:null;
  }
  const custom=text.replaceAll(' ','').match(/^([0-9]{4})-([0-9]{1,2})-([0-9]{1,2})@([0-9]{1,2})h([0-9]{1,2})m(?:([0-9]{1,2})s(?:([0-9]{1,3})ms)?)?$/);
  if(custom){
    const [,y,m,d,h,min,s='0',ms='0']=custom,day=new Date(+y,+m-1,+d,+h,+min,+s,+ms);
    if(day.getFullYear()!==+y||day.getMonth()!==+m-1||day.getDate()!==+d||day.getHours()!==+h||day.getMinutes()!==+min||day.getSeconds()!==+s||day.getMilliseconds()!==+ms)return null;
    return day.getTime();
  }
  const ms=Date.parse(text.replace(/([0-9]) *(am|pm)(?![a-z])/i,'$1 $2'));
  return Number.isFinite(ms)?ms:null;
}
