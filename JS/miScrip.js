// lista con los usuarios de prueba del sistema
const base = [
    {
        // nombre de usuario del admin
        user: 'adminred',
        // contrasena del admin
        pass: '123',
        // rol para entrar 
        rol: 'Administrador',
        // pagina a la que entra
        url: 'AdminRed.html',
        // nombre que se muestra en pantalla
        nombreFabrica: 'Fábrica Administradora'
    },
    {
        // usuario de la primera fabrica
        user: 'fabricamiembro',
        // contrasena de la primera fabrica
        pass: '123',
        // rol de fabrica
        rol: 'Fabrica',
        // pagina de fabrica miembro
        url: 'FabricaMiem.html',
        // nombre de esta fabrica
        nombreFabrica: 'Fabrica silao'
    },

    {
        // usuario de la segunda fabrica
        user: 'fabricamiembro2',
        // contrasena de la segunda fabrica
        pass: '123',
        // rol de fabrica
        rol: 'Fabrica',
        // pagina de fabrica miembro
        url: 'FabricaMiem.html',
        // nombre de esta otra fabrica
        nombreFabrica: 'Fabrica Leon'
    }
];

// funcion que se activa al darle clic en entrar
function iniciarSesion(e) {
    // evita que la pagina se recargue sola
    e.preventDefault();

    // guarda lo que escribio en usuario sin espacios extra
    const inputUser = document.getElementById('inputUser').value.trim();
    // guarda lo que escribio en contrasena sin espacios extra
    const inputPass = document.getElementById('inputPass').value.trim();

    // busca en la lista si hay alguien con ese usuario y contrasena
    const usuarioAutenticado = base.find(
        usuario => usuario.user === inputUser && usuario.pass === inputPass
    );

    // si si encontro al usuario
    if (usuarioAutenticado) {
        // guarda sus datos en la sesion del navegador
        sessionStorage.setItem('sesionActiva', JSON.stringify(usuarioAutenticado));
        // lo manda a la pagina que le toca
        window.location.href = usuarioAutenticado.url;
    } else {
        // si no lo encontro, quita lo oculto al mensaje de error
        document.getElementById('errorMsg').classList.remove('d-none');
    }
}

// funcion para salir de la cuenta
function cerrarSesion() {
    // borra los datos de la sesion guardada
    sessionStorage.removeItem('sesionActiva');
    // regresa a la pantalla de inicio de sesion
    window.location.href = 'index.html';
}

// funcion que revisa si el usuario tiene permiso de ver esa pagina
function verificarAcceso(rolRequerido) {
    // lee los datos de quien tiene la sesion abierta
    const sesion = JSON.parse(sessionStorage.getItem('sesionActiva'));

    // si no hay nadie conectado, lo manda al login
    if (!sesion) {
        window.location.href = 'index.html';
    // si tiene otro rol diferente al que pide la pagina, lo regresa a la suya
    } else if (sesion.rol !== rolRequerido) {
        window.location.href = sesion.url;
    } else {
        // busca el lugar en la barra donde va el nombre
        const infoUsuario = document.getElementById('infoUsuario');
        // si existe ese lugar, escribe el nombre de la fabrica o del usuario
        if (infoUsuario) {
            infoUsuario.textContent = sesion.nombreFabrica || sesion.user;
        }
    }
}

// funcion para que si ya entro, no vuelva a ver el login
function saltarLoginSiAutenticado() {
    // revisa si ya hay una sesion guardada
    const sesion = JSON.parse(sessionStorage.getItem('sesionActiva'));

    // si ya hay sesion, lo manda directo a su pagina
    if (sesion) {
        window.location.href = sesion.url;
    }
}


