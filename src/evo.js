/* =====================================================================
   EVOLUSI: sprite bentuk ke-2 / ke-3 (pilihan San, 20 Nov)
   kancik: Kancilon -> Kancilraja | cebongi: Kodi -> Katakraya | pioyo: Petokar -> Jagoapi
   kucingko: Macanko | tikusil: Tikusgar | dombanyo: Gembulon
   EVO[sp+st]() -> rig. Dipakai lewat evoBuild(sp, st).
   ===================================================================== */
const EVO = {};
function evoSetup() {
const G = (c) => glow(c), M = (c) => toon(c);
const ring=(p,n,rad,y,c,sz=0.09,jit=0.06)=>{for(let i=0;i<n;i++){const a=i/n*Math.PI*2; box(p,sz,sz,sz,G(c),Math.cos(a)*rad,y+Math.sin(i*2.1)*jit,Math.sin(a)*rad,{no:true,ry:a});}};
const floor=(r,rad,c)=>box(r.root,rad,0.04,rad,G(c),0,0.02,0,{no:true});
const leg=(r,g,x,z,H,w,mat,foot,ph=0)=>{const p=grp(g,x,H,z); box(p,w,H,w,mat,0,-H/2,0); box(p,w*1.3,0.08,w*1.5,foot,0,-H+0.04,0.03); r.legs.push({p,ph}); return p;};
const crys=(p,x,y,z,h,c,rz=0,rx=0)=>{box(p,0.12,h,0.12,G(c),x,y+h/2,z,{rz,rx,no:true}); box(p,0.07,0.1,0.07,M('#ffffff'),x,y+h+0.03,z,{rz,rx,no:true});};
const Q=(spec,extra)=>()=>{const r=buildQuad(spec); extra&&extra(r,spec); return r;};
const stripe=(p,c,pts)=>pts.forEach(([x,y,z,w,h,d])=>box(p,w,h,d,toon(c),x,y,z,{no:true}));
EVO.kancik2=()=>{const r=buildKancik(2);
  const g1=toon('#3fae4a'),g2=toon('#6fd05f');
  box(r.head,0.5,0.1,0.46,g1,0,-0.2,-0.02); for(let i=0;i<6;i++){const a=i/6*Math.PI*2; box(r.head,0.1,0.1,0.1,g2,Math.sin(a)*0.25,-0.2,Math.cos(a)*0.22-0.02,{ry:a});}
  box(r.body,0.14,0.05,0.5,g1,0.1,0.2,-0.3,{ry:0.2}); box(r.body,0.1,0.04,0.3,g2,0.12,0.18,-0.62,{ry:0.3});
  [[-0.1,0.3],[0.1,0.3]].forEach(([x,y])=>{});
  box(r.head,0.1,0.04,0.1,toon('#ff7fb2'),0.16,0.24,0.1); box(r.head,0.05,0.05,0.05,toon('#ffe14a'),0.16,0.27,0.1,{no:true});
  return r;};
EVO.kancik3=()=>{const r=newRig(),g=r.root; const bark=[M('#6a4a2c'),M('#7a5632'),M('#5a3e24')],moss=M('#4f9a3e'),LF=['#2f8f3a','#4fbf4f','#7ae06b','#9cf08a'].map(M),wood=M('#4a3220');
  const H=0.34; const body=grp(g,0,H+0.42,0); r.body=body; r.baseY=H+0.42;
  box(body,0.84,0.84,1.0,bark[0]); for(let i=0;i<4;i++) box(body,0.86,0.08,1.02,bark[1+i%2],0,-0.3+i*0.2,0,{no:true}); box(body,0.6,0.12,0.8,moss,0,-0.4,0);
  [[-0.43,0.1],[0.43,-0.3],[-0.2,-0.5],[0.3,0.3]].forEach(([x,z],i)=>box(body,0.04,0.2,0.2,M('#c9a86a'),x>0?0.43:-0.43,0.1,z,{no:true}));
  [[-1,0.35],[1,0.35],[-1,-0.4],[1,-0.4]].forEach(([sx,sz],i)=>{const p=leg(r,g,sx*0.3,sz,H,0.26,bark[2],M('#3a2814'),i%2*3); [-1,0,1].forEach(k=>box(p,0.08,0.08,0.2,wood,k*0.09,-H+0.04,0.18,{no:true,ry:k*0.3}));});
  const head=grp(body,0,0.25,0.62); r.head=head; faceBox(r,head,0.56,0.5,0.48,'#6a4a2c',{eyeC:'#ffe36a',blush:'#7a9a3a'}); box(head,0.4,0.16,0.14,moss,0,-0.16,0.26);
  [-1,1].forEach(sx=>box(head,0.14,0.28,0.1,bark[1],sx*0.34,0.18,-0.05,{rz:-sx*0.8}));
  [-1,1].forEach(sx=>{const A=(x,y,h,rz)=>box(head,0.1,h,0.1,wood,sx*x,y,-0.05,{rz:-sx*rz}); A(0.16,0.5,0.6,0.35);A(0.34,1.0,0.5,-0.2);A(0.4,0.75,0.4,1.0);A(0.14,0.9,0.4,-0.6);});
  const cs=[[0,1.25,-0.05,0.9,0.4,0.8,3],[-0.5,1.05,-0.05,0.55,0.3,0.55,1],[0.5,1.05,-0.05,0.55,0.3,0.55,1],[0,1.5,-0.05,0.55,0.3,0.55,2],[-0.3,1.4,0.1,0.35,0.25,0.35,0],[0.3,1.4,0.1,0.35,0.25,0.35,0],[0,1.68,-0.05,0.3,0.2,0.3,3]]; cs.forEach(([x,y,z,w,h,d,c])=>box(head,w,h,d,LF[c],x,y,z));
  [[-0.5,0.85],[0.5,0.85],[-0.2,1.1],[0.25,1.2]].forEach(([x,y],i)=>box(head,0.04,0.34+i*0.05,0.04,M('#3f9a3a'),x,y,0.15,{no:true}));
  const fl=['#ff7fb2','#ffe14a','#ffffff','#c58cff']; for(let i=0;i<10;i++) box(head,0.09,0.09,0.09,M(fl[i%4]),Math.cos(i*2.2)*0.55,1.25+Math.sin(i*1.7)*0.25,Math.sin(i*2.2)*0.3,{no:true});
  box(head,0.12,0.12,0.12,G('#fff08a'),0,1.85,-0.05,{no:true});
  [[-0.45,0.2,0.1],[0.45,0.0,-0.1]].forEach(([x,y,z])=>{box(body,0.3,0.06,0.3,M('#e0603a'),x,y+0.3,z); box(body,0.08,0.2,0.08,M('#f2e8d0'),x,y+0.18,z);});
  ring(g,10,1.0,0.5,'#ffd0ea',0.09,0.3); ring(g,8,0.7,1.3,'#fff08a',0.07,0.3); floor(r,1.2,'#d8ffb0'); r.h=2; return r;};
EVO.cebongi2=()=>{const r=buildCebongi(2);
  const w=toon('#2f8fd0'); [[-0.14,0.18,-0.1],[0.1,0.18,0.0],[-0.02,0.18,-0.2],[0.16,0.18,-0.2],[-0.12,0.18,0.12],[0.12,0.18,0.14]].forEach(([x,y,z])=>box(r.body,0.12,0.03,0.12,w,x,y,z,{no:true})); box(r.body,0.54,0.04,0.54,toon('#7fc8ee'),0,-0.14,0.0,{no:true});
  for(let i=0;i<4;i++) box(r.root,0.09,0.09,0.09,glow('#bdeeff'),Math.cos(i*1.6)*0.5,0.55+(i%2)*0.1,Math.sin(i*1.6)*0.5,{no:true});
  return r;};
EVO.cebongi3=()=>{const r=newRig(),g=r.root; const T=M('#2f9fb0'),T2=M('#238a9a'),BL=M('#ffe08a'),gold=M('#f2c230'),cape=M('#2a4fb0');
  const body=grp(g,0,0.5,0); r.body=body; r.baseY=0.5; box(body,0.78,0.9,0.62,T); box(body,0.56,0.7,0.06,BL,0,-0.05,0.32,{no:true});
  [[-0.2,0.2,0.32],[0.15,0.35,0.32],[0.22,-0.2,0.32]].forEach(([x,y,z])=>box(body,0.1,0.1,0.03,M('#f2d070'),x,y,z,{no:true}));
  [-1,1].forEach(sx=>{const p=grp(g,sx*0.3,0.3,0.05); box(p,0.3,0.3,0.4,T2,0,0.0,0); box(p,0.34,0.08,0.5,T2,0,-0.16,0.1); r.legs.push({p,ph:0,sx});});
  [-1,1].forEach(sx=>{const a=grp(body,sx*0.5,0.28,0.05); a.rotation.z=sx*0.2; box(a,0.2,0.62,0.22,T2,0,-0.25,0); box(a,0.26,0.16,0.28,T,0,-0.6,0.02); [-1,0,1].forEach(k=>box(a,0.06,0.1,0.08,T,k*0.08,-0.7,0.1,{no:true}));});
  const head=grp(body,0,0.62,0.04); r.head=head; faceBox(r,head,0.82,0.44,0.56,'#2f9fb0',{noEyes:true,wide:true,blush:'#f59a9a'});
  [-1,1].forEach(sx=>{box(head,0.3,0.26,0.3,T,sx*0.26,0.32,0.06); box(head,0.22,0.2,0.04,M('#ffffff'),sx*0.26,0.32,0.22,{no:true}); box(head,0.1,0.14,0.04,M('#26192a'),sx*0.26,0.32,0.245,{no:true});});
  box(head,0.5,0.2,0.3,BL,0,-0.22,0.18); box(head,0.34,0.14,0.2,G('#ffe36a'),0,-0.3,0.26,{no:true});
  for(let i=-3;i<=3;i++) box(head,0.08,0.2+(i===0?0.2:(Math.abs(i)%2?0:0.08)),0.08,gold,i*0.12,0.6+(i===0?0.1:0),-0.02); box(head,0.8,0.1,0.5,gold,0,0.48,-0.02); box(head,0.12,0.12,0.08,G('#ff5a7a'),0,0.58,0.22,{no:true});
  box(body,0.9,0.14,0.5,gold,0,0.42,0); box(body,0.9,1.2,0.08,cape,0,-0.1,-0.34); box(body,0.9,0.08,0.1,gold,0,-0.7,-0.34,{no:true});
  const st=grp(body,0.62,-0.35,0.3); box(st,0.07,1.3,0.07,M('#7a5230'),0,0.2,0); box(st,0.26,0.26,0.26,G('#7fd0ff'),0,0.95,0,{no:true,ry:0.7,rx:0.7}); box(st,0.14,0.14,0.14,M('#ffffff'),0,0.95,0,{no:true});
  ring(g,10,0.9,0.5,'#bdeeff',0.1,0.3); ring(g,8,0.7,1.5,'#fff08a',0.07,0.3); floor(r,1.1,'#bdeeff'); r.h=1.8; return r;};
EVO.pioyo2=()=>{const r=buildPioyo(2);
  r.feathers&&r.feathers.forEach(f=>{});
  const f=toon('#ff7a2a'); [-0.14,0,0.14].forEach(x=>box(r.body,0.05,0.18,0.05,f,x,0.3,-0.4,{rx:-0.5}));
  r.wings.forEach(w=>flame(r,w.w,0,-0.2,0,0.4));
  box(r.head,0.1,0.18,0.07,toon('#e23a2e'),0,0.3,0.04);
  return r;};
EVO.pioyo3=()=>{const r=newRig(),g=r.root; const R1=M('#e0401c'),GD=M('#ffc23a'),f1=G('#ff4a1a'),f2=G('#ff9a2a'),f3=G('#ffe36a'),f4=G('#fffbd0');
  const body=grp(g,0,1.0,0); r.body=body; r.baseY=1.0; body.rotation.x=0.15; box(body,0.5,0.5,0.9,R1); box(body,0.36,0.34,0.06,GD,0,-0.04,0.46,{no:true}); box(body,0.52,0.2,0.5,f2,0,-0.15,0.0,{no:true});
  r.wings=[-1,1].map(sx=>{const w=grp(body,sx*0.3,0.15,0.0); w.rotation.z=sx*0.35; for(let t=0;t<3;t++){for(let i=0;i<5;i++){box(w,0.5+i*0.16,0.05,0.18,[f1,f2,f3][(i+t)%3],sx*(0.4+i*0.12+t*0.0),0.08-t*0.07+i*0.03,-0.35+t*0.35+i*0.0,{no:true,rz:sx*(0.06*i)});} } box(w,0.9,0.1,0.5,R1,sx*0.5,0.05,0,{rz:sx*0.05}); box(w,0.16,0.16,0.16,f4,sx*1.45,0.4,0,{no:true}); return {w,sx};});
  const neck=grp(body,0,0.15,0.4); neck.rotation.x=0.5; box(neck,0.26,0.7,0.26,R1,0,0.35,0); const head=grp(neck,0,0.75,0.0); head.rotation.x=-0.5; r.head=head; faceBox(r,head,0.4,0.38,0.4,'#e8501e',{eyeC:'#1d0f08'}); box(head,0.12,0.08,0.18,M('#ffcf3a'),0,-0.05,0.27);
  [-3,-2,-1,0,1,2,3].forEach(k=>{box(head,0.06,0.5+(Math.abs(k)===3?0.2:0)+(k===0?0.2:0),0.06,[f1,f2,f3,f4][Math.abs(k)%4],k*0.07,0.35,-0.05-Math.abs(k)*0.1,{no:true,rz:-k*0.1,rx:-0.4-Math.abs(k)*0.15});});
  const tail=grp(body,0,0,-0.45); for(let i=0;i<7;i++){const k=i-3; const fp=grp(tail,0,0,0); fp.rotation.set(0.9,0,k*0.18); box(fp,0.12,1.5-Math.abs(k)*0.15,0.05,[f1,f2,f3][i%3],0,-0.8,-0.05,{no:true}); box(fp,0.16,0.16,0.08,f4,0,-1.55+Math.abs(k)*0.15,-0.05,{no:true});}
  [-1,1].forEach(sx=>{const p=grp(body,sx*0.15,-0.28,0.1); p.rotation.x=0.8; box(p,0.08,0.3,0.08,M('#e8b020'),0,-0.15,0,{no:true}); [-1,0,1].forEach(k=>box(p,0.05,0.05,0.16,M('#e8b020'),k*0.06,-0.32,0.06,{no:true}));});
  ring(g,14,1.05,1.0,'#ffd24a',0.1,0.4); box(g,0.5,0.04,0.5,G('#ff7a2a'),0,0.04,0,{no:true}); floor(r,1.0,'#ff9a2a'); r.h=2.2; return r;};
EVO.kucingko2=Q({fur:'#f0a040',dark:'#2e1d12',belly:'#fff1d6',body:[0.5,0.46,0.84],head:[0.56,0.5,0.5],legH:0.3,ear:'round',tail:'long',stripes:[-0.3,-0.15,0,0.15,0.3],snout:'#fff1d6',nose:'#e0587a',h:1.0,foot:'#2e1d12'},(r,S)=>{
  stripe(r.body,'#2e1d12',[[-0.255,0.1,-0.25,0.02,0.16,0.07],[-0.255,-0.05,-0.05,0.02,0.2,0.07],[-0.255,0.1,0.15,0.02,0.16,0.07],[0.255,0.1,-0.15,0.02,0.16,0.07],[0.255,-0.05,0.05,0.02,0.2,0.07],[0.255,0.1,0.25,0.02,0.16,0.07]]);
  stripe(r.head,'#2e1d12',[[0,0.2,0.2,0.05,0.08,0.02],[-0.12,0.2,0.2,0.04,0.07,0.02],[0.12,0.2,0.2,0.04,0.07,0.02]]);
  [-1,1].forEach(sx=>box(r.head,0.05,0.09,0.04,toon('#ffffff'),sx*0.1,-0.17,0.24,{no:true}));
  box(r.head,0.7,0.08,0.4,toon('#e07a1c'),0,-0.1,-0.12,{no:true});
});
EVO.tikusil2=()=>{const r=newRig(),g=r.root; const F=M('#6a7a8c'),F2=M('#4a5868'),BL=M('#c8d2de'),MT=M('#c0c8d0'),OR=M('#ff9a2a'),R=[M('#555e6a'),M('#7b8694')];
  const H=0.22; const body=grp(g,0,H+0.32,0); r.body=body; r.baseY=H+0.32; box(body,0.7,0.62,1.3,F); box(body,0.5,0.06,1.0,BL,0,-0.31,0);
  for(let i=0;i<6;i++) box(body,0.72-Math.abs(i-2.5)*0.04,0.14,0.2,R[i%2],0,0.34,-0.5+i*0.2); [0,1,2,3].forEach(i=>box(body,0.06,0.2,0.14,G('#ff9a2a'),-0.2+i*0.13,0.5,-0.4+i*0.0,{no:true}));
  [[-1,-0.45],[1,-0.45]].forEach(([sx,sz],i)=>{const p=leg(r,g,sx*0.3,sz,H,0.22,F2,R[0],i*3); });
  [-1,1].forEach(sx=>{const a=grp(body,sx*0.42,-0.1,0.5); a.rotation.x=0.2; box(a,0.3,0.4,0.36,F2,0,-0.1,0); box(a,0.4,0.2,0.4,R[0],0,-0.34,0.06); [-1,0,1].forEach(k=>{box(a,0.08,0.06,0.4,M('#f0ece0'),k*0.12,-0.4,0.38,{no:true,rx:0.2}); box(a,0.06,0.05,0.2,M('#f0ece0'),k*0.12,-0.42,0.62,{no:true,rx:0.3});});});
  const head=grp(body,0,0.0,0.82); r.head=head; faceBox(r,head,0.5,0.46,0.4,'#6a7a8c',{noEyes:true}); box(head,0.52,0.1,0.12,M('#2a3038'),0,0.08,0.2); [-1,1].forEach(sx=>{box(head,0.2,0.2,0.08,M('#7fd0ff'),sx*0.14,0.08,0.24,{no:true}); box(head,0.08,0.1,0.04,M('#1a1020'),sx*0.14,0.08,0.29,{no:true}); box(head,0.26,0.26,0.1,MT,sx*0.14,0.08,0.18,{no:true}); box(head,0.2,0.2,0.04,G('#9fe8ff'),sx*0.14,0.08,0.26,{no:true}); box(head,0.08,0.1,0.04,M('#1a1020'),sx*0.14,0.08,0.29,{no:true});});
  [-1,1].forEach(sx=>box(head,0.2,0.2,0.05,F,sx*0.28,0.3,-0.05,{rz:-sx*0.3}));
  const dr=grp(head,0,-0.06,0.2); [[0.34,0.3,0.14],[0.28,0.26,0.28],[0.22,0.22,0.42],[0.16,0.18,0.56],[0.1,0.14,0.7]].forEach(([w,h,z,],i)=>{box(dr,w,h,0.16,i%2?MT:M('#e0e6ee'),0,0,z-0.14); box(dr,w+0.02,0.04,0.06,OR,0,h*0.2,z-0.14+0.05,{no:true,rz:0.0});}); box(dr,0.07,0.07,0.1,G('#ffffff'),0,0,0.72,{no:true});
  [-1,1].forEach(sx=>box(dr,0.04,0.12,0.04,G('#9fe8ff'),sx*0.3,0.0,0.3,{no:true}));
  const tail=grp(body,0,0.0,-0.66); for(let i=0;i<5;i++) box(tail,0.08,0.08,0.2,M('#f2a9b0'),0,-i*0.02,-0.1-i*0.2,{no:true});
  ring(g,12,1.0,0.4,'#ffb050',0.08,0.3); floor(r,1.3,'#c0c8d0'); r.h=1.0; return r;};
EVO.dombanyo2=()=>{const r=newRig(),g=r.root; const F=M('#d8b070'),F2=M('#a8803a'),BL=M('#f6e8c0'),W=M('#fff6e0'),GD=G('#ffd24a'),H=0.62;
  const body=grp(g,0,H+0.3,0); r.body=body; r.baseY=H+0.3; box(body,0.56,0.56,1.1,F); box(body,0.4,0.06,0.9,BL,0,-0.28,0);
  [[-1,0.38],[1,0.38],[-1,-0.4],[1,-0.4]].forEach(([sx,sz],i)=>{const p=leg(r,g,sx*0.2,sz,H,0.14,F2,M('#2f2420'),i%2*3); box(p,0.24,0.34,0.26,W,0,0.02,0);});
  for(let i=0;i<7;i++){const a=i/7*Math.PI; box(body,0.58+Math.sin(a)*0.2,0.2,0.2,W,0,0.2,-0.5+i*0.17-0.0,{no:true});}
  const neck=grp(body,0,0.2,0.5); neck.rotation.x=0.6; box(neck,0.34,0.6,0.34,F,0,0.3,0); [[0,0.2,0.0,0.62,0.4,0.5],[-0.3,0.35,0.0,0.36,0.34,0.36],[0.3,0.35,0.0,0.36,0.34,0.36],[0,0.5,0.05,0.5,0.3,0.4]].forEach(([x,y,z,w,h,d],i)=>box(neck,w,h,d,W,x,y,z));
  const head=grp(neck,0,0.7,0.04); head.rotation.x=-0.6; r.head=head; faceBox(r,head,0.4,0.4,0.42,'#d8b070',{eyeC:'#2a1a08',blush:'#d98a8a'}); box(head,0.24,0.2,0.2,BL,0,-0.1,0.26); box(head,0.08,0.06,0.04,M('#2a1a14'),0,-0.02,0.37,{no:true});
  [-1,1].forEach(sx=>{box(head,0.26,0.12,0.14,F2,sx*0.28,0.06,-0.04,{rz:-sx*0.5}); const hg=grp(head,sx*0.24,0.2,-0.04); [[0,0,0.22,0.16],[sx*0.12,0.1,0.2,0.15],[sx*0.24,0.06,0.18,0.14],[sx*0.32,-0.06,0.15,0.13],[sx*0.3,-0.2,0.12,0.12],[sx*0.2,-0.28,0.1,0.11],[sx*0.1,-0.28,0.08,0.1]].forEach(([x,y,s,t],i)=>box(hg,s,t,0.2,i%2?M('#f2c230'):GD,x,y,0,{no:true}));});
  box(head,0.1,0.1,0.06,G('#7fff9a'),0,0.22,0.2,{no:true}); box(head,0.5,0.06,0.3,GD,0,0.24,0.0,{no:true});
  const tail=grp(body,0,0.1,-0.58); box(tail,0.2,0.2,0.2,W,0,0,-0.08);
  ring(g,12,1.0,0.8,'#ffe36a',0.09,0.3); ring(g,8,0.7,1.8,'#ffffff',0.07,0.3); floor(r,1.2,'#fff2a0'); r.h=1.9; return r;};
}
evoSetup();
function evoFinish(r, size) {
  r.size = size || r.size;
  if (!r.update) r.update = (t, walk) => {
    const sp = walk ? 7 : 0;
    r.legs.forEach((l) => { if (l.p) l.p.rotation.x = walk ? Math.sin(t * sp + (l.ph || 0)) * 0.55 : 0; });
    if (r.body) r.body.position.y = r.baseY + (walk ? Math.abs(Math.sin(t * sp)) * 0.04 : Math.sin(t * 2) * 0.01);
    if (r.head) r.head.rotation.x = (r.head.userData.rx0 || 0) + Math.sin(t * 1.3) * 0.05;
    if (r.wings) r.wings.forEach((w) => { w.w.rotation.z = (w.w.userData.rz0 === undefined ? (w.w.userData.rz0 = w.w.rotation.z) : w.w.userData.rz0) + Math.sin(t * (walk ? 9 : 2.2) + (w.sx || 1)) * (walk ? 0.3 : 0.08) * (w.sx || 1); });
  };
  if (r.head && r.head.userData.rx0 === undefined) r.head.userData.rx0 = r.head.rotation.x;
  return r;
}
const EVO_SIZE = { kancik2: 1.3, kancik3: 1.15, cebongi2: 1.3, cebongi3: 1.15, pioyo2: 1.3, pioyo3: 1.15, kucingko2: 1.2, tikusil2: 1.15, dombanyo2: 1.0 };
function evoBuild(sp, st) {
  const f = EVO[sp + st]; if (!f) return null;
  const r = f(); return evoFinish(r, EVO_SIZE[sp + st] || 1.2);
}
