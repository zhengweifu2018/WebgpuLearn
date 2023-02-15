import { EStencilOp, ECompareFunc, ETextureFormat } from "../DataTypes";

export interface CStencilOpDesc {
    FailOp: EStencilOp;         // default value = EStencilOp.Keep;
    DepthFailOp: EStencilOp;    // default value = EStencilOp.Keep;
    PassOp: EStencilOp;         // default value = EStencilOp.Keep;
    StencilFunc: ECompareFunc;  // default value = ECompareFunc.Always;
}

// 深度模板状态
export interface CDepthStencilState {
    // 是否打开深度测试
    DepthTestEnable: boolean;            //default value = true;
    // 是否打开深度写入
    DepthWriteEnable: boolean;           //default value = true;
    // 指定深度比较函数
    DepthFunc: ECompareFunc;             //default value = ECompareFunc.Less;
    // 是否打开模板测试
    StencilEnable: boolean;              //default value = false;
    FrontFaceStencil?: CStencilOpDesc;    //default value = new CStencilOpDesc();
    BackFaceStencil?: CStencilOpDesc;     //default value = new CStencilOpDesc();
    Format: ETextureFormat;              //default value = ETextureFormat.DEPTH24PLUS;
}