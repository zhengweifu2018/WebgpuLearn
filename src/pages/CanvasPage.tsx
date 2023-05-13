import React from "react";

import { withRouter, RouteComponentProps } from 'react-router-dom';

import { CreateTrangle } from "../samples/00triangle/draw";
import { CreateBufferQuadrangle } from "../samples/01quadrangle/draw";
import { CreateQuadrangleWithTexture } from "../samples/02quadrangle_with_texture/draw";
import { CreateCube } from "../samples/03cube/draw";
import { CreateMovedCube } from "../samples/04cube_move/draw";
import { CreateCubeInstances } from "../samples/05cube_instances/draw";
import { CreateCameraControls } from "../samples/06camera_controls/draw";
import { CreateBasicComputePipeline } from "../samples/07basic_compute_pipeline/draw";
import { DeferredRenderer } from "../samples/08deferred_renderer/draw";
import { LightRenderer } from "../samples/09light/draw";

import { Draw } from "../samples/99simple_frame/draw";
import { Test } from "../samples/SimpleEngine/Test";

const SimpleName2Func = new Map<string, Function>([
    ["00triangle", CreateTrangle],
    ["01quadrangle", CreateBufferQuadrangle],
    ["02quadrangle_with_texture", CreateQuadrangleWithTexture],
    ["03cube", CreateCube],
    ["04cube_move", CreateMovedCube],
    ["05cube_instances", CreateCubeInstances], 
    ["06camera_controls", CreateCameraControls],
    ["07basic_compute_pipeline", CreateBasicComputePipeline],
    ["08deferred_renderer", DeferredRenderer],
    ["09light", LightRenderer],
    ["99simple_frame", Draw],
    ["SimpleEngine", Test]
]);

export interface Props {
    sample?: string;
}
type thisProps = Props & RouteComponentProps;

class CanvasPage extends React.Component<thisProps, {}> { 
    constructor(props: thisProps) {
        super(props);
    }
    componentDidMount() { 
        if (navigator.gpu) {
            const canvasName: string = "webgpu-learn-canvas";
            const matchParams = this.props.match.params as Props;
            let sampleName: string = matchParams.sample == undefined? "" : matchParams.sample;
            console.log(sampleName);
            if(SimpleName2Func.has(sampleName)) {
                const func = SimpleName2Func.get(sampleName) as Function;
                func(canvasName);
            }
        }
    }
    public render(): React.ReactNode {
        return <div style={{width: "100%", height: "100%"}}>
            {navigator.gpu ? <canvas id="webgpu-learn-canvas" style={{width: "100%", height: "100%"}}></canvas> : "当前浏览器不支持WebGPU!"}
        </div>
    }
}

export default withRouter(CanvasPage as any);