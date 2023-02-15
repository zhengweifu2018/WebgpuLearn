
import { 
    EFrontFace,
    ERasterCullMode, 
    EBlendOp, 
    EBlendFactor,
    EShaderDataType,
    EPrimitiveTopology,
    ECompareFunc,
    EStencilOp,
    ETextureFormat,
    ELoadOp, EStoreOp
 } from "../../Render/DataTypes";

export const GPUTextureFormatFrom = (textureFormat: ETextureFormat) : GPUTextureFormat => {
    switch(textureFormat) {
        case ETextureFormat.R8UNORM: return "r8unorm";
        case ETextureFormat.R8SNORM: return "r8snorm";
        case ETextureFormat.R8UINT: return "r8uint";
        case ETextureFormat.R8SINT: return "r8sint";
        case ETextureFormat.R16UINT: return "r16uint";
        case ETextureFormat.R16SINT: return "r16sint";
        case ETextureFormat.R16FLOAT: return "r16float";
        case ETextureFormat.RG8UNORM: return "rg8unorm";
        case ETextureFormat.RG8SNORM: return "rg8snorm";
        case ETextureFormat.RG8UINT: return "rg8uint";
        case ETextureFormat.RG8SINT: return "rg8sint";
        case ETextureFormat.R32UINT: return "r32uint";
        case ETextureFormat.R32SINT: return "r32sint";
        case ETextureFormat.R32FLOAT: return "r32float";
        case ETextureFormat.RG16UINT: return "rg16uint";
        case ETextureFormat.RG16SINT: return "rg16sint";
        case ETextureFormat.RG16FLOAT: return "rg16float";
        case ETextureFormat.RGBA8UNORM: return "rgba8unorm";
        case ETextureFormat.RGBA8UNORM_SRGB: return "rgba8unorm-srgb";
        case ETextureFormat.RGBA8SNORM: return "rgba8snorm";
        case ETextureFormat.RGBA8UINT: return "rgba8uint";
        case ETextureFormat.RGBA8SINT: return "rgba8sint";
        case ETextureFormat.BGRA8UNORM: return "bgra8unorm";
        case ETextureFormat.BGRA8UNORM_SRGB: return "bgra8unorm-srgb";
        case ETextureFormat.RGB9E5UFLOAT: return "rgb9e5ufloat";
        case ETextureFormat.RGB10A2UNORM: return "rgb10a2unorm";
        case ETextureFormat.RG11B10UFLOAT: return "rg11b10ufloat";
        case ETextureFormat.RG32UINT: return "rg32uint";
        case ETextureFormat.RG32SINT: return "rg32sint";
        case ETextureFormat.RG32FLOAT: return "rg32float";
        case ETextureFormat.RGBA16UINT: return "rgba16uint";
        case ETextureFormat.RGBA16SINT: return "rgba16sint";
        case ETextureFormat.RGBA16FLOAT: return "rgba16float";
        case ETextureFormat.RGBA32UINT: return "rgba32uint";
        case ETextureFormat.RGBA32SINT: return "rgba32sint";
        case ETextureFormat.RGBA32FLOAT: return "rgba32float";
        case ETextureFormat.STENCIL8: return "stencil8";
        case ETextureFormat.DEPTH16UNORM: return "depth16unorm";
        case ETextureFormat.DEPTH24PLUS: return "depth24plus";
        case ETextureFormat.DEPTH24PLUS_STENCIL8: return "depth24plus-stencil8";
        case ETextureFormat.DEPTH32FLOAT: return "depth32float";
        case ETextureFormat.DEPTH32FLOAT_STENCIL8: return "depth32float-stencil8";
        case ETextureFormat.BC1_RGBA_UNORM: return "bc1-rgba-unorm";
        case ETextureFormat.BC1_RGBA_UNORM_SRGB: return "bc1-rgba-unorm-srgb";
        case ETextureFormat.BC2_RGBA_UNORM: return "bc2-rgba-unorm";
        case ETextureFormat.BC2_RGBA_UNORM_SRGB: return "bc2-rgba-unorm-srgb";
        case ETextureFormat.BC3_RGBA_UNORM: return "bc3-rgba-unorm";
        case ETextureFormat.BC3_RGBA_UNORM_SRGB: return "bc3-rgba-unorm-srgb";
        case ETextureFormat.BC4_R_UNORM: return "bc4-r-unorm";
        case ETextureFormat.BC4_R_SNORM: return "bc4-r-snorm";
        case ETextureFormat.BC5_RG_UNORM: return "bc5-rg-unorm";
        case ETextureFormat.BC5_RG_SNORM: return "bc5-rg-snorm";
        case ETextureFormat.BC6H_RGB_UFLOAT: return "bc6h-rgb-ufloat";
        case ETextureFormat.BC6H_RGB_FLOAT: return "bc6h-rgb-float";
        case ETextureFormat.BC7_RGBA_UNORM: return "bc7-rgba-unorm";
        case ETextureFormat.BC7_RGBA_UNORM_SRGB: return "bc7-rgba-unorm-srgb";
        case ETextureFormat.ETC2_RGB8UNORM: return "etc2-rgb8unorm";
        case ETextureFormat.ETC2_RGB8UNORM_SRGB: return "etc2-rgb8unorm-srgb";
        case ETextureFormat.ETC2_RGB8A1UNORM: return "etc2-rgb8a1unorm";
        case ETextureFormat.ETC2_RGB8A1UNORM_SRGB: return "etc2-rgb8a1unorm-srgb";
        case ETextureFormat.ETC2_RGBA8UNORM: return "etc2-rgba8unorm";
        case ETextureFormat.ETC2_RGBA8UNORM_SRGB: return "etc2-rgba8unorm-srgb";
        case ETextureFormat.EAC_R11UNORM: return "eac-r11unorm";
        case ETextureFormat.EAC_R11SNORM: return "eac-r11snorm";
        case ETextureFormat.EAC_RG11UNORM: return "eac-rg11unorm";
        case ETextureFormat.EAC_RG11SNORM: return "eac-rg11snorm";
        case ETextureFormat.ASTC_4X4_UNORM: return "astc-4x4-unorm";
        case ETextureFormat.ASTC_4X4_UNORM_SRGB: return "astc-4x4-unorm-srgb";
        case ETextureFormat.ASTC_5X4_UNORM: return "astc-5x4-unorm";
        case ETextureFormat.ASTC_5X4_UNORM_SRGB: return "astc-5x4-unorm-srgb";
        case ETextureFormat.ASTC_5X5_UNORM: return "astc-5x5-unorm";
        case ETextureFormat.ASTC_5X5_UNORM_SRGB: return "astc-5x5-unorm-srgb";
        case ETextureFormat.ASTC_6X5_UNORM: return "astc-6x5-unorm";
        case ETextureFormat.ASTC_6X5_UNORM_SRGB: return "astc-6x5-unorm-srgb";
        case ETextureFormat.ASTC_6X6_UNORM: return "astc-6x6-unorm";
        case ETextureFormat.ASTC_6X6_UNORM_SRGB: return "astc-6x6-unorm-srgb";
        case ETextureFormat.ASTC_8X5_UNORM: return "astc-8x5-unorm";
        case ETextureFormat.ASTC_8X5_UNORM_SRGB: return "astc-8x5-unorm-srgb";
        case ETextureFormat.ASTC_8X6_UNORM: return "astc-8x6-unorm";
        case ETextureFormat.ASTC_8X6_UNORM_SRGB: return "astc-8x6-unorm-srgb";
        case ETextureFormat.ASTC_8X8_UNORM: return "astc-8x8-unorm";
        case ETextureFormat.ASTC_8X8_UNORM_SRGB: return "astc-8x8-unorm-srgb";
        case ETextureFormat.ASTC_10X5_UNORM: return "astc-10x5-unorm";
        case ETextureFormat.ASTC_10X5_UNORM_SRGB: return "astc-10x5-unorm-srgb";
        case ETextureFormat.ASTC_10X6_UNORM: return "astc-10x6-unorm";
        case ETextureFormat.ASTC_10X6_UNORM_SRGB: return "astc-10x6-unorm-srgb";
        case ETextureFormat.ASTC_10X8_UNORM: return "astc-10x8-unorm";
        case ETextureFormat.ASTC_10X8_UNORM_SRGB: return "astc-10x8-unorm-srgb";
        case ETextureFormat.ASTC_10X10_UNORM: return "astc-10x10-unorm";
        case ETextureFormat.ASTC_10X10_UNORM_SRGB: return "astc-10x10-unorm-srgb";
        case ETextureFormat.ASTC_12X10_UNORM: return "astc-12x10-unorm";
        case ETextureFormat.ASTC_12X10_UNORM_SRGB: return "astc-12x10-unorm-srgb";
        case ETextureFormat.ASTC_12X12_UNORM: return "astc-12x12-unorm";
        case ETextureFormat.ASTC_12X12_UNORM_SRGB: return "astc-12x12-unorm-srgb"; 
    }
}

