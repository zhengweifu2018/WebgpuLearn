import { mat4 } from "gl-matrix"

export class CObject { 
    public worldMatrix: mat4;
    constructor() { 
        this.worldMatrix = mat4.create();
    }
}