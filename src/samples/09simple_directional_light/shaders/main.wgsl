struct FViewData {
    viewMatrix : mat4x4<f32>,
    projectionMatrix : mat4x4<f32>,
};

struct FLightData {
    viewProjectionMatrix: mat4x4<f32>,
    positionXYZ_targetX: vec4<f32>,
    targetYZ_colorRG: vec4<f32>,
    colorB_Bias_samples_padding: vec4<f32>,
}

@group(0) @binding(0) var<uniform> ViewData : FViewData;
@group(0) @binding(1) var<uniform> WorldMatrix : mat4x4<f32>;
@group(0) @binding(2) var<uniform> LightData : FLightData;

struct VInput {
    @location(0) pos : vec3<f32>,
    @location(1) normal : vec3<f32>,
    @location(2) uv : vec2<f32>,
};

struct VOutput {
    @builtin(position) Position : vec4<f32>,
    @location(0) vPos : vec3<f32>,
    @location(1) vNormal : vec3<f32>,
    @location(2) vUV : vec2<f32>,
    @location(3) shadowPos : vec3<f32>,
    
};

@vertex
fn vs_main(input: VInput) -> VOutput {
    var output: VOutput;
    output.Position = ViewData.projectionMatrix * ViewData.viewMatrix * WorldMatrix * vec4<f32>(input.pos, 1.0f);
    output.vPos = input.pos;
    output.vNormal = input.normal;
    output.vUV = input.uv;

    // xy is in (-1, 1), z is in (0, 1) space
    let posFromLight = LightData.viewProjectionMatrix * WorldMatrix * vec4<f32>(input.pos, 1.0);
    // xy convert to (0, 1)
    // y is fliped because texture coords are y-down.
    output.shadowPos = vec3<f32>(posFromLight.xy * vec2<f32>(0.5, -0.5) + vec2<f32>(0.5, 0.5), posFromLight.z);
    
    return output;
}

@group(0) @binding(3) var ShadowMap : texture_depth_2d;
@group(0) @binding(4) var ShadowSampler : sampler_comparison;

fn getLightPosition() -> vec3<f32> {
    return LightData.positionXYZ_targetX.xyz;
}

fn getLightTarget() -> vec3<f32> {
    return vec3<f32>(LightData.positionXYZ_targetX.w, LightData.targetYZ_colorRG.xy);
}

fn getLightColor() -> vec3<f32> {
    return vec3<f32>(LightData.targetYZ_colorRG.zw, LightData.colorB_Bias_samples_padding.x);
}

@fragment
fn fs_main(input: VOutput) -> @location(0) vec4<f32> {
    var outColor: vec3<f32> = vec3<f32>(0, 0, 0);

    let lightDir: vec3<f32> = normalize(getLightPosition() - getLightTarget());
    let ambient : f32 = 0.3;
    let lightIntensity = max(0, dot(lightDir, input.vNormal));

    let bias = LightData.colorB_Bias_samples_padding.y;

    let shadowSampleCount:u32 = u32(LightData.colorB_Bias_samples_padding.z);

    var shadowSampleOffsets4x4 : array<vec2<f32>, 16> = array<vec2<f32>, 16>(
        vec2(-1.5, -1.5), vec2(-1.5, -0.5), vec2(-1.5, 0.5), vec2(-1.5, 1.5),
        vec2(-0.5, -1.5), vec2(-0.5, -0.5), vec2(-0.5, 0.5), vec2(-0.5, 1.5),
        vec2( 0.5, -1.5), vec2( 0.5, -0.5), vec2( 0.5, 0.5), vec2( 0.5, 1.5),
        vec2( 1.5, -1.5), vec2( 1.5, -0.5), vec2( 1.5, 0.5), vec2( 1.5, 1.5)
    );

    var shadowSampleOffsets3x3 : array<vec2<f32>, 9> = array<vec2<f32>, 9>(
        vec2(-1.0, -1.0), vec2(0.0, -1.0), vec2(1.0, -1.0),
        vec2(-1.0,  0.0), vec2(0.0,  0.0), vec2(1.0,  0.0),
        vec2(-1.0,  1.0), vec2(0.0,  1.0), vec2(1.0,  1.0)
    );

    var shadowSampleOffsets2x2 : array<vec2<f32>, 4> = array<vec2<f32>, 4>(
        vec2(-0.5, -0.5), vec2(-0.5, 0.5), 
        vec2( 0.5, -0.5), vec2( 0.5, 0.5),
    );

    var shadowSampleOffsets1x2 : array<vec2<f32>, 2> = array<vec2<f32>, 2>(
        vec2(-0.5, -0.5), vec2(0.5, 0.5)
    );

    var shadowSampleOffsets1x1 : array<vec2<f32>, 1> = array<vec2<f32>, 1>(
        vec2(0.0, 0.0)
    );

    let texelSize = 1.0 / vec2<f32>(textureDimensions(ShadowMap, 0));

    var visibility = 0.0;
    // PCF
    for(var i = 0u; i < shadowSampleCount; i = i + 1u) {
        if(shadowSampleCount == 16) {
            visibility += textureSampleCompare(ShadowMap, ShadowSampler, 
                input.shadowPos.xy + shadowSampleOffsets4x4[i] * texelSize, 
                input.shadowPos.z - bias);
        } else if(shadowSampleCount == 9) {
            visibility += textureSampleCompare(ShadowMap, ShadowSampler, 
                input.shadowPos.xy + shadowSampleOffsets3x3[i] * texelSize, 
                input.shadowPos.z - bias);
        } else if(shadowSampleCount == 4) {
            visibility += textureSampleCompare(ShadowMap, ShadowSampler, 
                input.shadowPos.xy + shadowSampleOffsets2x2[i] * texelSize, 
                input.shadowPos.z - bias);
        } else if(shadowSampleCount == 2) {
            visibility += textureSampleCompare(ShadowMap, ShadowSampler, 
                input.shadowPos.xy + shadowSampleOffsets1x2[i] * texelSize, 
                input.shadowPos.z - bias);
        } else {
            visibility += textureSampleCompare(ShadowMap, ShadowSampler, 
                input.shadowPos.xy + shadowSampleOffsets1x1[i] * texelSize, 
                input.shadowPos.z - bias);
        }
    }

    visibility /= f32(shadowSampleCount);

    outColor = (lightIntensity * visibility + ambient) * getLightColor();

    return vec4<f32>(outColor, 1);
}