class Simulador {
    constructor() {
        this.SEGMENT_SIZE = 0x10000;
        this.MEMORY_SIZE = 0x100000;
        this.SHIFT_FACTOR = 0x10;
        this.segments = {
            CS: { name: 'Código (CS)', base: 0, limit: 0 },
            SS: { name: 'Pilha (SS)', base: 0, limit: 0 },
            DS: { name: 'Dados (DS)', base: 0, limit: 0 },
            ES: { name: 'Extra (ES)', base: 0, limit: 0 }
        };
        this.memoryMap = [];
        this.calculations = [];
    }

    calcularBaseSeletor(seletor) {
        return seletor * this.SHIFT_FACTOR;
    }

    calcularEnderecoFisico(endBaseSegmento, offset) {
        return endBaseSegmento + offset;
    }

    toHex(number, padding = 5) {
        return number.toString(16).toUpperCase().padStart(padding, '0');
    }

    initializeSegments(csBase) {
        this.segments.CS.base = this.calcularBaseSeletor(csBase);
        this.segments.CS.limit = this.segments.CS.base + this.SEGMENT_SIZE - 1;
        let nextAvailable = this.segments.CS.base + this.SEGMENT_SIZE;
        let ssSelector = Math.floor(nextAvailable / this.SHIFT_FACTOR);
        this.segments.SS.base = this.calcularBaseSeletor(ssSelector);
        this.segments.SS.limit = this.segments.SS.base + this.SEGMENT_SIZE - 1;
        nextAvailable = this.segments.SS.base + this.SEGMENT_SIZE;
        let dsSelector = Math.floor(nextAvailable / this.SHIFT_FACTOR);
        this.segments.DS.base = this.calcularBaseSeletor(dsSelector);
        this.segments.DS.limit = this.segments.DS.base + this.SEGMENT_SIZE - 1;
        nextAvailable = this.segments.DS.base + this.SEGMENT_SIZE;
        let esSelector = Math.floor(nextAvailable / this.SHIFT_FACTOR);
        this.segments.ES.base = this.calcularBaseSeletor(esSelector);
        this.segments.ES.limit = this.segments.ES.base + this.SEGMENT_SIZE - 1;
    }

    initializeCompactSegments(csBase, sourceSegment, targetSegment) {
        this.initializeSegments(csBase);
        let sourceUsedSize = 0x8000;
        this.segments[sourceSegment].limit = this.segments[sourceSegment].base + sourceUsedSize - 1;
        let nextAvailable = this.segments[sourceSegment].base + sourceUsedSize;
        this.segments[targetSegment].base = nextAvailable;
        this.segments[targetSegment].limit = this.segments[targetSegment].base + this.SEGMENT_SIZE - 1;
    }

    generateGPFOffset(sourceSegment, targetSegment) {
        let sourceBase = this.segments[sourceSegment].base;
        let targetBase = this.segments[targetSegment].base;
        let offsetToTarget = targetBase - sourceBase;
        let gpfOffset = offsetToTarget + 0x100;
        return gpfOffset;
    }

    detectGPF(sourceSegment, offset) {
        let sourceBase = this.segments[sourceSegment].base;
        let physicalAddress = this.calcularEnderecoFisico(sourceBase, offset);
        if (physicalAddress >= sourceBase && physicalAddress <= this.segments[sourceSegment].limit) {
            return { hasGPF: false, targetSegment: null };
        }
        for (let segName in this.segments) {
            if (segName !== sourceSegment) {
                let seg = this.segments[segName];
                if (physicalAddress >= seg.base && physicalAddress <= seg.limit) {
                    return { hasGPF: true, targetSegment: segName };
                }
            }
        }
        return { hasGPF: true, targetSegment: 'FORA_DOS_SEGMENTOS' };
    }

