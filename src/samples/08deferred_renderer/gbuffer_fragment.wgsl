struct SInput {
    @location(0) vPos : vec3<f32>,
    @location(1) vNomal : vec3<f32>,
    @location(2) vUV : vec2<f32>,
};

struct SOutput {
    @location(0) albedo : vec4<f32>,
    @location(1) position : vec4<f32>,
    @location(2) normal : vec4<f32>
}

@fragment
fn main(input: SInput) -> SOutput {
    var output: SOutput;
    output.albedo = vec4<f32>(1.0, 1.0, 0.0, 1.0);
    output.position = vec4<f32>(input.vPos, 1.0);
    output.normal = vec4<f32>(input.vNomal, 1.0);
    return output;
}