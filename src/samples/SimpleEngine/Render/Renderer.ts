import { CRenderPass } from "./RenderPass";

export class CRenderer {
    AddRenderPass(renderPass: CRenderPass) {
        this.m_RenderPasses.push(renderPass);
    }
    private m_RenderPasses: Array<CRenderPass>;
} 