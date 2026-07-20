/* ===========================================================
   NFC PAY TEMPLATE
   Desarrollado por DINDONMAX
=========================================================== */

const app = document.getElementById("app");

/* -----------------------------------------------------------
   Cargar la configuración del cliente
----------------------------------------------------------- */

async function cargarConfiguracion() {
    try {
        const respuesta = await fetch("config.json");

        if (!respuesta.ok) {
            throw new Error("No se pudo cargar config.json");
        }

        const configuracion = await respuesta.json();

        aplicarConfiguracion(configuracion);
        construirPagina(configuracion);

    } catch (error) {
        console.error(error);

        app.innerHTML = `
            <div class="mensaje-error">
                <h2>No se pudo cargar la página</h2>
                <p>Revisa que el archivo config.json exista y esté bien escrito.</p>
            </div>
        `;
    }
}

/* -----------------------------------------------------------
   Aplicar color principal
----------------------------------------------------------- */

function aplicarConfiguracion(configuracion) {
    if (configuracion.colorPrincipal) {
        document.documentElement.style.setProperty(
            "--color-principal",
            configuracion.colorPrincipal
        );
    }

    if (configuracion.empresa) {
        document.title = `${configuracion.empresa} | Información bancaria`;
    }
}

/* -----------------------------------------------------------
   Construir toda la página
----------------------------------------------------------- */

function construirPagina(configuracion) {
    const empresa =
        configuracion.empresa || "NOMBRE DEL NEGOCIO";

    const titular =
        configuracion.titular || "NOMBRE DEL TITULAR";

    const bancos =
        Array.isArray(configuracion.bancos)
            ? configuracion.bancos
            : [];

    app.innerHTML = `
        <header class="encabezado">

            <h1 class="nombre-negocio">
                ${escaparHTML(empresa)}
            </h1>

            <div class="confianza">
                🛡️ Paga con confianza
            </div>

            <div class="aviso-titular">
                <span class="icono-verificacion">✓</span>

                <div>
                    <p>
                        Verifica que el pago sea realizado
                        exclusivamente a nombre de:
                    </p>

                    <strong>
                        ${escaparHTML(titular)}
                    </strong>
                </div>
            </div>

        </header>

        <main class="lista-bancos">
            ${
                bancos.length > 0
                    ? bancos.map(banco =>
                        crearTarjetaBanco(banco, titular)
                    ).join("")
                    : `
                        <div class="mensaje-error">
                            <h2>No hay cuentas configuradas</h2>
                            <p>Agrega bancos dentro de config.json.</p>
                        </div>
                    `
            }
        </main>

        <section class="beneficios">

            <div class="beneficio">
                <strong>100% Seguro</strong>
                <span>Tus datos están protegidos</span>
            </div>

            <div class="beneficio">
                <strong>Cuentas verificadas</strong>
                <span>Información oficial y actualizada</span>
            </div>

            <div class="beneficio">
                <strong>Pago rápido</strong>
                <span>Fácil, seguro y confiable</span>
            </div>

            <div class="beneficio">
                <strong>Gracias</strong>
                <span>Gracias por tu preferencia</span>
            </div>

        </section>

        <div
            id="mensaje-copiado"
            class="mensaje-copiado"
            role="status"
            aria-live="polite"
        ></div>
    `;

    activarBotonesCopiar();
}

/* -----------------------------------------------------------
   Crear una tarjeta bancaria
----------------------------------------------------------- */

