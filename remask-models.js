import * as T from './vendor/three.module.min.js';
import { RoundedBoxGeometry } from './vendor/RoundedBoxGeometry.js';

// Concept geometry in arbitrary units. No dimensions or performance claims.
export const PARTS = {
  enclosure: { model:'station', n:'01', title:'โครงเครื่องและฝาครอบ', text:'โครงรับแรงแยกจากฝาครอบ มีคานยึด แผงถอดซ่อม บานพับ และขาปรับระดับ เปิดฝาเพื่อเข้าถึงชิ้นส่วนภายในโดยไม่ต้องรื้อโครงหลัก' },
  screen: { model:'station', n:'02', title:'หน้าจอและจุดอ่าน QR / RFID', text:'จอแสดงสถานะจำลองและจุดระบุตัวตน เชื่อมหน้ากากกับประวัติรายชิ้น แท็กใช้ติดตามข้อมูล ไม่ได้ตรวจเชื้อหรือยืนยันความปลอดภัยด้วยตัวเอง' },
  intake: { model:'station', n:'03', title:'ถาดรับคืนและชุดตรวจภาพ', text:'ช่องรับชิ้นใช้แล้วอยู่แยกจากช่องจ่าย ถาดเคลื่อนตามราง มีตำแหน่งกล้องและแสงสำหรับตรวจสภาพและระบุตัวตน ต้องแยกไส้กรองก่อนส่งเฉพาะโครงเข้าสู่ห้องทำความสะอาด' },
  chamber: { model:'station', n:'04', title:'ห้องทำความสะอาดโครงหน้ากาก', text:'ห้องปิดแยก มีถาดยึดชิ้นงาน ผิวด้านใน ถาดรอง และตำแหน่งติดตั้งชุดกระบวนการ วิธีทำความสะอาดและลดการปนเปื้อนต้องเลือกตามวัสดุและผลทดลอง ไม่ใส่ไส้กรองใช้แล้วเข้าไปล้าง' },
  airflow: { model:'station', n:'05', title:'พัดลม ทางลม และทางระบาย', text:'แนวคิดชุดหมุนเวียนลมสำหรับช่วงทำให้แห้ง พร้อมทางระบายจากห้องกระบวนการ ตำแหน่งพัดลม ท่อ และแผงกั้นต้องพัฒนาร่วมกับการควบคุมการปนเปื้อน' },
  lift: { model:'station', n:'06', title:'รางเลื่อนและชุดขับเคลื่อน', text:'รางคู่ประคองถาดร่วมกับสกรูขับและมอเตอร์ เพื่อจัดตำแหน่งชิ้นงาน ลดการเอียง และเคลื่อนระหว่างตำแหน่งตรวจ ตัวอย่างนี้แสดงแนวทางกลไก ยังไม่ใช่ระบบขนถ่ายที่ทดสอบแล้ว' },
  controller: { model:'station', n:'07', title:'ชุดควบคุมและเซนเซอร์', text:'บอร์ดควบคุม ภาคจ่ายไฟ ขั้วต่อสาย และสวิตช์ตรวจฝา ใช้รับสัญญาณและสั่งกลไก แนวคิด interlock จะหยุดกระบวนการเมื่อฝาถูกเปิด ต้องยืนยันการทำงานกับต้นแบบจริง' },
  output: { model:'station', n:'08', title:'ส่วนตรวจซ้ำและแยกสถานะ', text:'เสนอช่องแยก PASS, CHECK และ REJECT หลังตรวจซ้ำและประกอบไส้กรองตามเกณฑ์ พร้อมแผงกั้นและช่องจ่าย การเคลื่อนย้ายข้ามโซนและการประกอบต้องออกแบบและทดสอบเพิ่มเติม' },
  shell: { model:'mask', n:'01', title:'โครงหน้ากากแบบใช้ซ้ำ', text:'โครงโค้งครอบจมูกและปาก มีช่องรับตลับกรองจริงในโมเดล แยกจากขอบซีลและไส้กรองเพื่อถอดตรวจ เลือกวัสดุและรูปทรงจากการทดสอบความเข้ากันได้กับกระบวนการทำความสะอาด' },
  seal: { model:'mask', n:'02', title:'ขอบซีลสัมผัสใบหน้า', text:'ขอบยืดหยุ่นต่อเนื่องรอบจมูก แก้ม และคาง แนวคิดให้ถอดตรวจรอยฉีกและการเสียรูปได้ ความแนบสนิทต้องทดสอบกับผู้สวมใส่จริง ไม่สามารถยืนยันจากรูปทรง 3D' },
  cartridge: { model:'mask', n:'03', title:'กรอบตลับและวงแหวนซีล', text:'กรอบรองรับแผ่นกรอง พร้อมจุดล็อกและวงซีลรอบรอยต่อ ถอดออกจากโครงได้โดยไม่ต้องทิ้งหน้ากากทั้งชิ้น ต้องทดสอบการรั่วและความแข็งแรงของจุดยึด' },
  filter: { model:'mask', n:'04', title:'แผ่นกรองถอดเปลี่ยน', text:'ชั้นกรองอยู่ในตลับ แสดงรอยพับเพื่ออธิบายตำแหน่งเท่านั้น ต้องเลือกตัวกรองที่มีผลทดสอบตามงานใช้งานจริง ไม่ล้างหรือฆ่าเชื้อไส้กรองโดยสมมติว่าจะยังมีประสิทธิภาพเท่าเดิม' },
  cover: { model:'mask', n:'05', title:'ฝาครอบและช่องอากาศ', text:'ฝาหน้าเจาะช่องอากาศหลายจุดและมีตัวล็อก ช่วยป้องกันการสัมผัสแผ่นกรองโดยตรง ช่องบนฝาไม่ใช่ชั้นกรอง เปิดฝาเพื่อเห็นตลับและชั้นกรองด้านใน' },
  straps: { model:'mask', n:'06', title:'สายรัดและตัวปรับ', text:'สายรัดสองระดับพร้อมตัวปรับและจุดยึดด้านข้าง ช่วยกระจายแรงกดโดยรอบ การเลือกความยืดหยุ่นและขนาดต้องคำนึงถึงความสบายและความแนบสนิท' },
  tag: { model:'mask', n:'07', title:'โมดูลระบุตัวตน RFID', text:'แท็กในตำแหน่งถอดเปลี่ยนได้ ใช้ผูก Mask ID กับประวัติการใช้งาน ตัวกรอง และจำนวนรอบ ต้องตรวจความทนทานหรือถอดออกตามกระบวนการที่เลือก' },
};

