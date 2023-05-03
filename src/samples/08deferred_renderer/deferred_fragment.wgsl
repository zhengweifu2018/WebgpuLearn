@group(0) @binding(0) var gBufferAlbedo: texture_2d<f32>;
@group(0) @binding(1) var gBufferPosition: texture_2d<f32>;
@group(0) @binding(2) var gBufferNormal: texture_2d<f32>;

override CanvasWidth: f32;
override CanvasHeight: f32;

@fragment
fn main(@builtin(position) coord : vec4<f32>) -> @location(0) vec4<f32> {
    var outColor : vec3<f32>;
    let position = textureLoad(gBufferPosition, vec2<i32>(floor(coord.xy)), 0).xyz;

    if (position.z > 1000000.0) {
        discard;
    } 

    let normal = textureLoad(gBufferNormal, vec2<i32>(floor(coord.xy)), 0).xyz;

    let albedo = textureLoad(gBufferAlbedo, vec2<i32>(floor(coord.xy)), 0).rgb;

    let lightDir = normalize(vec3<f32>(1, 1, 0));
    let light = max(0.1, dot(normal, lightDir));

    let c = coord.xy / vec2<f32>(CanvasWidth, CanvasHeight);

    if(c.x <= 0.5) {
        if(c.y <= 0.5) {
            outColor += albedo * light;
        } else {
            outColor += albedo;
        }
    } else {
        if(c.y <= 0.5) {
            outColor += normal;
        } else {
            outColor += position;
        }
    }
    
    return vec4(outColor, 1.0);
}