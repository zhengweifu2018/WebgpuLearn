const preprocessorSymbols = /#([^\s]*)([^\n]*)/gm
// Template literal tag that handles simple preprocessor symbols for WGSL 
/**
 * shaders. Supports #define/ifdef/ifndef/if/elif/else/endif statements.
 * #define USE_VERTEX_COLOR 1
 * #if USE_VERTEX_COLOR
 *  ...
 * #else
 *  ...
 * #endif
 */
interface State {
    str: string;
    elseIsValid: boolean;
    expression: boolean;
}

export const ShaderPreprocessor = (code: string) =>{
    const stateStack: Array<State> = [];
    let state: State = { str: '', elseIsValid: false, expression: true };
    let depth = 1;

    const matchedSymbols = code.matchAll(preprocessorSymbols);

    let lastIndex = 0;

    let defineMap: Map<string, string> = new Map();

    const GetNewStr = (orgStr: string) : string => {
        let newStr: string = orgStr;

        defineMap.forEach((value , key) =>{
            newStr = newStr.replaceAll(key, value);  
        });

        return newStr;
    }

    for (const match of matchedSymbols) {
        const matchIndex = match.index !== undefined ? match.index : 0;
        state.str += code.substring(lastIndex, matchIndex);
        // 去除前后空格
        const trimStr = match[2].replace(/(^\s*)|(\s*$)/g, ""); 
        switch (match[1]) {
            case 'ifndef':
            case 'ifdef':
                stateStack.push(state);
                depth++;
                const hasDefine = defineMap.has(trimStr);
                const defExpression = match[1] == 'ifdef' ?  hasDefine : !hasDefine;
                state = { str: '', elseIsValid: true, expression: defExpression };
                break;
            case 'define': // 仅使用第一个宏定义的值
                const defineSegments = trimStr.split(/\s+/g);
                if(defineSegments.length == 2 && !defineMap.has(defineSegments[0]))
                {
                    defineMap.set(defineSegments[0], defineSegments[1]);
                }
                break;
            case 'if':
                stateStack.push(state);
                depth++;
                const ifExpression =  eval(GetNewStr(trimStr));
                state = { str: '', elseIsValid: true, expression: ifExpression };
                break;
            case 'elif':
                if (!state.elseIsValid) {
                    throw new Error('#elif not preceeded by an #if or #elif');
                    break;
                }
                if (state.expression && stateStack.length != depth) {
                    stateStack.push(state);
                }
                const elifExpression =  eval(GetNewStr(trimStr));
                state = { str: '', elseIsValid: true, expression: elifExpression };
                break;
            case 'else':
                if (!state.elseIsValid) {
                    throw new Error('#else not preceeded by an #if or #elif');
                    break;
                }
                if (state.expression && stateStack.length != depth) {
                    stateStack.push(state);
                }
                state = { str: match[2], elseIsValid: false, expression: true };
                break;
            case 'endif':
                if (!stateStack.length) {
                    throw new Error('#endif not preceeded by an #if');
                    break;
                } 
                
                const branchState = stateStack.length == depth ? stateStack.pop() : state;
                state = stateStack.pop() as State;
                depth--;
                if(state)
                {
                    if (branchState && branchState.expression) {
                        state.str += branchState.str;
                    }
                    state.str += match[2];
                }
                break;
            default:
                // Unknown preprocessor symbol. Emit it back into the output string unchanged.
                state.str += match[0];
                break;
        }

        lastIndex = matchIndex + match[0].length;
    }

    // If the string didn't end on one of the preprocessor symbols append the rest of it here.
    if (lastIndex != code.length) {
        state.str += code.substring(lastIndex, code.length);
    }
    

    if (stateStack.length) {
        throw new Error('Mismatched #if/#endif count');
    }

    return GetNewStr(state.str);
}