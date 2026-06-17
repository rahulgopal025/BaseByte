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
