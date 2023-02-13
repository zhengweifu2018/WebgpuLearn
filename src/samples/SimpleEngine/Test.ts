import { CreateIndexBuffer, CreateVertexBuffer } from "../common";
import { CGeometryComponent, CMaterialComponent, CTransformComponent } from "./Game/Component";
import { CScene } from "./Game/Scene";
import { WebGPUApi } from "./Platform/WebGPU/WebGPUApi";
import { CVertexBuffer, CIndexBuffer } from "./Render/Buffer";
import { CBufferElement, CBufferLayout, EShaderDataType } from "./Render/BufferLayout";
import { CreateFactory } from "./Render/CreateFactory";
import { CRendererApi } from "./Render/RendererApi";
import { CPipelineStateObject } from "./Render/PipelineStateObject";
import { CShader, EShaderType } from "./Render/Shader";

const VertexShader: string = `
struct VSData {
    @builtin(position) vPosition : vec4<f32>,
    @location(1) vColor : vec3<f32>,
};

@vertex
fn main(
    @location(0) pos : vec3<f32>,
    @location(1) col : vec3<f32>) -> VSData {
    var vsData: VSData;
    vsData.vPosition = vec4<f32>(pos, 1.0);
    vsData.vColor = col;
    return vsData;
}
`;

const FragmentShader: string = `
struct SInput {
    //@location(0) vPosition : vec4<f32>,
    @location(1) vColor : vec3<f32>,
};
@fragment
fn main(input: SInput) -> @location(0) vec4<f32> {
    return vec4<f32>(input.vColor, 1.0);
}
`;

export const Test = async (canvaseName: string) => {
    let scene = new CScene();
    let entity = scene.CreateEnitity();

    let transfrom = new CTransformComponent();
    let geometry = new CGeometryComponent();
    let material = new CMaterialComponent();

    entity.AddComponent(transfrom, geometry, material);
    
    const rendererApi : CRendererApi = CreateFactory.GetRendererApi();
    await rendererApi.Init(canvaseName);

    const vertexData = new Float32Array([
        -0.5,  0.5, 0, 1, 1, 1,
         0.5,  0.5, 0, 1, 0, 1,
         0.5, -0.5, 0, 1, 0, 1,
        -0.5, -0.5, 0, 1, 0, 1
    ]);

    let vertexBuffer: CVertexBuffer = CreateFactory.CreateVertexBuffer(vertexData);

    let bufferElements: Array<CBufferElement> = [
        new CBufferElement("a_Position", EShaderDataType.Float3),
        new CBufferElement("a_Color", EShaderDataType.Float3)
    ];

    let layout : CBufferLayout = new CBufferLayout(bufferElements);

    vertexBuffer.Layout = layout;

    const indexData = new Uint32Array([
        0, 1, 2, 2, 3, 0
    ]);

    let indexBuffer : CIndexBuffer = CreateFactory.CreateIndexBuffer(indexData, indexData.length);

    let device = WebGPUApi.Instance.Device;
    let format = WebGPUApi.Instance.Format;
    let context = WebGPUApi.Instance.Context; 

    const vShader: CShader = CreateFactory.CreateShader(VertexShader, "main", EShaderType.Vertex);
    const pShader: CShader = CreateFactory.CreateShader(FragmentShader, "main", EShaderType.Fragment);

    const pipeline: CPipelineStateObject = CreateFactory.CreatePipelineStateObject(
        vertexBuffer, vShader, pShader
    );

    // const pipeline: GPURenderPipeline = device.createRenderPipeline({
    //     layout: "auto",
    //     vertex: {
    //         module: device.createShaderModule({
    //             code: VertexShader
    //         }),
    //         entryPoint: "main",
    //         buffers: [{
    //             arrayStride: 4 * 6,
    //             attributes: [
    //                 {shaderLocation: 0, format: "float32x3", offset: 0},
    //                 {shaderLocation: 1, format: "float32x3", offset: 12}
    //             ]
    //         }]
    //     },
    //     fragment: {
    //         module: device.createShaderModule({
    //             code: FragmentShader
    //         }),
    //         entryPoint: "main",
    //         targets: [{
    //             format: format
    //         }]
    //     },
    //     primitive: {
    //         topology: "triangle-list"
    //     }
    // });

    const commandEncoder = device.createCommandEncoder();
    const textureView = context.getCurrentTexture().createView();
    const renderPassDescriptor = {
        colorAttachments: [{
            view: textureView,
            clearValue: {
                r: 0, g: 0, b: 0.5, a: 1.0
            },
            loadOp: "clear",
            storeOp: 'store'
        }]
    } as GPURenderPassDescriptor;

    // 创建RenderPass
    const renderPass = commandEncoder.beginRenderPass(renderPassDescriptor);
    renderPass.setPipeline(pipeline.RenderPipeline);

    renderPass.setVertexBuffer(0, vertexBuffer.Buffer);
    renderPass.setIndexBuffer(indexBuffer.Buffer, "uint32");
    
    renderPass.drawIndexed(6, 1, 0, 0, 0);
    renderPass.end();

    device.queue.submit([commandEncoder.finish()]);
}