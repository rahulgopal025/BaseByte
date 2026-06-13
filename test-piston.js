async function testPiston() {
  try {
    const language = 'c';
    const code = '#include <stdio.h>\nint main() { printf("Hello"); return 0; }';
    const langConfig = {
      c: { version: '10.2.0' },
      python: { version: '3.10.0' },
      java: { version: '15.0.2' }
    };
    
    console.log("Sending request to Piston...");
    const response = await fetch('https://emkc.org/api/v2/piston/execute', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        language: language.toLowerCase(),
        version: langConfig[language.toLowerCase()]?.version || 'latest',
        files: [{ content: code }],
        stdin: ''
      })
    });
    const data = await response.json();
    console.log("Response data:", JSON.stringify(data, null, 2));
  } catch (error) {
    console.error("Error from Piston:", error);
  }
}

testPiston();