    simulate(csBase, sourceSegment, targetSegment) {
        this.calculations = [];
        
        const segmentOrder = ["CS", "SS", "DS", "ES"];
        const sourceIndex = segmentOrder.indexOf(sourceSegment);
        const targetIndex = segmentOrder.indexOf(targetSegment);

        // Verifica se os segmentos são adjacentes
        if (Math.abs(sourceIndex - targetIndex) !== 1) {
            alert(`GPF inválido: O segmento ${sourceSegment} só pode invadir segmentos adjacentes. O segmento ${targetSegment} não é adjacente.`);
            return null; // Interrompe a simulação
        }

        this.initializeCompactSegments(csBase, sourceSegment, targetSegment);
        let gpfOffset = this.generateGPFOffset(sourceSegment, targetSegment);
        let physicalAddress = this.calcularEnderecoFisico(this.segments[sourceSegment].base, gpfOffset);
        let gpfResult = this.detectGPF(sourceSegment, gpfOffset);
        this.calculations.push({
            step: 1,
            description: `Endereço base ${sourceSegment} = ${this.toHex(this.segments[sourceSegment].base / this.SHIFT_FACTOR, 4)}h × 10h = ${this.toHex(this.segments[sourceSegment].base)}h`,
        });
        this.calculations.push({
            step: 2,
            description: `Offset gerado para causar GPF = ${this.toHex(gpfOffset, 4)}h`,
        });
        this.calculations.push({
            step: 3,
            description: `Endereço Físico = ${this.toHex(this.segments[sourceSegment].base)}h + ${this.toHex(gpfOffset, 4)}h = ${this.toHex(physicalAddress)}h`,
        });
        this.calculations.push({
            step: 4,
            description: `Verificação: O endereço ${this.toHex(physicalAddress)}h está fora do limite de ${sourceSegment} e dentro do segmento ${gpfResult.targetSegment}.`,
            value: gpfResult.hasGPF ? 'GPF DETECTADO!' : 'Sem GPF'
        });
        return {
            segments: this.segments,
            sourceSegment: sourceSegment,
            targetSegment: targetSegment,
            offset: gpfOffset,
            physicalAddress: physicalAddress,
            gpf: gpfResult,
            calculations: this.calculations,
            csBaseHex: this.toHex(csBase, 4)
        };
    }

    generateMemoryVisual() {
        // Ordena os segmentos na ordem: ES, DS, SS, CS (de cima para baixo)
        const segmentOrder = ['ES', 'DS', 'SS', 'CS'];
        
        // Calcula o tamanho total de todos os segmentos
        let totalSize = 0;
        for (let segmentName of segmentOrder) {
            const segment = this.segments[segmentName];
            totalSize += (segment.limit - segment.base + 1);
        }
        
        // Altura base total para a representação visual (em pixels)
        const totalHeight = 400;
        
        let visualHtml = '';
        
        for (let segmentName of segmentOrder) {
            const segment = this.segments[segmentName];
            const segmentSize = segment.limit - segment.base + 1;
            const startAddress = this.toHex(segment.base);
            const endAddress = this.toHex(segment.limit);
            
            // Calcula a altura proporcional do segmento
            const proportionalHeight = Math.max(60, (segmentSize / totalSize) * totalHeight);
            
            visualHtml += `
                <div class="memory-segment ${segmentName.toLowerCase()}-segment" 
                     data-segment="${segmentName}" 
                     style="height: ${proportionalHeight}px;">
                    <div class="segment-label">${segmentName}</div>
                    <div class="segment-address">${startAddress}h - ${endAddress}h</div>
                    <div class="segment-size">${(segmentSize / 1024).toFixed(0)} KB</div>
                </div>
            `;
        }
        
        return visualHtml;
    }

    generateMemoryMap() {
        let map = [];
        let sortedSegments = Object.entries(this.segments)
            .sort((a, b) => a[1].base - b[1].base);
        for (let [name, segment] of sortedSegments) {
            map.push({
                name: name,
                description: segment.name,
                start: this.toHex(segment.base),
                end: this.toHex(segment.limit),
                size: segment.limit - segment.base + 1
            });
        }
        return map;
    }
}

function validarEntradas() {
    const inputCs = document.getElementById('csBase').value.trim().toUpperCase();
    const sourceSegment = document.getElementById('sourceSegment').value;
    const targetSegment = document.getElementById('targetSegment').value;

    if (!inputCs) {
        alert("Por favor, insira o endereço base de CS!");
        return false;
    }
    if (!/^[0-9A-F]{1,4}$/.test(inputCs)) {
        alert("CS deve ser um valor hexadecimal de até 4 dígitos (0000-FFFF).");
        return false;
    }
    if (sourceSegment === targetSegment) {
        alert("O segmento fonte não pode ser o mesmo que o segmento alvo!");
        return false;
    }
    const csBaseInt = parseInt(inputCs, 16);
    const enderecoMaximo = (csBaseInt * 0x10) + (4 * 0x10000) - 1;
    if (enderecoMaximo > 0xFFFFF) {
        alert("A combinação de CS e os segmentos seguintes ultrapassa o limite de 1MB de memória! Tente um valor menor para CS (ex: 8000).");
        return false;
    }
    return {
        csBase: csBaseInt,
        sourceSegment,
        targetSegment,
    };
}

