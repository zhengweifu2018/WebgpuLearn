import { CRenderTarget } from "./BlendState";
import { CDepthStencilState } from "./DepthStencilState";
import { CRasterState } from "./RasterState";

export interface CRenderState {
    RenderTargets: Array<CRenderTarget>; //default value = [];
    DepthStencilState: CDepthStencilState; //default value = new CDepthStencilState();
    RasterState: CRasterState; //default value = new CRasterState();
}