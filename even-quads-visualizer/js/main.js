"use strict";

/* ---------- icon sources — loaded from js/icons.js (base64, avoids file:// CORS) ---------- */
const ICON_SRC = ICON_DATA;
const COLORS = ["#4a63c0", "#8a4fc9", "#d6932e", "#c24a86"];
const COUNT_VALUES = [1, 2, 3, 4];
const VALID_COLOR = 0x4fb3a9;
const INVALID_COLOR = 0xe2654b;
const SELECT_COLOR = "#d7a33d";

/* ---------- state ---------- */
// mode per bit: 'free' | 'fix'
let bitMode = ["free","free","free","fix","fix","fix"];
let bitFixedVal = [0,0,0,0,0,0];
let selected = []; // array of vertexId (0..7), order = selection order

/* ---------- load icons ---------- */
const iconImgs = {};
let iconsLoaded = 0;
function loadIcons(cb){
  const keys = Object.keys(ICON_SRC);
  keys.forEach(k=>{
    const img = new Image();
    img.onload = ()=>{ iconsLoaded++; if(iconsLoaded===keys.length) cb(); };
    img.src = ICON_SRC[k];
    iconImgs[k] = img;
  });
}

/* ---------- card texture rendering ---------- */
const tintCache = {};
function tintedIcon(shapeKey, colorIdx){
  const cacheKey = shapeKey+"-"+colorIdx;
  if(tintCache[cacheKey]) return tintCache[cacheKey];
  const img = iconImgs[shapeKey];
  const c = document.createElement("canvas");
  c.width = img.width; c.height = img.height;
  const ctx = c.getContext("2d");
  ctx.drawImage(img,0,0);
  ctx.globalCompositeOperation = "source-in";
  ctx.fillStyle = COLORS[colorIdx];
  ctx.fillRect(0,0,c.width,c.height);
  tintCache[cacheKey] = c;
  return c;
}

function attrVal(vec, hiIdx, loIdx){ return vec[hiIdx]*2 + vec[loIdx]; }

function makeCardCanvas(vector, isSelected, selOrder){
  const S = 320;
  const c = document.createElement("canvas");
  c.width = S; c.height = S;
  const ctx = c.getContext("2d");

  const shapeVal = attrVal(vector,0,1);
  const colorVal = attrVal(vector,2,3);
  const count = attrVal(vector,4,5) + 1; // 1..4 copies of the shape
  const shapeKey = ""+vector[0]+vector[1];

  // card body
  const pad = 14, r = 22;
  roundRect(ctx, pad, pad, S-pad*2, S-pad*2, r);
  ctx.fillStyle = "#ede7da";
  ctx.fill();
  ctx.lineWidth = isSelected ? 7 : 2;
  ctx.strokeStyle = isSelected ? SELECT_COLOR : "#33384a";
  ctx.stroke();

  // icons — stacked vertically, one per count (1-4), all the same size
  const tinted = tintedIcon(shapeKey, colorVal);
  const ar = tinted.width / tinted.height;
  const areaTop = pad + 20, areaBottom = S - pad - 46;
  const areaW = S - pad*2 - 56, areaH = areaBottom - areaTop;
  const gap = 10;

  let itemH = (areaH - gap*(count-1)) / count;
  let itemW = itemH * ar;
  if(itemW > areaW){ itemW = areaW; itemH = itemW / ar; }
  const totalH = itemH*count + gap*(count-1);
  const startY = areaTop + (areaH - totalH)/2;

  for(let i=0;i<count;i++){
    const y = startY + i*(itemH+gap);
    ctx.drawImage(tinted, (S-itemW)/2, y, itemW, itemH);
  }

  // binary label
  ctx.font = "600 18px ui-monospace, SFMono-Regular, Menlo, monospace";
  ctx.fillStyle = "#6b6052";
  ctx.textAlign = "center";
  ctx.fillText(vector.join(""), S/2, S-pad-14);

  // selection order badge
  if(isSelected){
    ctx.beginPath();
    ctx.arc(S-pad-22, pad+22, 18, 0, Math.PI*2);
    ctx.fillStyle = SELECT_COLOR;
    ctx.fill();
    ctx.fillStyle = "#1a1305";
    ctx.font = "800 18px ui-monospace, monospace";
    ctx.fillText(String(selOrder), S-pad-22, pad+28);
  }
  return c;
}

