struct SInput {
    [[location(0)]] pos : vec2<f32>;
    [[location(1)]] uv : vec2<f32>;
};

struct SOutput {
    [[builtin(position)]] Position : vec4<f32>;
    //[[location(0)]] vPosition : vec4<f32>;
    [[location(1)]] vUV : vec2<f32>;
};

[[stage(vertex)]]
fn main(input: SInput) -> SOutput {
    var output: SOutput;
    output.Position = vec4<f32>(input.pos, 0.0, 1.0);
    //output.vPosition = vec4<f32>(input.pos, 0.0, 1.0);
    output.vUV = input.uv;
    return output;
}