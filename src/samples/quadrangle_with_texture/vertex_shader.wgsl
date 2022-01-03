struct VSData {
    [[builtin(position)]] vPosition : vec4<f32>;
    [[location(1)]] vColor : vec3<f32>;
};

[[stage(vertex)]]
fn main(
    [[location(0)]] pos : vec2<f32>,
    [[location(1)]] col : vec3<f32>) -> VSData {
    var vsData: VSData;
    vsData.vPosition = vec4<f32>(pos, 0.0, 1.0);
    vsData.vColor = col;
    return vsData;
}