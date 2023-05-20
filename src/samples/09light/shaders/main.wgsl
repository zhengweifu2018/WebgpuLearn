struct FViewData {
    viewMatrix : mat4x4<f32>,
    projectionMatrix : mat4x4<f32>,
};

struct FLightData {
    viewProjectionMatrix: mat4x4<f32>,
    positionXYZ_targetX: vec4<f32>,
    targetYZ_colorRG: vec4<f32>,
    colorB_Bias_padding: vec4<f32>,
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
    return vec3<f32>(LightData.targetYZ_colorRG.zw, LightData.colorB_Bias_padding.x);
}

@fragment
fn fs_main(input: VOutput) -> @location(0) vec4<f32> {
    var outColor: vec3<f32> = vec3<f32>(0, 0, 0);

    let lightDir: vec3<f32> = normalize(getLightPosition() - getLightTarget());
    let ambient : f32 = 0.2;
    let lightIntensity = ambient + max(0, dot(lightDir, input.vNormal));

    let bias = LightData.colorB_Bias_padding.y;
    var visibility = 0.0;
    visibility += textureSampleCompare(ShadowMap, ShadowSampler, input.shadowPos.xy, input.shadowPos.z - bias);

    outColor = lightIntensity * getLightColor() * visibility;

    return vec4<f32>(outColor, 1);
}