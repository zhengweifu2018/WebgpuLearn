import { CreateIndexBuffer, CreateVertexBuffer } from "../common";
import { CGeometryComponent, CMaterialComponent, CTransformComponent } from "./Game/Component";
import { CScene } from "./Game/Scene";
import { WebGPUApi } from "./Platform/WebGPU/WebGPUApi";
import { IVertexBuffer, IIndexBuffer, IFrameBuffer, CFrameBufferDesc, ITextureView, CTextureViewDesc } from "./Render/Buffer";
import { CBufferElement, CBufferLayout, EShaderDataType } from "./Render/BufferLayout";
import { CreateFactory } from "./Render/CreateFactory";
import { IRendererApi } from "./Render/RendererApi";
import { CGraphicsPipelineDesc, IGraphicsPipeline } from "./Render/GraphicsPipeline";
import { IShader, EShaderType } from "./Render/Shader";
import { CRenderState } from "./Render/States/RenderState";
import { EBlendFactor, EBlendOp, EColorMask, ECompareFunc, EFrontFace, ELoadOp, EPrimitiveTopology, ERasterCullMode, ERasterFillMode, EStoreOp, ETextureFormat, ETextureViewDimension } from "./Render/DataTypes";
import { ICommandList } from "./Render/CommandList";
import { vec4 } from "gl-matrix";
import { IRenderPass } from "./Render/RenderPass";
import { CGraphicsState } from "./Render/States/GraphicsState";
import{ ShaderPreprocessor } from "./Platform/WebGPU/WebGPUPreprocessor"

import VertexShader from "./Platform/WebGPU/Shaders/BasicVertex.wgsl?raw";
import FragmentShader from "./Platform/WebGPU/Shaders/LambertShader.wgsl?raw";


// export const Test = (canvaseName: string) => {
//     console.log(ShaderPreprocessor('#define USE_VERTEX_COLOR 0\n' + VertexShader));
// }

