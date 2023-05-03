struct SInput {
    @location(1) vPos : vec3<f32>,
    @location(2) vNomal : vec3<f32>,
    @location(3) vUV : vec2<f32>,
};

@fragment
fn main(input: SInput) -> @location(0) vec4<f32> {
    return vec4<f32>(input.vNomal.x, input.vNomal.y, 0, 0);
}