function roundRect(ctx,x,y,w,h,r){
  ctx.beginPath();
  ctx.moveTo(x+r,y);
  ctx.arcTo(x+w,y,x+w,y+h,r);
  ctx.arcTo(x+w,y+h,x,y+h,r);
  ctx.arcTo(x,y+h,x,y,r);
  ctx.arcTo(x,y,x+w,y,r);
  ctx.closePath();
}

/* ---------- three.js setup ---------- */
const canvas = document.getElementById("three-canvas");
const renderer = new THREE.WebGLRenderer({ canvas, antialias:true, alpha:true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio,2));
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, 1, 0.1, 100);

const rig = new THREE.Group();
scene.add(rig);
const cubeGroup = new THREE.Group();
rig.add(cubeGroup);
const fillGroup = new THREE.Group();
rig.add(fillGroup);
const labelGroup = new THREE.Group();
rig.add(labelGroup);

let radius = 6.2, theta = 0.7, phi = 1.05;
function updateCamera(){
  camera.position.set(
    radius*Math.sin(phi)*Math.cos(theta),
    radius*Math.cos(phi),
    radius*Math.sin(phi)*Math.sin(theta)
  );
  camera.lookAt(0,0,0);
}
updateCamera();

function resize(){
  const w = canvas.clientWidth, h = canvas.clientHeight;
  renderer.setSize(w,h,false);
  camera.aspect = w/h;
  camera.updateProjectionMatrix();
}
window.addEventListener("resize", resize);

/* orbit controls (manual, no external deps) */
let dragging=false, lastX=0, lastY=0, interacted=false;
canvas.addEventListener("pointerdown", e=>{ dragging=true; lastX=e.clientX; lastY=e.clientY; });
window.addEventListener("pointerup", ()=> dragging=false);
window.addEventListener("pointermove", e=>{
  if(!dragging) return;
  const dx=e.clientX-lastX, dy=e.clientY-lastY;
  lastX=e.clientX; lastY=e.clientY;
  theta -= dx*0.006;
  phi = Math.min(Math.max(phi - dy*0.006, 0.18), Math.PI-0.18);
  updateCamera();
  markInteracted();
});
canvas.addEventListener("wheel", e=>{
  e.preventDefault();
  radius = Math.min(Math.max(radius + e.deltaY*0.0035, 3.2), 14);
  updateCamera();
  markInteracted();
}, { passive:false });
function markInteracted(){
  if(interacted) return;
  interacted = true;
  const hint = document.getElementById("hint");
  hint.style.opacity = "0";
}

/* sprites for cards, registered for raycasting */
let cardSprites = []; // index = vertexId 0..7
let cardData = [];    // {vector, position}
const S = 1.3;

function freeIndices(){ const r=[]; for(let i=0;i<6;i++) if(bitMode[i]==="free") r.push(i); return r; }

