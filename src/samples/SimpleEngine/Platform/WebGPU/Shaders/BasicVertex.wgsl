#ifndef USE_VERTEX_COLOR
    #define USE_VERTEX_COLOR 0
#endif

struct VSData {
    @builtin(position) Position : vec4<f32>,
    @location(0) vPosition : vec4<f32>
#if USE_VERTEX_COLOR
    , @location(1) vColor : vec3<f32>
#endif
};

@vertex
fn main(
    @location(0) pos : vec3<f32>
#if USE_VERTEX_COLOR
    , @location(1) col : vec3<f32>
#endif
    ) -> VSData {
    var vsData: VSData;
    vsData.Position = vec4<f32>(pos, 1.0);
    vsData.vPosition = vsData.Position;
#if USE_VERTEX_COLOR
    vsData.vColor = col;
#endif
    return vsData;
}