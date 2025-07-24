class Simulador{
constructor(){
    this.SEGMENT_SIZE = 0x10000; 
    this.MEMORY_SIZE = 0x100000; 
    this.DEZ = 0x10; // pra calcular o endereço base e outros coisas, não deixa no hardcode!
}

initializeCompactSegments(csBase, sourceSegment, targetSegment) {
    this.initializeSegments(csBase);
    
    let sourceUsedSize = 0x8000; 
    
    this.segments[sourceSegment].limit = this.segments[sourceSegment].base + sourceUsedSize - 1;
    
    let nextAvailable = this.segments[sourceSegment].base + sourceUsedSize;
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

    // 3. Verificar se é um valor hexadecimal válido (4 dígitos 0-9,A-F)
    if (!/^[0-9A-F]{4}$/.test(inputCs)) {
        alert("CS deve ser um valor hexadecimal de 4 dígitos (0000-FFFF)");
        return false;
    }

    // 4. Converter CS para hexadecimal (apesar de já estar em hex, garantimos o formato)
    const csBaseHex = inputCs.padStart(4, '0'); // Garante 4 dígitos

    // 5. Verificar se o segmento fonte é o mesmo que o alvo
    if (sourceSegment === targetSegment) {
        alert("O segmento fonte não pode ser o mesmo que o segmento alvo!");
        return false;
    }

    // 6. Verificar se CS ultrapassa o limite de memória (1MB = FFFFF)
    const csBaseInt = parseInt(csBaseHex, 16);
    const enderecoMaximo = (csBaseInt * 0x10) + 0xFFFF;
    
    if (enderecoMaximo > 0xFFFFF) {
        alert("CS ultrapassa o limite de 1MB de memória!");
        return false;
    }

    // Se todas as validações passaram
    return {
        csBase: csBaseHex,
        sourceSegment,
        targetSegment,
        enderecoMaximo: enderecoMaximo.toString(16).toUpperCase()
    };
}

// Função principal que será chamada pelo botão
function runSimulation() {
    const validacao = validarEntradas();
    
    if (validacao) {
        console.log("Validações OK!");
        console.log("CS Base:", validacao.csBase);
        console.log("Segmento Origem:", validacao.sourceSegment);
        console.log("Segmento Alvo:", validacao.targetSegment);
        console.log("Endereço Máximo:", validacao.enderecoMaximo);
        
        // Aqui você pode continuar com outras operações
        document.getElementById('results').style.display = 'block';
    }
}

// Função para limpar os resultados
function clearResults() {
    document.getElementById('results').style.display = 'none';
    document.getElementById('csBase').value = '';
}