function rebuildScene(){
  // clear
  cubeGroup.clear(); fillGroup.clear(); labelGroup.clear();
  cardSprites = []; cardData = [];

  const free = freeIndices();
  const ok = free.length===3;
  document.getElementById("empty-state").classList.toggle("show", !ok);
  document.getElementById("empty-count").textContent = free.length+" / 3";
  canvas.style.display = ok ? "block" : "none";
  updateFreeCountUI();
  updateAxisCaption(free, ok);

  selected = [];

  if(!ok){ updateAnalysis(); return; }

  // 8 vertices
  for(let combo=0; combo<8; combo++){
    const bits = [(combo>>2)&1, (combo>>1)&1, combo&1];
    const vector = new Array(6);
    free.forEach((idx,axis)=>{ vector[idx] = bits[axis]; });
    for(let i=0;i<6;i++) if(bitMode[i]==="fix") vector[i] = bitFixedVal[i];

    const pos = new THREE.Vector3(
      (bits[0]?1:-1)*S, (bits[1]?1:-1)*S, (bits[2]?1:-1)*S
    );
    cardData[combo] = { vector, pos, bits };
  }

  // edges (hamming distance 1 among the 3 free-bit coords)
  const edgeMat = new THREE.LineBasicMaterial({ color:0x3a3f52, transparent:true, opacity:0.55 });
  for(let a=0;a<8;a++) for(let b=a+1;b<8;b++){
    const ba=[(a>>2)&1,(a>>1)&1,a&1], bb=[(b>>2)&1,(b>>1)&1,b&1];
    let diff=0; for(let k=0;k<3;k++) if(ba[k]!==bb[k]) diff++;
    if(diff===1){
      const geo = new THREE.BufferGeometry().setFromPoints([cardData[a].pos, cardData[b].pos]);
      cubeGroup.add(new THREE.Line(geo, edgeMat));
    }
  }

  // axis end labels
  free.forEach((idx,axis)=>{
    const dir = new THREE.Vector3(axis===0?1:0, axis===1?1:0, axis===2?1:0);
    [0,1].forEach(val=>{
      const sprite = makeTextSprite("x"+(idx+1)+"="+val, axis);
      sprite.position.copy(dir.clone().multiplyScalar((val?1:-1)*S*1.55));
      labelGroup.add(sprite);
    });
  });

  // card sprites
  for(let combo=0; combo<8; combo++){
    const tex = new THREE.CanvasTexture(makeCardCanvas(cardData[combo].vector, false, 0));
    tex.needsUpdate = true;
    const mat = new THREE.SpriteMaterial({ map: tex, transparent:true });
    const sprite = new THREE.Sprite(mat);
    sprite.position.copy(cardData[combo].pos);
    sprite.scale.set(1.05,1.05,1);
    sprite.userData.vertexId = combo;
    cubeGroup.add(sprite);
    cardSprites[combo] = sprite;
  }

  updateAnalysis();
}

function makeTextSprite(text, axisHint){
  const c = document.createElement("canvas");
  c.width=160; c.height=64;
  const ctx = c.getContext("2d");
  ctx.font="700 30px ui-monospace, monospace";
  ctx.fillStyle = ["#e2654b","#4fb3a9","#d7a33d"][axisHint] || "#aab";
  ctx.textAlign="center"; ctx.textBaseline="middle";
  ctx.fillText(text, 80, 34);
  const tex = new THREE.CanvasTexture(c);
  const mat = new THREE.SpriteMaterial({ map:tex, transparent:true, depthTest:false });
  const sp = new THREE.Sprite(mat);
  sp.scale.set(0.62,0.25,1);
  sp.renderOrder = 5;
  return sp;
}

function refreshCardTexture(combo){
  const isSel = selected.includes(combo);
  const order = isSel ? selected.indexOf(combo)+1 : 0;
  const tex = new THREE.CanvasTexture(makeCardCanvas(cardData[combo].vector, isSel, order));
  tex.needsUpdate = true;
  cardSprites[combo].material.map.dispose();
  cardSprites[combo].material.map = tex;
}

/* ---------- raycasting / selection ---------- */
const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();
canvas.addEventListener("click", e=>{
  if(freeIndices().length!==3) return;
  const moved = Math.hypot(e.clientX-lastX, e.clientY-lastY);
  const rect = canvas.getBoundingClientRect();
  mouse.x = ((e.clientX-rect.left)/rect.width)*2-1;
  mouse.y = -((e.clientY-rect.top)/rect.height)*2+1;
  raycaster.setFromCamera(mouse, camera);
  const hits = raycaster.intersectObjects(cardSprites);
  if(hits.length===0) return;
  const vId = hits[0].object.userData.vertexId;
  toggleSelect(vId);
});

function toggleSelect(vId){
  const i = selected.indexOf(vId);
  if(i>=0){
    selected.splice(i,1);
  } else {
    if(selected.length>=4) selected.shift();
    selected.push(vId);
  }
  // refresh affected textures (all, since order numbers may shift)
  for(let c=0;c<8;c++) refreshCardTexture(c);
  updateAnalysis();
}

