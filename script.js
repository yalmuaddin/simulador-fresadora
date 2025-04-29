// Constantes actualizadas
const COSTE_DISCO = 100; // € por disco
const PIEZAS_POR_DISCO = 25;
const COSTE_HERRAMIENTA_INDIVIDUAL = 60; // € por herramienta
const HERRAMIENTAS_NECESARIAS = 6; // Mínimo 6 herramientas
const HORAS_VIDA_HERRAMIENTA = 80; // Horas por herramienta
const TIEMPO_POR_PIEZA = 20 / 60; // 20 minutos en horas

// Nueva función para calcular costes de herramientas
function calcularCosteHerramientas(piezasMensuales) {
    // Horas totales de fresado
    const horasFresado = piezasMensuales * TIEMPO_POR_PIEZA;
    
    // Juegos completos de herramientas necesarios (6 herramientas = 1 juego)
    const horasPorJuego = HERRAMIENTAS_NECESARIAS * HORAS_VIDA_HERRAMIENTA;
    const juegosNecesarios = Math.ceil(horasFresado / horasPorJuego);
    
    // Coste total de herramientas
    return juegosNecesarios * HERRAMIENTAS_NECESARIAS * COSTE_HERRAMIENTA_INDIVIDUAL;
}

// Función de costes internos actualizada
function calcularCostesInternos(piezasMensuales) {
    // Materiales (discos)
    const piezasConError = piezasMensuales * 1.05; // +5% error
    const discosNecesarios = Math.ceil(piezasConError / PIEZAS_POR_DISCO);
    const costeMateriales = discosNecesarios * COSTE_DISCO;
    
    // Herramientas (nuevo cálculo)
    const costeHerramientas = calcularCosteHerramientas(piezasMensuales);
    
    // Otros costes (mantenimiento y luz)
    const horasFresado = piezasMensuales * TIEMPO_POR_PIEZA;
    const costeLuz = horasFresado * 0.15; // 0.15€/hora
    const costeMantenimiento = 800 / 12; // 800€ anuales
    
    return {
        costeTotalInterno: costeMateriales + costeHerramientas + costeLuz + costeMantenimiento,
        costeMateriales: costeMateriales,
        costeHerramientas: costeHerramientas,
        costeLuz: costeLuz,
        costeMantenimiento: costeMantenimiento,
        piezasConError: piezasConError - piezasMensuales
    };
}