export interface Quiz {
  _id: string;
  language: string;
  topic: string;
  question: string;
  options: string[];
  correctAnswer: number;
  explanation: string;
}
