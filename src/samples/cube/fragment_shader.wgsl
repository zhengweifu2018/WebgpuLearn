struct SInput {
    //[[location(0)]] vPosition : vec4<f32>;
    [[location(1)]] vColor : vec3<f32>;
};

[[stage(fragment)]]
fn main(input: SInput) -> [[location(0)]] vec4<f32> {
    return vec4<f32>(input.vColor, 1.0);
}