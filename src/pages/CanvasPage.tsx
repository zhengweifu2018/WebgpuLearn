import React from "react";

import { withRouter, RouteComponentProps } from 'react-router-dom';

import { CreateTrangle } from "../samples/00triangle/draw";
import { CreateBufferQuadrangle } from "../samples/01quadrangle/draw";
import { CreateQuadrangleWithTexture } from "../samples/02quadrangle_with_texture/draw";
import { CreateCube } from "../samples/03cube/draw";
import { CreateMovedCube } from "../samples/04cube_move/draw";
import { CreateCubeInstances } from "../samples/05cube_instances/draw";

import { Draw } from "../samples/99simple_frame/draw";

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
            let sampleName = matchParams.sample;
            console.log(sampleName);
            switch (sampleName) { 
                case "00triangle":
                    CreateTrangle(canvasName);
                    break;
                case "01quadrangle":
                    CreateBufferQuadrangle(canvasName);
                    break;
                case "02quadrangle_with_texture":
                    CreateQuadrangleWithTexture(canvasName);
                    break;
                case "03cube":
                    CreateCube(canvasName);
                    break;
                case "04cube_move":
                    CreateMovedCube(canvasName);
                    break;
                case "05cube_instances":
                    CreateCubeInstances(canvasName);
                    break;     
                case "99simple_frame":
                    Draw(canvasName);
                    break;
                default:
                    CreateBufferQuadrangle(canvasName);
                    break;
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