struct FLightData {
    viewProjectionMatrix: mat4x4<f32>,
    positionXYZ_targetX: vec4<f32>,
    targetYZ_colorRG: vec4<f32>,
    colorB_padding: vec4<f32>,
}

@group(0) @binding(0) var<uniform> WorldMatrix : mat4x4<f32>;
@group(0) @binding(1) var<uniform> LightData : FLightData;

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
fn main(input: SInput) -> @builtin(position) vec4<f32> {
    return LightData.viewProjectionMatrix * WorldMatrix * vec4<f32>(input.pos, 1.0f);
}