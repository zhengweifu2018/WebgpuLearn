import { IGraphicsPipeline } from "../../Render/GraphicsPipeline";
import { IVertexBuffer, IIndexBuffer } from "../Buffer";

export interface CGraphicsState {
    GraphicsPipeline: IGraphicsPipeline;
    VertexBuffer: IVertexBuffer;
    IndexBuffer: IIndexBuffer;
}