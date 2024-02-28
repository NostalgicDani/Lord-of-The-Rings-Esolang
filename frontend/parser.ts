// deno-lint-ignore-file no-explicit-any
import {
  Stmt,
  Program, 
  Expr, 
  AssignmentExpr,
  MemberExpr,
  CallExpr,
  Property,
  ObjectLiteral,
  BinaryExpr, 
  NumericalLiteral, 
  StringLiteral,
  VarDeclaration,
  FuncDeclaration,
  Identifier
} from "./ast.ts";

import { 
  tokenize, 
  Token, 
  TokenType
} from "./lexer.ts";

export default class Parser {
  private tokens: Token[] = [];
  
  private not_eof () : boolean {
    return this.tokens[0].type != TokenType.EOF;
  }

  private at () {
    return this.tokens[0] as Token;
  }
  
  private eat () {
    const prev = this.tokens.shift() as Token;
    return prev;
  }

  private expect(type: TokenType, err: any){
    const prev = this.tokens.shift() as Token;

    if (!prev || prev.type != type){
      console.error("Parser Error:\n", err, prev, "Expecting: ", type);
      Deno.exit(1);
    }

    return prev;
  }

  public produceAST (sourceCode: string): Program {
    this.tokens = tokenize(sourceCode);
    const program: Program = {
      kind: "Program",
      body: [],
    };

    //parse until eof
    while (this.not_eof()){
      program.body.push(this.parse_stmt());
    }

    return program;
  }

  private parse_stmt (): Stmt {
    // function declarae, variable
    switch(this.at().type){
      case TokenType.Let:
      case TokenType.Const: 
        return this.parse_var_declaration();
      case TokenType.Func:
        return this.parse_fn_declaration();
      default:
        return this.parse_expr();
    }
  }

  private parse_fn_declaration(): Stmt {
    this.eat(); //eats func keyword
    const name = this.expect(TokenType.Identifier, "Expected function name following func keyword").value;

    const args = this.parse_args();
    const params: string[] = [];
    for(const arg of args){
      if (arg.kind !== "Identifier"){
        console.log(arg);
        throw "Inside function, expected parameters to be string";
      }

    params.push((arg as Identifier).symbol);
    }

    this.expect(TokenType.OpenBrace, "Expected function body following declaration");

    const body: Stmt[] = [];

    while (this.at().type !== TokenType.EOF && this.at().type !== TokenType.CloseBrace){
      body.push(this.parse_stmt());
    }

    this.expect(TokenType.CloseBrace, "Closing brace expected inside function declaration");
    const func = {
      kind: "FuncDeclaration",
      parameters: params, 
      name, 
      body, 
    } as FuncDeclaration;

    return func;
  }

  private parse_var_declaration(): Stmt {
    const isConstant = this.eat().type == TokenType.Const;
    const identifier = this.expect(TokenType.Identifier, "Expected identifier name following let | const keywords.").value
   
    if (this.at().type != TokenType.Equals){
      if(isConstant){
        throw "Must assign value to constant expression. No value provided for " + JSON.stringify(identifier);
      }
        return {kind: "VarDeclaration", identifier, constant: false,} as VarDeclaration;
    }
    this.expect(TokenType.Equals, "Expected equals token following identifier in var declaration.");
    const declaration = {
      kind: "VarDeclaration", 
      value: this.parse_expr(), 
      identifier,
      constant: isConstant
    } as VarDeclaration;

    if (this.at().type == TokenType.String) this.eat(); // eat the " at the end

    return declaration;
  }

  private parse_expr (): Expr {
    return this.parse_assignment_expr();
  }

  private parse_assignment_expr(): Expr {
    const left = this.parse_object_expr();

    if (this.at().type == TokenType.Equals){
      this.eat() //advance past equal
      const value = this.parse_assignment_expr();
      return {value, assigne: left, kind: "AssignmentExpr"} as AssignmentExpr;
    }
    
    return left;  
  }