const mat = (color, metalness=0, roughness=.5, more={}) => new T.MeshStandardMaterial({color,metalness,roughness,...more});
const M = {
  navy:mat('#173444',.42,.33), teal:mat('#118d91',.45,.31), white:mat('#e9eff0',.18,.36),
  steel:mat('#b7c6cc',.75,.3), dark:mat('#101e26',.2,.38), rubber:mat('#36434c',0,.85),
  silicone:mat('#96c5c6',0,.63), black:mat('#18232b',.15,.5), filter:mat('#f0eee3',0,.91),
  pcb:mat('#16645a',.2,.5), copper:mat('#dca86c',.65,.3), gold:mat('#e6b44e',.55,.4),
  green:mat('#48b59d',.1,.5), amber:mat('#d8a358',.1,.5), red:mat('#c37b78',.1,.5),
  led:mat('#48dcd9',0,.22,{emissive:'#12adad',emissiveIntensity:.65}),
  screen:mat('#123949',.15,.25,{emissive:'#0b303b',emissiveIntensity:.25}),
};
const geoCache = new Map();
function box(p,size,pos,material=M.white,r=.025) {
  const key=size.join(',')+','+r;
  if(!geoCache.has(key)) geoCache.set(key,r ? new RoundedBoxGeometry(...size,2,Math.min(r,...size.map(v=>v*.4))) : new T.BoxGeometry(...size));
  const m=new T.Mesh(geoCache.get(key),material); m.position.set(...pos); m.castShadow=true; m.receiveShadow=true;p.add(m);return m;
}
function cyl(p,r,h,pos,material=M.steel,axis='y',segments=20) {
  const m=new T.Mesh(new T.CylinderGeometry(r,r,h,segments),material);m.position.set(...pos);
  if(axis==='z')m.rotation.x=Math.PI/2;if(axis==='x')m.rotation.z=Math.PI/2;
  m.castShadow=true;m.receiveShadow=true;p.add(m);return m;
}
function path(p,pts,r,material=M.steel,closed=false) {
  const curve=new T.CatmullRomCurve3(pts.map(v=>new T.Vector3(...v)),closed,'centripetal');
  const m=new T.Mesh(new T.TubeGeometry(curve,Math.max(24,pts.length*8),r,8,closed),material);m.castShadow=true;p.add(m);return m;
}
function ellipse(p,rx,ry,z,r,material,cy=0) {
  return path(p,Array.from({length:40},(_,i)=>{const a=i/40*Math.PI*2;return[rx*Math.cos(a),ry*Math.sin(a)+cy,z]}),r,material,true);
}
function screws(p,xs,ys,z,material=M.steel) {
  for(const x of xs)for(const y of ys){cyl(p,.018,.012,[x,y,z],material,'z',10);box(p,[.020,.003,.002],[x,y,z+.007],M.dark,0);}
}
function part(root,id) { const g=new T.Group();g.name=id;g.userData.part=id;root.add(g);return g; }
function marker(group,pos) { const a=new T.Object3D();a.position.set(...pos);group.add(a);return a; }
function label(p,text,w,h,pos,color='#bce7e8',background=null) {
  if(typeof document==='undefined')return;
  const canvas=document.createElement('canvas');canvas.width=512;canvas.height=128;
  const ctx=canvas.getContext('2d');if(!ctx)return;
  if(background){ctx.fillStyle=background;ctx.fillRect(0,0,512,128);}
  ctx.fillStyle=color;ctx.textAlign='center';ctx.textBaseline='middle';ctx.font='600 44px Arial';ctx.fillText(text,256,65);
  const texture=new T.CanvasTexture(canvas);texture.colorSpace=T.SRGBColorSpace;
  const m=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshBasicMaterial({map:texture,transparent:true,depthWrite:false,toneMapped:false}));m.position.set(...pos);p.add(m);
}

