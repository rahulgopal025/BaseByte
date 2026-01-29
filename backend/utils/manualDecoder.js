/**
 * Professional Manual Error Decoder for BaseByte.
 * Decodes technical compiler errors into student-friendly Hinglish hints with Emojis! 🚀
 */

const decodeManualError = (rawError, language, lineNum) => {
    const error = rawError.toLowerCase();
         
        if (error.includes("timeout") || error.includes("signal: killed")) {
            return `Bhai, program run hone mein bohot time le raha hai. Logic check karo, kahin loop toh nahi phas gaya? 🐢`;
        }

    // --- C Language Errors ---
    if (language === "c") {
        if (error.includes("expected declaration or statement at end of input")) {
        return `Bhai, code ke end mein ek bracket '}' missing lag raha hai. Check karo! 👐`;
        }
        if (error.includes("expected ';'") || error.includes("error: expected expression")) {
            return `Bhai, line ${lineNum} par semicolon (;) missing hai. Har statement ke baad ';' lagana mat bhulo! 😅`;
        }
        if (error.includes("undeclared") || error.includes("not declared")) {
            return `Line ${lineNum}: Ye variable tune declare nahi kiya hai. Pehle 'int', 'float' ya 'char' use karke define karo. 🧐`;
        }
        if (error.includes("expected '}'") || error.includes("expected '{'")) {
            return `Line ${lineNum} ke aas-pass brackets { } check karo. Jitne open kiye hain, utne close bhi karne padenge! 👐`;
        }
        if (error.includes("format specifies type") && error.includes("scanf")) {
            return `Bhai, scanf mein variable ke pehle '&' lagaya kya? Address ke bina input nahi lega! 📍`;
        }
        if (error.includes("implicit declaration of function 'printf'")) {
            return `Are, tune 'printf' ki spelling galat likhi hai ya header file bhul gaya? Check karo. 🔍`;
        }
        if (error.includes("stdio.h: no such file")) {
            return `Header file check karo: #include <stdio.h> barobar likha hai na? Spelling mistake lag rahi hai. 📚`;
        }
        if (error.includes("character constant too long")) {
            return `Bhai, single quotes ' ' mein sirf ek hi character aata hai. Zyada ke liye double quotes " " use karo. 💬`;
        }
    }

    // --- Python Errors ---
    if (language === "python") {
            if (error.includes("expected declaration or statement at end of input")) {
            return `Bhai, code ke end mein ek bracket '}' missing lag raha hai. Check karo! 👐`;
        }
        if (error.includes("indentationerror")) {
            return `Python spacing ka bohot kachcha hai! Line ${lineNum} par extra space ya kam space check karo. 📏`;
        }
        if (error.includes("syntaxerror: invalid syntax") || error.includes("expected ':'")) {
            return `Line ${lineNum} par 'if', 'else', 'for' ya 'while' ke baad colon (:) lagana reh gaya hai. ⚡`;
        }
        if (error.includes("is not defined") || error.includes("nameerror")) {
            return `Line ${lineNum}: Spelling check kar lo variable ki. Ye naam system ko pehle se pata nahi hai. 🤔`;
        }
        if (error.includes("typeerror: can only concatenate str")) {
            return `Bhai, String ke saath Number nahi jod sakte. Number ko str() mein dalo ya comma (,) use karo. 🧩`;
        }
        if (error.includes("indexerror")) {
            return `Line ${lineNum}: List ka index limit ke baahar hai. Jitne items hain usse zyada mang rahe ho! 🚫`;
        }
        if (error.includes("modulenotfounderror")) {
            return `Bhai, ye library (module) installed nahi hai ya spelling galat hai. 📦`;
        }
    }

    // --- Java Errors ---
    if (language === "java") {
        if (error.includes("expected declaration or statement at end of input")) {
            return `Bhai, code ke end mein ek bracket '}' missing lag raha hai. Check karo! 👐`;
        }
        if (error.includes("cannot find symbol")) {
            return `Java ko ye variable ya method mil nahi raha line ${lineNum} par. Capital letters check karo. 🔡`;
        }
        if (error.includes("expected ';'")) {
            return `Line ${lineNum}: Java mein semicolon (;) compulsory hai har line ke baad. Check karo. ❗`;
        }
        if (error.includes("class main is public, should be declared in a file named main.java")) {
            return `Bhai, BaseByte par file ka naam 'Main.java' fix hota hai, isliye class ka naam 'Main' hi rakho. 🏠`;
        }
        if (error.includes("main method not found")) {
            return `Bhai, main method barobar likho: 'public static void main(String[] args)'. 🏗️`;
        }
        if (error.includes("reached end of file while parsing")) {
            return `Bhai, ek extra bracket '}' closing kam hai code ke end mein. Check karo. 🔚`;
        }
        if (error.includes("incompatible types")) {
            return `Line ${lineNum}: Data types match nahi ho rahe. Int ko String mein galti se daal rahe ho. 🔄`;
        }
    }

    // Default message if no specific error keyword is matched
    return `Bhai, line ${lineNum} par kuch syntax galti hai. Code ek baar shanti se check karo, solve ho jayega! 👍`;
};

module.exports = { decodeManualError };