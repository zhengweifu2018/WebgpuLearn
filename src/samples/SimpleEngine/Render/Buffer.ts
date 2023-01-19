abstract class CBuffer {

}

abstract class CVertexBuffer extends CBuffer {
    abstract Bind() : void;
    abstract Unbind() : void; 
    abstract Create(data: Uint32Array) : void;
}

abstract class CIndexBuffer extends CBuffer {
    abstract Bind() : void;
    abstract Unbind() : void; 
    abstract Create(data: Uint32Array) : void;
}

export { CVertexBuffer,  CIndexBuffer };