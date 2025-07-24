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