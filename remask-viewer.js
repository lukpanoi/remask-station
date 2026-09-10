const explorer = document.getElementById('model-3d');
const $ = id => document.getElementById(id);
const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
let T, PARTS, renderer, scene, camera, controls, models, raycaster;
let mode='overview', selected=null, openTarget=0, openValue=0, explodeTarget=0, explodeValue=0;
let visible=true, dirty=true, initialized=false, initializing=false, raf=0, transition=null;
let expanded=false, placeholder=null, priorFocus=null, previousBodyOverflow='';
let hotButtons=[], oldMaterials=new Map(), cameraSize={width:0,height:0}, lastTime=0;
const viewDefaults={overview:{title:'ReMask Station + Reusable Facepiece',text:'เลือกตัวเครื่องหรือหน้ากาก แล้วเปิดดูภายใน หรือแยกชิ้นส่วนเพื่อสำรวจโครงสร้าง'},station:{title:'ReMask Station · ตัวเครื่อง',text:'เปิดฝาเพื่อดูห้องกระบวนการ รางเลื่อน และชุดควบคุม แตะหมายเลขหรือชิ้นส่วนที่ต้องการสำรวจ'},mask:{title:'Reusable Facepiece · หน้ากาก',text:'ดูรูปทรงได้รอบด้าน เปิดดูด้านใน หรือแยกชั้นเพื่อสำรวจขอบซีล ตลับกรอง และฝาครอบ'}};

