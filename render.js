const categories = [['published','Published articles'],['review','Under review'],['conference','Conference presentations'],['outreach','Science outreach']];
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
function linkFor(item) {
  const raw = item.url || (item.doi ? 'https://doi.org/'+item.doi : '');
  if (!raw) return '';
  const url = new URL(raw);
  if (url.protocol !== 'https:') throw new Error('Links must use HTTPS.');
  return url.href;
}
function link(url,label) {
  return `<a href="${escape(url)}" target="_blank" rel="noopener noreferrer">${escape(label)}<span class="sr-only"> (opens in a new tab)</span></a>`;
}
function actions(item) {
  const result=[];
  const url=item.category==='review'?'':linkFor(item);
  const kind=item.category==='conference'?(item.linkType==='abstract'?'abstract':item.linkType==='poster'?'poster':'presentation'):item.category==='outreach'?'presentation':'article';
  if(url) result.push(link(url,'View '+kind+(item.openAccess?' (open access)':'')));
  for(const preprint of item.preprints||[]) {
    const url=linkFor(preprint);
    if(url)result.push(link(url,'View preprint (open access)'));
  }
  return result.length?`<div class="actions">${result.join('')}</div>`:'';
}
export function renderPublications(catalog) {
  if(!Array.isArray(catalog))throw new Error('Invalid reference list.');
  const ids=new Set();
  for(const p of catalog){
    if(!/^[a-z0-9-]+$/.test(p.id)||ids.has(p.id))throw new Error('Invalid or duplicate reference identifier.');
    ids.add(p.id);
    if(!categories.some(([key])=>key===p.category))throw new Error('Unknown category.');
    linkFor(p);for(const preprint of p.preprints||[])linkFor(preprint);
  }
  const navigation=categories.map(([key,label])=>{
    const count=catalog.filter(p=>p.category===key).length;
    return count?`<a href="#${key}">${label} <span>${count}</span></a>`:'';
  }).join('');
  const html=categories.map(([key,label])=>{
    const entries=catalog.filter(p=>p.category===key);
    if(!entries.length)return '';
    const years=[...new Set(entries.map(p=>p.year))].sort((a,b)=>(b||0)-(a||0));
    return `<section class="category-section" id="${key}" aria-labelledby="heading-${key}"><div class="category-heading"><h2 id="heading-${key}">${label}</h2><span>${entries.length}</span></div>${years.map(year=>`<section class="year-group"><h3>${escape(year||'')}</h3><div>${entries.filter(p=>p.year===year).map(p=>`<article><p class="journal">${escape(p.journal)}</p><h4 lang="${escape(p.language||'en')}">${escape(p.title)}</h4>${p.authors?`<p class="authors">${escape(p.authors)}</p>`:''}${p.note?`<p class="document-note">${escape(p.note)}</p>`:''}${actions(p)}</article>`).join('')}</div></section>`).join('')}</section>`;
  }).join('');
  return {html,navigation,count:catalog.length};
}