export function buildStation() {
  const root=new T.Group();root.name='station';root.userData.model='station';
  const parts={}, anchors={}, moving=[];
  for(const [id,d] of Object.entries(PARTS))if(d.model==='station')parts[id]=part(root,id);
  const {enclosure:e,screen:s,intake:i,chamber:c,airflow:a,lift:l,controller:k,output:o}=parts;
  function movable(parent,name,delta) {const g=new T.Group();g.name=name;parent.add(g);moving.push({group:g,delta:new T.Vector3(...delta)});return g;}
  // Frame, base, adjustable feet and removable skins.
  box(e,[1.49,.14,1.19],[0,.20,0],M.navy);
  for(const x of [-.57,.57])for(const z of [-.43,.43]){cyl(e,.026,.18,[x,.11,z]);cyl(e,.09,.055,[x,.035,z],M.rubber);}
  for(const x of [-.66,.66])for(const z of [-.49,.49]){box(e,[.065,2.91,.065],[x,1.72,z],M.steel,.009);box(e,[.018,2.83,.012],[x,1.72,z+.037],M.dark,.003);}
  for(const y of [.28,1.02,2.36,3.12]){box(e,[1.36,.055,.05],[0,y,-.50],M.steel,.006);for(const x of [-.66,.66])box(e,[.055,.055,1.05],[x,y,0],M.steel,.006);}
  const left=movable(e,'left-panel',[-.9,.03,0]),right=movable(e,'right-panel',[.9,.03,0]),back=movable(e,'rear-panel',[0,.07,-.73]),top=movable(e,'top-panel',[0,.49,0]);
  box(left,[.07,2.95,1.09],[-.72,1.69,0],M.navy);
  box(right,[.07,2.95,1.09],[.72,1.69,0],M.navy);
  box(back,[1.43,2.93,.06],[0,1.70,-.56],M.navy);
  box(top,[1.50,.065,1.19],[0,3.20,0],M.navy,.03);
  for(const panel of [left,right]){const x=panel===left?-.763:.763;for(let row=0;row<11;row++)for(let col=0;col<3;col++)box(panel,[.006,.025,.20],[x,.38+row*.043,-.35+col*.29],M.dark,.005);for(const y of [.38,2.98])for(const z of [-.45,.43])cyl(panel,.019,.009,[x,y,z],M.steel,'x',10);}
  // Whole front face is mounted on a true hinge.
  const door=new T.Group();door.position.set(-.70,0,.585);e.add(door);
  const face=new T.Group();face.position.set(.70,0,0);door.add(face);
  box(face,[1.37,.80,.075],[0,2.76,0],M.white);
  box(face,[1.37,.11,.075],[0,2.28,0],M.white);
  box(face,[1.37,.72,.075],[0,1.25,0],M.white);
  box(face,[1.37,.27,.075],[0,.42,0],M.white);
  box(face,[1.37,.13,.075],[0,.82,0],M.white);
  for(const x of [-.59,.59])box(face,[.18,.75,.075],[x,1.86,0],M.navy);
  for(const x of [-.60,.60])box(face,[.16,.25,.075],[x,.65,0],M.white);
  for(const x of [-.728,.728])box(face,[.05,2.89,.09],[x,1.72,.026],M.teal,.018);
  box(face,[.88,.075,.24],[0,1.49,-.06],M.navy);
  box(face,[.94,.035,.24],[0,.545,-.07],M.navy);
  box(face,[.79,.012,.012],[0,.56,.03],M.led,.003);
  for(const y of [.53,2.22]){cyl(e,.029,.20,[-.725,y,.58]);box(face,[.065,.12,.085],[-.67,y,-.02],M.steel,.008);}
  box(face,[.025,.31,.045],[.49,1.24,.066],M.steel,.011);
  screws(face,[-.53,.53],[.35,1.55,3.07],.046);
  label(face,'ReMask Station',.80,.13,[0,1.15,.042],'#264c5a');
  label(face,'RETURN',.42,.08,[0,2.28,.046],'#32606f');
  label(face,'READY',.32,.07,[0,.82,.046],'#32606f');
  // Screen contents are geometry plus a locally generated label texture.
  const display=new T.Group();face.add(display);display.userData.part='screen';
  box(display,[1.04,.57,.035],[0,2.79,.057],M.dark);
  box(display,[.94,.47,.013],[0,2.79,.080],M.screen,.010);
  label(display,'ReMask',.60,.10,[0,2.91,.088]);
  label(display,'CONCEPT DEMO',.66,.085,[0,2.68,.088],'#6cb9c0');
  for(let v=0;v<3;v++){ellipse(display,.068,.068,.091,.006,M.led,2.8).position.x=-.25+v*.25;box(display,[.15,.007,.003],[-.125+v*.25,2.79,.092],M.teal,.002);}
  box(display,[.035,.26,.018],[.58,2.00,.055],M.led,.01);
  cyl(display,.049,.025,[.58,1.75,.06],M.teal,'z');
  label(display,'ID',.13,.09,[.58,1.89,.052]);
  // Intake carriage on twin rails, inspection camera and separate filter bin.
  box(i,[1.14,.06,.81],[0,1.93,.015],M.steel,.012);
  box(i,[.94,.025,.62],[0,1.976,.05],M.dark,.014);
  for(const x of [-.44,.44]){box(i,[.035,.055,.59],[x,2.00,.06],M.teal,.005);box(i,[.035,.03,.79],[x,1.89,0],M.steel,.005);}
  box(i,[.21,.13,.14],[0,2.21,-.30],M.black);
  cyl(i,.047,.050,[0,2.19,-.215],M.steel,'z');cyl(i,.031,.056,[0,2.19,-.21],M.screen,'z');
  box(i,[.65,.016,.022],[0,2.29,-.10],M.led,.003);
  box(i,[.20,.22,.29],[-.44,1.72,-.14],M.navy,.012);
  label(i,'FILTER OUT',.24,.056,[-.44,1.72,.011]);
  // Isolated process chamber: a hollow enclosure, not a solid block.
  box(c,[1.19,.06,.92],[0,1.025,-.035],M.steel,.008);
  box(c,[1.19,.045,.92],[0,1.77,-.035],M.steel,.008);
  box(c,[1.13,.72,.035],[0,1.40,-.477],M.steel,.008);
  for(const x of [-.55,.55])box(c,[.03,.69,.85],[x,1.405,-.04],M.steel,.006);
  // Framed open aperture, perimeter seal and inspection tray.
  for(const x of [-.51,.51])box(c,[.025,.60,.025],[x,1.4,.402],M.rubber,.008);
  for(const y of [1.11,1.70])box(c,[1.04,.025,.025],[0,y,.402],M.rubber,.008);
  box(c,[.85,.035,.64],[0,1.18,.015],M.navy,.012);
  for(let v=0;v<13;v++)box(c,[.016,.014,.53],[-.36+v*.060,1.205,.01],M.steel,.003);
  for(const x of [-.32,.32])path(c,[[x,1.27,-.24],[x,1.32,-.1],[x,1.32,.1],[x,1.27,.24]],.012,M.steel);
  const bareFacepiece=new T.Mesh(shellGeometry(),M.rubber);bareFacepiece.scale.setScalar(.37);bareFacepiece.position.set(0,1.40,.05);bareFacepiece.castShadow=true;c.add(bareFacepiece);
  box(c,[.90,.035,.70],[0,1.075,-.01],M.dark,.010);
  label(c,'FACEPIECE ONLY',.71,.10,[0,1.59,-.454],'#345461');
  // Air path and drain, clearly visible in service view.
  box(a,[.28,.32,.12],[.36,1.48,-.33],M.navy,.016);
  const fan=new T.Group();fan.position.set(.36,1.48,-.253);a.add(fan);
  ellipse(fan,.12,.12,0,.011,M.steel);cyl(fan,.038,.033,[0,0,.008],M.dark,'z');
  for(let v=0;v<7;v++){const blade=box(fan,[.06,.085,.012],[0,.067,0],M.black,.017);const pivot=new T.Group();fan.remove(blade);pivot.add(blade);pivot.rotation.z=v/7*Math.PI*2;fan.add(pivot);}
  for(let v=-2;v<=2;v++)box(fan,[.21,.005,.008],[0,v*.035,.025],M.steel,.002);
  path(a,[[.40,1.58,-.36],[.55,1.60,-.35],[.615,1.75,-.29],[.61,2.16,-.32]],.044,M.teal);
  path(a,[[.30,1.06,-.3],[.45,.97,-.34],[.50,.79,-.39],[.50,.48,-.40]],.021,M.steel);
  // Motor, lead screw, guide rails and linear bearings.
  for(const x of [-.47,.47]){cyl(l,.018,1.10,[x,1.93,-.37]);for(const y of [1.42,2.46])box(l,[.11,.095,.11],[x,y,-.37],M.navy,.010);cyl(l,.036,.17,[x,1.93,-.37],M.steel);}
  cyl(l,.022,1.09,[0,1.99,-.405],M.steel);
  for(let v=0;v<40;v++){const ring=new T.Mesh(new T.TorusGeometry(.027,.006,4,12),M.steel);ring.rotation.x=Math.PI/2;ring.position.set(0,1.48+v*.024,-.405);l.add(ring);}
  box(l,[.23,.21,.21],[0,2.62,-.395],M.dark,.012);box(l,[.235,.038,.215],[0,2.50,-.395],M.steel,.004);
  cyl(l,.044,.10,[0,2.42,-.405],M.gold);
  // PCB with components, terminals, PSU and cable routes.
  box(k,[.93,.46,.025],[0,2.88,-.475],M.pcb,.008);
  box(k,[.21,.23,.07],[-.12,2.88,-.42],M.black,.004);
  for(let v=0;v<7;v++){box(k,[.12,.012,.004],[-.30,2.77+v*.03,-.457],M.copper,.002);box(k,[.10,.024,.043],[.27,2.77+v*.032,-.434],M.dark,.002);}
  for(let v=0;v<5;v++){box(k,[.05,.06,.06],[-.34+v*.074,3.03,-.42],M.teal,.004);cyl(k,.009,.005,[-.34+v*.074,3.036,-.387],M.steel,'z',8);}
  screws(k,[-.43,.43],[2.70,3.05],-.451);
  box(k,[.28,.33,.29],[.40,2.59,-.30],M.steel,.012);
  for(let v=0;v<6;v++)box(k,[.23,.012,.007],[.40,2.47+v*.045,-.147],M.dark,.003);
  for(const [x,material] of [[-.36,M.red],[-.31,M.teal],[-.26,M.gold]])path(k,[[x,2.68,-.43],[x-.11,2.51,-.41],[x-.12,2.24,-.41],[x-.02,2.16,-.35]],.009,material);
  box(k,[.075,.105,.08],[.60,2.34,.45],M.black,.008);
  box(k,[.03,.055,.045],[.60,2.34,.505],M.red,.005);
  // Physically divided outcome bins and outlet shelf.
  box(o,[1.17,.045,.85],[0,.36,-.01],M.steel,.006);
  for(const x of [-.565,-.19,.19,.565])box(o,[.022,.45,.73],[x,.60,-.055],M.steel,.004);
  box(o,[1.16,.44,.022],[0,.60,-.41],M.steel,.004);
  for(const [x,material,word] of [[-.38,M.green,'PASS'],[0,M.amber,'CHECK'],[.38,M.red,'REJECT']]){
    box(o,[.33,.025,.64],[x,.40,-.02],material,.007);label(o,word,.30,.067,[x,.46,.362],'#345966');
  }
  box(o,[1.15,.04,.29],[0,.84,-.24],M.navy,.01);
  const gate=box(o,[.43,.035,.38],[.19,.88,-.04],M.teal,.008);gate.rotation.y=-.3;
  cyl(o,.05,.095,[.20,.86,-.26],M.steel);
  // Anchors follow moving parts and are shared by touch and keyboard controls.
  anchors.enclosure=marker(face,[-.44,1.3,.09]);anchors.screen=marker(display,[.32,2.93,.12]);
  anchors.intake=marker(i,[-.23,2.04,.39]);anchors.chamber=marker(c,[-.28,1.50,.40]);
  anchors.airflow=marker(a,[.43,1.48,-.20]);anchors.lift=marker(l,[-.42,2.37,-.32]);
  anchors.controller=marker(k,[.19,2.92,-.37]);anchors.output=marker(o,[.30,.58,.38]);
  const closedAnchors=['screen','intake','enclosure'];
  return {root,parts,anchors,closedAnchors,apply(open,explode){
    door.rotation.y=-open*1.78;door.position.set(-.70-explode*.40,0,.585+explode*.79);
    for(const {group,delta} of moving)group.position.copy(delta).multiplyScalar(explode);
    // Remove the service side from the sight line when opened, then park it beside the frame.
    right.position.x+=open*.79;right.position.z-=open*.20;
    parts.intake.position.z=explode*.28;parts.chamber.position.z=explode*.15;
    parts.output.position.y=-explode*.12;parts.controller.position.y=explode*.22;
  }};
}

