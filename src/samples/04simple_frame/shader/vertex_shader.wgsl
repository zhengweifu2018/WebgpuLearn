struct SUniforms {
    projectionMatrix: mat4x4<f32>,
    viewMatrix      : mat4x4<f32>,
    modelMatrix     : mat4x4<f32>,
};

@group(0) @binding(0) var<uniform> uniforms : SUniforms;

struct SInput {
    @location(0) worldPosition : vec4<f32>,
    @location(1) worldNormal : vec4<f32>,
    @location(2) worldUV : vec4<f32>,
};

struct SOutput {
    @builtin(position) Position : vec4<f32>,
    @location(0) vPosition : vec4<f32>,
    @location(1) vNormal : vec4<f32>,
    @location(2) vUV : vec4<f32>,
};

@stage(vertex)
fn main(input: SInput) -> SOutput {
    var output: SOutput;
    output.Position = uniforms.projectionMatrix * uniforms.viewMatrix * uniforms.modelMatrix * input.worldPosition;
    output.vPosition = input.worldPosition;
    output.vNormal = input.worldNormal;
    output.vUV = input.worldUV;
    return output;
}