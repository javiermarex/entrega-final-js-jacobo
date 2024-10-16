const urlJson = "https://script.googleusercontent.com/macros/echo?user_content_key=DINlBFs9T735xmZZaRVdTOcgaany3rYwX552yh9Fipuw1ElqqGeUhrk_5CDBfS2eVtpTxpAtOmEWUPzV2_HDtzJv-kYVpoXem5_BxDlH2jW0nuo2oDemN9CCS2h10ox_1xSncGQajx_ryfhECjZEnO3nw8oTq2s7Q6bgwnIIzrnrCPk7epEDSim9e61Ja6Wp9bPix3CzAMxOIvvqvf6i3QQ8EDCYVjy_AQFy47d7l4UgZ28mH57ViQ&lib=M-y9yDASJz8jrFsUeoNOBgmXJ7hljrEEe";
let carrito = JSON.parse(localStorage.getItem('carrito')) || [];
let productos = [];
let paginaActual = 1;
const productosPorPagina = 12;

// Función para cargar los productos desde el JSON solo una vez
async function cargarProductos() {
    if (productos.length === 0) {
        try {
            const respuesta = await fetch(urlJson);
            productos = await respuesta.json();
        } catch (error) {
            console.error("Error al cargar los productos:", error);
        }
    }
    mostrarProductos();
}

//Funcion para mostrar productos
function mostrarProductos(pagina = 1) {
    const contenedorProductos = document.getElementById('productos');
    contenedorProductos.innerHTML = '';
    const inicio = (pagina - 1) * productosPorPagina;
    const fin = inicio + productosPorPagina;
    const productosAMostrar = productos.slice(inicio, fin);
    productosAMostrar.forEach(producto => {
        const divProducto = document.createElement('div');
        divProducto.className = 'border p-4';
        divProducto.innerHTML = `
            <img src="${producto.imagen}" alt="${producto.titulo}" class="w-full h-48 object-cover mb-4">
            <h3 class="text-xl font-bold">${producto.titulo}</h3>
            <p>${producto.descripcion}</p>
            <p><strong>Precio:</strong> $${producto.precio.toFixed(2)}</p>
            <button class="bg-blue-500 text-white px-4 py-2 mt-8" onclick="agregarAlCarrito(${producto.id})">Agregar al Carrito</button>
        `;
        contenedorProductos.appendChild(divProducto);
    });
    crearPaginacion();
}

//Paginacion de a 12 productos por pagina
function crearPaginacion() {
    const contenedorPaginacion = document.getElementById('paginacion');
    contenedorPaginacion.innerHTML = '';
    const totalPaginas = Math.ceil(productos.length / productosPorPagina);
    for (let i = 1; i <= totalPaginas; i++) {
        const boton = document.createElement('button');
        boton.innerText = i;
        boton.className = `mx-1 px-4 py-2 border ${i === paginaActual ? 'bg-blue-500 text-white' : 'bg-white'}`;
        boton.addEventListener('click', () => {
            paginaActual = i;
            mostrarProductos(i);
        });
        contenedorPaginacion.appendChild(boton);
    }
}

function actualizarLocalStorage() {
    localStorage.setItem('carrito', JSON.stringify(carrito));
}

//Funcion agregar al carrito
function agregarAlCarrito(idProducto) {
    const producto = productos.find(p => p.id === idProducto);
    if (producto) {
        const indiceProductoExistente = carrito.findIndex(item => item.id === idProducto);
        if (indiceProductoExistente !== -1) {
            carrito[indiceProductoExistente].cantidad += 1;
            alert(`${producto.titulo} cantidad aumentada en el carrito.`);
        } else {
            carrito.push({ ...producto, cantidad: 1 });
            alert(`${producto.titulo} agregado al carrito.`);
        }
        actualizarLocalStorage();
        mostrarCarrito();
    } else {
        alert("Producto no encontrado.");
    }
}

//Mostrar carrito
function mostrarCarrito() {
    const modalCarrito = document.getElementById('modalCarrito');
    const itemsCarrito = document.getElementById('itemsCarrito');
    itemsCarrito.innerHTML = '';
    let precioTotalCarrito = 0;
    carrito.forEach((item, index) => {
        const precioTotal = item.precio * item.cantidad;
        precioTotalCarrito += precioTotal;
        const li = document.createElement('li');
        li.classList.add('mb-2');
        const botonEliminar = document.createElement('button');
        botonEliminar.innerText = 'x';
        botonEliminar.classList.add('text-red-500', 'ml-2');
        botonEliminar.onclick = () => eliminarDelCarrito(index);
        const precioFormateado = item.precio.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        const precioTotalFormateado = precioTotal.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
        li.innerText = `${item.titulo} - $${precioFormateado} (Cantidad: ${item.cantidad}) - Total: $${precioTotalFormateado}`;
        li.appendChild(botonEliminar);
        itemsCarrito.appendChild(li);
    });
    const liTotal = document.createElement('li');
    liTotal.classList.add('font-bold', 'mt-4');
    const precioTotalCarritoFormateado = precioTotalCarrito.toLocaleString('es-AR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    liTotal.innerText = `Total del Carrito: $${precioTotalCarritoFormateado}`;
    itemsCarrito.appendChild(liTotal);
    modalCarrito.classList.remove('hidden');
}

//Funcion eliminar del carrito
function eliminarDelCarrito(indice) {
    carrito.splice(indice, 1);
    actualizarLocalStorage();
    mostrarCarrito();
}

//Finalizar pedido
function finalizarPedido() {
    document.getElementById('modalPedido').classList.remove('hidden');
}
//WhatsApp
document.getElementById('enviarWhatsApp').addEventListener('click', function () {
    enviarPedido('whatsapp');
});
//Email
document.getElementById('enviarEmail').addEventListener('click', function () {
    enviarPedido('email');
});

//Funcion enviar pedido
function enviarPedido(metodo) {
    const nombre = document.getElementById('nombre').value;
    const telefono = document.getElementById('telefono').value;
    const correo = document.getElementById('correo').value;
    const entrega = document.getElementById('entrega').value;
    const pago = document.getElementById('pago').value;
    const mensaje = document.getElementById('mensaje').value;
    let detallesPedido = `Nombre: ${nombre}\nTeléfono: ${telefono}\nEmail: ${correo}\nRetiro/Envío: ${entrega}\nPago: ${pago}\nMensaje: ${mensaje}\n\nProductos:\n`;
    carrito.forEach(item => {
        detallesPedido += `${item.titulo} - $${item.precio.toFixed(2)} (Cantidad: ${item.cantidad})\n`;
    });
    if (metodo === 'whatsapp') {
        const urlWhatsApp = `https://wa.me/?text=${encodeURIComponent(detallesPedido)}`;
        window.open(urlWhatsApp, '_blank');
    } else if (metodo === 'email') {
        const urlMailto = `mailto:${correo}?subject=Pedido de productos&body=${encodeURIComponent(detallesPedido)}`;
        window.open(urlMailto, '_blank');
    }
    document.getElementById('modalPedido').classList.add('hidden');
}

//Eventos botones
document.getElementById('cerrarCarrito').addEventListener('click', function () {
    document.getElementById('modalCarrito').classList.add('hidden');
});

//Eventos botones
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById('cerrarFormularioBtn').addEventListener('click', function () {
        document.getElementById('modalPedido').classList.add('hidden');
    });
});

//Eventos botones
document.getElementById('verCarrito').addEventListener('click', mostrarCarrito);
document.getElementById('finalizarPedido').addEventListener('click', finalizarPedido);

cargarProductos();