export const Test = async (canvaseName: string) => {
    let scene = new CScene();
    let entity = scene.CreateEnitity();

    let transfrom = new CTransformComponent();
    let geometry = new CGeometryComponent();
    let material = new CMaterialComponent();

    entity.AddComponent(transfrom, geometry, material);
    
    const rendererApi : IRendererApi = CreateFactory.GetRendererApi();
    await rendererApi.Init(canvaseName);

    const vertexData = new Float32Array([
        // position,   color
        -0.5, -0.5,  0.5,    0, 0, 1,     // vertex a, index 0
         0.5, -0.5,  0.5,    1, 0, 1,     // vertex b, index 1
         0.5,  0.5,  0.5,    1, 1, 1,     // vertex c, index 2
        -0.5,  0.5,  0.5,    0, 1, 1,     // vertex d, index 3
        -0.5, -0.5, -0.5,    0, 0, 0,     // vertex e, index 4
         0.5, -0.5, -0.5,    1, 0, 0,     // vertex f, index 5
         0.5,  0.5, -0.5,    1, 1, 0,     // vertex g, index 6
        -0.5,  0.5, -0.5,    0, 1, 0      // vertex h, index 7 
    ]);

    const indexData = new Uint32Array([
        // front
        0, 1, 2, 2, 3, 0,

        // right
        1, 5, 6, 6, 2, 1,

        // back
        4, 7, 6, 6, 5, 4,

        // left
        0, 3, 7, 7, 4, 0,

        // top
        3, 2, 6, 6, 7, 3,

        // bottom
        0, 4, 5, 5, 1, 0
    ]);

    // const vertexData = new Float32Array([
    //     -0.5,  0.5, 0.0, 1, 0, 0,
    //      0.5,  0.5, 0.0, 0, 1, 0,
    //      0.5, -0.5, 0.0, 0, 0, 1,
    //     -0.5, -0.5, 0.0, 1, 1, 1
    // ]);

    // const indexData = new Uint32Array([
    //     0, 1, 2, 2, 3, 0
    // ]);


    const vertexBuffer: IVertexBuffer = rendererApi.CreateVertexBuffer(vertexData);
    const indexBuffer : IIndexBuffer = rendererApi.CreateIndexBuffer(indexData, indexData.length);

    const defineStr = '#define USE_VERTEX_COLOR 1\n';

    const vertexShaderCode = ShaderPreprocessor(`${defineStr}${VertexShader}`);
    const fragmentShaderCode = ShaderPreprocessor(`${defineStr}${FragmentShader}`);
    console.log(vertexShaderCode);
    const vShader: IShader = rendererApi.CreateShader(vertexShaderCode, "main", EShaderType.Vertex);
    const pShader: IShader = rendererApi.CreateShader(fragmentShaderCode, "main", EShaderType.Fragment);
    
    let renderState: CRenderState = {
        RasterState: {
            FillMode: ERasterFillMode.Solid,
            CullMode: ERasterCullMode.None,
            FrontFace: EFrontFace.CCW,
            DepthClipEnable: false,
            ScissorEnable: false,
            MultisampleEnable: false
        },
        DepthStencilState: {
            DepthTestEnable: true,
            DepthWriteEnable: true,
            DepthFunc: ECompareFunc.Less,
            StencilEnable: false,
            Format: ETextureFormat.DEPTH24PLUS,
        },
        RenderTargets: [{
            Format: ETextureFormat.BGRA8UNORM,
            ColorWriteMask: EColorMask.All,
            BlendState: {
                BlendEnable: false,
                SrcBlend: EBlendFactor.One,
                DestBlend: EBlendFactor.Zero,
                BlendOp: EBlendOp.Add,
                SrcBlendAlpha: EBlendFactor.One,
                DestBlendAlpha: EBlendFactor.Zero,
                BlendOpAlpha: EBlendOp.Add
            }
        }]
    };

    const bufferElements: Array<CBufferElement> = [
        new CBufferElement("a_Position", EShaderDataType.Float3),
        new CBufferElement("a_Color", EShaderDataType.Float3)
    ];
    const layout : CBufferLayout = new CBufferLayout(bufferElements);

    const desc: CGraphicsPipelineDesc = {
        PrimitiveTopology: EPrimitiveTopology.TriangleList,
        RenderState: renderState,
        VertexShader: vShader,
        FragmentShader: pShader,
        Layout: layout
    };

    const pipeline: IGraphicsPipeline = rendererApi.CreateRenderPipeline(desc);

    const commandList: ICommandList = rendererApi.CreateCommandList();

    // const textureViewDesc: CTextureViewDesc = {
    //     Format: ETextureFormat.BGRA8UNORM,
    //     Extent: {
    //         Width: WebGPUApi.Instance.Canvas.width, 
    //         Height: WebGPUApi.Instance.Canvas.height, 
    //         Depth: 1
    //     },
    //     Dimension: ETextureViewDimension.TEXTURE2D,
    //     BaseMipLevel: 0,
    //     MipLevelCount: 1,
    //     BaseArrayLayer: 0,
    //     ArrayLayerCount: 0
    // };
    // const textureView: ITextureView = rendererApi.CreateTextureView(textureViewDesc);
    
    const depthStencilViewDesc: CTextureViewDesc = {
        Format: ETextureFormat.DEPTH24PLUS,
        Extent: {
            Width: WebGPUApi.Instance.Canvas.width, 
            Height: WebGPUApi.Instance.Canvas.height, 
            Depth: 1
        },
        Dimension: ETextureViewDimension.TEXTURE2D,
        BaseMipLevel: 0,
        MipLevelCount: 1,
        BaseArrayLayer: 0,
        ArrayLayerCount: 0
    }
    const depthStencilView: ITextureView = rendererApi.CreateTextureView(depthStencilViewDesc);

    const frameDesc: CFrameBufferDesc = {
        ColorAttachments: [{
            ClearColor: vec4.fromValues(0, 0.5, 0.5, 1),
            LoadOp: ELoadOp.Clear,
            StoreOp: EStoreOp.Store,
        }],
        DepthAttachment: {
            TextureView: depthStencilView,
            DepthClearValue: 1.0,
            DepthLoadOp: ELoadOp.Clear,
            DepthStoreOp: EStoreOp.Store,
            DepthReadOnly: false,
        
            StencilClearValue: 1,
            StencilLoadOp: ELoadOp.Clear,
            StencilStoreOp: EStoreOp.Store,
            StencilReadOnly: true
        }
    };

    const frameBuffer: IFrameBuffer = rendererApi.CreateFrameBuffer(frameDesc); 

    commandList.Open();

    // 创建并渲染一个renderpass
    {
        let renderPass: IRenderPass = commandList.CreateRenderPass(frameBuffer);

        renderPass.Begin()
    
        const graphicsState: CGraphicsState = {
            GraphicsPipeline: pipeline,
            VertexBuffer: vertexBuffer,
            IndexBuffer: indexBuffer
        };
        renderPass.SetGraphicsState(graphicsState);

        renderPass.DrawIndexed({
            IndexCount: indexBuffer.Count,
            // InstanceCount: 1,
            // FirstIndex: 0,
            // BaseVertex: 0,
            // FirstInstance: 0
        });
    
        renderPass.End();
    }
    
    commandList.Close();

    commandList.Submit();
}