export const GPUVertexFormatFrom = (shaderDataType: EShaderDataType) : GPUVertexFormat | null => {
    switch(shaderDataType) {
        case EShaderDataType.Float:     return "float32";
        case EShaderDataType.Float2:    return "float32x2";
        case EShaderDataType.Float3:    return "float32x3";
        case EShaderDataType.Float4:    return "float32x4";
        case EShaderDataType.Int:       return "uint32";
        case EShaderDataType.Int2:      return "uint32x2";
        case EShaderDataType.Int3:      return "uint32x3";
        case EShaderDataType.Int4:      return "uint32x4";
        default:                        return null;
    }
}

export const GPUPrimitiveTopologyFrom = (primitiveTopology: EPrimitiveTopology): GPUPrimitiveTopology | undefined => {
    switch(primitiveTopology) {
        case EPrimitiveTopology.PointList:     return "point-list";
        case EPrimitiveTopology.LineList:      return "line-list";
        case EPrimitiveTopology.lineStrip:     return "line-strip";
        case EPrimitiveTopology.TriangleList:  return "triangle-list";
        case EPrimitiveTopology.TriangleStrip: return "triangle-strip";
        default:                               return undefined;
    }
}

export const GPUFrontFaceFrom = (frontFace: EFrontFace) : GPUFrontFace => {
    switch(frontFace) {
        case EFrontFace.CW:  return "cw";
        case EFrontFace.CCW: return "ccw";
    }
    return "ccw";
}

