import { ERasterFillMode, ERasterCullMode, EFrontFace } from "../DataTypes";

export interface CRasterState {
    FillMode: ERasterFillMode; //default value = ERasterFillMode.Solid;
    CullMode: ERasterCullMode; //default value = ERasterCullMode.Back;

    FrontFace: EFrontFace; //default value = EFrontFace.CCW;
    
    // 是否打开深度裁剪
    DepthClipEnable: boolean; //default value = false;
    ScissorEnable: boolean; //default value = false;

    // 是否打开多重采样
    MultisampleEnable: boolean; //default value = false;
}