function crearTarjetaBanco(banco, titularGeneral) {
    const id =
        banco.id || "banco";

    const cuenta =
        banco.cuenta || "0000000000";

    const tipo =
        banco.tipo || "Cuenta de Ahorro";

    const titular =
        banco.titular || titularGeneral;

    const logo =
        banco.logo || `logos/${id}.png`;

    const color =
        banco.color || "var(--color-principal)";

    return `
        <article
            class="tarjeta-banco"
            style="--color-banco:${escaparAtributo(color)}"
        >

            <div class="contenedor-logo">
                <img
                    src="${escaparAtributo(logo)}"
                    alt="Logo bancario"
                    class="logo-banco"
                    onerror="this.style.display='none'"
                >
            </div>

            <div class="informacion-banco">

                <p class="tipo-cuenta">
                    ${escaparHTML(tipo)}
                </p>

                <button
                    class="numero-cuenta"
                    data-cuenta="${escaparAtributo(cuenta)}"
                    aria-label="Copiar cuenta ${escaparAtributo(cuenta)}"
                >
                    ${escaparHTML(cuenta)}
                </button>

                <p class="titular-cuenta">
                    Titular:
                    <strong>
                        ${escaparHTML(titular)}
                    </strong>
                </p>

            </div>

            <button
                class="boton-copiar"
                data-cuenta="${escaparAtributo(cuenta)}"
            >
                <span>⧉</span>
                Copiar
            </button>

        </article>
    `;
}

/* -----------------------------------------------------------
   Activar botones para copiar
----------------------------------------------------------- */

function activarBotonesCopiar() {
    const elementos =
        document.querySelectorAll("[data-cuenta]");

    elementos.forEach(elemento => {
        elemento.addEventListener("click", async () => {
            const cuenta = elemento.dataset.cuenta;

            await copiarCuenta(cuenta, elemento);
        });
    });
}

/* -----------------------------------------------------------
   Copiar número de cuenta
----------------------------------------------------------- */

async function copiarCuenta(cuenta, elemento) {
    try {
        if (
            navigator.clipboard &&
            window.isSecureContext
        ) {
            await navigator.clipboard.writeText(cuenta);
        } else {
            copiarMetodoAlternativo(cuenta);
        }

        mostrarMensaje("✓ Cuenta copiada correctamente");

        if (elemento.classList.contains("boton-copiar")) {
            const contenidoOriginal = elemento.innerHTML;

            elemento.innerHTML = "✓ Copiado";
            elemento.classList.add("copiado");

            setTimeout(() => {
                elemento.innerHTML = contenidoOriginal;
                elemento.classList.remove("copiado");
            }, 1600);
        }

    } catch (error) {
        console.error(error);

        mostrarMensaje(
            "Mantén presionado el número para copiarlo."
        );
    }
}

/* -----------------------------------------------------------
   Método alternativo para navegadores antiguos
----------------------------------------------------------- */

function copiarMetodoAlternativo(texto) {
    const campo =
        document.createElement("textarea");

    campo.value = texto;
    campo.setAttribute("readonly", "");
    campo.style.position = "fixed";
    campo.style.opacity = "0";

    document.body.appendChild(campo);

    campo.select();

    const resultado =
        document.execCommand("copy");

    campo.remove();

    if (!resultado) {
        throw new Error("No fue posible copiar");
    }
}

/* -----------------------------------------------------------
   Mostrar confirmación
----------------------------------------------------------- */

let temporizadorMensaje;

function mostrarMensaje(texto) {
    const mensaje =
        document.getElementById("mensaje-copiado");

    if (!mensaje) return;

    mensaje.textContent = texto;
    mensaje.classList.add("visible");

    clearTimeout(temporizadorMensaje);

    temporizadorMensaje = setTimeout(() => {
        mensaje.classList.remove("visible");
    }, 2200);
}

/* -----------------------------------------------------------
   Seguridad básica para textos
----------------------------------------------------------- */

function escaparHTML(valor) {
    return String(valor)
        .replaceAll("&", "&amp;")
        .replaceAll("<", "&lt;")
        .replaceAll(">", "&gt;")
        .replaceAll('"', "&quot;")
        .replaceAll("'", "&#039;");
}

function escaparAtributo(valor) {
    return escaparHTML(valor);
}

/* -----------------------------------------------------------
   Iniciar aplicación
----------------------------------------------------------- */

cargarConfiguracion();
