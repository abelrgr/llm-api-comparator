import type { Provider } from "../types/index";

export type SnippetLang =
  | "javascript"
  | "typescript"
  | "python"
  | "php"
  | "curl";

export interface ModelSnippetInfo {
  id: string;
  name: string;
  provider: Provider;
  is_local: boolean;
}

// ─── Provider routing helpers ─────────────────────────────────────────────────

function isOpenAICompat(provider: Provider) {
  return provider === "openai" || provider === "mistral" || provider === "meta";
}

function getBaseURL(provider: Provider): string {
  if (provider === "mistral") return "https://api.mistral.ai/v1";
  if (provider === "meta") return "https://api.together.xyz/v1";
  return "https://api.openai.com/v1";
}

function getEnvVar(provider: Provider): string {
  const map: Partial<Record<Provider, string>> = {
    openai: "OPENAI_API_KEY",
    anthropic: "ANTHROPIC_API_KEY",
    google: "GOOGLE_API_KEY",
    mistral: "MISTRAL_API_KEY",
    meta: "TOGETHER_API_KEY",
    cohere: "COHERE_API_KEY",
  };
  return map[provider] ?? "API_KEY";
}

function getChatEndpoint(provider: Provider): string {
  if (provider === "anthropic") return "https://api.anthropic.com/v1/messages";
  if (provider === "google")
    return "https://generativelanguage.googleapis.com/v1beta/models";
  if (provider === "cohere") return "https://api.cohere.ai/v2/chat";
  if (provider === "local") return "http://localhost:11434/api/chat";
  return `${getBaseURL(provider)}/chat/completions`;
}

// ─── JavaScript (fetch) Snippets ─────────────────────────────────────────────

function jsOpenAICompat(model: ModelSnippetInfo): string {
  const envVar = getEnvVar(model.provider);
  const baseUrl = getBaseURL(model.provider);
  return `// Node.js 18+ or browser — no extra dependencies needed
const response = await fetch('${baseUrl}/chat/completions', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${process.env.${envVar}}\`,
  },
  body: JSON.stringify({
    model: '${model.id}',
    messages: [
      { role: 'system', content: 'You are a helpful assistant.' },
      { role: 'user',   content: 'Hello! What can you do?' },
    ],
    max_tokens: 256,
    temperature: 0.7,
  }),
});

const data = await response.json();
console.log(data.choices[0].message.content);`;
}

function jsAnthropic(model: ModelSnippetInfo): string {
  return `// Node.js 18+ or browser — no extra dependencies needed
const response = await fetch('https://api.anthropic.com/v1/messages', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'x-api-key': process.env.ANTHROPIC_API_KEY,
    'anthropic-version': '2023-06-01',
  },
  body: JSON.stringify({
    model: '${model.id}',
    max_tokens: 256,
    messages: [
      { role: 'user', content: 'Hello! What can you do?' },
    ],
  }),
});

const data = await response.json();
console.log(data.content[0].text);`;
}

function jsGoogle(model: ModelSnippetInfo): string {
  return `// Node.js 18+ or browser — no extra dependencies needed
const model = '${model.id}';
const url   = \`https://generativelanguage.googleapis.com/v1beta/models/\${model}:generateContent?key=\${process.env.GOOGLE_API_KEY}\`;

const response = await fetch(url, {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    contents: [
      { parts: [{ text: 'Hello! What can you do?' }] },
    ],
  }),
});

const data = await response.json();
console.log(data.candidates[0].content.parts[0].text);`;
}

function jsCohere(model: ModelSnippetInfo): string {
  return `// Node.js 18+ or browser — no extra dependencies needed
const response = await fetch('https://api.cohere.ai/v2/chat', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json',
    'Authorization': \`Bearer \${process.env.COHERE_API_KEY}\`,
  },
  body: JSON.stringify({
    model: '${model.id}',
    messages: [
      { role: 'user', content: 'Hello! What can you do?' },
    ],
    temperature: 0.7,
  }),
});

const data = await response.json();
console.log(data.message.content[0].text);`;
}

