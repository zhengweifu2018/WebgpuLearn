export interface CDrawArguments
{
    VertexCount: number; // default value = 0;
    InstanceCount?: number; // default value = 1;
    FirstIndex?: number; // default value = 0;
    FirstInstance?: number; // default value = 0;
};

export interface CDrawIndexedArguments
{
    IndexCount: number; // default value = 0;
    InstanceCount?: number; // default value = 1;
    FirstIndex?: number; // default value = 0;
    BaseVertex?: number; // default value = 0;
    FirstInstance?: number; // default value = 0;
};