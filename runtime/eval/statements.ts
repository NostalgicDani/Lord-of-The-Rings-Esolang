import { Program, VarDeclaration, FuncDeclaration } from "../../frontend/ast.ts";
import Environment from "../environment.ts";
import { evaluate } from "../interpreter.ts";
import { RuntimeVal, MK_NULL, FunctionValue } from "../values.ts";

export function eval_program (program: Program, env: Environment): RuntimeVal {
  let lastEvaluated : RuntimeVal = MK_NULL();
  
  for (const statement of program.body){
    lastEvaluated = evaluate(statement, env);
  }

  return lastEvaluated;
}


export function eval_var_declaration(declaration: VarDeclaration, env: Environment): RuntimeVal {
  const value = declaration.value ? evaluate(declaration.value, env) : MK_NULL(); 

  return env.declareVar(declaration.identifier, value, declaration.constant);
}

export function eval_func_declaration (declaration: FuncDeclaration, env: Environment): RuntimeVal {
  //create scope
  const func = {
    type: "function",
    name: declaration.name,
    parameters: declaration.parameters,
    declarationEnv: env,
    body: declaration.body,
  } as FunctionValue;

  return env.declareVar(declaration.name, func, true);
}