function jsLocal(model: ModelSnippetInfo): string {
  return `// Ollama – no API key required
// Install: https://ollama.ai

const response = await fetch('http://localhost:11434/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: '${model.id}',
    messages: [
      { role: 'user', content: 'Hello! What can you do?' },
    ],
    stream: false,
  }),
});

const data = await response.json();
console.log(data.message.content);`;
}

// ─── TypeScript Snippets ──────────────────────────────────────────────────────

function tsOpenAICompat(model: ModelSnippetInfo): string {
  const needsBaseURL = model.provider !== "openai";
  const envVar = getEnvVar(model.provider);
  const baseURL = getBaseURL(model.provider);
  return `import OpenAI from 'openai';

const client = new OpenAI({
  apiKey: process.env.${envVar},${needsBaseURL ? `\n  baseURL: '${baseURL}',` : ""}
});

const response = await client.chat.completions.create({
  model: '${model.id}',
  messages: [
    { role: 'system', content: 'You are a helpful assistant.' },
    { role: 'user', content: 'Hello! What can you do?' },
  ],
  max_tokens: 256,
  temperature: 0.7,
});

console.log(response.choices[0].message.content);`;
}

function tsAnthropic(model: ModelSnippetInfo): string {
  return `import Anthropic from '@anthropic-ai/sdk';

const client = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

const response = await client.messages.create({
  model: '${model.id}',
  max_tokens: 256,
  messages: [
    { role: 'user', content: 'Hello! What can you do?' },
  ],
});

console.log(response.content[0].text);`;
}

function tsGoogle(model: ModelSnippetInfo): string {
  return `import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);
const gemini = genAI.getGenerativeModel({ model: '${model.id}' });

const result = await gemini.generateContent('Hello! What can you do?');

console.log(result.response.text());`;
}

function tsCohere(model: ModelSnippetInfo): string {
  return `import { CohereClient } from 'cohere-ai';

const cohere = new CohereClient({
  token: process.env.COHERE_API_KEY,
});

const response = await cohere.chat({
  model: '${model.id}',
  message: 'Hello! What can you do?',
  temperature: 0.7,
});

console.log(response.text);`;
}

function tsLocal(model: ModelSnippetInfo): string {
  return `// Ollama – no API key required
// Install: https://ollama.ai

const response = await fetch('http://localhost:11434/api/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    model: '${model.id}',
    messages: [
      { role: 'user', content: 'Hello! What can you do?' },
    ],
    stream: false,
  }),
});

const data = await response.json();
console.log(data.message.content);`;
}

// ─── Python Snippets ──────────────────────────────────────────────────────────

function pyOpenAICompat(model: ModelSnippetInfo): string {
  const needsBaseURL = model.provider !== "openai";
  const envVar = getEnvVar(model.provider);
  const baseURL = getBaseURL(model.provider);
  return `from openai import OpenAI

client = OpenAI(
    api_key="${envVar}",${needsBaseURL ? `\n    base_url="${baseURL}",` : ""}
)

response = client.chat.completions.create(
    model="${model.id}",
    messages=[
        {"role": "system", "content": "You are a helpful assistant."},
        {"role": "user", "content": "Hello! What can you do?"},
    ],
    max_tokens=256,
    temperature=0.7,
)

print(response.choices[0].message.content)`;
}

function pyAnthropic(model: ModelSnippetInfo): string {
  return `import anthropic

client = anthropic.Anthropic(api_key="ANTHROPIC_API_KEY")

response = client.messages.create(
    model="${model.id}",
    max_tokens=256,
    messages=[
        {"role": "user", "content": "Hello! What can you do?"}
    ],
)

print(response.content[0].text)`;
}

function pyGoogle(model: ModelSnippetInfo): string {
  return `import google.generativeai as genai

genai.configure(api_key="GOOGLE_API_KEY")
model = genai.GenerativeModel("${model.id}")

response = model.generate_content("Hello! What can you do?")

print(response.text)`;
}

function pyCohere(model: ModelSnippetInfo): string {
  return `import cohere

co = cohere.Client(api_key="COHERE_API_KEY")

response = co.chat(
    model="${model.id}",
    message="Hello! What can you do?",
    temperature=0.7,
)

print(response.text)`;
}

