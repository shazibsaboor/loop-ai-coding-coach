export type Check = { label: string; args: unknown[]; expected: unknown };
export type Challenge = {
  id: string; title: string; subtitle: string; concept: string; level: "Beginner" | "Intermediate";
  minutes: number; functionName: string; lesson: string; task: string; requirements: string[];
  starter: string; checks: Check[]; hints: string[]; reflection: string; answer: string;
  guided?: { example: string; steps: string[] };
};
export const challenges: Challenge[] = [
  {
    id: "first-message", title: "Your first message", subtitle: "Change one word. See what happens.", concept: "Start from zero · Text", level: "Beginner", minutes: 3,
    functionName: "message", lesson: 'Code is a set of instructions for a computer. Text goes inside quotes, like "Hello!". The word return gives back an answer. We have already written the function message() { ... } wrapper: it groups instructions so the Run button can try them. Keep that wrapper for now; you will learn it in lesson 4.',
    task: 'Make the answer say "Hello, friend!". In the editor, change only Ali to friend. Keep the quotes and the exclamation mark.',
    requirements: ['Find "Hello, Ali!" in the code.', 'Replace Ali with friend, then click Run code.'],
    starter: 'function message() {\n  return "Hello, Ali!";\n}\n',
    checks: [{ label: 'Your message says Hello, friend!', args: [], expected: 'Hello, friend!' }],
    guided: { example: 'return "Hello, Ali!";', steps: ['return gives back the text after it.', 'The quotes mark where the text starts and ends. The semicolon ends this instruction.', 'Change Ali to friend in the code box. On a phone, tap Code first. Then press Run code.'] },
    hints: ['You only need to change one word inside the quotes.', 'Keep Hello, the comma, the space, and ! exactly as they are.', 'The middle line should be: return "Hello, friend!";'],
    reflection: 'What do the quotes tell the computer?', answer: 'The characters between the quotes are text. The computer returns that text as the answer.',
  },
  {
    id: "your-name", title: "Remember a name", subtitle: "Keep text in a named place.", concept: "Start from zero · Variables", level: "Beginner", minutes: 4,
    functionName: "rememberName", lesson: 'A variable is a named place to keep a value. In let name = "Ali"; the word let creates a variable, name is its label, and = stores the text "Ali" in it. Later, return name; gives back the stored text. name without quotes reads the variable; "name" with quotes is just the word name.',
    task: 'Store the name Sara instead of Ali. Change the text on the let line. Leave return name; alone.',
    requirements: ['Replace "Ali" with "Sara".', 'Run the code. The answer should be "Sara".'],
    starter: 'function rememberName() {\n  let name = "Ali";\n  return name;\n}\n',
    checks: [{ label: 'The stored name is Sara', args: [], expected: 'Sara' }],
    guided: { example: 'let name = "Ali";\nreturn name;', steps: ['The first line stores Ali under the label name.', 'The second line reads that label and gives back Ali.', 'Change Ali to Sara on the first line, then run the code.'] },
    hints: ['Change the value inside quotes on the let line.', 'You do not need to change the variable label name.', 'Use let name = "Sara"; and keep return name;'],
    reflection: 'Why does return name give back Sara?', answer: 'name holds the text Sara. Reading the variable gives you the value stored in it.',
  },
  {
    id: "first-sum", title: "Let the computer add", subtitle: "Use code like a calculator.", concept: "Start from zero · Numbers", level: "Beginner", minutes: 4,
    functionName: "total", lesson: 'Numbers do not need quotes. The + sign adds numbers: 2 + 3 gives 5. Text behaves differently: "2" + "3" joins two pieces of text to make "23". For a calculation, use numbers without quotes.',
    task: 'You have 2 apples and buy 4 more. Change 3 to 4 in the code so it calculates 2 + 4.',
    requirements: ['Keep the + sign and use numbers without quotes.', 'Run the code. The answer should be the number 6.'],
    starter: 'function total() {\n  return 2 + 3;\n}\n',
    checks: [{ label: 'Two apples plus four apples gives 6', args: [], expected: 6 }],
    guided: { example: 'return 2 + 3;', steps: ['The computer adds 2 and 3 to get 5.', 'return gives that number back as the answer.', 'Replace 3 with 4, then run the code to see 6.'] },
    hints: ['You only need to replace one number.', 'Do not put quotes around 2 or 4.', 'The middle line should be return 2 + 4;'],
    reflection: 'Why do we leave quotes off the numbers?', answer: 'Without quotes they are numbers, so + adds them. With quotes they are text, so + joins them.',
  },
  {
    id: "first-function", title: "A greeting you can reuse", subtitle: "Give your code a name to work with.", concept: "Start from zero · Functions", level: "Beginner", minutes: 5,
    functionName: "sayHello", lesson: 'A function groups instructions under a name. Here its name is sayHello. The name inside the parentheses is an input: a value we give it when we use it. The braces { } hold its instructions. sayHello("Ali") runs those instructions with name holding "Ali". The + sign joins text together.',
    task: 'The starter always says Hello, name! because "name" is inside quotes. Remove only the quotes around the second word "name" so the code uses the supplied name instead.',
    requirements: ['Keep quotes around "Hello, " and "!".', 'Use name without quotes between the + signs.', 'Run the code. It should greet both Ali and Sara.'],
    starter: 'function sayHello(name) {\n  return "Hello, " + "name" + "!";\n}\n',
    checks: [{ label: 'Give it Ali → get Hello, Ali!', args: ['Ali'], expected: 'Hello, Ali!' }, { label: 'Give it Sara → get Hello, Sara!', args: ['Sara'], expected: 'Hello, Sara!' }],
    guided: { example: 'function sayHello(name) {\n  return "Hi, " + name;\n}\n// sayHello("Ali") gives "Hi, Ali"', steps: ['name receives the text supplied when the function runs.', '"Hi, " + name joins the greeting and the supplied name. The line starting // is a comment: a note the computer ignores.', 'In your editor, remove the quotes around "name" only. Run both examples with Run code.'] },
    hints: ['"name" means the literal word name. name means the value supplied to the function.', 'Keep the spaces and punctuation inside the other quotes.', 'Use return "Hello, " + name + "!";'],
    reflection: 'How can the same code greet two different people?', answer: 'Each time we use the function, name receives a different input. The instructions stay the same.',
  },
{
  "id": "easy-greeting",
  "title": "Say good morning",
  "subtitle": "Change \"Hello, \" to \"Good morning, \" inside the quotes.",
  "concept": "Joining text",
  "level": "Beginner",
  "minutes": 4,
  "functionName": "morning",
  "lesson": "The + sign joins text. A space inside quotes is part of the message. name already holds \"Sara\".",
  "task": "Change \"Hello, \" to \"Good morning, \" inside the quotes.",
  "requirements": [
    "Change \"Hello, \" to \"Good morning, \" inside the quotes.",
    "Keep the other lines as they are, then click Run code."
  ],
  "starter": "function morning() {\n  let name = \"Sara\";\n  return \"Hello, \" + name;\n}\n",
  "checks": [
    {
      "label": "Your answer should be \"Good morning, Sara\"",
      "args": [],
      "expected": "Good morning, Sara"
    }
  ],
  "guided": {
    "example": "return \"Hi, \" + \"Ali\";",
    "steps": [
      "The example joins two pieces of text to make Hi, Ali.",
      "Change \"Hello, \" to \"Good morning, \" inside the quotes.",
      "Click Run code below the editor to check your answer."
    ]
  },
  "hints": [
    "Look at the example above. You only need a small change.",
    "Change \"Hello, \" to \"Good morning, \" inside the quotes.",
    "The completed code looks like this:\nfunction morning() {\n  let name = \"Sara\";\n  return \"Good morning, \" + name;\n}\n"
  ],
  "reflection": "What did your small change do?",
  "answer": "Change \"Hello, \" to \"Good morning, \" inside the quotes. The code now gives \"Good morning, Sara\"."
},
{
  "id": "easy-subtract",
  "title": "Apples left over",
  "subtitle": "Change + to - to find how many of your 5 apples remain after eating 2.",
  "concept": "Taking away",
  "level": "Beginner",
  "minutes": 4,
  "functionName": "apples",
  "lesson": "The minus sign - takes one number away from another.",
  "task": "Change + to - to find how many of your 5 apples remain after eating 2.",
  "requirements": [
    "Change + to - to find how many of your 5 apples remain after eating 2.",
    "Keep the other lines as they are, then click Run code."
  ],
  "starter": "function apples() {\n  return 5 + 2;\n}\n",
  "checks": [
    {
      "label": "Your answer should be 3",
      "args": [],
      "expected": 3
    }
  ],
  "guided": {
    "example": "return 8 - 2;",
    "steps": [
      "Eight minus two gives six.",
      "Change + to - to find how many of your 5 apples remain after eating 2.",
      "Click Run code below the editor to check your answer."
    ]
  },
  "hints": [
    "Look at the example above. You only need a small change.",
    "Change + to - to find how many of your 5 apples remain after eating 2.",
    "The completed code looks like this:\nfunction apples() {\n  return 5 - 2;\n}\n"
  ],
  "reflection": "What did your small change do?",
  "answer": "Change + to - to find how many of your 5 apples remain after eating 2. The code now gives 3."
},
{
  "id": "easy-multiply",
  "title": "Two bags of sweets",
  "subtitle": "Change + to * to count 2 bags with 4 sweets in each bag.",
  "concept": "Multiplication",
  "level": "Beginner",
  "minutes": 4,
  "functionName": "sweets",
  "lesson": "In JavaScript, * means multiply. It counts equal groups.",
  "task": "Change + to * to count 2 bags with 4 sweets in each bag.",
  "requirements": [
    "Change + to * to count 2 bags with 4 sweets in each bag.",
    "Keep the other lines as they are, then click Run code."
  ],
  "starter": "function sweets() {\n  return 2 + 4;\n}\n",
  "checks": [
    {
      "label": "Your answer should be 8",
      "args": [],
      "expected": 8
    }
  ],
  "guided": {
    "example": "return 3 * 2;",
    "steps": [
      "Three groups of two gives six.",
      "Change + to * to count 2 bags with 4 sweets in each bag.",
      "Click Run code below the editor to check your answer."
    ]
  },
  "hints": [
    "Look at the example above. You only need a small change.",
    "Change + to * to count 2 bags with 4 sweets in each bag.",
    "The completed code looks like this:\nfunction sweets() {\n  return 2 * 4;\n}\n"
  ],
  "reflection": "What did your small change do?",
  "answer": "Change + to * to count 2 bags with 4 sweets in each bag. The code now gives 8."
},
{
  "id": "easy-divide",
  "title": "Share the biscuits",
  "subtitle": "Change - to / to share 8 biscuits equally between 2 people.",
  "concept": "Division",
  "level": "Beginner",
  "minutes": 4,
  "functionName": "share",
  "lesson": "The / sign divides numbers. Dividing means sharing equally.",
  "task": "Change - to / to share 8 biscuits equally between 2 people.",
  "requirements": [
    "Change - to / to share 8 biscuits equally between 2 people.",
    "Keep the other lines as they are, then click Run code."
  ],
  "starter": "function share() {\n  return 8 - 2;\n}\n",
  "checks": [
    {
      "label": "Your answer should be 4",
      "args": [],
      "expected": 4
    }
  ],
  "guided": {
    "example": "return 6 / 2;",
    "steps": [
      "Six shared between two people gives three each.",
      "Change - to / to share 8 biscuits equally between 2 people.",
      "Click Run code below the editor to check your answer."
    ]
  },
  "hints": [
    "Look at the example above. You only need a small change.",
    "Change - to / to share 8 biscuits equally between 2 people.",
    "The completed code looks like this:\nfunction share() {\n  return 8 / 2;\n}\n"
  ],
  "reflection": "What did your small change do?",
  "answer": "Change - to / to share 8 biscuits equally between 2 people. The code now gives 4."
},
{
  "id": "easy-number",
  "title": "A number, not text",
  "subtitle": "Remove the quotes around 7 so the answer is a number.",
  "concept": "Numbers and quotes",
  "level": "Beginner",
  "minutes": 4,
  "functionName": "age",
  "lesson": "Quotes turn a number into text. The number 7 and the text \"7\" look similar, but the computer treats them differently.",
  "task": "Remove the quotes around 7 so the answer is a number.",
  "requirements": [
    "Remove the quotes around 7 so the answer is a number.",
    "Keep the other lines as they are, then click Run code."
  ],
  "starter": "function age() {\n  return \"7\";\n}\n",
  "checks": [
    {
      "label": "Your answer should be 7",
      "args": [],
      "expected": 7
    }
  ],
  "guided": {
    "example": "return 5;",
    "steps": [
      "Without quotes, 5 is a number.",
      "Remove the quotes around 7 so the answer is a number.",
      "Click Run code below the editor to check your answer."
    ]
  },
  "hints": [
    "Look at the example above. You only need a small change.",
    "Remove the quotes around 7 so the answer is a number.",
    "The completed code looks like this:\nfunction age() {\n  return 7;\n}\n"
  ],
  "reflection": "What did your small change do?",
  "answer": "Remove the quotes around 7 so the answer is a number. The code now gives 7."
},
{
  "id": "easy-boolean",
  "title": "Turn on the light",
  "subtitle": "Change false to true to show that the light is on.",
  "concept": "True and false",
  "level": "Beginner",
  "minutes": 4,
  "functionName": "light",
  "lesson": "true means yes and false means no. These special values are called booleans. They do not use quotes.",
  "task": "Change false to true to show that the light is on.",
  "requirements": [
    "Change false to true to show that the light is on.",
    "Keep the other lines as they are, then click Run code."
  ],
  "starter": "function light() {\n  let isOn = false;\n  return isOn;\n}\n",
  "checks": [
    {
      "label": "Your answer should be true",
      "args": [],
      "expected": true
    }
  ],
  "guided": {
    "example": "let isOpen = true;",
    "steps": [
      "This stores yes (true) under the label isOpen.",
      "Change false to true to show that the light is on.",
      "Click Run code below the editor to check your answer."
    ]
  },
  "hints": [
    "Look at the example above. You only need a small change.",
    "Change false to true to show that the light is on.",
    "The completed code looks like this:\nfunction light() {\n  let isOn = true;\n  return isOn;\n}\n"
  ],
  "reflection": "What did your small change do?",
  "answer": "Change false to true to show that the light is on. The code now gives true."
},
{
  "id": "easy-compare",
  "title": "Is ten bigger?",
  "subtitle": "Replace < with > to ask whether 10 is greater than 5.",
  "concept": "Comparing numbers",
  "level": "Beginner",
  "minutes": 4,
  "functionName": "bigger",
  "lesson": "The > sign means greater than. The < sign means less than. Comparing numbers gives true for yes or false for no.",
  "task": "Replace < with > to ask whether 10 is greater than 5.",
  "requirements": [
    "Replace < with > to ask whether 10 is greater than 5.",
    "Keep the other lines as they are, then click Run code."
  ],
  "starter": "function bigger() {\n  return 10 < 5;\n}\n",
  "checks": [
    {
      "label": "Your answer should be true",
      "args": [],
      "expected": true
    }
  ],
  "guided": {
    "example": "return 8 > 3;",
    "steps": [
      "Eight is greater than three, so this gives true.",
      "Replace < with > to ask whether 10 is greater than 5.",
      "Click Run code below the editor to check your answer."
    ]
  },
  "hints": [
    "Look at the example above. You only need a small change.",
    "Replace < with > to ask whether 10 is greater than 5.",
    "The completed code looks like this:\nfunction bigger() {\n  return 10 > 5;\n}\n"
  ],
  "reflection": "What did your small change do?",
  "answer": "Replace < with > to ask whether 10 is greater than 5. The code now gives true."
},
{
  "id": "easy-list",
  "title": "Pick the first fruit",
  "subtitle": "Change fruits[1] to fruits[0] to choose Apple, the first fruit.",
  "concept": "A simple list",
  "level": "Beginner",
  "minutes": 4,
  "functionName": "fruit",
  "lesson": "An array is a list inside square brackets. Commas separate its items. JavaScript counts positions from 0: the first item is at 0, the second at 1.",
  "task": "Change fruits[1] to fruits[0] to choose Apple, the first fruit.",
  "requirements": [
    "Change fruits[1] to fruits[0] to choose Apple, the first fruit.",
    "Keep the other lines as they are, then click Run code."
  ],
  "starter": "function fruit() {\n  let fruits = [\"Apple\", \"Banana\"];\n  return fruits[1];\n}\n",
  "checks": [
    {
      "label": "Your answer should be \"Apple\"",
      "args": [],
      "expected": "Apple"
    }
  ],
  "guided": {
    "example": "let colours = [\"Red\", \"Blue\"];\nreturn colours[0];",
    "steps": [
      "Position 0 gives the first item, Red.",
      "Change fruits[1] to fruits[0] to choose Apple, the first fruit.",
      "Click Run code below the editor to check your answer."
    ]
  },
  "hints": [
    "Look at the example above. You only need a small change.",
    "Change fruits[1] to fruits[0] to choose Apple, the first fruit.",
    "The completed code looks like this:\nfunction fruit() {\n  let fruits = [\"Apple\", \"Banana\"];\n  return fruits[0];\n}\n"
  ],
  "reflection": "What did your small change do?",
  "answer": "Change fruits[1] to fruits[0] to choose Apple, the first fruit. The code now gives \"Apple\"."
},
{
  "id": "easy-count",
  "title": "Count your colours",
  "subtitle": "Add \"Green\" after \"Blue\" in the list, with a comma between them.",
  "concept": "List length",
  "level": "Beginner",
  "minutes": 4,
  "functionName": "colours",
  "lesson": "The .length after a list name tells us how many items it contains. A list with Red and Blue has length 2.",
  "task": "Add \"Green\" after \"Blue\" in the list, with a comma between them.",
  "requirements": [
    "Add \"Green\" after \"Blue\" in the list, with a comma between them.",
    "Keep the other lines as they are, then click Run code."
  ],
  "starter": "function colours() {\n  let colours = [\"Red\", \"Blue\"];\n  return colours.length;\n}\n",
  "checks": [
    {
      "label": "Your answer should be 3",
      "args": [],
      "expected": 3
    }
  ],
  "guided": {
    "example": "let pets = [\"Cat\", \"Dog\"];\nreturn pets.length;",
    "steps": [
      "This gives 2 because the list contains two pets.",
      "Add \"Green\" after \"Blue\" in the list, with a comma between them.",
      "Click Run code below the editor to check your answer."
    ]
  },
  "hints": [
    "Look at the example above. You only need a small change.",
    "Add \"Green\" after \"Blue\" in the list, with a comma between them.",
    "The completed code looks like this:\nfunction colours() {\n  let colours = [\"Red\", \"Blue\", \"Green\"];\n  return colours.length;\n}\n"
  ],
  "reflection": "What did your small change do?",
  "answer": "Add \"Green\" after \"Blue\" in the list, with a comma between them. The code now gives 3."
},
{
  "id": "easy-choice",
  "title": "Choose a sunny message",
  "subtitle": "Change isSunny from false to true so the answer becomes \"Wear a hat\".",
  "concept": "A simple if",
  "level": "Beginner",
  "minutes": 4,
  "functionName": "weather",
  "lesson": "if means: do the instructions in these braces only when the condition is true. return ends the function and gives its answer. Otherwise, the next return is used.",
  "task": "Change isSunny from false to true so the answer becomes \"Wear a hat\".",
  "requirements": [
    "Change isSunny from false to true so the answer becomes \"Wear a hat\".",
    "Keep the other lines as they are, then click Run code."
  ],
  "starter": "function weather() {\n  let isSunny = false;\n  if (isSunny) {\n    return \"Wear a hat\";\n  }\n  return \"Take an umbrella\";\n}\n",
  "checks": [
    {
      "label": "Your answer should be \"Wear a hat\"",
      "args": [],
      "expected": "Wear a hat"
    }
  ],
  "guided": {
    "example": "if (true) {\n  return \"Yes\";\n}",
    "steps": [
      "Because the condition is true, the instruction inside the braces runs.",
      "Change isSunny from false to true so the answer becomes \"Wear a hat\".",
      "Click Run code below the editor to check your answer."
    ]
  },
  "hints": [
    "Look at the example above. You only need a small change.",
    "Change isSunny from false to true so the answer becomes \"Wear a hat\".",
    "The completed code looks like this:\nfunction weather() {\n  let isSunny = true;\n  if (isSunny) {\n    return \"Wear a hat\";\n  }\n  return \"Take an umbrella\";\n}\n"
  ],
  "reflection": "What did your small change do?",
  "answer": "Change isSunny from false to true so the answer becomes \"Wear a hat\". The code now gives \"Wear a hat\"."
}
];
export function getChallenge(id: string) { return challenges.find(c => c.id === id); }
