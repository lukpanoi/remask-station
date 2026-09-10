// Presentation timeline only: these seconds are animation timing, not a UV dose or treatment protocol.
export const PROCESS_DURATION = 23;
export const PROCESS_STEPS = [
  { at:0, end:3.2, title:'รับหน้ากาก', part:'conveyor', text:'สายพานนำหน้ากากตัวอย่างเข้าช่องรับคืน แยกจากช่องจ่ายชิ้นพร้อมใช้' },
  { at:3.2, end:7.2, title:'ตรวจและถอดไส้กรอง', part:'intake', text:'จำลองการอ่านตัวตนและตรวจภาพ จากนั้นแยกไส้กรอง สายรัด และแท็กออก ไม่ส่งไส้กรองใช้แล้วเข้าห้อง UV' },
  { at:7.2, end:14.2, title:'ฆ่าเชื้อ · UV จำลอง', part:'uv', text:'ส่งเฉพาะโครงเข้าสู่ห้องปิด การเรืองแสงเป็นสัญลักษณ์การทำงาน ไม่ได้แทนโดสหรือรับรองการฆ่าเชื้อจริง ต้องทำความสะอาดก่อนและยืนยันกระบวนการด้วยการทดสอบ' },
  { at:14.2, end:18.6, title:'ตรวจซ้ำ', part:'output', text:'หยุด UV ก่อนเปิดทางออก แล้วเคลื่อนโครงไปตรวจซ้ำ ผลตรวจและสถานะทั้งหมดในแอนิเมชันเป็นข้อมูลสาธิต' },
  { at:18.6, end:23, title:'ตัดสิน PASS / REJECT', part:'output', text:'ตัวอย่าง PASS แสดงการประกอบตัวกรองทดแทนและจ่ายกลับ ส่วน REJECT แยกเข้าช่องกักโดยไม่จ่ายกลับอัตโนมัติ' },
];
const clamp=v=>Math.max(0,Math.min(1,v));
const progress=(t,a,b)=>clamp((t-a)/(b-a));
const smooth=v=>v*v*(3-2*v);
const mix=(a,b,t)=>a+(b-a)*smooth(clamp(t));
export function processFrame(seconds,result='pass') {
  const t=Math.max(0,Math.min(PROCESS_DURATION,Number.isFinite(seconds)?seconds:0));
  const stage=Math.max(0,PROCESS_STEPS.findIndex(s=>t<s.end));
  const step=t===PROCESS_DURATION?4:stage;
  const mask=[0,2.22,mix(1.24,.015,progress(t,0,3.2))];
  let rx=0,ry=0;
  const separation=smooth(progress(t,4.7,6.8));
  const topHatch=t<7.6?smooth(progress(t,6.9,7.6)):1-smooth(progress(t,8.7,9.15));
  const bottomHatch=t<14.5?smooth(progress(t,13.8,14.5)):1-smooth(progress(t,15.6,16.0));
  if(t>=7.2)mask[1]=mix(2.22,1.42,progress(t,7.6,8.7));
  if(t>=14.2)mask[1]=mix(1.42,.89,progress(t,14.5,15.6));
  if(t>=18.6){
    if(result==='reject'){
      mask[0]=mix(0,.38,progress(t,18.6,20.3));mask[1]=mix(.89,.63,progress(t,19.6,21.7));ry=mix(0,Math.PI/2,progress(t,18.6,19.5));mask[2]=-.055;
    }else{
      mask[1]=mix(.89,.57,progress(t,19.6,20.8));rx=mix(0,-Math.PI/2,progress(t,18.6,19.6));mask[2]=mix(.015,1.05,progress(t,20.8,23));
    }
  }
  const uv=t>=9.2&&t<13.6&&topHatch<.001&&bottomHatch<.001;
  return {time:t,step,mask,rx,ry,separation,topHatch,bottomHatch,uv,
    scan:(t>=3.3&&t<4.7)||(t>=16.0&&t<18.6),scanPhase:(t%1.6)/1.6,
    belt:t<3.2?progress(t,0,3.2):result==='pass'&&t>20.8?progress(t,20.8,23):0,
    incoming:t<3.2,outgoing:result!=='reject'&&t>20.8,
    replacement:result==='pass'?smooth(progress(t,18.8,20.2)):0,
    result:result==='reject'?'reject':'pass',complete:t>=PROCESS_DURATION,
    route:t>=18.6?(result==='reject'?'reject':'pass'):null,
  };
}
