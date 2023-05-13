struct FViewData {
    viewMatrix : mat4x4<f32>,
    projectionMatrix : mat4x4<f32>,
};

@group(0) @binding(0) var<uniform> ViewData : FViewData;
@group(0) @binding(1) var<uniform> WorldMatrix : mat4x4<f32>;

struct SInput {
    @location(0) pos : vec3<f32>,
    @location(1) normal : vec3<f32>,
    @location(2) uv : vec2<f32>,
};

struct SOutput {
    @builtin(position) Position : vec4<f32>,
    @location(0) vPos : vec3<f32>,
    @location(1) vNormal : vec3<f32>,
    @location(2) vUV : vec2<f32>,
};

@vertex
fn main(input: SInput) -> SOutput {
    var output: SOutput;
    output.Position = ViewData.projectionMatrix * ViewData.viewMatrix * WorldMatrix * vec4<f32>(input.pos, 1.0f);
    output.vPos = input.pos;
    output.vNormal = input.normal;
    output.vUV = input.uv;
    return output;
}