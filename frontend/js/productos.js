const grid = document.getElementById('grid-productos');
const productos = JSON.parse(localStorage.getItem('productos_demo') || '[]');

function render(){
  if (!productos.length) grid.innerHTML = '<p>No hay productos.</p>';
  else {
    grid.innerHTML = '';
    productos.forEach(p => {
      const div = document.createElement('div');
      div.className = 'card-prod';
      div.innerHTML = `
        <div class="img-placeholder">Imagen</div>
        <h3>${p.nombre}</h3>
        <p>${p.descripcion || ''}</p>
        <p>Precio: $${p.precio.toFixed(2)}</p>
        <p>${p.stock>0? 'Disponible':'Agotado'}</p>
        <button ${p.stock==0?'disabled':''} data-id="${p.id}" class="add-cart">Agregar</button>
      `;
      grid.appendChild(div);
    });
  }
}
render();

grid.addEventListener('click', (e)=> {
  if (e.target.classList.contains('add-cart')){
    const id = e.target.dataset.id;
    const prod = productos.find(x=>x.id==id);
    addToCart(prod);
  }
});

function getCart(){ return JSON.parse(localStorage.getItem('cart')||'[]'); }
function saveCart(c){ localStorage.setItem('cart', JSON.stringify(c)); }
function addToCart(prod){
  const cart = getCart();
  const found = cart.find(p=>p.id==prod.id);
  if (found) found.qty++;
  else cart.push({...prod, qty:1});
  saveCart(cart);
  if (window.Swal) {
    Swal.fire("Carrito", "Agregado al carrito (modo demo local)", "success");
  } else {
    alert('Agregado al carrito');
  }
}
