export const codeTemplates: { [key: string]: string } = {
  c: '#include <stdio.h>\n\nint main() {\n    printf("welcome to BaseByte C!");\n    return 0;\n}',
  cpp: '#include <iostream>\nusing namespace std;\n\nint main() {\n    cout << "Welcome to BaseByte C++!" << endl;\n    return 0;\n}',
  java: 'public class Main {\n    public static void main(String[] args) {\n        System.out.println("Hello Java World!");\n    }\n}',
  python: 'print("Hello Students, Python is easy!")',
  javascript: 'console.log("Welcome to JavaScript!");',
  csharp: 'using System;\n\nclass Program {\n    static void Main() {\n        Console.WriteLine("Welcome to C#!");\n    }\n}',
  go: 'package main\n\nimport "fmt"\n\nfunc main() {\n    fmt.Println("Welcome to Go!")\n}',
  rust: 'fn main() {\n    println!("Welcome to Rust!");\n}',
  php: '<?php\n\necho "Welcome to PHP!";\n?>',
  ruby: 'puts "Welcome to Ruby!"'
};

export const judge0LanguageIds: Record<string, number> = {
  python: 71, javascript: 63, c: 50, cpp: 54, java: 62, csharp: 51, php: 68, ruby: 72, go: 60, rust: 73
};

export const getRandomHint = () => {
  const hints = [
    "Check for missing semicolons or brackets.",
    "Did you misspell a variable name?",
    "Check your logic and try again.",
    "Make sure you handled all edge cases."
  ];
  return hints[Math.floor(Math.random() * hints.length)];
};

export const getSmartHint = (errorText: string) => {
  if (!errorText) return getRandomHint();
  
  const error = errorText.toLowerCase();
  
  if (error.includes("';'") || error.includes("semicolon") || error.includes("expected ';'"))
    return "Arre semicolon bhool gaya kya? Usse bhi life mein jagah chahiye! 😤";
  
  if (error.includes("'}'" ) || error.includes("missing '}'") || error.includes("reached end of file"))
    return "Bhai, curly braces band karo — ghar ka darwaza khula chhod diya kya? 🚪";
  
  if (error.includes("cannot find symbol") || error.includes("is not defined") || error.includes("undeclared"))
    return "Variable declare kiya? Ya seedha use kar liya? 😂";
  
  if (error.includes("import") || error.includes("cannot be resolved"))
    return "Import karna bhool gaya? Pehle bulao toh class ko! 📞";
  
  if (error.includes("nosuchelementexception") || error.includes("input") || error.includes("scanner"))
    return "Bhai, input toh de! Scanner bhookha hai! 🍽️";
  
  if (error.includes("nullpointerexception") || error.includes("null pointer"))
    return "Null pointer? Kuch toh gadbad hai Daya! 🔍";
  
  if (error.includes("stackoverflow") || error.includes("stack overflow"))
    return "Stack overflow — itna deep mat socho life mein! 🌀";
  
  if (error.includes("arrayindexoutofbounds") || error.includes("index out of"))
    return "Array out of bounds — zyada hi ambitious ho gaye bhai! 📦";
  
  if (error.includes("dividebyzero") || error.includes("/ by zero"))
    return "Division by zero? Maths teacher শিক্ষক rote honge abhi! 😢";
  
  if (error.includes("timeout") || error.includes("time limit"))
    return "Ek aur loop? CPU ki jaan lo kya? 🔥";
  
  if (error.includes("indentationerror") || error.includes("indent"))
    return "Indentation galat hai — Python bhai bahut sensitive hai! 😒";
  
  if (error.includes("typeerror") || error.includes("type mismatch"))
    return "Float mein int daala? Apples mein oranges mix kiye! 🍊";
  
  if (error.includes("classnotfound") || error.includes("class main"))
    return "Java mein main class main nahi? Ghar mein bina maa ke jaisa! 🏠";

  if (error.includes("infinite") || error.includes("while") || error.includes("for"))
    return "While loop mein condition update nahi ki? Kabhi khatam hi nahi hoga! 🔄";

  if (error.includes("return"))
    return "Return type void hai but value return kar raha? Confused ho kya? 😵";

  return getRandomHint();
};
