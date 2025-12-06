// Archivo conservado sólo por si se requiere para cosas locales
// El panel de administración ahora usa las APIs del backend

function obtenerProductos(){
  return JSON.parse(localStorage.getItem("productos") || "[]");
}

function guardarProductos(arr){
  localStorage.setItem("productos", JSON.stringify(arr));
}

function agregarProducto(obj){
  const arr = obtenerProductos();
  obj.id = Date.now();
  arr.push(obj);
  guardarProductos(arr);
}

function editarProducto(id, datos){
  const arr = obtenerProductos();
  const idx = arr.findIndex(p=>p.id===id);
  if(idx>=0){
    arr[idx]=Object.assign(arr[idx], datos);
    guardarProductos(arr);
    return true;
  }
  return false;
}

function eliminarProducto(id){
  let arr = obtenerProductos();
  arr = arr.filter(p=> p.id !== id);
  guardarProductos(arr);
}
