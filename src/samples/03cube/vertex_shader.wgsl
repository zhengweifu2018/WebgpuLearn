struct SUniforms {
    mvpMatrix: mat4x4<f32>;
};

[[binding(0), group(0)]] var<uniform> uniforms : SUniforms;

struct SInput {
    [[location(0)]] pos : vec4<f32>;
    [[location(1)]] col : vec4<f32>;
};

struct SOutput {
    [[builtin(position)]] Position : vec4<f32>;
    //[[location(0)]] vPosition : vec4<f32>;
    [[location(1)]] vColor : vec4<f32>;
};

[[stage(vertex)]]
fn main(input: SInput) -> SOutput {
    var output: SOutput;
    output.Position = uniforms.mvpMatrix * input.pos;
    //output.vPosition = vec4<f32>(input.pos, 1.0);
    output.vColor = input.col;
    return output;
}