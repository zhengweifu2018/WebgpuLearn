import { EPrimitiveTopology} from "./DataTypes";
import { CBufferLayout } from "./BufferLayout";
import { IShader } from "./Shader"
import { CRenderState } from "./States/RenderState";

export interface CGraphicsPipelineDesc {
    // geometry primitive topology
    PrimitiveTopology: EPrimitiveTopology; // default value = EPrimitiveTopology.TriangleList;

    // The render state
    RenderState: CRenderState;
    
    // shaders
    VertexShader: IShader;
    FragmentShader: IShader;

    Layout: CBufferLayout;
}

export abstract class IGraphicsPipeline {
    get RenderPipeline(): any {
        return null;
    }
    
    get GraphicsPipelineDesc() {
        return this.m_GraphicsPipelineDesc;
    }

    protected m_GraphicsPipelineDesc: CGraphicsPipelineDesc;
}