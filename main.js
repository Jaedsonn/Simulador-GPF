class Simulador {
    constructor() {
        this.SEGMENT_SIZE = 0x10000;
        this.MEMORY_SIZE = 0x100000;
        this.DEZ = 0x10; // para calcular o endereço base e outras coisas, não deixa no hardcode!
        this.segments = {}; // Initialize segments object
    }

    calcularBaseSeletor(seletor) {
        return seletor * this.DEZ;
    }

    calcularEnderecoFisico(endBaseSegmento, offset) {
        return endBaseSegmento + offset;
    }

    calcularHexadecimal(endSegmento) {
        return parseInt(endSegmento, 16);
    }

    // This method was missing and is crucial for initializeCompactSegments
    initializeSegments(csBase) {
        // Example initialization for segments
        // In a real scenario, you'd likely define how segments are structured.
        // For demonstration, let's assume some common segments exist.
        // You might want to extend this to dynamically create segments based on need.
        this.segments = {
            'CS': { base: this.calcularBaseSeletor(this.calcularHexadecimal(csBase)), limit: this.SEGMENT_SIZE - 1 },
            'DS': { base: 0, limit: this.SEGMENT_SIZE - 1 }, // Example
            'ES': { base: 0, limit: this.SEGMENT_SIZE - 1 }, // Example
            'SS': { base: 0, limit: this.SEGMENT_SIZE - 1 }  // Example
            // Add other segments as necessary for your simulation
        };
    }

    initializeCompactSegments(csBase, sourceSegment, targetSegment) {
        this.initializeSegments(csBase); // Ensure segments are initialized

        let sourceUsedSize = 0x8000;

        // Ensure sourceSegment exists before accessing it
        if (!this.segments[sourceSegment]) {
            console.error(`Segmento de origem '${sourceSegment}' não encontrado.`);
            return;
        }

        this.segments[sourceSegment].limit = this.segments[sourceSegment].base + sourceUsedSize - 1;

        let nextAvailable = this.segments[sourceSegment].base + sourceUsedSize;

        // Ensure targetSegment exists or create it
        if (!this.segments[targetSegment]) {
            this.segments[targetSegment] = {}; // Create the target segment object if it doesn't exist
        }
        this.segments[targetSegment].base = nextAvailable;
        this.segments[targetSegment].limit = this.segments[targetSegment].base + this.SEGMENT_SIZE - 1;
    }
}

function validarEntradas() {
    // 1. Obter os valores dos inputs
    const inputCs = document.getElementById('csBase').value.trim().toUpperCase();
    const sourceSegment = document.getElementById('sourceSegment').value;
    const targetSegment = document.getElementById('targetSegment').value;

    // 2. Verificar se o CS foi digitado
    if (!inputCs) {
        alert("Por favor, insira o endereço base de CS!");
        return false;
    }

   
    if (!/^[0-9A-F]{4}$/.test(inputCs)) {
        alert("CS deve ser um valor hexadecimal de 4 dígitos (0000-FFFF)");
        return false;
    }

   
    const csBaseHex = inputCs.padStart(4, '0'); 


    if (sourceSegment === targetSegment) {
        alert("O segmento fonte não pode ser o mesmo que o segmento alvo!");
        return false;
    }

 
    const csBaseInt = parseInt(csBaseHex, 16);
    const enderecoMaximo = (csBaseInt * 0x10) + 0xFFFF;

    if (enderecoMaximo > 0xFFFFF) {
        alert("CS ultrapassa o limite de 1MB de memória!");
        return false;
    }

 
    return {
        csBase: csBaseHex,
        sourceSegment,
        targetSegment,
        enderecoMaximo: enderecoMaximo.toString(16).toUpperCase()
    };
}


function runSimulation() {

    clearResults();

    const result = validarEntradas();

    if (result) {
        const { csBase, sourceSegment, targetSegment, enderecoMaximo } = result;
        console.log("CS Base:", csBase);
        console.log("Segmento Origem:", sourceSegment);
        console.log("Segmento Alvo:", targetSegment);
        console.log("Endereço Máximo Calculado:", enderecoMaximo);

        const simulador = new Simulador();

       
        simulador.initializeCompactSegments(csBase, sourceSegment, targetSegment);

     
        document.getElementById('results').style.display = 'block';

        // Example of displaying some results:
        document.getElementById('displayCsBase').textContent = `CS Base: ${csBase}`;
        document.getElementById('displaySourceSegment').textContent = `Segmento Origem: ${sourceSegment}`;
        document.getElementById('displayTargetSegment').textContent = `Segmento Alvo: ${targetSegment}`;
        document.getElementById('displayMaxAddress').textContent = `Endereço Máximo: ${enderecoMaximo}`;
    }
}

// Função para limpar os resultados
function clearResults() {
    document.getElementById('results').style.display = 'none';
    document.getElementById('csBase').value = '';
    // Clear any displayed results if they exist
    document.getElementById('displayCsBase').textContent = '';
    document.getElementById('displaySourceSegment').textContent = '';
    document.getElementById('displayTargetSegment').textContent = '';
    document.getElementById('displayMaxAddress').textContent = '';
}


*/