/* ---------- geometry classification ---------- */
function tripleProduct(p0,p1,p2,p3){
  const a=[p1.x-p0.x,p1.y-p0.y,p1.z-p0.z];
  const b=[p2.x-p0.x,p2.y-p0.y,p2.z-p0.z];
  const c=[p3.x-p0.x,p3.y-p0.y,p3.z-p0.z];
  const cross=[ a[1]*b[2]-a[2]*b[1], a[2]*b[0]-a[0]*b[2], a[0]*b[1]-a[1]*b[0] ];
  return cross[0]*c[0]+cross[1]*c[1]+cross[2]*c[2];
}

function classifyGeometry(ids){
  const pts = ids.map(id=>cardData[id].bits); // raw 0/1 coords, not scaled
  const v3 = ids.map(id=>new THREE.Vector3(...cardData[id].bits));
  const vol = tripleProduct(v3[0],v3[1],v3[2],v3[3]);
  const coplanar = Math.abs(vol) < 1e-6;

  const dists = [];
  for(let a=0;a<4;a++) for(let b=a+1;b<4;b++){
    const dx=pts[a][0]-pts[b][0], dy=pts[a][1]-pts[b][1], dz=pts[a][2]-pts[b][2];
    dists.push(dx*dx+dy*dy+dz*dz);
  }
  dists.sort((a,b)=>a-b);
  const counts = {1:0,2:0,3:0};
  dists.forEach(d=> counts[d] = (counts[d]||0)+1 );

  let name, detail;
  if(coplanar){
    const sharedAxis = [0,1,2].find(ax => pts.every(p=>p[ax]===pts[0][ax]));
    if(sharedAxis!==undefined){ name="Square face"; }
    else{ name="Rectangle (diagonal slice)"; }
  } else {
    const allEqual = dists.every(d=>d===dists[0]);
    name = allEqual ? "Regular tetrahedron" : "Tetrahedron (irregular)";
  }
  detail = (counts[1]||0)+"× edge · "+(counts[2]||0)+"× face-diag · "+(counts[3]||0)+"× space-diag";
  return { name, detail, coplanar, ids: ids.map(id=>v3[ids.indexOf(id)]) };
}

/* ---------- fills + connecting edges for the active selection ---------- */
function rebuildSelectionVisuals(validOverall){
  fillGroup.clear();
  if(selected.length!==4) return;
  const color = validOverall ? VALID_COLOR : INVALID_COLOR;
  const pts = selected.map(id=>cardData[id].pos);

  // connecting edges as thin cylinders
  for(let a=0;a<4;a++) for(let b=a+1;b<4;b++){
    const p1=pts[a], p2=pts[b];
    const dSq = p1.distanceToSquared(p2);
    const isShort = Math.abs(dSq - (2*S)*(2*S)) < 1e-3; // unit cube edge (length 2S)
    fillGroup.add(makeEdge(p1,p2,color,isShort?0.045:0.022, isShort?0.95:0.55));
  }

  const geomInfo = classifyGeometry(selected);
  if(geomInfo.coplanar){
    const ordered = sortPlanar(pts);
    fillGroup.add(makePolyFill(ordered, color));
  } else {
    const tris = [[0,1,2],[0,1,3],[0,2,3],[1,2,3]];
    tris.forEach(tri=>{
      fillGroup.add(makeTriFill([pts[tri[0]],pts[tri[1]],pts[tri[2]]], color));
    });
  }
}

function makeEdge(p1,p2,colorHex,radius,opacity){
  const dir = new THREE.Vector3().subVectors(p2,p1);
  const len = dir.length();
  const geo = new THREE.CylinderGeometry(radius,radius,len,8);
  const mat = new THREE.MeshBasicMaterial({ color:colorHex, transparent:true, opacity });
  const mesh = new THREE.Mesh(geo,mat);
  const mid = new THREE.Vector3().addVectors(p1,p2).multiplyScalar(0.5);
  mesh.position.copy(mid);
  mesh.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0), dir.clone().normalize());
  return mesh;
}

function sortPlanar(pts){
  const centroid = new THREE.Vector3();
  pts.forEach(p=>centroid.add(p));
  centroid.multiplyScalar(0.25);
  const normal = new THREE.Vector3().subVectors(pts[1],pts[0]).cross(new THREE.Vector3().subVectors(pts[2],pts[0])).normalize();
  let u = new THREE.Vector3().subVectors(pts[0],centroid).normalize();
  let v = new THREE.Vector3().crossVectors(normal,u);
  const withAngle = pts.map(p=>{
    const rel = new THREE.Vector3().subVectors(p,centroid);
    const ang = Math.atan2(rel.dot(v), rel.dot(u));
    return { p, ang };
  });
  withAngle.sort((a,b)=>a.ang-b.ang);
  return withAngle.map(w=>w.p);
}

