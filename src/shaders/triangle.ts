export const Triangle = () => { 
    // const vertex = [
    //     "const pos: array<vec2<f32>, 3> = array<vec2<f32>, 3>(",
    //     "   vec2<f32>( 0.0,  0.5),",
    //     "   vec2<f32>(-0.5, -0.5),",
    //     "   vec2<f32>( 0.5, -0.5));",
    //     "[[builtin(position)]] var<out> Position: vec4<f32>;",
    //     "[[builtin(vertex_idx)]] var<in> VertexIndex: i32;",
    //     "[[stage(vertex)]]",
    //     "fn main() -> {",
    //     "   Postion = vec4<f32>(pos[VertexIndex], 0.0, 1.0);",
    //     "   return;",
    //     "}"
    // ].join('\n');

    // const fragment = [
    //     "[[location(0)]] var<out> OutColor: vec4<f32>",
    //     "[[stage(fragment)]]",
    //     "fn main() -> {",
    //     "   OutColor = vec4<f32>(1.0, 1.0, 0.0, 1.0);",
    //     "   return;",
    //     "}"
    // ].join('\n');
    const vertex = `
        [[stage(vertex)]]
        fn main([[builtin(vertex_index)]] VertexIndex : u32)
            -> [[builtin(position)]] vec4<f32> {
        var pos = array<vec2<f32>, 3>(
            vec2<f32>(0.0, 0.5),
            vec2<f32>(-0.5, -0.5),
            vec2<f32>(0.5, -0.5));
        
        return vec4<f32>(pos[VertexIndex], 0.0, 1.0);
        }
    `;

    const fragment = `
        [[stage(fragment)]]
        fn main() -> [[location(0)]] vec4<f32> {
        return vec4<f32>(1.0, 0.0, 0.0, 1.0);
        }
    `;
    
    return { vertex, fragment };
}