import React from "react";

import { withRouter, RouteComponentProps } from 'react-router-dom';

import { CreateTrangle } from "../samples/triangle/draw";
import { CreateBufferQuadrangle } from "../samples/quadrangle/draw";
import { CreateQuadrangleWithTexture } from "../samples/quadrangle_with_texture/draw";

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
                case "shader_triangle":
                    CreateTrangle(canvasName);
                    break;
                case "buffer_quad":
                    CreateBufferQuadrangle(canvasName);
                    break;
                case "quad_with_texture":
                    CreateQuadrangleWithTexture(canvasName);
                    break;
                default:
                    CreateBufferQuadrangle(canvasName);
                    break;
            }
        }
    }
    public render(): React.ReactNode {
        return <div>
            {navigator.gpu ? <canvas id="webgpu-learn-canvas" width="640" height="480"></canvas> : "当前浏览器不支持WebGPU!"}
        </div>
    }
}

export default withRouter(CanvasPage as any);