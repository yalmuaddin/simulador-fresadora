// Constantes
const COSTE_DISCO = 100; // € por disco
const PIEZAS_POR_DISCO = 25;
const COSTE_HERRAMIENTA_INDIVIDUAL = 60; // €
const HERRAMIENTAS_NECESARIAS = 6;
const HORAS_VIDA_HERRAMIENTA = 80; // horas
const TIEMPO_POR_PIEZA = 20 / 60; // horas
const POTENCIA_FRESADORA = 0.170; // kW (170W)
const POTENCIA_STANDBY = 0.100; // kW (100W)
const COSTE_KWH = 0.30; // €/kWh
const HORAS_STANDBY = 8 * 22; // 8h/día × 22 días laborales

// Cálculo de costes amortizados
function calcularCosteDiscos(piezasMensuales) {
    const piezasConError = piezasMensuales * 1.05; // +5% de error
    const discosNecesarios = piezasConError / PIEZAS_POR_DISCO;
    return discosNecesarios * COSTE_DISCO;
}

function calcularCosteHerramientas(piezasMensuales) {
    const horasFresado = piezasMensuales * TIEMPO_POR_PIEZA;
    const horasPorJuego = HERRAMIENTAS_NECESARIAS * HORAS_VIDA_HERRAMIENTA; // 480h
    return (horasFresado / horasPorJuego) * (HERRAMIENTAS_NECESARIAS * COSTE_HERRAMIENTA_INDIVIDUAL);
}

function calcularCostesInternos(piezasMensuales) {
    const costeMateriales = calcularCosteDiscos(piezasMensuales);
    const costeHerramientas = calcularCosteHerramientas(piezasMensuales);
    const horasFresado = piezasMensuales * TIEMPO_POR_PIEZA;
    
    // Cálculo de luz (fresado + standby)
    const costeLuz = (POTENCIA_FRESADORA * horasFresado + POTENCIA_STANDBY * HORAS_STANDBY) * COSTE_KWH;
    
    const costeMantenimiento = 800 / 12; // €/mes

    return {
        costeTotalInterno: costeMateriales + costeHerramientas + costeLuz + costeMantenimiento,
        costeMateriales,
        costeHerramientas,
        costeLuz,
        costeMantenimiento,
        piezasConError: Math.round(piezasMensuales * 0.05) // 5% de error
    };
}

// Generar gráfico comparativo
let comparacionChart = null;

function generarGrafico(externo, interno) {
    const ctx = document.getElementById("comparacion-chart").getContext("2d");
    if (comparacionChart) {
        comparacionChart.destroy();
    }
    comparacionChart = new Chart(ctx, {
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

// Evento principal
document.getElementById("calcular-btn").addEventListener("click", function() {
    const inversion = parseFloat(document.getElementById("inversion").value);
    const plazo = parseInt(document.getElementById("financiacion").value);
    const gastoExterno = parseFloat(document.getElementById("gasto-externo").value);
    const piezasMes = parseInt(document.getElementById("piezas-mes").value);

    // Calcular cuota de financiación con multiplicadores
    const multiplicadores = {
        24: 0.0446,
        36: 0.0318,
        48: 0.0246,
        60: 0.0204,
        72: 0.0177,
        84: 0.0124
    };
    const cuotaMensual = inversion * multiplicadores[plazo];

    // Calcular costes internos
    const costes = calcularCostesInternos(piezasMes);
    const ahorro = gastoExterno - costes.costeTotalInterno - cuotaMensual;

    // Mostrar resultados
    document.getElementById("cuota-mensual").textContent = cuotaMensual.toFixed(2) + " €/mes";
    document.getElementById("ahorro-mensual").textContent = (ahorro >= 0 ? "+" : "") + ahorro.toFixed(2) + " €/mes";
    document.getElementById("ahorro-mensual").className = "result-value " + (ahorro >= 0 ? "positive" : "negative");

    document.getElementById("coste-materiales").textContent = costes.costeMateriales.toFixed(2) + " €";
    document.getElementById("coste-herramientas").textContent = costes.costeHerramientas.toFixed(2) + " €";
    document.getElementById("coste-luz").textContent = costes.costeLuz.toFixed(2) + " €";
    document.getElementById("coste-mantenimiento").textContent = costes.costeMantenimiento.toFixed(2) + " €";
    document.getElementById("coste-total").textContent = costes.costeTotalInterno.toFixed(2) + " €";

    document.getElementById("piezas-error").textContent = costes.piezasConError + " piezas";
    document.getElementById("coste-pieza").textContent = (costes.costeTotalInterno / piezasMes).toFixed(2) + " €";

    // Calcular ROI
    const roiMeses = inversion / (gastoExterno - costes.costeTotalInterno);
    const roiTexto = gastoExterno > costes.costeTotalInterno
        ? `La inversión se recupera en aproximadamente ${roiMeses.toFixed(1)} meses.`
        : "No se recupera la inversión con los datos actuales.";
    document.getElementById("roi-text").textContent = roiTexto;

    // Mostrar sección de resultados
    document.getElementById("resultados").classList.remove("hidden");

    // Generar gráfico
    generarGrafico(gastoExterno, costes.costeTotalInterno + cuotaMensual);
});