export const GPUCullModeFrom = (cullMode: ERasterCullMode) : GPUCullMode => {
    switch(cullMode) {
        case ERasterCullMode.None:  return "none";
        case ERasterCullMode.Front: return "front";
        case ERasterCullMode.Back:  return "back";
    }
    return "back";
}

export const GPUCompareFunctionFrom = (compareFunc: ECompareFunc) : GPUCompareFunction => {
    switch(compareFunc) {
        case ECompareFunc.Never:          return "never";
        case ECompareFunc.Less:           return "less";
        case ECompareFunc.Equal:          return "equal";
        case ECompareFunc.LessOrEqual:    return "less-equal";
        case ECompareFunc.Greater:        return "greater";
        case ECompareFunc.GreaterOrEqual: return "greater-equal";
        case ECompareFunc.Always:         return "always";
        default:                          return "always";
    }
}

export const GPUStencilOperationFrom = (stencilOp: EStencilOp) : GPUStencilOperation => {
    switch(stencilOp) {
        case EStencilOp.Keep:           return "keep";
        case EStencilOp.Zero:           return "zero";
        case EStencilOp.Replace:        return "replace";
        case EStencilOp.Invert:         return "invert";
        case EStencilOp.IncrementClamp: return "increment-clamp";
        case EStencilOp.DecrementClamp: return "decrement-clamp";
        case EStencilOp.IncrementWrap:  return "increment-wrap";
        case EStencilOp.DecrementWrap:  return "decrement-wrap";
    }

    return "keep";
}

export const GPUBlendOperationFrom = (blendOp: EBlendOp) => {
    switch(blendOp) {
        case EBlendOp.Add: return "add";
        case EBlendOp.Subrtact: return "subtract";
        case EBlendOp.ReverseSubtract: return "reverse-subtract";
        case EBlendOp.Min: return "min";
        case EBlendOp.Max: return "max";
    }
}

export const GPUBlendFactorFrom = (blendFactor: EBlendFactor) => {
    switch(blendFactor) {
        case EBlendFactor.Zero: return "zero";
        case EBlendFactor.One: return "one";
        case EBlendFactor.Src: return "src";
        case EBlendFactor.OneMinuSrc: return "one-minus-src";
        case EBlendFactor.SrcAlpha: return "src-alpha";
        case EBlendFactor.OneMinuSrcAlpha: return "one-minus-src-alpha";
        case EBlendFactor.Dst: return "dst";
        case EBlendFactor.OneMinusDst: return "one-minus-dst";
        case EBlendFactor.DstAlpha: return "dst-alpha";
        case EBlendFactor.OneMinusDstAlpha: return "one-minus-dst-alpha";
        case EBlendFactor.SrcAlphaSaturated: return "src-alpha-saturated";
        case EBlendFactor.Constant: return "constant";
        case EBlendFactor.OneMinusConstant: return "one-minus-constant";
    }
}


export const GPULoadOpFrom = (loadOp: ELoadOp) => {
    switch(loadOp) {
        case ELoadOp.Load: return "load";
        case ELoadOp.Clear: return "clear";
    }
}

export const GPUStoreOpFrom = (storeOp: EStoreOp) => {
    switch(storeOp) {
        case EStoreOp.Store: return "store";
        case EStoreOp.Discard: return "discard";
    }
}