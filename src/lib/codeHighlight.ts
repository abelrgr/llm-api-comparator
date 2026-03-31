export type TokenType =
  | 'keyword'
  | 'string'
  | 'comment'
  | 'number'
  | 'builtin'
  | 'variable'
  | 'operator'
  | 'plain';

export interface Token {
  type: TokenType;
  text: string;
}

// Tailwind text-color classes for a dark code background
export const TOKEN_COLORS: Record<TokenType, string> = {
  keyword:  'text-violet-400',
  string:   'text-emerald-400',
  comment:  'text-slate-500',
  number:   'text-amber-300',
  builtin:  'text-cyan-400',
  variable: 'text-orange-300',
  operator: 'text-slate-400',
  plain:    'text-slate-300',
};

type Rule = [RegExp, TokenType];

// ─── Language rule sets ───────────────────────────────────────────────────────

const TS_KEYWORDS = new RegExp(
  '^(import|export|from|as|const|let|var|function|class|interface|type|' +
  'if|else|for|while|do|switch|case|break|continue|return|' +
  'async|await|new|typeof|instanceof|try|catch|finally|throw|' +
  'null|undefined|true|false|void|string|number|boolean|object|any|' +
  'readonly|enum|extends|implements|abstract|static|public|private|protected)\\b',
);

const TS_BUILTINS = new RegExp(
  '^(console|process|Promise|fetch|Array|Object|JSON|Math|Error|' +
  'require|module|exports|Buffer|setTimeout|clearTimeout|' +
  'Map|Set|Symbol|window|document|globalThis|Response|Request|URL)\\b',
);

const PY_KEYWORDS = new RegExp(
  '^(def|class|if|elif|else|for|while|return|import|from|as|with|' +
  'try|except|finally|pass|and|or|not|in|is|lambda|yield|' +
  'async|await|del|global|raise|assert|break|continue|nonlocal|print)\\b',
);

const PY_BUILTINS = new RegExp(
  '^(None|True|False|len|range|str|int|float|list|dict|tuple|set|' +
  'type|isinstance|open|json|self|super|enumerate|zip|map|filter|' +
  'sorted|reversed|any|all|max|min|sum|abs|round|repr|format|input|bytes)\\b',
);

const PHP_KEYWORDS = new RegExp(
  '^(function|class|if|else|elseif|for|foreach|while|return|use|namespace|' +
  'echo|require|require_once|include|include_once|new|null|true|false|' +
  'array|instanceof|try|catch|finally|throw|static|public|private|protected|' +
  'extends|implements|interface|abstract|trait|const|yield|match|print|' +
  'CURLOPT_RETURNTRANSFER|CURLOPT_POST|CURLOPT_POSTFIELDS|CURLOPT_HTTPHEADER)\\b',
);

function tsRules(): Rule[] {
  return [
    [/^(\/\*[\s\S]*?\*\/)/, 'comment'],
    [/^(\/\/[^\n]*)/, 'comment'],
    [/^(`[^`]*`)/, 'string'],           // template literal
    [/^("(?:[^"\\]|\\.)*")/, 'string'],
    [/^('(?:[^'\\]|\\.)*')/, 'string'],
    [TS_KEYWORDS, 'keyword'],
    [TS_BUILTINS, 'builtin'],
    [/^(\d+\.?\d*)/, 'number'],
    [/^([+\-*/%=!<>&|^~?]+)/, 'operator'],
  ];
}

function pyRules(): Rule[] {
  return [
    [/^("""[\s\S]*?""")/, 'string'],
    [/^('''[\s\S]*?''')/, 'string'],
    [/^(#[^\n]*)/, 'comment'],
    [/^(f"(?:[^"\\]|\\.)*")/, 'string'],
    [/^(f'(?:[^'\\]|\\.)*')/, 'string'],
    [/^(r"(?:[^"\\]|\\.)*")/, 'string'],
    [/^(r'(?:[^'\\]|\\.)*')/, 'string'],
    [/^("(?:[^"\\]|\\.)*")/, 'string'],
    [/^('(?:[^'\\]|\\.)*')/, 'string'],
    [PY_KEYWORDS, 'keyword'],
    [PY_BUILTINS, 'builtin'],
    [/^(\d+\.?\d*)/, 'number'],
    [/^([+\-*/%=!<>&|^~?]+)/, 'operator'],
  ];
}

function phpRules(): Rule[] {
  return [
    [/^(<\?php)/, 'keyword'],
    [/^(\?>)/, 'keyword'],
    [/^(\/\*[\s\S]*?\*\/)/, 'comment'],
    [/^(\/\/[^\n]*)/, 'comment'],
    [/^(#[^\n]*)/, 'comment'],
    [/^("(?:[^"\\]|\\.)*")/, 'string'],
    [/^('(?:[^'\\]|\\.)*')/, 'string'],
    [/^(\$[a-zA-Z_][a-zA-Z0-9_]*)/, 'variable'],
    [PHP_KEYWORDS, 'keyword'],
    [/^(\d+\.?\d*)/, 'number'],
    [/^([+\-*/%=!<>&|^~?]+)/, 'operator'],
  ];
}

function curlRules(): Rule[] {
  return [
    [/^(#[^\n]*)/, 'comment'],
    [/^(curl)\b/, 'keyword'],
    [/^(--[a-zA-Z][a-zA-Z0-9-]*)/, 'builtin'],   // --flags
    [/^(-[a-zA-Z])(?=\s)/, 'builtin'],             // -H -d etc
    [/^(\$[A-Z_][A-Z0-9_]*)/, 'variable'],         // $ENV_VARS
    [/^(https?:\/\/\S+)/, 'string'],               // URLs
    [/^("(?:[^"\\]|\\.)*")/, 'string'],
    [/^('(?:[^\\']*(?:\\[\s\S][^\\']*)*)')/, 'string'],  // single-quote (no escape in bash)
    [/^(\\\n)/, 'operator'],                        // line continuation
    [/^(\d+\.?\d*)/, 'number'],
    [/^([+\-*/%=!<>&|^~?:,{}[\]]+)/, 'operator'],
  ];
}

function getRules(lang: string): Rule[] {
  switch (lang) {
    case 'javascript':
    case 'typescript': return tsRules();
    case 'python':     return pyRules();
    case 'php':        return phpRules();
    case 'curl':       return curlRules();
    default:           return [];
  }
}

// ─── Tokenizer ────────────────────────────────────────────────────────────────

export function tokenize(code: string, lang: string): Token[] {
  const tokens: Token[] = [];
  const rules  = getRules(lang);
  let pos = 0;

  while (pos < code.length) {
    const slice = code.slice(pos);
    let matched = false;

    for (const [regex, type] of rules) {
      const m = slice.match(regex);
      if (m) {
        tokens.push({ type, text: m[0] });
        pos += m[0].length;
        matched = true;
        break;
      }
    }

    if (!matched) {
      // Append to the previous plain token if possible
      const last = tokens[tokens.length - 1];
      if (last && last.type === 'plain') {
        last.text += code[pos];
      } else {
        tokens.push({ type: 'plain', text: code[pos] });
      }
      pos++;
    }
  }

  return tokens;
}
