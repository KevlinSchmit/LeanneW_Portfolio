const nodes=[...document.querySelectorAll('.video-node')];let active=null,pinned=false,timer;
function position(node){const dot=node.querySelector('button'),preview=node.querySelector('.video-preview'),r=dot.getBoundingClientRect(),w=preview.offsetWidth,h=preview.offsetHeight;preview.style.left=Math.max(16,Math.min(innerWidth-w-16,r.left+r.width/2-w/2))+'px';preview.style.top=Math.max(16,Math.min(innerHeight-h-16,r.top+r.height/2-h/2))+'px'}
function hide(){clearTimeout(timer);for(const node of nodes){node.querySelector('.video-preview').classList.remove('visible');node.querySelector('button').setAttribute('aria-expanded','false');node.querySelector('video').pause()}active=null;pinned=false}
function show(node){clearTimeout(timer);const changed=active!==node;if(changed){hide();active=node}position(node);node.querySelector('.video-preview').classList.add('visible');node.querySelector('button').setAttribute('aria-expanded','true');if(changed)videoReady.get(node).then(()=>{if(active===node)node.querySelector('video').play().catch(()=>{})}).catch(()=>{})}
function leave(){if(!pinned)timer=setTimeout(hide,180)}
for(const node of nodes){const dot=node.querySelector('button'),preview=node.querySelector('.video-preview');dot.addEventListener('pointerenter',e=>{if(e.pointerType==='mouse'&&(!pinned||active===node))show(node)});dot.addEventListener('pointerleave',leave);preview.addEventListener('pointerenter',()=>clearTimeout(timer));preview.addEventListener('pointerdown',()=>{clearTimeout(timer);pinned=true},true);preview.querySelector('video').addEventListener('seeking',()=>{clearTimeout(timer);pinned=true});preview.addEventListener('pointerleave',leave);dot.addEventListener('focus',()=>show(node));dot.addEventListener('click',()=>{if(active===node&&pinned)hide();else{show(node);pinned=true}});node.addEventListener('focusout',()=>{setTimeout(()=>{if(!node.contains(document.activeElement)&&!pinned)hide()},0)})}
document.addEventListener('pointerdown',e=>{if(!e.target.closest('.video-node'))hide()});document.addEventListener('keydown',e=>{if(e.key==='Escape'){hide()}});window.addEventListener('resize',()=>{if(active)position(active)});
// A complete local Blob gives native controls a seekable file even when the
// static host does not serve byte-range responses for MP4 assets.
const videoReady=new Map();
for(const node of nodes){
  const video=node.querySelector('video'),preview=node.querySelector('.video-preview');
  const status=document.createElement('p');status.className='video-loading';status.textContent='Loading video…';status.setAttribute('role','status');preview.append(status);
  const url=video.querySelector('source').src;
  const ready=fetch(url).then(response=>{if(!response.ok)throw new Error('Video download failed');return response.blob()}).then(blob=>{
    const objectUrl=URL.createObjectURL(new Blob([blob],{type:'video/mp4'}));
    video.querySelector('source').remove();video.src=objectUrl;video.load();status.remove();
  }).catch(error=>{status.textContent='Unable to load video. Please refresh to try again.';throw error});
  videoReady.set(node,ready);ready.catch(()=>{});
}