function makePolyFill(orderedPts, colorHex){
  const geo = new THREE.BufferGeometry();
  const verts = [];
  const [a,b,c,d] = orderedPts;
  verts.push(a.x,a.y,a.z, b.x,b.y,b.z, c.x,c.y,c.z);
  verts.push(a.x,a.y,a.z, c.x,c.y,c.z, d.x,d.y,d.z);
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts,3));
  geo.computeVertexNormals();
  const mat = new THREE.MeshBasicMaterial({ color:colorHex, transparent:true, opacity:0.22, side:THREE.DoubleSide, depthWrite:false });
  return new THREE.Mesh(geo,mat);
}
function makeTriFill(p3, colorHex){
  const geo = new THREE.BufferGeometry();
  const verts = [];
  p3.forEach(p=>verts.push(p.x,p.y,p.z));
  geo.setAttribute("position", new THREE.Float32BufferAttribute(verts,3));
  geo.computeVertexNormals();
  const mat = new THREE.MeshBasicMaterial({ color:colorHex, transparent:true, opacity:0.16, side:THREE.DoubleSide, depthWrite:false });
  return new THREE.Mesh(geo,mat);
}

/* ---------- analysis panel ---------- */
const ATTRS = [
  {name:"Shape", hi:0, lo:1},
  {name:"Color", hi:2, lo:3},
  {name:"Count", hi:4, lo:5},
];

function updateAnalysis(){
  document.getElementById("sel-count").textContent = selected.length;
  renderSlots();

  const attrlines = document.getElementById("attrlines");
  const verdict = document.getElementById("verdict");
  const geomEl = document.getElementById("geom");

  if(selected.length<4){
    attrlines.innerHTML = ATTRS.map(a=>`
      <div class="attrline"><span>${a.name}</span><span class="chip wait">pick ${4-selected.length} more</span></div>
    `).join("");
    verdict.className = "";
    verdict.textContent = selected.length===0 ? "select 4 cards" : selected.length+" / 4 selected";
    geomEl.textContent = "select 4 cards to classify their shape";
    rebuildSelectionVisuals(false);
    return;
  }

  const vectors = selected.map(id=>cardData[id].vector);
  let allValid = true;
  attrlines.innerHTML = ATTRS.map(a=>{
    const vals = vectors.map(v=>v[a.hi]*2+v[a.lo]);
    const xorSum = vals.reduce((acc,v)=>acc^v, 0);
    const uniq = new Set(vals);
    let status, cls;
    if(xorSum===0){
      if(uniq.size===1) status="all same";
      else if(uniq.size===4) status="all different";
      else status="two pairs";
      cls="diff";
    } else {
      status="unbalanced — invalid";
      cls="bad";
      allValid=false;
    }
    return `<div class="attrline"><span>${a.name}</span>
      <span class="vals">${vals.join(" ")}</span>
      <span class="chip ${cls}">${status}</span></div>`;
  }).join("");

  verdict.className = allValid ? "valid" : "invalid";
  verdict.textContent = allValid ? "✓ VALID QUAD" : "✗ NOT A VALID QUAD";

  const g = classifyGeometry(selected);
  geomEl.innerHTML = `<div class="shape-name">${g.name}</div><div class="edges">${g.detail}</div>`;

  rebuildSelectionVisuals(allValid);
}

function renderSlots(){
  const wrap = document.getElementById("slots");
  wrap.innerHTML = "";
  for(let i=0;i<4;i++){
    const slot = document.createElement("div");
    const vId = selected[i];
    if(vId===undefined){
      slot.className="slot";
      slot.textContent = "—";
    } else {
      slot.className="slot filled";
      const cv = makeCardCanvas(cardData[vId].vector, true, i+1);
      slot.appendChild(cv);
      const x = document.createElement("div");
      x.className="x"; x.textContent="×";
      x.addEventListener("click", ev=>{ ev.stopPropagation(); toggleSelect(vId); });
      slot.appendChild(x);
    }
    wrap.appendChild(slot);
  }
}