// --------------------------------FABRICA MIEMBRO-----------------------------------------
// espera a que cargue la pagina para encender cada parte
document.addEventListener('DOMContentLoaded', () => {
    // busca el formulario de fabrica
    const formulario = document.getElementById('formAnuncio');
    // busca la caja de anuncios del admin
    const contenedorAdmin = document.getElementById('contenedorAnunciosAdmin');

    // si existe el formulario, estamos en la pagina de fabrica
    if (formulario) {
        // cuando envien el formulario, activa la funcion publicarAnuncio
        formulario.addEventListener('submit', publicarAnuncio);
        // muestra los anuncios aprobados de otras fabricas
        mostrarAnunciosAprobados();
        // muestra los anuncios pendientes de esta fabrica
        mostrarAnunciosPendientes();
    }

    // si existe la caja del admin, estamos en la pagina de administrador
    if (contenedorAdmin) {
        // muestra todos los anuncios para revisarlos
        mostrarAnunciosAdmin();
    }
});

// funcion para guardar una oferta o solicitud nueva
function publicarAnuncio(e) {
    // evita que se recargue la pagina al enviar
    e.preventDefault();

    // lee los datos de la fabrica que inicio sesion
    const sesion = JSON.parse(sessionStorage.getItem('sesionActiva'));
    // lee si eligio oferta o solicitud
    const tipo = document.getElementById('tipoAnuncio').value; //sacar lo que esta escrito
    // lee lo que escribio en el material
    const material = document.getElementById('materialAnuncio').value.trim(); //quita espacion en blanco

    // si no hay sesion o no escribio material, se detiene
    if (!sesion || !material) {
        return;
    }

    // trae la lista de anuncios guardados o crea una lista vacia
    const anuncios = JSON.parse(localStorage.getItem('anunciosMercado')) || [];

    // arma el anuncio nuevo con todos sus datos
    const nuevoAnuncio = {
        // guarda si es oferta o solicitud
        tipo: tipo,
        // guarda el texto del material
        material: material,
        // guarda el nombre de la fabrica desde la sesion
        fabrica: sesion.nombreFabrica || sesion.user,
        // guarda que usuario lo creo
        publicadoPor: sesion.user,
        // lo pone como pendiente hasta que el admin lo apruebe
        estado: 'pendiente'
    };

    // mete el anuncio nuevo al final de la lista 
    anuncios.push(nuevoAnuncio);
    // guarda la lista actualizada en el localStorage pipiiii
    localStorage.setItem('anunciosMercado', JSON.stringify(anuncios));

    // borra lo que estaba escrito en el formulario
    document.getElementById('formAnuncio').reset();
    // vuelve a cargar la lista de aprobados
    mostrarAnunciosAprobados();
    // vuelve a cargar la lista de pendientes
    mostrarAnunciosPendientes();
    // muestra un aviso de que ya se publico
    alert('Anuncio publicado. Quedará pendiente de aprobación.');
}

// funcion para mostrar los anuncios pendientes de esta fabrica
function mostrarAnunciosPendientes() {
    // lee quien tiene la sesion abierta
    const sesion = JSON.parse(sessionStorage.getItem('sesionActiva'));
    // lee todos los anuncios guardados
    const anuncios = JSON.parse(localStorage.getItem('anunciosMercado')) || [];
    // busca la caja donde van los pendientes
    const contenedor = document.getElementById('contenedorPendientes');

    // si no encuentra la caja o la sesion, se sale
    if (!contenedor || !sesion) {
        return;
    }

    // vacia la caja para no repetir anuncios
    contenedor.innerHTML = '';

    // filtra solo los que estan pendientes y los hizo este usuario
    const anunciosPendientes = anuncios.filter(anuncio =>
        anuncio.estado === 'pendiente' && anuncio.publicadoPor === sesion.user
    );

    // si no tiene pendientes, pone un mensaje y termina
    if (anunciosPendientes.length === 0) {
        contenedor.textContent = 'No tienes anuncios pendientes.';
        return;
    }

    // recorre uno por uno los anuncios pendientes
    anunciosPendientes.forEach(anuncio => {
        // crea una caja para el renglon
        const fila = document.createElement('div');
        // le pone diseno para separar el texto a la izquierda y la etiqueta a la derecha
        fila.className = 'd-flex justify-content-between align-items-center border-bottom border-secondary py-2';

        // crea un texto con el tipo y el material
        const texto = document.createElement('span');
        // escribe el tipo y el material juntos
        texto.textContent = anuncio.tipo + ': ' + anuncio.material;

        // crea la etiquetita amarilla
        const estado = document.createElement('span');
        // le pone color amarillo de bookstrap
        estado.className = 'badge rounded-pill bg-warning text-dark';
        // le pone la palabra pendiente
        estado.textContent = 'Pendiente';

        // mete el texto y la etiqueta adentro de la fila
        fila.append(texto, estado);
        // mete la fila adentro de la caja de pendientes
        contenedor.appendChild(fila);
    });
}