function showDetail(id) {
  selected=id;
  const data=id ? PARTS?.[id] : viewDefaults[mode];
  if(!data)return;
  $('rm-detail-number').textContent=data.n || (mode==='station'?'01':mode==='mask'?'02':'3D');
  $('rm-detail-title').textContent=data.title;
  $('rm-detail-copy').textContent=data.text;
  for(const button of $('rm-parts').querySelectorAll('button'))button.setAttribute('aria-pressed',String(button.dataset.part===id));
  if(scene) {
    for(const [mesh,material]of oldMaterials){const highlighted=mesh.material;mesh.material=material;highlighted.dispose();}oldMaterials.clear();
    if(id)for(const model of Object.values(models))model.root.traverse(mesh=>{
      if(!mesh.isMesh || getPart(mesh)!==id || !mesh.material.emissive)return;
      oldMaterials.set(mesh,mesh.material);mesh.material=mesh.material.clone();mesh.material.emissive.set('#148a87');mesh.material.emissiveIntensity=.20;
    });
    buildHotspots();dirty=true;
  }
}
function getPart(object) { for(let p=object;p;p=p.parent)if(p.userData.part)return p.userData.part;return null; }
function renderPartList() {
  if(!PARTS)return;
  const entries=Object.entries(PARTS).filter(([,data])=>mode==='overview'||data.model===mode);
  $('rm-parts').replaceChildren(...entries.map(([id,data])=>{
    const button=document.createElement('button');button.type='button';button.className='rm-part-button';button.dataset.part=id;
    button.textContent=`${data.n} · ${data.title}`;button.setAttribute('aria-pressed',String(id===selected));
    button.addEventListener('click',()=>selectPart(id));return button;
  }));
  $('rm-parts-count').textContent=`(${entries.length})`;
}
function selectPart(id) {
  const data=PARTS[id];if(!data)return;
  if(mode!==data.model)setView(data.model);
  // Expose interior parts selected from the accessible component list.
  if(!models?.[data.model].closedAnchors.includes(id) && openTarget===0 && explodeTarget<.15){openTarget=1;updateButtons();animateFit();}
  if(id==='seal'&&camera)fitCamera(true,new T.Vector3(-3,1.4,-6));
  showDetail(id);
}
function updateButtons() {
  $('rm-open').setAttribute('aria-pressed',String(openTarget>0));
  $('rm-open').querySelector('span').textContent=openTarget>0?'ประกอบกลับ':mode==='mask'?'เปิดดูด้านใน':'เปิดดูภายใน';
  $('rm-explode').setAttribute('aria-pressed',String(explodeTarget>0));
  $('rm-explode').querySelector('span').textContent=explodeTarget>0?'รวมชิ้นส่วน':'แยกชิ้นส่วน';
  $('rm-slider-row').hidden=explodeTarget===0;
  $('rm-explode-range').value=Math.round(explodeTarget*100);$('rm-explode-value').textContent=Math.round(explodeTarget*100)+'%';
  $('rm-view-label').textContent=mode==='overview'?'SYSTEM OVERVIEW':mode==='station'?(openTarget?'STATION · INSIDE':explodeTarget?'STATION · EXPLODED':'REMASK STATION'):(explodeTarget?'FACEPIECE · EXPLODED':openTarget?'FACEPIECE · INSIDE':'REUSABLE FACEPIECE');
  for(const button of explorer.querySelectorAll('[data-rm-view]'))button.setAttribute('aria-pressed',String(button.dataset.rmView===mode));
}
function positionModels() {
  if(!models)return;
  const station=models.station.root,mask=models.mask.root;
  station.visible=mode!=='mask';mask.visible=mode!=='station';
  station.position.set(mode==='overview'?-.96:0,0,0);station.scale.setScalar(mode==='overview'?.84:1);
  mask.position.set(mode==='overview'?1.20:0,mode==='overview'?1.22:1.35,0);mask.scale.setScalar(mode==='overview'?.81:1.22);mask.rotation.y=mode==='overview'?-.15:0;
  applyPose(openValue,explodeValue);
}
function applyPose(open,explode) { if(models)for(const model of Object.values(models))model.apply(open,explode);if(renderer)renderer.shadowMap.needsUpdate=true; }
function setView(value) {
  mode=value;openTarget=openValue=0;explodeTarget=explodeValue=0;
  positionModels();renderPartList();updateButtons();showDetail(null);fitCamera(true);dirty=true;
}
function animateFit() {buildHotspots();fitCamera(true,mode==='mask'&&openTarget>0&&T?new T.Vector3(-4,1.8,-6):null);dirty=true;}
function fitCamera(animate=true,direction=null) {
  if(!camera||!models||!cameraSize.width)return;
  // Fit the final assembly pose, accounting for all eight corners and mobile aspect ratio.
  applyPose(openTarget,explodeTarget);
  scene.updateMatrixWorld(true);
  const bounds=new T.Box3();for(const m of Object.values(models))if(m.root.visible)bounds.union(new T.Box3().setFromObject(m.root));
  const target=bounds.getCenter(new T.Vector3());
  const dir=(direction||new T.Vector3(mode==='mask'?3.2:3.5,mode==='mask'?1.7:1.55,7)).clone().normalize();
  const right=new T.Vector3().crossVectors(new T.Vector3(0,1,0),dir).normalize(),up=new T.Vector3().crossVectors(dir,right).normalize();
  const tangent=Math.tan(T.MathUtils.degToRad(camera.fov/2));
  let distance=0;
  for(const x of [bounds.min.x,bounds.max.x])for(const y of [bounds.min.y,bounds.max.y])for(const z of [bounds.min.z,bounds.max.z]){
    const v=new T.Vector3(x,y,z).sub(target);
    distance=Math.max(distance,v.dot(dir)+Math.max(Math.abs(v.dot(right))/(tangent*camera.aspect),Math.abs(v.dot(up))/tangent)*1.24);
  }
  distance=Math.max(distance,2.2);const position=target.clone().addScaledVector(dir,distance);
  applyPose(openValue,explodeValue);
  controls.minDistance=Math.max(.85,distance*.35);controls.maxDistance=distance*2.3;
  if(animate&&!reducedMotion.matches){transition={start:performance.now(),from:camera.position.clone(),to:position,fromTarget:controls.target.clone(),target,duration:650};}
  else {transition=null;camera.position.copy(position);controls.target.copy(target);camera.lookAt(target);controls.update();}
  dirty=true;
}
function buildHotspots() {
  if(!models)return;
  const focused=mode==='overview'?[]:openTarget>0||explodeTarget>.1 ?
    (mode==='station'?['intake','chamber','airflow','controller','output']:['shell','seal','cartridge','filter','cover','tag']):models[mode].closedAnchors;
  if(selected&&!focused.includes(selected))focused.unshift(selected);
  hotButtons=[];
  if(mode==='overview'){
    for(const [model,text]of [['station','01 · ตัวเครื่อง'],['mask','02 · หน้ากาก']]){
      const b=document.createElement('button');b.type='button';b.className='rm-hotspot rm-object-label';b.textContent=text;
      b.setAttribute('aria-label',`สำรวจ${model==='station'?'ตัวเครื่อง':'หน้ากาก'}แบบ 3 มิติ`);b.addEventListener('click',()=>setView(model));
      hotButtons.push({button:b,model,overview:true});
    }
  } else for(const id of focused){
    const b=document.createElement('button');b.type='button';b.className='rm-hotspot';b.textContent=PARTS[id].n;
    b.title=PARTS[id].title;b.setAttribute('aria-label',PARTS[id].title);b.setAttribute('aria-pressed',String(id===selected));
    b.addEventListener('click',()=>selectPart(id));hotButtons.push({button:b,id,anchor:models[mode].anchors[id]});
  }
  $('rm-hotspots').replaceChildren(...hotButtons.map(h=>h.button));dirty=true;
}
function updateHotspots() {
  if(!camera)return;
  scene.updateMatrixWorld(true);camera.updateMatrixWorld();const placed=[];
  const width=cameraSize.width,height=cameraSize.height;
  for(const h of hotButtons){
    const p=h.overview?models[h.model].root.localToWorld(new T.Vector3(0,h.model==='station'?.32:-.59,.60)):h.anchor.getWorldPosition(new T.Vector3());
    p.project(camera);let x=(p.x*.5+.5)*width,y=(-p.y*.5+.5)*height;
    const within=p.z>-1&&p.z<1&&x>18&&x<width-17&&y>52&&y<height-45;
    const collision=placed.some(q=>Math.hypot(x-q.x,y-q.y)<37);
    const show=within&&(!collision||h.id===selected);
    h.button.hidden=!show;
    if(show){h.button.style.transform=`translate(${Math.round(x)}px,${Math.round(y)}px) translate(-50%,-50%)`;placed.push({x,y});}
  }
}
function resize() {
  if(!renderer)return;
  const {width,height}=$('rm-stage').getBoundingClientRect();if(!width||!height)return;
  const changed=width!==cameraSize.width||height!==cameraSize.height;
  if(!changed)return;cameraSize={width,height};renderer.setSize(width,height,false);camera.aspect=width/height;camera.updateProjectionMatrix();fitCamera(false);dirty=true;
}
function zoom(factor) {
  if(!camera)return;transition=null;
  const v=camera.position.clone().sub(controls.target),length=T.MathUtils.clamp(v.length()*factor,controls.minDistance,controls.maxDistance);
  camera.position.copy(controls.target).add(v.setLength(length));controls.update();dirty=true;
}
function tick(time) {
  raf=0;if(!visible||document.hidden||!renderer)return;
  const dt=Math.min((time-(lastTime||time))/1000,.05);lastTime=time;
  const alpha=reducedMotion.matches?1:1-Math.exp(-dt*9);
  if(Math.abs(openValue-openTarget)>.0003||Math.abs(explodeValue-explodeTarget)>.0003){
    openValue+=(openTarget-openValue)*alpha;explodeValue+=(explodeTarget-explodeValue)*alpha;
    applyPose(openValue,explodeValue);dirty=true;
  }
  if(transition){
    const t=Math.min(1,(time-transition.start)/transition.duration),e=1-Math.pow(1-t,3);
    camera.position.lerpVectors(transition.from,transition.to,e);controls.target.lerpVectors(transition.fromTarget,transition.target,e);camera.lookAt(controls.target);
    if(t===1)transition=null;dirty=true;
  }
  if(controls.update(dt))dirty=true;
  if(dirty){renderer.render(scene,camera);updateHotspots();dirty=false;}
  raf=requestAnimationFrame(tick);
}
function resume(){if(!raf&&renderer&&visible&&!document.hidden){lastTime=0;dirty=true;raf=requestAnimationFrame(tick);}}
function failure() {
  $('rm-loading').hidden=true;$('rm-fallback').hidden=false;$('rm-stage').setAttribute('aria-busy','false');
  $('rm-hotspots').hidden=true;explorer.querySelector('.rm-camera-tools').hidden=true;
  for(const id of ['rm-open','rm-explode']){$(id).disabled=true;}
}
async function initialize() {
  if(initialized||initializing)return;initializing=true;
  const timer=setTimeout(()=>failure(),20000);
  try{
    const [three,controlModule,modelModule,envModule]=await Promise.all([
      import('./vendor/three.module.min.js'),import('./vendor/OrbitControls.js'),import('./remask-models.js'),import('./vendor/RoomEnvironment.js')
    ]);
    T=three;PARTS=modelModule.PARTS;renderPartList();
    renderer=new T.WebGLRenderer({antialias:true,alpha:true,powerPreference:'low-power'});
    renderer.setPixelRatio(Math.min(devicePixelRatio||1,innerWidth<650?1.6:2));renderer.setClearColor(0x000000,0);
    renderer.shadowMap.enabled=true;renderer.shadowMap.type=T.PCFSoftShadowMap;renderer.shadowMap.autoUpdate=false;
    renderer.outputColorSpace=T.SRGBColorSpace;renderer.toneMapping=T.ACESFilmicToneMapping;renderer.toneMappingExposure=1.18;
    const canvas=renderer.domElement;canvas.tabIndex=0;canvas.setAttribute('role','img');
    canvas.setAttribute('aria-label','โมเดลสามมิติ ReMask ลากเพื่อหมุน ใช้ปุ่มลูกศรเพื่อหมุน ปุ่มบวกหรือลบเพื่อซูม และ Home คืนมุมมอง');
    $('rm-canvas-host').append(canvas);
    scene=new T.Scene();camera=new T.PerspectiveCamera(37,1,.02,100);
    const pmrem=new T.PMREMGenerator(renderer),environment=new envModule.RoomEnvironment();
    const envTexture=pmrem.fromScene(environment,.04).texture;scene.environment=envTexture;scene.environmentIntensity=.78;environment.dispose();pmrem.dispose();
    scene.add(new T.HemisphereLight(0xe9f7ff,0x819ca7,2.2));
    const key=new T.DirectionalLight(0xffffff,3.7);key.position.set(-3,6,5);key.castShadow=true;
    key.shadow.mapSize.set(1024,1024);Object.assign(key.shadow.camera,{left:-4,right:4,top:5,bottom:-4,near:.1,far:18});key.shadow.bias=-.0007;key.shadow.normalBias=.025;scene.add(key);
    const fill=new T.DirectionalLight(0xc4f7f5,1.5);fill.position.set(4,3,-3);scene.add(fill);
    const ground=new T.Mesh(new T.PlaneGeometry(200,200),new T.ShadowMaterial({color:'#264859',opacity:.13}));ground.rotation.x=-Math.PI/2;ground.position.y=-.004;ground.receiveShadow=true;scene.add(ground);
    const grid=new T.GridHelper(12,48,0xbfd4de,0xd3e1e7);grid.material.transparent=true;grid.material.opacity=.35;grid.position.y=-.006;scene.add(grid);
    models={station:modelModule.buildStation(),mask:modelModule.buildMask()};for(const m of Object.values(models))scene.add(m.root);
    controls=new controlModule.OrbitControls(camera,canvas);controls.enableDamping=true;controls.dampingFactor=.085;controls.enablePan=false;
    controls.rotateSpeed=.65;controls.zoomSpeed=.8;controls.minPolarAngle=.15;controls.maxPolarAngle=Math.PI*.86;controls.autoRotateSpeed=.55;
    controls.addEventListener('change',()=>{dirty=true;});controls.addEventListener('start',()=>{transition=null;});
    raycaster=new T.Raycaster();raycaster.params.Line.threshold=.007;
    let down=null,maxMove=0,pointers=new Set();
    canvas.addEventListener('pointerdown',event=>{pointers.add(event.pointerId);if(pointers.size===1){down={x:event.clientX,y:event.clientY,time:performance.now()};maxMove=0;}else down=null;});
    canvas.addEventListener('pointermove',event=>{if(down)maxMove=Math.max(maxMove,Math.hypot(event.clientX-down.x,event.clientY-down.y));});
    canvas.addEventListener('pointercancel',event=>{pointers.delete(event.pointerId);down=null;});
    canvas.addEventListener('pointerup',event=>{
      pointers.delete(event.pointerId);if(!down||maxMove>7||performance.now()-down.time>650||pointers.size){down=null;return;}down=null;
      const r=canvas.getBoundingClientRect();raycaster.setFromCamera(new T.Vector2((event.clientX-r.left)/r.width*2-1,-(event.clientY-r.top)/r.height*2+1),camera);
      const roots=Object.values(models).filter(m=>m.root.visible).map(m=>m.root);
      const hits=raycaster.intersectObjects(roots,true);const id=hits.filter(hit=>hit.object.isMesh).map(hit=>getPart(hit.object)).find(Boolean);if(id)selectPart(id);
    });
    canvas.addEventListener('keydown',event=>{
      if(['+','=','-','_','Home','ArrowLeft','ArrowRight','ArrowUp','ArrowDown'].includes(event.key))event.preventDefault();else return;
      if(event.key==='+'||event.key==='=')return zoom(.84);if(event.key==='-'||event.key==='_')return zoom(1.18);if(event.key==='Home')return fitCamera(true);
      transition=null;const spherical=new T.Spherical().setFromVector3(camera.position.clone().sub(controls.target));
      if(event.key==='ArrowLeft')spherical.theta-=.15;if(event.key==='ArrowRight')spherical.theta+=.15;
      if(event.key==='ArrowUp')spherical.phi=Math.max(controls.minPolarAngle,spherical.phi-.12);if(event.key==='ArrowDown')spherical.phi=Math.min(controls.maxPolarAngle,spherical.phi+.12);
      camera.position.copy(controls.target).add(new T.Vector3().setFromSpherical(spherical));controls.update();dirty=true;
    });
    canvas.addEventListener('webglcontextlost',event=>{event.preventDefault();if(raf)cancelAnimationFrame(raf);raf=0;failure();});
    new ResizeObserver(resize).observe($('rm-stage'));
    initialized=true;positionModels();resize();showDetail(null);updateButtons();
    $('rm-loading').hidden=true;$('rm-fallback').hidden=true;$('rm-hotspots').hidden=false;
    explorer.querySelector('.rm-camera-tools').hidden=false;for(const id of ['rm-open','rm-explode'])$(id).disabled=false;
    $('rm-stage').setAttribute('aria-busy','false');resume();
  }catch(error){console.warn('ReMask 3D could not start:',error);failure();}
  finally{clearTimeout(timer);initializing=false;}
}