  private parse_object_expr(): Expr {
    if (this.at().type !== TokenType.OpenBrace){
      return this.parse_additive_expr();
    }

    this.eat() //advance past open brace
    const properties = new Array<Property>();

    while (this.not_eof() && this.at().type !== TokenType.CloseBrace){
      const key = this.expect(TokenType.Identifier, "Object literal key expected").value;

      if (this.at().type == TokenType.Comma){
        this.eat();
        properties.push({key, kind: "Property", value: undefined} as Property);
        continue;
      } else if (this.at().type == TokenType.CloseBrace){
        properties.push({key, kind: "Property", value: undefined});
        continue;
      }
      
      this.expect(TokenType.Colon, "Missing colon following identifier in ObjectExpr");
      const value = this.parse_expr();
      properties.push({kind: "Property", value, key});
      if (this.at().type != TokenType.CloseBrace){
        this.expect(TokenType.Comma, "Expecting comma or closing bracket following property");
      }
    }

    this.expect(TokenType.CloseBrace, "Object literal missing closing brace.");
    return {kind: "ObjectLiteral", properties} as ObjectLiteral;
  }

  private parse_additive_expr (): Expr {
    let left = this.parse_multiplicative_expr();

    while (this.at().value == "+" || this.at().value == "-"){
      const operator = this.eat().value;
      const right = this.parse_multiplicative_expr();
      left = {
        kind: "BinaryExpr",
        left, 
        right, 
        operator,
      } as BinaryExpr;
    }

    return left;
  }

  private parse_multiplicative_expr (): Expr {
    let left = this.parse_call_member_expr();

    while (this.at().value == "/" || this.at().value == "*" || this.at().value == "%"){
      const operator = this.eat().value;
      const right = this.parse_call_member_expr();
      left = {
        kind: "BinaryExpr",
        left, 
        right, 
        operator,
      } as BinaryExpr;
    }
    
    return left;
  }


  private parse_call_member_expr (): Expr {
    const member = this.parse_member_expr();

    if(this.at().type == TokenType.OpenParen){
      return this.parse_call_expr(member);
    }

    return member;
  }

  private parse_call_expr (caller: Expr): Expr {
    let call_expr: Expr = {
      kind: "CallExpr",
      caller,
      args: this.parse_args(),
    } as CallExpr;

    if(this.at().type == TokenType.OpenParen){
      call_expr = this.parse_call_expr(call_expr);
    }

    return call_expr;
  }

  private parse_args (): Expr[] {
    this.expect(TokenType.OpenParen, "Expected open parenthesis");
    const args = this.at().type == TokenType.CloseParen
      ? []
      : this.parse_arguments_list();
    
    this.expect(TokenType.CloseParen, "Missing closing parenthesis");
    return args;
  }

  private parse_arguments_list (): Expr[] {
    const args = [this.parse_assignment_expr()];

    while(this.at().type == TokenType.Comma && this.eat()){
      args.push(this.parse_assignment_expr());
    }

    return args;
  }

  private parse_member_expr (): Expr {
    let object = this.parse_primary_expr();

    while(this.at().type == TokenType.Dot || this.at().type == TokenType.OpenBracket){
      const operator = this.eat(); //either dot or bracket
      let property: Expr;
      let computed: boolean;

      // non-computed, (dot)
      if (operator.type == TokenType.Dot){
        computed = false; //not computed
        property = this.parse_primary_expr(); //get identifier

        if (property.kind != "Identifier"){
          throw `Cannot use dot operator without right hand side being a identifier`;
        } 
      } else { //allows chaining
        computed = true;
        property = this.parse_expr(); 
        this.expect(TokenType.CloseBracket, "Missing closing bracket in computed value.");
      }

      object = {
        kind: "MemberExpr",
        object,
        property,
        computed,
      } as MemberExpr;
    }
    return object;
  }

  private parse_primary_expr (): Expr {
    const tk = this.at().type;
    
    //what current token & return
    switch(tk){
      //user defined values
      case TokenType.Identifier:
        return {
          kind: "Identifier",
          symbol: this.eat().value
        } as Identifier;

      //constants and scalars
      case TokenType.Number:
        return {
          kind: "NumericLiteral",
          value: parseFloat(this.eat().value)
        } as NumericalLiteral;
      case TokenType.String:
        return {
            kind: "StringLiteral",
            value: this.eat().value
      } as StringLiteral;
      //group expressions
      case TokenType.OpenParen: {
        this.eat(); //eat opening paren
        const value = this.parse_expr();
        this.expect( //possible error
          TokenType.CloseParen,
          "Unexpected token found inside parenthesised expression. Epected clsoing parenthesis."
          ); //eat closing paren
        return value;
      }


      case TokenType.Equals:
      case TokenType.CloseParen:
      case TokenType.BinaryOperator:
      case TokenType.Let:
      case TokenType.EOF:
      default:
        console.error("Unexpected token found during parsing!", this.at());
        Deno.exit(1);
    }
  }

}