// funcion para mostrar anuncios aprobados de otras fabricas
function mostrarAnunciosAprobados() {
    // lee los datos de la fabrica conectada
    const sesion = JSON.parse(sessionStorage.getItem('sesionActiva'));
    // lee todos los anuncios guardados
    const anuncios = JSON.parse(localStorage.getItem('anunciosMercado')) || [];
    // busca la caja donde se muestran los aprobados
    const contenedor = document.getElementById('contenedorAnuncios');

    // si no encuentra la caj se sale
    if (!contenedor) {
        return;
    }

    // limpia la caja antes de poner los anuncios
    contenedor.innerHTML = '';

    // filtra solo los aprobados y que no sean de la fabrica en dode estoy 
    const anunciosVisibles = anuncios.filter(anuncio =>
        anuncio.estado === 'aprobado' && anuncio.publicadoPor !== sesion.user
    );

    // si no hay ninguno aprobado de otras fabricas, pone este texto
    if (anunciosVisibles.length === 0) {
        contenedor.textContent = 'Todavía no hay anuncios aprobados de otras fabricas.';
        return;
    }

    // recorre cada anuncio aprobado para armar su card
    anunciosVisibles.forEach(anuncio => {
        // crea la tarjeta negra con borde gris
        const tarjeta = document.createElement('div');
        tarjeta.className = 'card bg-black text-light border-secondary';

        // crea la parte de adentro de la tarjeta
        const contenido = document.createElement('div');
        contenido.className = 'card-body';

        // crea el titulo verde con el tipo de anuncio
        const titulo = document.createElement('h3');
        titulo.className = 'h6 text-success fw-bold';
        titulo.textContent = anuncio.tipo;

        // crea el texto con el material ofrecido o pedido
        const material = document.createElement('p');
        material.className = 'mb-2';
        material.textContent = anuncio.material;

        // crea el texto gris diciendo que fabrica lo publico
        const fabrica = document.createElement('p');
        fabrica.className = 'small text-secondary mb-0';
        fabrica.textContent = 'Publicado por: ' + anuncio.fabrica;

        // mete titulo, material y fabrica adentro del contenido
        contenido.append(titulo, material, fabrica); //uno o varios elementos
        // mete el contenido adentro de la tarjeta
        tarjeta.appendChild(contenido);//mete un solo elemento adentro de otro
        // mete la tarjeta adentro de la caja principal
        contenedor.appendChild(tarjeta);
    });
}


// --------------------------------ADMINISTRADOR DE RED-----------------------------------------

