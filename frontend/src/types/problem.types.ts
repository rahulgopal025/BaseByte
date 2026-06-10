export interface TestCase {
  input: string;
  output: string;
}

export interface Problem {
  _id: string;
  title: string;
  description: string;
  difficulty: 'Easy' | 'Medium' | 'Hard';
  language: string;
  tags: string[];
  sampleInput: string;
  sampleOutput: string;
  testCases: TestCase[];
  createdAt: string;
}