function runSimulation() {
    const entradas = validarEntradas();
    if (entradas) {
        const { csBase, sourceSegment, targetSegment } = entradas;
        const simulador = new Simulador();
        try {
            const simResult = simulador.simulate(csBase, sourceSegment, targetSegment);
            
            if (!simResult) { // Se simResult for null, a simulação foi interrompida por GPF inválido
                document.getElementById("results").style.display = "none";
                return;
            }

            document.getElementById("results").style.display = "block";
            const gpfStatusDiv = document.getElementById("gpfStatus");
            if (simResult.gpf.hasGPF) {
                gpfStatusDiv.innerHTML = `<div class="gpf-alert">⚠️ GPF DETECTADO! ⚠️<br>Segmento ${simResult.sourceSegment} invadiu o segmento ${simResult.gpf.targetSegment}</div>`;
            } else {
                gpfStatusDiv.innerHTML = `<div class="gpf-alert no-gpf">✅ Nenhum GPF detectado</div>`;
            }
            // Gera a representação visual da memória
            document.getElementById("memoryVisual").innerHTML = simulador.generateMemoryVisual();
            
            // Destaca o segmento que foi invadido
            if (simResult.gpf.hasGPF && simResult.gpf.targetSegment !== "FORA_DOS_SEGMENTOS") {
                const targetElement = document.querySelector(`[data-segment="${simResult.gpf.targetSegment}"]`);
                if (targetElement) {
                    targetElement.classList.add("memory-highlight");
                }
            }

            document.getElementById("calculations").innerHTML = simResult.calculations.map(calc => 
                `<div class="calculation-step"><strong>Passo ${calc.step}:</strong> ${calc.description}</div>`
            ).join("");
            const memoryMap = simulador.generateMemoryMap();
            document.getElementById("memoryMap").innerHTML = memoryMap.map(segment => 
                `<div class="segment-block">
                    <div class="segment-name">${segment.name} - ${segment.description}</div>
                    <div class="segment-info">
                        Início: <span class="hex-value">${segment.start}h</span><br>
                        Fim: <span class="hex-value">${segment.end}h</span><br>
                        Tamanho: ${(segment.size / 1024).toFixed(0)} KB
                    </div>
                </div>`
            ).join("");
            document.getElementById("simulationDetails").innerHTML = 
                `<p><strong>Endereço base CS:</strong> <span class="hex-value">${simResult.csBaseHex}h</span></p>
                 <p><strong>Segmento de origem:</strong> ${simResult.sourceSegment}</p>
                 <p><strong>Offset gerado:</strong> <span class="hex-value">${simulador.toHex(simResult.offset, 4)}h</span></p>
                 <p><strong>Endereço físico resultante:</strong> <span class="hex-value">${simulador.toHex(simResult.physicalAddress)}h</span></p>
                 <p><strong>Segmento alvo invadido:</strong> ${simResult.gpf.targetSegment}</p>
                 <p><strong>Fórmula utilizada:</strong> Endereço Físico = (Seletor × 10h) + Offset</p>`;
        } catch (error) {
            alert("Ocorreu um erro na simulação: " + error.message);
        }
    }
}

function clearResults() {
    document.getElementById('results').style.display = 'none';
    document.getElementById('csBase').value = '';
    document.getElementById('sourceSegment').selectedIndex = 0;
    document.getElementById('targetSegment').selectedIndex = 1;
    document.getElementById('gpfStatus').innerHTML = '';
    document.getElementById('calculations').innerHTML = '';
    document.getElementById('memoryMap').innerHTML = '';
    document.getElementById('memoryVisual').innerHTML = '';
    document.getElementById('simulationDetails').innerHTML = '';
}

document.getElementById('csBase').addEventListener('input', function(e) {
    this.value = this.value.replace(/[^0-9A-Fa-f]/g, '').toUpperCase();
});