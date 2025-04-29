const COSTE_DISCO = 100;
const PIEZAS_POR_DISCO = 25;
const COSTE_HERRAMIENTA_INDIVIDUAL = 60;
const HERRAMIENTAS_NECESARIAS = 6;
const HORAS_VIDA_HERRAMIENTA = 80;
const TIEMPO_POR_PIEZA = 20 / 60;

function calcularCosteHerramientas(piezasMensuales) {
    const horasFresado = piezasMensuales * TIEMPO_POR_PIEZA;
    const horasPorJuego = HERRAMIENTAS_NECESARIAS * HORAS_VIDA_HERRAMIENTA;
    const juegosNecesarios = Math.ceil(horasFresado / horasPorJuego);
    return juegosNecesarios * HERRAMIENTAS_NECESARIAS * COSTE_HERRAMIENTA_INDIVIDUAL;
}

function calcularCostesInternos(piezasMensuales) {
    const piezasConError = piezasMensuales * 1.05;
    const discosNecesarios = Math.ceil(piezasConError / PIEZAS_POR_DISCO);
    const costeMateriales = discosNecesarios * COSTE_DISCO;
    const costeHerramientas = calcularCosteHerramientas(piezasMensuales);
    const horasFresado = piezasMensuales * TIEMPO_POR_PIEZA;
    const costeLuz = horasFresado * 0.15;
    const costeMantenimiento = 800 / 12;

    return {
        costeTotalInterno: costeMateriales + costeHerramientas + costeLuz + costeMantenimiento,
        costeMateriales,
        costeHerramientas,
        costeLuz,
        costeMantenimiento,
        piezasConError: piezasConError - piezasMensuales
    };
}

document.getElementById("calcular-btn").addEventListener("click", function () {
    const inversion = parseFloat(document.getElementById("inversion").value);
    const plazo = parseInt(document.getElementById("financiacion").value);
    const gastoExterno = parseFloat(document.getElementById("gasto-externo").value);
    const piezasMes = parseInt(document.getElementById("piezas-mes").value);

    const costes = calcularCostesInternos(piezasMes);
    const cuotaMensual = inversion / plazo;

    const ahorro = gastoExterno - costes.costeTotalInterno - cuotaMensual;

    document.getElementById("cuota-mensual").textContent = cuotaMensual.toFixed(2) + " €/mes";
    document.getElementById("ahorro-mensual").textContent =
        (ahorro >= 0 ? "+" : "") + ahorro.toFixed(2) + " €/mes";
    document.getElementById("ahorro-mensual").className = "result-value " + (ahorro >= 0 ? "positive" : "negative");

    document.getElementById("coste-materiales").textContent = costes.costeMateriales.toFixed(2) + " €";
    document.getElementById("coste-herramientas").textContent = costes.costeHerramientas.toFixed(2) + " €";
    document.getElementById("coste-luz").textContent = costes.costeLuz.toFixed(2) + " €";
    document.getElementById("coste-mantenimiento").textContent = costes.costeMantenimiento.toFixed(2) + " €";
    document.getElementById("coste-total").textContent = costes.costeTotalInterno.toFixed(2) + " €";

    const piezasError = Math.round(costes.piezasConError);
    document.getElementById("piezas-error").textContent = piezasError + " piezas";
    document.getElementById("coste-pieza").textContent =
        (costes.costeTotalInterno / piezasMes).toFixed(2) + " €";

    const roiMeses = inversion / (gastoExterno - costes.costeTotalInterno);
    const roiTexto = gastoExterno > costes.costeTotalInterno
        ? `La inversión se recupera en aproximadamente ${roiMeses.toFixed(1)} meses.`
        : "No se recupera la inversión con los datos actuales.";
    document.getElementById("roi-text").textContent = roiTexto;

    document.getElementById("resultados").classList.remove("hidden");

    generarGrafico(gastoExterno, costes.costeTotalInterno + cuotaMensual);
});

function generarGrafico(externo, interno) {
    const ctx = document.getElementById("comparacion-chart").getContext("2d");
    if (window.comparacionChart) {
        window.comparacionChart.destroy();
    }
    window.comparacionChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: ['Externalización', 'Producción Interna'],
            datasets: [{
                label: 'Coste mensual (€)',
                data: [externo, interno],
                backgroundColor: ['#FF5252', '#0A6C48']
            }]
        },
        options: {
            responsive: true,
            plugins: { legend: { display: false } },
            scales: { y: { beginAtZero: true } }
        }
    });
}