function pyLocal(model: ModelSnippetInfo): string {
  return `import json
import urllib.request

# Ollama – no API key required
url  = "http://localhost:11434/api/chat"
body = json.dumps({
    "model": "${model.id}",
    "messages": [
        {"role": "user", "content": "Hello! What can you do?"}
    ],
    "stream": False,
}).encode("utf-8")

req = urllib.request.Request(
    url,
    data=body,
    headers={"Content-Type": "application/json"},
)
with urllib.request.urlopen(req) as resp:
    result = json.loads(resp.read())

print(result["message"]["content"])`;
}

// ─── PHP Snippets ─────────────────────────────────────────────────────────────

function phpOpenAICompat(model: ModelSnippetInfo): string {
  const needsBaseURL = model.provider !== "openai";
  const baseURL = getBaseURL(model.provider);
  return `<?php
// composer require openai-php/client

$client = OpenAI::client('YOUR_API_KEY'${needsBaseURL ? `,\n    baseUri: '${baseURL}'` : ""});

$response = $client->chat()->create([
    'model'       => '${model.id}',
    'messages'    => [
        ['role' => 'system', 'content' => 'You are a helpful assistant.'],
        ['role' => 'user',   'content' => 'Hello! What can you do?'],
    ],
    'max_tokens'  => 256,
    'temperature' => 0.7,
]);

echo $response->choices[0]->message->content;`;
}

function phpAnthropic(model: ModelSnippetInfo): string {
  return `<?php
// No official PHP SDK – using cURL directly

$apiKey  = 'YOUR_ANTHROPIC_API_KEY';
$payload = json_encode([
    'model'      => '${model.id}',
    'max_tokens' => 256,
    'messages'   => [
        ['role' => 'user', 'content' => 'Hello! What can you do?'],
    ],
]);

$ch = curl_init('https://api.anthropic.com/v1/messages');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        "x-api-key: {$apiKey}",
        'anthropic-version: 2023-06-01',
    ],
]);

$result = json_decode(curl_exec($ch), true);
echo $result['content'][0]['text'];`;
}

function phpGoogle(model: ModelSnippetInfo): string {
  return `<?php
// No official PHP SDK – using cURL directly

$apiKey = 'YOUR_GOOGLE_API_KEY';
$model  = '${model.id}';
$url    = "https://generativelanguage.googleapis.com/v1beta"
        . "/models/{$model}:generateContent?key={$apiKey}";

$payload = json_encode([
    'contents' => [
        ['parts' => [['text' => 'Hello! What can you do?']]]
    ],
]);

$ch = curl_init($url);
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
]);

$result = json_decode(curl_exec($ch), true);
echo $result['candidates'][0]['content']['parts'][0]['text'];`;
}

function phpCohere(model: ModelSnippetInfo): string {
  return `<?php
// Using cURL – no official PHP SDK

$apiKey  = 'YOUR_COHERE_API_KEY';
$payload = json_encode([
    'model'       => '${model.id}',
    'message'     => 'Hello! What can you do?',
    'temperature' => 0.7,
]);

$ch = curl_init('https://api.cohere.ai/v2/chat');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => [
        'Content-Type: application/json',
        "Authorization: Bearer {$apiKey}",
    ],
]);

$result = json_decode(curl_exec($ch), true);
echo $result['text'];`;
}

function phpLocal(model: ModelSnippetInfo): string {
  return `<?php
// Ollama – no API key required
// Install: https://ollama.ai

$payload = json_encode([
    'model'    => '${model.id}',
    'messages' => [
        ['role' => 'user', 'content' => 'Hello! What can you do?'],
    ],
    'stream'   => false,
]);

$ch = curl_init('http://localhost:11434/api/chat');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => $payload,
    CURLOPT_HTTPHEADER     => ['Content-Type: application/json'],
]);

$result = json_decode(curl_exec($ch), true);
echo $result['message']['content'];`;
}

// ─── cURL Snippets ────────────────────────────────────────────────────────────

