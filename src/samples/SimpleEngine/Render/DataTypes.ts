// 图形 API
export enum EGraphicsAPI {
    NONE,
    WEBGL,
    WEBGPU
}

// 纹理格式
export enum ETextureFormat {
    // 8_bit formats
    R8UNORM,
    R8SNORM,
    R8UINT,
    R8SINT,

    // 16-bit formats
    R16UINT,
    R16SINT,
    R16FLOAT,
    RG8UNORM,
    RG8SNORM,
    RG8UINT,
    RG8SINT,

    // 32-bit formats
    R32UINT,
    R32SINT,
    R32FLOAT,
    RG16UINT,
    RG16SINT,
    RG16FLOAT,
    RGBA8UNORM,
    RGBA8UNORM_SRGB,
    RGBA8SNORM,
    RGBA8UINT,
    RGBA8SINT,
    BGRA8UNORM,
    BGRA8UNORM_SRGB,
    // Packed 32-bit formats
    RGB9E5UFLOAT,
    RGB10A2UNORM,
    RG11B10UFLOAT,

    // 64-bit formats
    RG32UINT,
    RG32SINT,
    RG32FLOAT,
    RGBA16UINT,
    RGBA16SINT,
    RGBA16FLOAT,

    // 128-bit formats
    RGBA32UINT,
    RGBA32SINT,
    RGBA32FLOAT,

    // Depth/stencil formats
    STENCIL8,
    DEPTH16UNORM,
    DEPTH24PLUS,
    DEPTH24PLUS_STENCIL8,
    DEPTH32FLOAT,

    // depth32float-stencil8 feature
    DEPTH32FLOAT_STENCIL8,

    // BC compressed formats usable if texture-compression-bc is both
    // supported by the device/user agent and enabled in requestDevice.
    BC1_RGBA_UNORM,
    BC1_RGBA_UNORM_SRGB,
    BC2_RGBA_UNORM,
    BC2_RGBA_UNORM_SRGB,
    BC3_RGBA_UNORM,
    BC3_RGBA_UNORM_SRGB,
    BC4_R_UNORM,
    BC4_R_SNORM,
    BC5_RG_UNORM,
    BC5_RG_SNORM,
    BC6H_RGB_UFLOAT,
    BC6H_RGB_FLOAT,
    BC7_RGBA_UNORM,
    BC7_RGBA_UNORM_SRGB,

    // ETC2 compressed formats usable if texture-compression-etc2 is both
    // supported by the device/user agent and enabled in requestDevice.
    ETC2_RGB8UNORM,
    ETC2_RGB8UNORM_SRGB,
    ETC2_RGB8A1UNORM,
    ETC2_RGB8A1UNORM_SRGB,
    ETC2_RGBA8UNORM,
    ETC2_RGBA8UNORM_SRGB,
    EAC_R11UNORM,
    EAC_R11SNORM,
    EAC_RG11UNORM,
    EAC_RG11SNORM,

    // ASTC compressed formats usable if texture-compression-astc is both
    // supported by the device/user agent and enabled in requestDevice.
    ASTC_4X4_UNORM,
    ASTC_4X4_UNORM_SRGB,
    ASTC_5X4_UNORM,
    ASTC_5X4_UNORM_SRGB,
    ASTC_5X5_UNORM,
    ASTC_5X5_UNORM_SRGB,
    ASTC_6X5_UNORM,
    ASTC_6X5_UNORM_SRGB,
    ASTC_6X6_UNORM,
    ASTC_6X6_UNORM_SRGB,
    ASTC_8X5_UNORM,
    ASTC_8X5_UNORM_SRGB,
    ASTC_8X6_UNORM,
    ASTC_8X6_UNORM_SRGB,
    ASTC_8X8_UNORM,
    ASTC_8X8_UNORM_SRGB,
    ASTC_10X5_UNORM,
    ASTC_10X5_UNORM_SRGB,
    ASTC_10X6_UNORM,
    ASTC_10X6_UNORM_SRGB,
    ASTC_10X8_UNORM,
    ASTC_10X8_UNORM_SRGB,
    ASTC_10X10_UNORM,
    ASTC_10X10_UNORM_SRGB,
    ASTC_12X10_UNORM,
    ASTC_12X10_UNORM_SRGB,
    ASTC_12X12_UNORM,
    ASTC_12X12_UNORM_SRGB  
}

// 纹理的纬度
export enum ETextureDimension {
    TEXTURE1D, TEXTURE2D, TEXTURE3D
}

// 纹理视图的纬度
export enum ETextureViewDimension {
    TEXTURE1D,
    TEXTURE2D,
    TEXTURE2D_ARRAY,
    CUBE,
    CUBE_ARRAY,
    TEXTURE3D
};

// 着色器包含的类型
export enum EShaderDataType {
    None=0, Float, Float2, Float3, Float4, Mat3, Mat4, Int, Int2, Int3, Int4, Boolean
}

// 混合因子
export enum EBlendFactor
{
    Zero,
    One,
    Src,
    OneMinuSrc,
    SrcAlpha,
    OneMinuSrcAlpha,
    Dst,
    OneMinusDst,
    DstAlpha,
    OneMinusDstAlpha,
    SrcAlphaSaturated,
    Constant,
    OneMinusConstant
}

// 混合操作
export enum EBlendOp
{
    Add,
    Subrtact,
    ReverseSubtract,
    Min,
    Max
}

// 颜色蒙版
export enum  EColorMask
{
    Red = 1,
    Green = 2,
    Blue = 4,
    Alpha = 8,
    All = 0xF
}

// 填充模式
export enum ERasterFillMode {
    Solid=0, Wireframe
}

// 剔除模式
export enum ERasterCullMode {
    None=0, Front, Back
}

export enum EFrontFace {
    CW=0, CCW
}

// 模板操作
export enum EStencilOp {
    Keep=0, Zero, Replace, Invert, IncrementClamp, DecrementClamp, IncrementWrap, DecrementWrap
}

// 比较方法
export enum ECompareFunc {
    Never=0, Less, Equal, LessOrEqual, Greater, GreaterOrEqual, Always
}

// 图元拓扑方式
export enum EPrimitiveTopology {
    PointList=0,
    LineList,
    lineStrip,
    TriangleList,
    TriangleStrip
}

export enum ELoadOp {
    Load, Clear
}
export enum EStoreOp {
    Store, Discard
}