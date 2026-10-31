import {renderPublications} from './render.js';

// The pre-rendered bibliography remains usable if this update fails.
try {
  const response=await fetch(new URL('./publications.json',import.meta.url),{cache:'no-cache'});
  if(!response.ok)throw new Error('Reference list unavailable.');
  const result=renderPublications(await response.json());
  document.querySelector('#publications').innerHTML=result.html;
  document.querySelector('.categories').innerHTML=result.navigation;
  document.querySelector('.count').textContent=String(result.count);
} catch(error) {
  console.error('Could not refresh the reference list:',error);
}
