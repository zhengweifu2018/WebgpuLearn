import { vec4 } from "gl-matrix";

enum ERendererAPI {
    NONE,
    WEBGL,
    WEBGPU
}

export abstract class CRendererApi {
    async Init(canvasName: string) {}
    
    abstract SetViewport(x : number, y : number, width: number, height: number) : void;

    abstract SetClearColor(color: vec4) : void;

    static get API() {
        return CRendererApi.s_Api;
    }
    private static s_Api: ERendererAPI
}
