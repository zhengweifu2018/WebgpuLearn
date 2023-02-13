export enum EShaderType {
    Vertex = 0, Fragment, Compute
}

export class CShader {
    constructor(source: string, entryPoint: string, type: EShaderType) {
        this.m_Source = source;
        this.m_EntryPoint = entryPoint;
        this.m_Type = type;
    }

    get Type() : EShaderType {
        return this.m_Type;
    }
    get Source() : string {
        return this.m_Source;
    }
    get EntryPoint() : string {
        return this.m_EntryPoint;
    }
    private m_Type: EShaderType;
    private m_Source: string;
    private m_EntryPoint: string;
}