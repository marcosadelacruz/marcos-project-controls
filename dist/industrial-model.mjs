import * as T from './vendor/three/three.module.js';

// A real, freely orbitable mesh reconstruction inspired by the selected image.
// Dimensions are artistic world units, not an engineering design or survey.
export const MODEL_VIEWS=Object.freeze([
 {label:'Vista general',azimuth:.82,elevation:.56,span:34,target:[0,3,0]},
 {label:'Montaje · Estructura',azimuth:-.55,elevation:.47,span:24,target:[2,4,0]},
 {label:'Ingeniería · Sistemas',azimuth:-2.12,elevation:.60,span:26,target:[-3,2.5,2]},
 {label:'Ferroviario · Monorriel',azimuth:-3.72,elevation:.44,span:30,target:[-5,2,0]}
]);

export function buildIndustrialModel({instanced=true}={}){
 const root=new T.Group();root.name='industrial-diorama';
 const geometry={box:new T.BoxGeometry(1,1,1),cylinder:new T.CylinderGeometry(1,1,1,12),sphere:new T.IcosahedronGeometry(1,1),cone:new T.ConeGeometry(1,1,7)};
 const leafPositions=[],leafIndices=[];
 for(let i=0;i<=7;i++){const t=i/7,w=Math.sin(t*Math.PI)*.16,y=Math.sin(t*Math.PI)*.16-.58*t*t;leafPositions.push(t*1.5,y,-w,t*1.5,y,w);if(i<7){const j=i*2;leafIndices.push(j,j+1,j+2,j+1,j+3,j+2);}}
 geometry.leaf=new T.BufferGeometry();geometry.leaf.setAttribute('position',new T.Float32BufferAttribute(leafPositions,3));geometry.leaf.setIndex(leafIndices);geometry.leaf.computeVertexNormals();
 const colors={steel:0x214c55,steelLight:0x547781,concrete:0xcec7b8,edge:0xaaa698,copper:0xb97850,copperLight:0xd69b6d,gold:0xd4a14c,pipe:0x9baca8,dark:0x183a43,glass:0x1f455c,white:0xf2eee0,green:0x526a3d,lightGreen:0x7d8d4e,bark:0x797055,soil:0x9e9074,sand:0xc6b99a,road:0x858983,water:0x428e94,rock:0x7f8270,rubber:0x323b3b};
 const materials=Object.fromEntries(Object.entries(colors).map(([k,color])=>[k,new T.MeshStandardMaterial({color,roughness:k==='water'?.37:.78,metalness:['pipe','copper','steel'].includes(k)?.32:.05,flatShading:true})]));
 materials.green.side=T.DoubleSide;materials.lightGreen.side=T.DoubleSide;
 let partCount=0;
 const up=new T.Vector3(0,1,0),unitZ=new T.Vector3(0,0,1);
 function batch(parent,name){
  const buckets=new Map();
  const add=(kind,material,p,s,q=new T.Quaternion())=>{const key=kind+':'+material;if(!buckets.has(key))buckets.set(key,[]);buckets.get(key).push(new T.Matrix4().compose(new T.Vector3(...p),q,new T.Vector3(...s)));partCount++;};
  const box=(x,y,z,w,h,d,m='steel',ry=0)=>add('box',m,[x,y,z],[w,h,d],new T.Quaternion().setFromAxisAngle(up,ry));
  const ball=(x,y,z,r,m='green',sy=1)=>add('sphere',m,[x,y,z],[r,r*sy,r]);
  const rod=(a,b,r,m='steel')=>{const av=new T.Vector3(...a),bv=new T.Vector3(...b),delta=bv.clone().sub(av);if(delta.length()<1e-5)return;add('cylinder',m,av.clone().add(bv).multiplyScalar(.5).toArray(),[r,delta.length(),r],new T.Quaternion().setFromUnitVectors(up,delta.normalize()));};
  const column=(x,z,height,r=.14,m='steel',base=0)=>rod([x,base,z],[x,base+height,z],r,m);
  function iBeam(a,b,size=.18){
   const av=new T.Vector3(...a),bv=new T.Vector3(...b),len=av.distanceTo(bv),q=new T.Quaternion().setFromUnitVectors(up,bv.clone().sub(av).normalize()),center=av.add(bv).multiplyScalar(.5);
   const shift=new T.Vector3(size*.43,0,0).applyQuaternion(q);
   add('box','steel',center.toArray(),[size*.2,len,size],q);
   for(const f of [-1,1])add('box','steel',center.clone().addScaledVector(shift,f).toArray(),[size*.18,len,size*1.25],q);
  }
  function rail(a,b){rod(a,b,.026,'gold');const av=new T.Vector3(...a),bv=new T.Vector3(...b),n=Math.ceil(av.distanceTo(bv)/1.15);for(let i=0;i<=n;i++){const p=av.clone().lerp(bv,i/n);rod([p.x,p.y-1,p.z],[p.x,p.y,p.z],.024,'gold');}rod([a[0],a[1]-.5,a[2]],[b[0],b[1]-.5,b[2]],.018,'gold');}
  function commit(){const group=new T.Group();group.name=name;for(const [key,matrices]of buckets){const [kind,m]=key.split(':');if(instanced){const mesh=new T.InstancedMesh(geometry[kind],materials[m],matrices.length);matrices.forEach((matrix,i)=>mesh.setMatrixAt(i,matrix));mesh.instanceMatrix.needsUpdate=true;mesh.castShadow=true;mesh.receiveShadow=true;group.add(mesh);}else for(const matrix of matrices){const mesh=new T.Mesh(geometry[kind],materials[m]);mesh.applyMatrix4(matrix);group.add(mesh);}}parent.add(group);return group;}
  return {add,box,ball,rod,column,iBeam,rail,commit};
 }
 const site=batch(root,'site-and-structures');
 site.box(0,-.55,0,26,1.1,18,'soil');site.box(0,.015,0,26,.09,18,'sand');
 site.box(0,.07,7.75,25.7,.04,2.3,'water');
 for(let i=0;i<45;i++){const x=-12.3+i*.55,z=6.4+Math.sin(i*.8)*.25;site.ball(x,.13,z,.25+(i%3)*.09,'rock',.7);}
 site.box(0,.105,5.45,25,.11,1.45,'road');
 for(let x=-11;x<=11;x+=1.9)site.box(x,.167,5.45,.8,.012,.035,'white');
 for(const z of [-6.8,6.3])site.rail([-12.4,1.1,z],[12.4,1.1,z]);

 // Four-storey structural frame: full depth, decks, braces, bolted footings.
 const xs=[0,3,6],zs=[-3,0,3],levels=[2,4,6,8];
 for(const x of xs)for(const z of zs){site.box(x,.12,z,.7,.24,.7,'concrete');site.box(x,.28,z,.38,.07,.38,'steelLight');site.iBeam([x,.3,z],[x,8.35,z],.22);for(const dx of [-.22,.22])for(const dz of [-.22,.22])site.column(x+dx,z+dz,.12,.035,'dark',.25);}
 for(const y of levels){
  for(const z of zs)site.iBeam([0,y,z],[6,y,z],.21);
  for(const x of xs)site.iBeam([x,y,-3],[x,y,3],.21);
  for(let z=-2.6;z<3;z+=.5)site.box(3,y+.10,z,6,.06,.055,'steelLight');
  site.box(1.6,y+.12,-1.5,2.6,.07,2.8,'concrete');
  site.rail([0,y+1,-3],[6,y+1,-3]);site.rail([0,y+1,3],[6,y+1,3]);site.rail([0,y+1,-3],[0,y+1,3]);site.rail([6,y+1,-3],[6,y+1,3]);
 }
 for(const z of [-3,3])for(const y of [0,4]){site.rod([0,y+.35,z],[3,y+4,z],.045,'steelLight');site.rod([3,y+.35,z],[0,y+4,z],.045,'steelLight');site.rod([3,y+.35,z],[6,y+4,z],.045,'steelLight');}
 for(const y of [0,2,4,6]){
  for(let i=0;i<12;i++)site.box(6.7,y+(i+1)/6,2.8-i*.25,.95,.10,.3,'steelLight');
  site.rail([6.22,y+1,2.9],[6.22,y+3,-.1]);site.rail([7.18,y+1,2.9],[7.18,y+3,-.1]);
 }
 site.box(-1.55,3.5,-2.4,1.8,7,1.8,'concrete');
 for(let y=.65;y<7;y+=1)site.box(-2.46,y,-2.4,.025,.035,1.7,'edge');
 site.box(4,1.35,4.15,4.8,2.7,1.55,'concrete');
 for(const x of [2.7,4.1,5.5]){site.box(x,1.25,4.94,.8,1.8,.035,'dark');for(let y=.5;y<2.1;y+=.16)site.box(x,y,4.97,.75,.03,.035,'steelLight');}
 for(const x of [2.4,3.9,5.4])site.box(x,2.85,4.15,.65,.3,.6,'steelLight');

 // Copper tanks, rings, access ladders, top guardrails and equipment nozzles.
 for(const x of [-5.75,-3.35]){
  site.column(x,.1,5.25,1,'copper');
  site.column(x,.1,.10,1.04,'copperLight',5.25);site.column(x,.1,.12,1.08,'edge',.12);
  for(const y of [.6,1.7,2.8,3.9,5.08])site.column(x,.1,.025,1.012,'copperLight',y);
  for(let j=0;j<20;j++){const a=j/20*Math.PI*2,b=(j+1)/20*Math.PI*2;site.rod([x+Math.cos(a)*1.05,5.94,.1+Math.sin(a)*1.05],[x+Math.cos(b)*1.05,5.94,.1+Math.sin(b)*1.05],.025,'gold');if(j%2===0)site.column(x+Math.cos(a)*1.05,.1+Math.sin(a)*1.05,.65,.02,'gold',5.3);}
  for(const dx of [-.2,.2])site.rod([x+dx,.3,1.17],[x+dx,5.65,1.17],.025,'pipe');
  for(let y=.4;y<5.6;y+=.28)site.rod([x-.2,y,1.17],[x+.2,y,1.17],.02,'pipe');
  site.rod([x,4.4,1.05],[x,4.4,1.65],.12,'pipe');site.column(x,.1,.22,.14,'pipe',5.35);
 }

 // Flanged piping, support shoes, handwheels and a horizontal pressure vessel.
 for(let j=0;j<3;j++){
  const z=2.4+j*.6,y=1.15+j*.33;
  site.rod([-8,y,z],[7.4,y,z],.12,'pipe');
  site.rod([-8,y,z],[-8,.3,z],.12,'pipe');site.rod([7.4,y,z],[7.4,.3,z],.12,'pipe');
  for(let x=-7.5;x<7;x+=2.15){site.rod([x-.065,y,z],[x+.065,y,z],.2,'pipe');for(let k=0;k<6;k++){const a=k/6*Math.PI*2;site.rod([x-.09,y+Math.cos(a)*.16,z+Math.sin(a)*.16],[x+.09,y+Math.cos(a)*.16,z+Math.sin(a)*.16],.022,'dark');}}
  for(const x of [-6,-1,4,7]){site.box(x,.4,z,.16,.8,.16,'steel');site.box(x,.85,z,.55,.1,.4,'steelLight');}
  site.column(-1.1,z,.32,.13,'copper',y);site.rod([-1.4,y+.34,z],[-.8,y+.34,z],.03,'gold');
 }
 site.rod([-5.75,4.4,1.65],[-5.75,1.82,1.65],.12,'pipe');site.rod([-3.35,4.4,1.65],[-3.35,1.82,1.65],.12,'pipe');
 site.rod([-5.75,1.82,1.65],[0,1.82,1.65],.12,'pipe');
 site.rod([-5.6,1.0,4.05],[-3.2,1.0,4.05],.48,'white');site.ball(-5.6,1,4.05,.48,'white');site.ball(-3.2,1,4.05,.48,'white');
 for(const x of [-5.2,-3.6]){site.box(x,.4,4.05,.16,.6,.6,'steel');site.column(x,4.05,.25,.09,'pipe',1.4);}
 for(const x of [-1.1,8.4]){site.box(x,.7,4.7,1.0,1.25,.85,'copper');site.box(x,1.37,4.7,1.1,.10,.95,'copperLight');site.box(x,.9,5.14,.6,.45,.025,'steelLight');}
 // Small loader, including four volumetric tyres and a front bucket.
 site.box(9,.55,3.3,1.7,.48,1.0,'gold');site.box(9.2,1.1,3.3,.75,.7,.8,'glass');site.box(9.2,1.5,3.3,.9,.12,.95,'gold');
 for(const x of [8.45,9.55])for(const z of [2.72,3.88])site.rod([x,.35,z-.13],[x,.35,z+.13],.32,'rubber');
 site.rod([8.5,.65,3.05],[7.55,.55,3.05],.08,'gold');site.rod([8.5,.65,3.55],[7.55,.55,3.55],.08,'gold');site.box(7.3,.28,3.3,.65,.3,1.25,'gold');

 // Green perimeter: dimensional trunks, crowns, bushes and rocky riverbank.
 function palm(x,z,h=2.4){
  site.rod([x,.12,z],[x+.1,h*.55,z+.04],.075,'bark');site.rod([x+.1,h*.55,z+.04],[x+.26,h,z],.055,'bark');
  for(let i=0;i<10;i++){const a=i/10*Math.PI*2;site.add('leaf',i%2?'green':'lightGreen',[x+.26,h,z],[1,1,1],new T.Quaternion().setFromAxisAngle(up,a));site.rod([x+.26,h,z],[x+.26+Math.cos(a)*.7,h+.12,z-Math.sin(a)*.7],.018,'green');}
  site.ball(x+.26,h-.15,z,.17,'green');
 }
 for(let i=0;i<19;i++){const x=-12+i*1.32;palm(x,-7.2,1.8+(i%4)*.33);if(i%2===0)palm(x,6.6,1.7+(i%3)*.4);}
 for(const z of [-5,-2,1,4]){palm(-12,z,2.3);palm(11.8,z,2.6);}
 for(let i=0;i<100;i++){const x=-12.5+(i*1.381)%25,z=i%2?-7.7:6.5;if(Math.abs(x)<3&&i%3===0)continue;site.ball(x,.35,z,.25+(i%5)*.07,i%3?'green':'lightGreen',1.2);}

 // Steel tower under the crane; all four sides are present.
 for(const x of [8.4,9.4])for(const z of [-2.8,-1.8])site.column(x,z,7.6,.085,'steel');
 for(let y=0;y<7.6;y+=1.2){
  for(const z of [-2.8,-1.8]){site.rod([8.4,y,z],[9.4,y+1.2,z],.04,'steelLight');site.rod([9.4,y,z],[8.4,y+1.2,z],.04,'steelLight');}
  for(const x of [8.4,9.4]){site.rod([x,y,-2.8],[x,y+1.2,-1.8],.04,'steelLight');site.rod([x,y,-1.8],[x,y+1.2,-2.8],.04,'steelLight');}
 }
 site.box(8.9,7.5,-2.3,1.7,.18,1.7,'steelLight');
 site.commit();

 // Elevated single-beam guideway, with fully modelled piers and capitals.
 const track=new T.CatmullRomCurve3([[-4,3,-5.8],[-9,3,-5.3],[-11,3,-2],[-10.8,3,2.1],[-8.3,3,4.4],[-5.5,3,4.7]].map(p=>new T.Vector3(...p)),false,'catmullrom',.3);
 const guide=batch(root,'monorail-guideway');
 for(let i=0;i<150;i++){const a=track.getPointAt(i/150),b=track.getPointAt((i+1)/150),mid=a.clone().add(b).multiplyScalar(.5),d=b.clone().sub(a);guide.box(mid.x,mid.y,mid.z,.48,.36,d.length()+.025,'concrete',Math.atan2(d.x,d.z));}
 for(let i=0;i<=10;i++){const p=track.getPointAt(i/10);guide.column(p.x,p.z,2.75,.16,'concrete');guide.box(p.x,2.75,p.z,.75,.2,.65,'concrete');guide.box(p.x,.12,p.z,.65,.24,.65,'edge');}
 guide.commit();

 // Four articulated cars follow the same 3D curve individually.
 const cars=[];
 for(let i=0;i<4;i++){
  const group=new T.Group();group.name=`monorail-car-${i}`;root.add(group);const b=batch(group,'car-body');
  b.box(0,.42,0,.62,.60,1.35,'white');b.box(0,.75,0,.56,.07,1.28,'white');b.box(0,.22,0,.635,.12,1.38,'steelLight');b.box(0,.08,0,.30,.25,1.15,'rubber');
  for(const x of [-.317,.317]){b.box(x,.46,0,.022,.33,1.19,'glass');for(const z of [-.43,-.14,.15,.44])b.box(x,.46,z,.028,.34,.025,'white');b.box(x,.24,0,.025,.06,1.32,'steel');}
  for(const z of [-.44,.44])b.box(0,.82,z,.38,.08,.22,'steelLight');
  if(i===0||i===3){const z=i===0?.73:-.73;b.ball(0,.43,z,.32,'white',.95);b.box(0,.53,z+(i===0?.22:-.22),.44,.24,.04,'glass');for(const x of [-.22,.22])b.ball(x,.29,z+(i===0?.25:-.25),.04,'gold');}
  else b.box(0,.43,.73,.52,.46,.10,'rubber');
  b.commit();cars.push(group);
 }

 // A slewing crane with real lattice boom, variable cable length and lifted beam.
 const crane=new T.Group();crane.name='crane-slew';crane.position.set(8.9,7.7,-2.3);root.add(crane);
 const cb=batch(crane,'crane-upperworks');cb.box(0,.4,0,1.6,.65,1.4,'gold');cb.box(.2,.7,.45,.8,.6,.6,'steelLight');cb.box(.2,.77,.76,.65,.30,.025,'glass');cb.box(1,.4,-.3,.8,.9,1.3,'copper');
 const start=new T.Vector3(-.2,.45,0),tip=new T.Vector3(-5.9,7.6,0),axis=tip.clone().sub(start),side=new T.Vector3(0,0,.26),cross=new T.Vector3(axis.y,-axis.x,0).normalize().multiplyScalar(.23);
 const corners=[side.clone().add(cross),side.clone().sub(cross),side.clone().negate().add(cross),side.clone().negate().sub(cross)];
 for(const c of corners)cb.rod(start.clone().add(c).toArray(),tip.clone().addScaledVector(c,.45).toArray(),.035,'steel');
 for(let i=0;i<14;i++){
  const a=start.clone().lerp(tip,i/14),b=start.clone().lerp(tip,(i+1)/14),width=1-i/25;
  for(const pair of [[0,1],[1,3],[3,2],[2,0]]){const c1=corners[pair[0]].clone().multiplyScalar(width),c2=corners[pair[1]].clone().multiplyScalar(width-.03);cb.rod(a.clone().add(c1).toArray(),b.clone().add(c2).toArray(),.019,'steelLight');cb.rod(a.clone().add(c2).toArray(),b.clone().add(c1).toArray(),.019,'steelLight');}
 }
 cb.rod([.9,.5,-.5],[-.4,3,-.4],.018,'bark');cb.rod([-.4,3,-.4],tip.toArray(),.018,'bark');cb.ball(tip.x,tip.y,tip.z,.14,'gold');cb.commit();
 const cable=new T.Mesh(geometry.cylinder,materials.dark);cable.name='hoist-cable';crane.add(cable);
 const load=new T.Group();load.name='crane-load';crane.add(load);const lb=batch(load,'hook-sling-beam');
 lb.box(0,0,0,.16,.26,.14,'gold');lb.rod([0,-.15,0],[-1.2,-1.1,0],.024,'bark');lb.rod([0,-.15,0],[1.2,-1.1,0],.024,'bark');
 lb.box(0,-1.15,0,3,.10,.35,'steelLight');lb.box(0,-1.32,0,3,.26,.08,'steel');lb.box(0,-1.48,0,3,.10,.35,'steelLight');lb.commit();
 const length=track.getLength(),tangent=new T.Vector3();
 function animate(seconds){
  const travel=(1-Math.cos(seconds*Math.PI*2/32))/2;
  const lead=T.MathUtils.lerp(6/length,1-1/length,travel);
  cars.forEach((car,i)=>{const u=Math.max(0,Math.min(1,lead-i*1.6/length));car.position.copy(track.getPointAt(u));car.position.y+=.25;track.getTangentAt(u,tangent);car.quaternion.setFromUnitVectors(unitZ,tangent.normalize());});
  crane.rotation.y=Math.sin(seconds*.22)*.06;
  const hookY=3.0+Math.sin(seconds*.4)*.85;load.position.set(tip.x,hookY,0);load.rotation.y=Math.sin(seconds*.33)*.035;
  cable.position.set(tip.x,(tip.y+hookY+.15)/2,0);cable.scale.set(.017,tip.y-hookY-.15,.017);
 }
 animate(0);root.updateMatrixWorld(true);
 root.userData={conceptual:true,partCount,instanced,source:'Original isometric reference; unseen faces interpreted.'};
 return {root,animate,track,cars,crane,load,cable,partCount,materials,geometries:geometry};
}