function curlOpenAI(model: ModelSnippetInfo): string {
  const endpoint = getChatEndpoint(model.provider);
  const envVar = getEnvVar(model.provider);
  const authHeader =
    model.provider === "meta"
      ? `\n  -H "Authorization: Bearer $${envVar}" \\`
      : `\n  -H "Authorization: Bearer $${envVar}" \\`;
  return `curl ${endpoint} \\${authHeader}
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model.id}",
    "messages": [
      {
        "role": "system",
        "content": "You are a helpful assistant."
      },
      {
        "role": "user",
        "content": "Hello! What can you do?"
      }
    ],
    "max_tokens": 256,
    "temperature": 0.7
  }'`;
}

function curlAnthropic(model: ModelSnippetInfo): string {
  return `curl https://api.anthropic.com/v1/messages \\
  -H "Content-Type: application/json" \\
  -H "x-api-key: $ANTHROPIC_API_KEY" \\
  -H "anthropic-version: 2023-06-01" \\
  -d '{
    "model": "${model.id}",
    "max_tokens": 256,
    "messages": [
      {
        "role": "user",
        "content": "Hello! What can you do?"
      }
    ]
  }'`;
}

function curlGoogle(model: ModelSnippetInfo): string {
  return `curl "https://generativelanguage.googleapis.com/v1beta/models/${model.id}:generateContent?key=$GOOGLE_API_KEY" \\
  -H "Content-Type: application/json" \\
  -d '{
    "contents": [
      {
        "parts": [
          {"text": "Hello! What can you do?"}
        ]
      }
    ]
  }'`;
}

function curlCohere(model: ModelSnippetInfo): string {
  return `curl https://api.cohere.ai/v2/chat \\
  -H "Content-Type: application/json" \\
  -H "Authorization: Bearer $COHERE_API_KEY" \\
  -d '{
    "model": "${model.id}",
    "messages": [
      {
        "role": "user",
        "content": "Hello! What can you do?"
      }
    ],
    "temperature": 0.7
  }'`;
}

function curlLocal(model: ModelSnippetInfo): string {
  return `# Ollama – no API key required
curl http://localhost:11434/api/chat \\
  -H "Content-Type: application/json" \\
  -d '{
    "model": "${model.id}",
    "messages": [
      {
        "role": "user",
        "content": "Hello! What can you do?"
      }
    ],
    "stream": false
  }'`;
}

// ─── Public API ───────────────────────────────────────────────────────────────

export function getSnippets(
  model: ModelSnippetInfo,
): Record<SnippetLang, string> {
  const { provider, is_local } = model;

  if (is_local) {
    return {
      javascript: jsLocal(model),
      typescript: tsLocal(model),
      python: pyLocal(model),
      php: phpLocal(model),
      curl: curlLocal(model),
    };
  }

  if (isOpenAICompat(provider)) {
    return {
      javascript: jsOpenAICompat(model),
      typescript: tsOpenAICompat(model),
      python: pyOpenAICompat(model),
      php: phpOpenAICompat(model),
      curl: curlOpenAI(model),
    };
  }

  if (provider === "anthropic") {
    return {
      javascript: jsAnthropic(model),
      typescript: tsAnthropic(model),
      python: pyAnthropic(model),
      php: phpAnthropic(model),
      curl: curlAnthropic(model),
    };
  }

  if (provider === "google") {
    return {
      javascript: jsGoogle(model),
      typescript: tsGoogle(model),
      python: pyGoogle(model),
      php: phpGoogle(model),
      curl: curlGoogle(model),
    };
  }

  if (provider === "cohere") {
    return {
      javascript: jsCohere(model),
      typescript: tsCohere(model),
      python: pyCohere(model),
      php: phpCohere(model),
      curl: curlCohere(model),
    };
  }

  // Fallback – treat as OpenAI-compatible
  return {
    javascript: jsOpenAICompat(model),
    typescript: tsOpenAICompat(model),
    python: pyOpenAICompat(model),
    php: phpOpenAICompat(model),
    curl: curlOpenAI(model),
  };
}