function shellPoint(r,a,inner=false) {
  const x=.92*r*Math.cos(a)*(1+.06*Math.sin(a));
  const y=.69*r*Math.sin(a)+.045*r;
  const nose=Math.pow(Math.max(0,Math.sin(a)),10)*.13*r*r;
  return [x,y,.66*(1-r*r)+.055+nose-(inner?.065:0)];
}
function shellGeometry() {
  // Annular cup with thickness and a real aperture for the removable cartridge.
  const vertices=[],indices=[],angular=80,radial=14,innerRadius=.53;
  for(let side=0;side<2;side++)for(let j=0;j<=radial;j++)for(let i=0;i<=angular;i++)vertices.push(...shellPoint(innerRadius+(1-innerRadius)*j/radial,i/angular*Math.PI*2,side===1));
  const count=(radial+1)*(angular+1);
  for(let s=0;s<2;s++)for(let j=0;j<radial;j++)for(let i=0;i<angular;i++){
    const a=s*count+j*(angular+1)+i,b=a+1,c=a+angular+1,d=c+1;
    if(s===0)indices.push(a,c,b,b,c,d);else indices.push(a,b,c,b,d,c);
  }
  for(const row of [0,radial])for(let i=0;i<angular;i++){
    const a=row*(angular+1)+i,b=a+1;
    if(row===0)indices.push(a,b,a+count,b,b+count,a+count);else indices.push(a,a+count,b,b,b+count,a+count);
  }
  const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(vertices,3));g.setIndex(indices);g.computeVertexNormals();return g;
}
function perforatedCover() {
  const s=new T.Shape();s.absellipse(0,0,.49,.33,0,Math.PI*2,false,0);
  for(let row=-3;row<=3;row++)for(let col=-5;col<=5;col++){
    const x=col*.075+(row%2)*.0375,y=row*.072;
    if((x/.447)**2+(y/.278)**2>.89)continue;
    const hole=new T.Path();hole.absarc(x,y,.018,0,Math.PI*2,true);s.holes.push(hole);
  }
  return new T.ExtrudeGeometry(s,{depth:.035,bevelEnabled:true,bevelSegments:1,steps:1,bevelSize:.004,bevelThickness:.004,curveSegments:8});
}
export function buildMask() {
  const root=new T.Group();root.name='mask';root.userData.model='mask';
  const parts={},anchors={};for(const[id,d]of Object.entries(PARTS))if(d.model==='mask')parts[id]=part(root,id);
  const {shell:s,seal:g,cartridge:c,filter:f,cover:v,straps:b,tag:t}=parts;
  const cup=new T.Mesh(shellGeometry(),M.rubber);cup.castShadow=true;cup.receiveShadow=true;s.add(cup);
  // Outer mould seam follows the face contour; separate rear silicone gasket.
  path(s,Array.from({length:80},(_,i)=>shellPoint(.992,i/80*Math.PI*2)),.013,M.black,true);
  path(g,Array.from({length:80},(_,i)=>{const p=shellPoint(.976,i/80*Math.PI*2);p[2]-=.063;return p;}),.064,M.silicone,true);
  path(g,Array.from({length:80},(_,i)=>{const p=shellPoint(.91,i/80*Math.PI*2);p[2]-=.112;return p;}),.020,M.silicone,true);
  // Continuous ring seat, latches and replaceable pleated insert.
  ellipse(s,.491,.365,.535,.025,M.navy,.023);
  ellipse(c,.492,.341,.558,.036,M.teal,.02);
  ellipse(c,.465,.320,.58,.013,M.silicone,.02);
  for(const sign of [-1,1]){box(c,[.075,.12,.085],[sign*.492,.02,.555],M.teal,.012);cyl(c,.013,.018,[sign*.505,.02,.61],M.steel,'z',10);}
  const disc=cyl(f,1,.026,[0,.02,.592],M.filter,'z',64);disc.scale.set(.443,1,.301);
  // Closely spaced folded media across a fitted ellipse.
  for(let j=-10;j<=10;j++){
    const x=j*.039,half=.29*Math.sqrt(Math.max(0,1-(x/.442)**2));
    const pleat=box(f,[.020,half*2,.025],[x,.02,.616],M.filter,.001);pleat.rotation.y=.45;
  }
  const grille=new T.Mesh(perforatedCover(),M.rubber);grille.position.set(0,.02,.662);grille.castShadow=true;v.add(grille);
  ellipse(v,.493,.331,.676,.014,M.black,.02);
  for(const sign of [-1,1])box(v,[.07,.095,.04],[sign*.498,.02,.67],M.dark,.01);
  label(v,'ReMask',.34,.07,[0,-.254,.710],'#95acae');
  // Upper and lower head straps, moulded mounts and adjustable buckles.
  for(const y of [.34,-.30]) {
    const pts=[[-.85,y,.10],[-1.04,y+.01,-.25],[-.93,y+.07,-.80],[-.48,y+.12,-1.13],[0,y+.13,-1.22],[.48,y+.12,-1.13],[.93,y+.07,-.80],[1.04,y+.01,-.25],[.85,y,.10]];
    const band=path(b,pts,.034,M.black);band.scale.y=1.04;
    for(const sign of [-1,1]){
      const mount=box(b,[.115,.16,.075],[sign*.846,y,.071],M.black,.024);mount.rotation.z=-sign*.18;
      box(b,[.071,.071,.018],[sign*.85,y,.113],M.teal,.008);
      cyl(b,.016,.015,[sign*.85,y-.053,.115],M.steel,'z',10);
      const buckle=box(b,[.13,.10,.075],[sign*.89,y+.07,-.84],M.teal,.016);buckle.rotation.y=sign*.35;
      box(b,[.071,.044,.081],[sign*.89,y+.07,-.84],M.black,.009);
    }
  }
  // Digital ID module is small, sealed and explicitly distinct from the filter.
  const tagBody=box(t,[.22,.15,.08],[.76,-.39,.10],M.teal,.025);tagBody.rotation.z=.32;
  for(let j=0;j<3;j++){
    const arc=new T.EllipseCurve(0,0,.021+j*.014,.021+j*.014,-1.1,1.1,false,0);
    const pts=arc.getPoints(15).map(p=>new T.Vector3(p.x+.73,p.y-.39,.146));
    const line=new T.Line(new T.BufferGeometry().setFromPoints(pts),new T.LineBasicMaterial({color:'#d9f3ee'}));t.add(line);
  }
  anchors.shell=marker(s,[-.66,.24,.33]);anchors.seal=marker(g,[-.80,-.22,.0]);
  anchors.cartridge=marker(c,[.48,.17,.60]);anchors.filter=marker(f,[-.15,.16,.63]);
  anchors.cover=marker(v,[.0,-.13,.72]);anchors.straps=marker(b,[.84,.40,-.63]);anchors.tag=marker(t,[.76,-.39,.17]);
  return {root,parts,anchors,closedAnchors:['shell','cover','straps','tag'],apply(open,explode){
    g.position.z=-explode*.42-open*.16;
    b.position.z=-explode*.79-open*.04;
    c.position.z=explode*.42+open*.20;
    f.position.z=explode*.85+open*.48;
    v.position.z=explode*1.27+open*.77;
    t.position.set(explode*.31,-explode*.23,explode*.15);
  }};
}
