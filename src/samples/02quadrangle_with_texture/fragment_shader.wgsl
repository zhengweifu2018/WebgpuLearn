@group(0) @binding(0) var inTextureSampler: sampler;
@group(0) @binding(1) var inTextrueData: texture_2d<f32>;

struct SInput {
    //@location(0) vPosition : vec4<f32>,
    @location(1) vUV : vec2<f32>,
};

@fragment
fn main(input: SInput) -> @location(0) vec4<f32> {
    let textureColor: vec3<f32> = (textureSample(inTextrueData, inTextureSampler, input.vUV)).rgb;
    return vec4<f32>(textureColor, 1.0);
}