/* ---------- controls UI ---------- */
function updateFreeCountUI(){
  const n = freeIndices().length;
  const el = document.getElementById("freecount");
  el.textContent = "Free: "+n+" / 3"+(n===3?" ✓":"");
  el.className = "freecount "+(n===3?"ok":"bad");
}

function updateAxisCaption(free, ok){
  const cap = document.getElementById("axis-caption");
  if(!ok){ cap.innerHTML=""; return; }
  const axisName=["X","Y","Z"];
  const fixedParts = [];
  for(let i=0;i<6;i++) if(bitMode[i]==="fix") fixedParts.push("x"+(i+1)+"="+bitFixedVal[i]);
  cap.innerHTML = free.map((idx,a)=>axisName[a]+" → x"+(idx+1)).join("&nbsp;&nbsp;·&nbsp;&nbsp;")
    + "<br/>fixed: " + fixedParts.join(", ");
}

function buildBitControls(){
  for(let i=0;i<6;i++){
    const seg = document.querySelector('.seg[data-row="'+i+'"]');
    seg.innerHTML = "";
    const optFree = document.createElement("button");
    optFree.textContent = "free"; optFree.dataset.val="free";
    const opt0 = document.createElement("button");
    opt0.textContent = "0"; opt0.dataset.val="0";
    const opt1 = document.createElement("button");
    opt1.textContent = "1"; opt1.dataset.val="1";
    [optFree,opt0,opt1].forEach(btn=>{
      btn.addEventListener("click", ()=>{
        if(btn.dataset.val==="free"){ bitMode[i]="free"; }
        else { bitMode[i]="fix"; bitFixedVal[i]=parseInt(btn.dataset.val,10); }
        syncBitButtons();
        rebuildScene();
      });
      seg.appendChild(btn);
    });
  }
  syncBitButtons();
}
function syncBitButtons(){
  for(let i=0;i<6;i++){
    const seg = document.querySelector('.seg[data-row="'+i+'"]');
    const btns = seg.querySelectorAll("button");
    btns.forEach(btn=>{
      let active=false;
      if(bitMode[i]==="free" && btn.dataset.val==="free") active=true;
      if(bitMode[i]==="fix" && btn.dataset.val===String(bitFixedVal[i])) active=true;
      btn.classList.toggle("active", active);
      btn.classList.toggle("is-free", btn.dataset.val==="free");
    });
  }
}

document.getElementById("btn-reset").addEventListener("click", ()=>{
  bitMode = ["free","free","free","fix","fix","fix"];
  bitFixedVal = [0,0,0,0,0,0];
  syncBitButtons();
  rebuildScene();
});
document.getElementById("btn-shuffle").addEventListener("click", ()=>{
  for(let i=0;i<6;i++) if(bitMode[i]==="fix") bitFixedVal[i] = Math.random()<0.5?0:1;
  syncBitButtons();
  rebuildScene();
});
document.getElementById("btn-clear").addEventListener("click", ()=>{
  selected = [];
  for(let c=0;c<8;c++) if(cardSprites[c]) refreshCardTexture(c);
  updateAnalysis();
});

function buildLegend(){
  const wrap = document.getElementById("legend-shapes");
  ["00","01","10","11"].forEach(k=>{
    const img = document.createElement("img");
    img.src = ICON_SRC[k];
    wrap.appendChild(img);
  });

  const counts = document.getElementById("legend-counts");
  COUNT_VALUES.forEach(n=>{
    const group = document.createElement("span");
    group.className = "cnt-group";
    for(let i=0;i<n;i++){
      const dot = document.createElement("span");
      group.appendChild(dot);
    }
    counts.appendChild(group);
  });
}

/* ---------- render loop ---------- */
function animate(){
  requestAnimationFrame(animate);
  resize();
  renderer.render(scene, camera);
}

/* ---------- boot ---------- */
loadIcons(()=>{
  buildBitControls();
  buildLegend();
  rebuildScene();
  animate();
});
