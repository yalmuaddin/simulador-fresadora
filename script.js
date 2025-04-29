// Constantes para cálculos (actualizadas)
const COSTE_DISCO = 100; // € por disco
const PIEZAS_POR_DISCO = 25;
const COSTE_FRESA = 60; // € por juego de 6 fresas
const HORAS_POR_FRESA = 80;
const TIEMPO_POR_PIEZA = 0.40; // horas
const COSTE_MANTENIMIENTO_ANUAL = 800;
const COSTE_LUZ_POR_HORA = 0.15;
const ERROR_FABRICACION = 0.05;

// Coeficientes de financiación (según tu tabla)
const COEFICIENTES_FINANCIACION = {
    24: 0.0445789961865814,   
    36: 0.0317897100847919,   
    48: 0.0245555438350711,   
    60: 0.0203875603373733,   
    72: 0.0177234717536852,   
    84: 0.0123529411764706    
};

// Función para calcular costes internos (actualizada)
function calcularCostesInternos(piezasMensuales) {
    const piezasConError = piezasMensuales * ERROR_FABRICACION;
    const piezasTotales = piezasMensuales + piezasConError;
    
    // Materiales
    const discosNecesarios = Math.ceil(piezasTotales / PIEZAS_POR_DISCO);
    const costeMateriales = discosNecesarios * COSTE_DISCO;
    
    // Herramientas
    const horasFresado = piezasMensuales * TIEMPO_POR_PIEZA;
    const fresasNecesarias = horasFresado / HORAS_POR_FRESA;
    const costeFresas = fresasNecesarias * COSTE_FRESA;
    
    // Otros costes
    const costeLuz = horasFresado * COSTE_LUZ_POR_HORA;
    const costeMantenimiento = COSTE_MANTENIMIENTO_ANUAL / 12;
    
    // Coste total
    const costeTotal = costeMateriales + costeFresas + costeLuz + costeMantenimiento;
    
    return {
        costeTotalInterno: costeTotal,
        costePorPieza: costeTotal / piezasMensuales,
        costeMateriales: costeMateriales,
        costeFresas: costeFresas,
        costeLuz: costeLuz,
        costeMantenimiento: costeMantenimiento,
        piezasConError: piezasConError
    };
}

// Función para calcular cuota mensual (nueva)
function calcularCuotaMensual(inversion, plazoMeses) {
    const coeficiente = COEFICIENTES_FINANCIACION[plazoMeses] || 1;
    const totalFinanciado = inversion * coeficiente;
    return totalFinanciado / plazoMeses;
}

// Función principal de cálculo (actualizada)
document.getElementById('calcular-btn').addEventListener('click', function() {
    const inversion = parseFloat(document.getElementById('inversion').value);
    const plazoMeses = parseInt(document.getElementById('financiacion').value);
    const gastoExterno = parseFloat(document.getElementById('gasto-externo').value);
    const piezasMensuales = parseInt(document.getElementById('piezas-mes').value);
    
    // Calcular todos los componentes
    const costes = calcularCostesInternos(piezasMensuales);
    const cuotaMensual = calcularCuotaMensual(inversion, plazoMeses);
    const coeficiente = COEFICIENTES_FINANCIACION[plazoMeses] || 1;
    const inversionFinanciada = inversion * coeficiente;
    
    // Calcular ahorro real (considerando la cuota)
    const ahorroReal = gastoExterno - (costes.costeTotalInterno + cuotaMensual);
    
    // Mostrar resultados
    document.getElementById('cuota-mensual').textContent = cuotaMensual.toFixed(2) + ' €/mes';
    document.getElementById('ahorro-mensual').textContent = ahorroReal.toFixed(2) + ' €/mes';
    document.getElementById('ahorro-mensual').className = ahorroReal >= 0 ? 'result-value positive' : 'result-value negative';
    
    // Actualizar otros campos (materiales, fresas, etc.)
    document.getElementById('coste-materiales').textContent = costes.costeMateriales.toFixed(2) + ' €';
    document.getElementById('coste-fresas').textContent = costes.costeFresas.toFixed(2) + ' €';
    document.getElementById('coste-luz').textContent = costes.costeLuz.toFixed(2) + ' €';
    document.getElementById('coste-mantenimiento').textContent = costes.costeMantenimiento.toFixed(2) + ' €';
    document.getElementById('coste-total').textContent = costes.costeTotalInterno.toFixed(2) + ' €';
    document.getElementById('coste-pieza').textContent = costes.costePorPieza.toFixed(2) + ' €';
    document.getElementById('piezas-error').textContent = costes.piezasConError.toFixed(0) + ' piezas';
    
    // Calcular y mostrar ROI
    if (ahorroReal > 0) {
        const mesesROI = inversionFinanciada / ahorroReal;
        document.getElementById('roi-text').textContent = 
            `Con un ahorro real de ${ahorroReal.toFixed(2)} €/mes, recuperará la inversión en ${mesesROI.toFixed(1)} meses (${(mesesROI/12).toFixed(1)} años).`;
    } else {
        document.getElementById('roi-text').textContent = 
            "La inversión no se recuperará con los datos actuales (ahorro mensual negativo).";
    }
    
    // Mostrar sección de resultados
    document.getElementById('resultados').classList.remove('hidden');
});