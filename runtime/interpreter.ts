// deno-lint-ignore-file no-unused-vars
import {
  MK_NULL,
  NumberVal,
  StringVal,
  ValueType,
  RuntimeVal
} from "./values.ts"

import {
  BinaryExpr,
  NodeType,
  Identifier,
  AssignmentExpr,
  VarDeclaration,
  ObjectLiteral,
  FuncDeclaration,
  NumericalLiteral,
  StringLiteral,
  Program,
  Stmt,
  CallExpr
} from "../frontend/ast.ts";
import Environment from "./environment.ts";
import { eval_identifier, eval_binary_expr, eval_assignment, eval_object_expr, eval_call_expr } from "./eval/expressions.ts";
import { eval_program, eval_var_declaration, eval_func_declaration } from "./eval/statements.ts";





export function evaluate (astNode: Stmt, env: Environment): RuntimeVal {

  switch (astNode.kind){
    case "NumericLiteral":
      return { 
        value: ((astNode as NumericalLiteral).value),
        type: "number",
      } as NumberVal;
    case "StringLiteral":
      return {
        value: ((astNode as StringLiteral).value),
        type: "string",
      } as StringVal;
    case "Identifier":
      return eval_identifier(astNode as Identifier, env);
    case "ObjectLiteral":
      return eval_object_expr(astNode as ObjectLiteral, env);
    case "CallExpr":
      return eval_call_expr(astNode as CallExpr, env);
    case "BinaryExpr":
      return eval_binary_expr(astNode as BinaryExpr, env);
    case "AssignmentExpr":
      return eval_assignment(astNode as AssignmentExpr, env)
    case "Program":
      return eval_program(astNode as Program, env);

    case "VarDeclaration":
      return eval_var_declaration(astNode as VarDeclaration, env);
    case "FuncDeclaration":
    return eval_func_declaration(astNode as FuncDeclaration, env);
    default: 
      console.error("This is ast node is not set up for interpretation", astNode);
      Deno.exit(0);
  }
}


