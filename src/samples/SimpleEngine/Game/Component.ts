import { mat4, vec4 } from "gl-matrix";
import { CMath } from "../Math/Math";

abstract class CComponent {
	constructor() {
		this.m_UUID = CMath.GenerateUUID();
	}

	get UUID() {return this.m_UUID;}

    private m_UUID : string;

}

class CTagComponent extends CComponent  {
	public constructor(tag: string) {
		super();
		this.m_Tag = tag;
	}
	public get Tag() {
		return this.m_Tag;
	}
	private m_Tag: string
}

class CTransformComponent extends CComponent  {
	constructor() {
		super();
		this.m_Matrix = mat4.create();
	}

	public set Matrix(matrix: mat4) {
		this.m_Matrix = matrix;
	}
	public get Matrix() : mat4 {
		return this.m_Matrix;
	}
	private m_Matrix : mat4; 
}

class CGeometryComponent extends CComponent  {}

class CMaterialComponent extends CComponent  {
	Color: vec4;
}

export { CComponent, CTagComponent, CTransformComponent, CGeometryComponent, CMaterialComponent }