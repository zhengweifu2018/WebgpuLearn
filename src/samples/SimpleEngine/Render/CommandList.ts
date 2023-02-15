import { CGraphicsState } from "./States/GraphicsState";
import { IFrameBuffer } from "./Buffer";
import { IRenderPass } from "./RenderPass";

export abstract class ICommandList {
    abstract Open(): void;
    abstract Close(): void;

    abstract CreateRenderPass(frameBuffer: IFrameBuffer) : IRenderPass;

    abstract Submit(): void;
}