for(const button of explorer.querySelectorAll('[data-rm-view]'))button.addEventListener('click',()=>setView(button.dataset.rmView));
$('rm-open').addEventListener('click',()=>{
  if(mode==='overview')setView('station');
  openTarget=openTarget>0?0:1;explodeTarget=0;updateButtons();showDetail(openTarget?(mode==='station'?'chamber':'shell'):null);animateFit();
});
$('rm-explode').addEventListener('click',()=>{
  if(mode==='overview')setView('mask');
  explodeTarget=explodeTarget>0?0:1;openTarget=0;updateButtons();showDetail(null);animateFit();
});
$('rm-explode-range').addEventListener('input',event=>{
  explodeTarget=Number(event.target.value)/100;openTarget=0;
  // Keep the range available at zero so it can be dragged back up.
  updateButtons();$('rm-slider-row').hidden=false;animateFit();
});
$('rm-reset').addEventListener('click',()=>{if(controls)controls.autoRotate=false;$('rm-rotate').setAttribute('aria-pressed','false');setView(mode);});
$('rm-zoom-in').addEventListener('click',()=>zoom(.82));$('rm-zoom-out').addEventListener('click',()=>zoom(1.2));
$('rm-rotate').addEventListener('click',()=>{if(!controls)return;controls.autoRotate=!controls.autoRotate;transition=null;$('rm-rotate').setAttribute('aria-pressed',String(controls.autoRotate));dirty=true;});
$('rm-retry').addEventListener('click',()=>location.reload());
function toggleExpanded() {
  expanded=!expanded;
  if(expanded){
    priorFocus=document.activeElement;placeholder=document.createElement('div');placeholder.style.height=explorer.getBoundingClientRect().height+'px';explorer.before(placeholder);document.body.append(explorer);
    previousBodyOverflow=document.body.style.overflow;document.body.classList.add('rm-expanded');document.body.style.overflow='hidden';
    explorer.classList.add('is-expanded');explorer.setAttribute('role','dialog');explorer.setAttribute('aria-modal','true');
    $('rm-expand').textContent='×';$('rm-expand').setAttribute('aria-label','ปิดมุมมองขยาย');
    visible=true;resume();
  }else{
    explorer.classList.remove('is-expanded');explorer.removeAttribute('role');explorer.removeAttribute('aria-modal');placeholder.replaceWith(explorer);placeholder=null;
    document.body.classList.remove('rm-expanded');document.body.style.overflow=previousBodyOverflow;
    $('rm-expand').innerHTML='<svg aria-hidden="true"><use href="#i-expand-3d"></use></svg>';$('rm-expand').setAttribute('aria-label','ขยายตัวดูโมเดล');priorFocus?.focus({preventScroll:true});
  }
  $('rm-expand').setAttribute('aria-expanded',String(expanded));if(expanded)$('rm-expand').focus();requestAnimationFrame(()=>{resize();fitCamera(false);});
}
$('rm-expand').addEventListener('click',toggleExpanded);
document.addEventListener('keydown',event=>{
  if(!expanded)return;if(event.key==='Escape'){event.preventDefault();toggleExpanded();return;}
  if(event.key==='Tab'){
    const nodes=[...explorer.querySelectorAll('button:not(:disabled),input,summary,canvas[tabindex="0"]')].filter(el=>el.getClientRects().length&&!el.hidden);
    const first=nodes[0],last=nodes.at(-1);
    if(event.shiftKey&&document.activeElement===first){event.preventDefault();last.focus();}else if(!event.shiftKey&&document.activeElement===last){event.preventDefault();first.focus();}
  }
});
document.addEventListener('visibilitychange',()=>{if(document.hidden){if(raf)cancelAnimationFrame(raf);raf=0;}else resume();});
reducedMotion.addEventListener('change',()=>{if(controls&&reducedMotion.matches){controls.autoRotate=false;$('rm-rotate').setAttribute('aria-pressed','false');transition=null;dirty=true;}});
if('IntersectionObserver' in window){
  const observer=new IntersectionObserver(entries=>{visible=expanded||entries[0].isIntersecting;if(visible){initialize();resume();}else{if(raf)cancelAnimationFrame(raf);raf=0;}},{rootMargin:'250px'});observer.observe(explorer);
}else initialize();
