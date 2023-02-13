import { CBufferLayout }  from "./BufferLayout";

abstract class CBuffer {
}

abstract class CVertexBuffer extends CBuffer {
    abstract Bind() : void;
    abstract Unbind() : void; 
    abstract get Buffer() : any;
    Layout: CBufferLayout;
}

abstract class CIndexBuffer extends CBuffer {
    abstract Bind() : void;
    abstract Unbind() : void;
    abstract get Buffer() : any;
    abstract get Count() : number; 
}

abstract class CTextureBuffer extends CBuffer {
    abstract Bind() : void;
    abstract Unbind() : void; 
}

export { CVertexBuffer,  CIndexBuffer, CTextureBuffer };