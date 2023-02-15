import { CGraphicsState } from "./States/GraphicsState";
import { CDrawArguments, CDrawIndexedArguments } from "./DrawArguments";

export abstract class IRenderPass {
    protected m_GraphicsState: CGraphicsState | null;

    abstract Begin(): void;
    abstract End(): void;

    abstract SetGraphicsState(state: CGraphicsState): void;
    abstract Draw(drawArguments: CDrawArguments): void;
    abstract DrawIndexed(drawArguments: CDrawIndexedArguments): void;

    // 计算着色器
    // abstract SetComputeState(state: CComputeState): void;
    // abstract Dispatch(groupsX: number, groupsY: number, groupsZ: number): void;
}