import Parser from "./frontend/parser.ts";
import { createGlobalEnv } from "./runtime/environment.ts";
import { evaluate } from "./runtime/interpreter.ts"
import { transcribe } from "./transcribe.ts";


const file = Deno.args[0];

if (file) {
  run(file);
} else {
  repl();
}

async function run(filename: string){
  const parser = new Parser();
  const env = createGlobalEnv();


  let input = await Deno.readTextFile(filename)

  if (filename.endsWith('.lotr')) input = transcribe(input);

  const program = parser.produceAST(input);
  const result = evaluate(program, env);

 return result;
}


function repl (){
  const parser = new Parser();
  const env = createGlobalEnv();



  console.log("\nRepl v0.1");
  while(true){

    const input =  prompt("> ");

    if (!input || input.includes("exit")){
      Deno.exit(1);
    }

    const program = parser.produceAST(input);
    
    const result = evaluate(program, env);
    
    return result;
  }
}