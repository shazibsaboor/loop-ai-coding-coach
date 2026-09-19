import type { Challenge } from "./challenges";

export const savedHelpQuestions = ["Give me a small hint", "Explain this lesson", "Show the correct solution"];

export const savedSolutions: Record<string, string> = {
  "first-message": 'function message() {\n  return "Hello, friend!";\n}',
  "your-name": 'function rememberName() {\n  let name = "Sara";\n  return name;\n}',
  "first-sum": 'function total() {\n  return 2 + 4;\n}',
  "first-function": 'function sayHello(name) {\n  return "Hello, " + name + "!";\n}',
  "easy-greeting": 'function morning() {\n  let name = "Sara";\n  return "Good morning, " + name;\n}',
  "easy-subtract": 'function apples() {\n  return 5 - 2;\n}',
  "easy-multiply": 'function sweets() {\n  return 2 * 4;\n}',
  "easy-divide": 'function share() {\n  return 8 / 2;\n}',
  "easy-number": 'function age() {\n  return 7;\n}',
  "easy-boolean": 'function light() {\n  let isOn = true;\n  return isOn;\n}',
  "easy-compare": 'function bigger() {\n  return 10 > 5;\n}',
  "easy-list": 'function fruit() {\n  let fruits = ["Apple", "Banana"];\n  return fruits[0];\n}',
  "easy-count": 'function colours() {\n  let colours = ["Red", "Blue", "Green"];\n  return colours.length;\n}',
  "easy-choice": 'function weather() {\n  let isSunny = true;\n  if (isSunny) {\n    return "Wear a hat";\n  }\n  return "Take an umbrella";\n}',
};

export function savedTutorReply(challenge: Challenge, question: string): string {
  const request = question.trim().toLowerCase().replace(/[?.!]+$/, "");
  if (["give me a small hint", "hint", "tell me the first small step"].includes(request)) {
    return `**Small hint — ${challenge.title}**\n\n${challenge.hints[0]}\n\n${challenge.requirements[0]}`;
  }
  if (["explain this lesson", "explain this challenge simply", "explain"].includes(request)) {
    return `**${challenge.title}**\n\n${challenge.lesson}\n\n**Try this:** ${challenge.task}`;
  }
  if (["show the correct solution", "show the solution", "solution", "answer"].includes(request) && savedSolutions[challenge.id]) {
    return `**Solution — ${challenge.title}**\n\n\`\`\`javascript\n${savedSolutions[challenge.id]}\n\`\`\`\n\n${challenge.answer}\n\nTry it in the code editor and press **Run code**.`;
  }
  return "I have saved help for this lesson, but I can’t analyse your custom code or answer that specific question without live AI. Choose **Give me a small hint**, **Explain this lesson**, or **Show the correct solution** below.";
}
