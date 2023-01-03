import { mat4, vec3 } from "gl-matrix";

export class CCamera { 
    public fov: number;
    public near: number;
    public far: number;
    public ratio: number;

    public eye: vec3;
    public target: vec3;
    public up: vec3;

    public constructor() { 
        this.fov = 60;
        this.near = 0.1;
        this.far = 1000;
        this.ratio = 1.0;

        this.eye = vec3.fromValues(0, 0, 0);
        this.target = vec3.fromValues(0, 0, -1);
        this.up = vec3.fromValues(0, 1, 0);
    }

    public createBuffer(device: GPUDevice) { 
        const projectionBuffer : GPUBuffer = device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        const viewBuffer : GPUBuffer = device.createBuffer({
            size: 64,
            usage: GPUBufferUsage.UNIFORM | GPUBufferUsage.COPY_DST
        });

        let projectionMatrix: mat4 = mat4.create();
        mat4.perspective(projectionMatrix, Math.PI / 180.0 * this.fov, this.ratio, this.near, this.far);

        let viewMatrix: mat4 = mat4.create();
        mat4.lookAt(viewMatrix, this.eye, this.target, this.up); 

        device.queue.writeBuffer(projectionBuffer, 0, projectionMatrix as ArrayBuffer);
        device.queue.writeBuffer(viewBuffer, 0, viewMatrix as ArrayBuffer);
    }
}