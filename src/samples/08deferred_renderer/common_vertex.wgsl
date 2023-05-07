struct FView {
    worldMatrix : mat4x4<f32>,
    viewMatrix : mat4x4<f32>,
    projectionMatrix : mat4x4<f32>,
};

@group(0) @binding(0) var<storage, read> View : FView;

// @group(0) @binding(0) var<storage, read> worldMatrix : mat4x4<f32>;
// @group(0) @binding(1) var<storage, read> vpMatrix : mat4x4<f32>;


struct SInput {
    @builtin(instance_index) index : u32,
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
    output.Position = View.projectionMatrix * View.viewMatrix * View.worldMatrix * vec4<f32>(input.pos, 1.0f);
    output.vPos = input.pos;
    output.vNormal = input.normal;
    output.vUV = input.uv;
    return output;
}