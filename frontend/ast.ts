// deno-lint-ignore-file no-empty-interface
export type NodeType = 
  //statements
  | "Program" 
  | "VarDeclaration"
  | "FuncDeclaration"

  //expressions
  | "AssignmentExpr"
  | "BinaryExpr"
  | "MemberExpr" 
  | "CallExpr"

  //literal
  | "Property"
  | "ObjectLiteral"
  | "NumericLiteral"
  | "StringLiteral"
  | "Identifier" 

//
export interface Stmt{
  kind: NodeType;
}

export interface Program extends Stmt {
  kind: "Program";
  body: Stmt[];
}

export interface VarDeclaration extends Stmt {
  kind: "VarDeclaration";
  constant: boolean;
  identifier: string;
  value?: Expr;
}

export interface FuncDeclaration extends Stmt {
  kind: "FuncDeclaration";
  parameters: string[];
  name: string;
  body: Stmt[];
}

export interface Expr extends Stmt {}

export interface AssignmentExpr extends Stmt{
  kind: "AssignmentExpr";
  assigne: Expr;
  value: Expr;
}

export interface BinaryExpr extends Expr {
  kind: "BinaryExpr";
  left: Expr;
  right: Expr;
  operator: string;
}

export interface CallExpr extends Expr {
  kind: "CallExpr";
  args: Expr[];
  caller: Expr;
}

export interface MemberExpr extends Expr {
  kind: "MemberExpr";
  object: Expr;
  property: Expr;
  computed: boolean;
}

export interface Identifier extends Expr {
  kind: "Identifier";
  symbol: string;
}

export interface NumericalLiteral extends Expr {
  kind: "NumericLiteral";
  value: number;
}

export interface StringLiteral extends Expr {
  kind: "StringLiteral";
  value: string;
}

export interface ObjectLiteral extends Expr {
  kind: "ObjectLiteral";
  properties: Property[];
}

export interface Property extends Expr {
  kind: "Property";
  key: string;
  value?: Expr;
}
 