export function makeModelScene(model){
 const scene=new T.Scene();scene.background=new T.Color(0xeee8db);scene.add(model.root);
 scene.add(new T.HemisphereLight(0xfff5e2,0x6a7c70,2.0));
 const key=new T.DirectionalLight(0xffe2b3,3.1);key.position.set(-12,22,14);key.castShadow=true;key.shadow.mapSize.set(2048,2048);key.shadow.camera.left=-20;key.shadow.camera.right=20;key.shadow.camera.top=20;key.shadow.camera.bottom=-20;key.shadow.normalBias=.035;scene.add(key);
 const fill=new T.DirectionalLight(0xd7e8e8,.75);fill.position.set(12,9,-15);scene.add(fill);
 const ground=new T.Mesh(new T.PlaneGeometry(180,180),new T.MeshStandardMaterial({color:0xeee8db,roughness:1}));ground.rotation.x=-Math.PI/2;ground.position.y=-1.12;ground.receiveShadow=true;ground.name='shadow-ground';scene.add(ground);
 return scene;
}

export function positionModelCamera(camera,view,aspect=1){
 const target=new T.Vector3(...view.target),d=65,ce=Math.cos(view.elevation);
 camera.position.set(target.x+Math.sin(view.azimuth)*ce*d,target.y+Math.sin(view.elevation)*d,target.z+Math.cos(view.azimuth)*ce*d);
 camera.lookAt(target);camera.left=-view.span/2;camera.right=view.span/2;camera.top=view.span/2/aspect;camera.bottom=-view.span/2/aspect;camera.near=.1;camera.far=200;camera.updateProjectionMatrix();camera.updateMatrixWorld();
 return camera;
}
