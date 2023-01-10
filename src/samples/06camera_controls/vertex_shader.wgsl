@group(0) @binding(0) var<storage, read> mvpMatrix : array<mat4x4<f32>>;

struct SInput {
    @builtin(instance_index) index : u32,
    @location(0) pos : vec4<f32>,
    @location(1) col : vec4<f32>,
};

struct SOutput {
    @builtin(position) Position : vec4<f32>,
    //@location(0) vPosition : vec4<f32>,
    @location(1) vColor : vec4<f32>,
};

@vertex
fn main(input: SInput) -> SOutput {
    var output: SOutput;
    output.Position = mvpMatrix[input.index] * input.pos;
    //output.vPosition = vec4<f32>(input.pos, 1.0);
    output.vColor = input.col;
    return output;
}