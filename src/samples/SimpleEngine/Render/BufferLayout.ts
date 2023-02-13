enum EShaderDataType {
    None=0, Float, Float2, Float3, Float4, Mat3, Mat4, Int, Int2, Int3, Int4, Boolean
}

const ShaderDataTypeSize = (type: EShaderDataType) : number => {
    switch(type) {
        case EShaderDataType.Float:     return 4;
        case EShaderDataType.Float2:    return 4 * 2;
        case EShaderDataType.Float3:    return 4 * 3;
        case EShaderDataType.Float4:    return 4 * 4;
        case EShaderDataType.Mat3:      return 4 * 9;
        case EShaderDataType.Mat4:      return 4 * 16;
        case EShaderDataType.Int:       return 4;
        case EShaderDataType.Int2:      return 4 * 2;
        case EShaderDataType.Int3:      return 4 * 3;
        case EShaderDataType.Int4:      return 4 * 4;
        case EShaderDataType.Boolean:   return 1;
        default:                        return 0;
    }
}

class CBufferElement {
    constructor(name: string, shaderDataType: EShaderDataType) {
        this.Name = name;
        this.ShaderDataType = shaderDataType;
        this.Size = ShaderDataTypeSize(shaderDataType);
        this.Offset = 0;
    }

    GetComponentCount() : number {
        switch(this.ShaderDataType) {
            case EShaderDataType.Float:     return 1;
            case EShaderDataType.Float2:    return 2;
            case EShaderDataType.Float3:    return 3;
            case EShaderDataType.Float4:    return 4;
            case EShaderDataType.Mat3:      return 9;
            case EShaderDataType.Mat4:      return 16;
            case EShaderDataType.Int:       return 1;
            case EShaderDataType.Int2:      return 2;
            case EShaderDataType.Int3:      return 3;
            case EShaderDataType.Int4:      return 4;
            case EShaderDataType.Boolean:   return 1;
            default:                        return 0;
        }
    }

    public Name:              string;
    public ShaderDataType:    EShaderDataType;
    public Size:              number;
    public Offset:            number;
}

class CBufferLayout {
    constructor(elements: Array<CBufferElement>) {
        this.m_BufferElements = elements;
        this.m_Stride = 0;
        this.CalculateOffsetAndStride();
    }

    private CalculateOffsetAndStride() {
        this.m_Stride = 0;
        let offset: number = 0;
        for(let element of this.m_BufferElements)
        {
            element.Offset = offset;
            offset += element.Size;
            this.m_Stride += element.Size;
        }
    }

    get Stride() : number {
        return this.m_Stride;
    }

    get BufferElements() : Array<CBufferElement> {
        return this.m_BufferElements;
    }

    private m_BufferElements: Array<CBufferElement>;
    private m_Stride: number;
}

export { CBufferElement, CBufferLayout, EShaderDataType }