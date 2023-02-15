import { EBlendFactor, EBlendOp, EColorMask, ETextureFormat } from "../DataTypes";

export interface CBlendState
{
    BlendEnable: boolean;         // default value = false;
    SrcBlend: EBlendFactor;       // default value = EBlendFactor.One;
    DestBlend: EBlendFactor;      // default value = EBlendFactor.Zero;
    BlendOp: EBlendOp;            // default value = EBlendOp.Add;
    SrcBlendAlpha: EBlendFactor;  // default value = EBlendFactor.One;
    DestBlendAlpha: EBlendFactor; // default value = EBlendFactor.Zero;
    BlendOpAlpha: EBlendOp;       // default value = EBlendOp.Add;
};

export interface CRenderTarget
{
    Format: ETextureFormat;
    BlendState: CBlendState;
    ColorWriteMask: EColorMask; //default value = EColorMask.All;
};