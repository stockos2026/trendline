const DB_NAME = "chartTechnicalAnalysis";
const STORE = "images";

function openDB(){
  return new Promise((resolve,reject)=>{
    const req=indexedDB.open(DB_NAME,1);
    req.onupgradeneeded=()=>req.result.createObjectStore(STORE,{keyPath:"id",autoIncrement:true});
    req.onsuccess=()=>resolve(req.result);
    req.onerror=()=>reject(req.error);
  });
}

async function saveImage(category,file){
  const db=await openDB();
  await new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).add({
      category,
      name:file.name,
      type:file.type,
      data:file
    });
    tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error);
  });
}

async function deleteImage(id){
  const db=await openDB();
  await new Promise((resolve,reject)=>{
    const tx=db.transaction(STORE,"readwrite");
    tx.objectStore(STORE).delete(Number(id));
    tx.oncomplete=resolve; tx.onerror=()=>reject(tx.error);
  });
  loadImages();
}

async function loadImages(){
  const db=await openDB();
  const items=await new Promise((resolve,reject)=>{
    const req=db.transaction(STORE,"readonly").objectStore(STORE).getAll();
    req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error);
  });

  document.querySelectorAll(".category").forEach(section=>{
    const category=section.querySelector(".dropzone").dataset.category;
    const gallery=section.querySelector(".gallery");
    gallery.innerHTML="";
    items.filter(x=>x.category===category).forEach(item=>{
      const url=URL.createObjectURL(item.data);
      const card=document.createElement("div");
      card.className="photo";
      card.innerHTML=`<img src="${url}" alt="${item.name.replace(/"/g,'&quot;')}">
                     <button class="delete" type="button">Διαγραφή</button>`;
      card.querySelector(".delete").onclick=()=>deleteImage(item.id);
      gallery.appendChild(card);
    });
  });
}

document.querySelectorAll(".dropzone").forEach(zone=>{
  const input=zone.querySelector("input");
  zone.addEventListener("click",e=>{
    if(e.target!==input) input.click();
  });
  input.addEventListener("change",()=>{
    [...input.files].forEach(file=>{
      if(file.type.startsWith("image/")) saveImage(zone.dataset.category,file).then(loadImages);
    });
    input.value="";
  });
  ["dragenter","dragover"].forEach(ev=>zone.addEventListener(ev,e=>{
    e.preventDefault(); zone.classList.add("dragover");
  }));
  ["dragleave","drop"].forEach(ev=>zone.addEventListener(ev,e=>{
    e.preventDefault(); zone.classList.remove("dragover");
  }));
  zone.addEventListener("drop",e=>{
    [...e.dataTransfer.files].forEach(file=>{
      if(file.type.startsWith("image/")) saveImage(zone.dataset.category,file).then(loadImages);
    });
  });
});

loadImages();