// funcion para mostrar todos los anuncios al administrador
function mostrarAnunciosAdmin() {
    // lee toda la lista de anuncios guardados
    const anuncios = JSON.parse(localStorage.getItem('anunciosMercado')) || [];
    // busca la caja donde van las tarjetas del administreshion
    const contenedor = document.getElementById('contenedorAnunciosAdmin');

    // si no existe la caja, se sale
    if (!contenedor) {
        return;
    }

    // limpia la caja
    contenedor.innerHTML = '';

    // si no hay anuncios guardados, muestra este aviso
    if (anuncios.length === 0) {
        contenedor.textContent = 'Todavía no hay anuncios publicados.';
        return;
    }

    // recorre todos los anuncios junto con su posicion el indice en la lista
    anuncios.forEach((anuncio, index) => {
        // crea la tarjeta del anuncio
        const tarjeta = document.createElement('div');
        tarjeta.className = 'card bg-black text-light border-secondary';

        // crea el espacio interior de la tarjeta
        const contenido = document.createElement('div');
        contenido.className = 'card-body';

        // crea la fila de arriba para el titulo y la etiqueta de estado
        const encabezado = document.createElement('div');
        encabezado.className = 'd-flex justify-content-between align-items-center mb-2';

        // crea el titulo rojo con el tipo de anuncio
        const tipo = document.createElement('h3');
        tipo.className = 'h6 text-danger fw-bold mb-0';
        tipo.textContent = anuncio.tipo;

        // crea la etiqueta con el color del estado actual
        const estado = document.createElement('span');
        estado.className = 'badge ' + claseEstado(anuncio.estado);
        estado.textContent = anuncio.estado || 'pendiente';

        // crea el parrafo con la descripcion del material
        const material = document.createElement('p');
        material.className = 'mb-2';
        material.textContent = anuncio.material;

        // crea el parrafo con el nombre de la fabrica que lo publico
        const fabrica = document.createElement('p');
        fabrica.className = 'small text-secondary mb-3';
        fabrica.textContent = 'Publicado por: ' + (anuncio.fabrica || anuncio.publicadoPor);

        // mete el tipo y el estado en la fila de arriba
        encabezado.append(tipo, estado);
        // mete la fila de arriba, el material y la fabrica adentro de contenido
        contenido.append(encabezado, material, fabrica);

        // si el anuncio sigue pendiente, muestra los botones para decidir
        if (anuncio.estado === 'pendiente') {
            // crea una caja para poner los dos botones juntos
            const acciones = document.createElement('div');
            acciones.className = 'd-flex gap-2';

            // crea el boton verde de aprobar
            const botonAprobar = document.createElement('button');
            botonAprobar.type = 'button';
            botonAprobar.className = 'btn btn-sm btn-success';
            botonAprobar.textContent = 'Aprobar';
            // al hacer clic, cambia este anuncio a aprobado
            botonAprobar.onclick = () => cambiarEstadoAnuncio(index, 'aprobado');

            // crea el boton rojo de rechazar
            const botonRechazar = document.createElement('button');
            botonRechazar.type = 'button';
            botonRechazar.className = 'btn btn-sm btn-outline-danger';
            botonRechazar.textContent = 'Rechazar';
            // al hacer clic, cambia este anuncio a rechazado
            botonRechazar.onclick = () => cambiarEstadoAnuncio(index, 'rechazado');

            // mete los dos botones en la caja de acciones
            acciones.append(botonAprobar, botonRechazar);
            // mete la caja de acciones adentro de contenido
            contenido.appendChild(acciones);
        }

        // mete contenido adentro de tarjeta
        tarjeta.appendChild(contenido);
        // mete tarjeta adentro de la caja principal del admin
        contenedor.appendChild(tarjeta);
    });
}

// funcion que da el color segun el estado del anuncio
function claseEstado(estado) {
    // si esta aprobado, devuelve verde
    if (estado === 'aprobado') {
        return 'bg-success text-dark';
    }

    // si esta rechazado, devuelve rojo
    if (estado === 'rechazado') {
        return 'bg-danger text-light';
    }

    // si esta pendiente, devuelve amarillo
    return 'bg-warning text-dark';
}

// funcion que cambia el estado del anuncio y guarda la lista
function cambiarEstadoAnuncio(indice, nuevoEstado) {
    // trae la lista actual de anuncios guardados
    const anuncios = JSON.parse(localStorage.getItem('anunciosMercado')) || [];

    // si no existe un anuncio en ese lugar, se sale
    if (!anuncios[indice]) {
        return;
    }

    // cambia el estado del anuncio elegido por aprobado o rechazado
    anuncios[indice].estado = nuevoEstado;
    // vuelve a guardar la lista ya actualizada
    localStorage.setItem('anunciosMercado', JSON.stringify(anuncios));
    // refresca la pantalla del admin para ver el nuevo estado
    mostrarAnunciosAdmin();
}