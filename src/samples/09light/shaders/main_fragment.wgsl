struct SInput {
    @location(0) vPos : vec3<f32>,
    @location(1) vNormal : vec3<f32>,
    @location(2) vUV : vec2<f32>,
};

struct FLightData {
    viewProjectionMatrix: mat4x4<f32>,
    positionXYZ_targetX: vec4<f32>,
    targetYZ_colorRG: vec4<f32>,
    colorB_padding: vec4<f32>,
}

@group(0) @binding(2) var<uniform> LightData : FLightData;

fn getLightPosition() -> vec3<f32> {
    return LightData.positionXYZ_targetX.xyz;
}

fn getLightTarget() -> vec3<f32> {
    return vec3<f32>(LightData.positionXYZ_targetX.w, LightData.targetYZ_colorRG.xy);
}

fn getLightColor() -> vec3<f32> {
    return vec3<f32>(LightData.targetYZ_colorRG.zw, LightData.colorB_padding.x);
}

@fragment
fn main(input: SInput) -> @location(0) vec4<f32> {
    var outColor: vec3<f32> = vec3<f32>(0, 0, 0);

    let lightDir: vec3<f32> = normalize(getLightPosition() - getLightTarget());
    let ambient : f32 = 0.2;
    let lightIntensity = ambient + max(0, dot(lightDir, input.vNormal));
    outColor = lightIntensity * getLightColor();

    return vec4<f32>(outColor, 0);
}