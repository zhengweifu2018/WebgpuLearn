#ifndef USE_VERTEX_COLOR
    #define USE_VERTEX_COLOR 0
#endif

struct VSData {
    @location(0) vPosition : vec4<f32>
#if USE_VERTEX_COLOR
    , @location(1) vColor : vec3<f32>
#endif
};

@fragment
fn main(input: VSData) -> @location(0) vec4<f32> {
#if USE_VERTEX_COLOR
    return vec4<f32>(input.vColor, 1.0);
#else
    return vec4<f32>(0.0, 0.0, 1.0, 1.0);
#endif
}