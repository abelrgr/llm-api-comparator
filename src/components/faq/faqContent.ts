import type { Lang } from "../../i18n/index";

export interface FAQItem {
  id: string;
  q: string;
  answer: string;
  bullets?: string[];
  tip?: string;
  diagram?: boolean;
}

export interface FAQCategory {
  id: string;
  icon: string;
  title: string;
  items: FAQItem[];
}

export const FAQ_DATA: Record<Lang, FAQCategory[]> = {
  // ─────────────────────────────────────────── ENGLISH ──────────────────────
  en: [
    {
      id: "decision",
      icon: "🎯",
      title: "How to Choose the Right Model",
      items: [
        {
          id: "key-factors",
          q: "What key factors should I evaluate when selecting a model?",
          answer:
            "Six dimensions determine which LLM fits your use case best. Evaluating them in order quickly eliminates poor matches:",
          bullets: [
            "💰 Cost — Input vs. output price per 1M tokens. Output tokens are typically 3–10× more expensive.",
            "📏 Context window — Maximum tokens processed per request (input + output combined).",
            "⚡ Latency — TTFT for interactive chat; TPS for batch throughput.",
            "🧠 Capabilities — Vision, function calling, reasoning, code generation, fine-tuning support.",
            "🔒 Privacy — Cloud APIs send data to third parties; local models stay on your hardware.",
            "🔗 Reliability — Uptime SLAs, rate limits, SDK maturity, and long-term provider commitment.",
          ],
          tip: "Start with cost × context window. These two alone eliminate 80% of mismatches before you need to compare capabilities.",
        },
        {
          id: "input-output-pricing",
          q: "What is the difference between input and output token pricing?",
          answer:
            "Every API call generates two separate costs, both measured per million tokens:",
          bullets: [
            "Input tokens: everything you send — system prompt + conversation history + user message.",
            "Output tokens: what the model generates — the completion, answer, or generated content.",
            "Output is usually priced 3–10× higher (e.g., GPT-4o: $2.50 input / $10.00 output per 1M tokens).",
            "Long chat histories make input cost dominant; generation tasks make output cost dominant.",
            "Setting max_tokens controls the maximum output spend per request.",
          ],
          tip: "Set max_tokens conservatively. Capping at 500 tokens can reduce your bill by 60–80% in chat applications.",
        },
        {
          id: "context-window",
          q: "How does the context window size affect which model I need?",
          answer:
            "The context window defines the maximum amount of text the model can see in a single request — input and output combined. Larger windows cost proportionally more:",
          bullets: [
            "8K tokens — Simple chatbots, short Q&A, code completions.",
            "32K tokens — Document Q&A, multi-turn conversations, code review.",
            "128K tokens — Legal documents, large codebases, report summarization.",
            "200K+ tokens — Entire books, multi-file code analysis, complex agent tasks.",
          ],
          tip: "You are billed for the full context on every call. Periodically summarize long conversations to keep context lean and costs low.",
        },
        {
          id: "latency",
          q: "When does latency matter and which metric should I measure?",
          answer:
            "Latency has two independent metrics that matter for very different scenarios:",
          bullets: [
            "TTFT (Time to First Token) — ms until the first character arrives. Dominant UX metric for streaming chat (target < 500ms).",
            "TPS (Tokens per Second) — generation speed after first token. Determines total response time for long completions.",
            "Real-time chat apps: optimize for low TTFT + enable streaming.",
            "Batch pipelines (summarization, analysis): optimize for high TPS and low cost; TTFT is irrelevant.",
            "Autonomous agents: both matter — each sequential tool call compounds total latency.",
          ],
          tip: "Always benchmark in your production deployment region, not the provider's marketing benchmark region.",
        },
        {
          id: "cloud-vs-local",
          q: "Should I use a cloud API or self-host a model?",
          answer:
            "Both are production-ready options. The right choice depends on volume, privacy requirements, and your team's operational capacity:",
          bullets: [
            "☁️ Cloud APIs — State-of-the-art models, zero infrastructure, instant scaling, pay-per-token. Data leaves your network.",
            "🖥️ Self-hosted — Full data privacy, no per-call cost after hardware, unlimited rate. Requires GPU + maintenance + expertise.",
            "Choose cloud for: prototyping, variable load, regulated industries needing latest model capabilities.",
            "Choose self-hosted for: >10M tokens/day at predictable load, strict data sovereignty, air-gapped environments.",
          ],
        },
      ],
    },
    {
      id: "glossary",
      icon: "📖",
      title: "Technical Glossary",
      items: [
        {
          id: "token",
          q: 'What is a "token"?',
          answer:
            "A token is the smallest text unit that an LLM processes. All LLM pricing is denominated in tokens — not words, sentences, or characters:",
          bullets: [
            "1 token ≈ ¾ word in English, ≈ 4 characters.",
            '"Hello world" = 2 tokens. "Supercalifragilistic" = 6 tokens.',
            "Code and non-Latin scripts (Chinese, Arabic) consume substantially more tokens per character.",
            "Rule of thumb: 1,000 tokens ≈ 750 English words ≈ 1.5 double-spaced pages.",
            "A 10-page PDF is roughly 3,000–5,000 tokens.",
          ],
          tip: "Use the provider's tokenizer tool before estimating costs. Token count varies significantly by language and content type.",
        },
        {
          id: "ttft",
          q: "What does TTFT (Time to First Token) mean?",
          answer:
            "TTFT is the elapsed clock time from sending an API request to receiving the very first output token:",
          bullets: [
            "Measured in milliseconds (ms). Common range: 200–2,000ms depending on model and server load.",
            "Components: network round-trip + server queuing + prompt processing + first token generation.",
            "Under 300ms feels instant; above 1,000ms feels sluggish in interactive UIs.",
            "Longer prompts typically increase TTFT — the model must process all input before generating.",
            "Key metric for: chatbots, voice assistants, real-time code completion.",
          ],
          tip: "Deploy your backend in the same cloud region as the LLM endpoint to reduce network RTT contribution.",
        },
        {
          id: "tps",
          q: "What is TPS (Tokens per Second)?",
          answer:
            "TPS measures how fast the model generates output tokens after the first token is emitted:",
          bullets: [
            "Common range: 30–150 TPS depending on model size and server hardware.",
            "Higher TPS = shorter total response time, especially visible in 500+ token responses.",
            "TPS degrades under high server load on shared inference endpoints.",
            "Self-hosted instances on dedicated GPUs offer more stable, predictable throughput.",
            "TPS and TTFT are independent: fast start (low TTFT) + slow generation (low TPS) is common for large models.",
          ],
        },
        {
          id: "function-calling",
          q: "What is function calling (tool use)?",
          answer:
            "Function calling lets the model invoke external tools or APIs during its reasoning process, making it the foundation of LLM agents:",
          bullets: [
            "You declare available tools via JSON schema (name, description, parameter types, required fields).",
            "The model signals which tool to call and with which arguments — your code actually executes it.",
            "You return the tool result to the model, which incorporates it into its response.",
            "Common tools: web search, database queries, code interpreters, REST APIs, calculators.",
            "Supported by: GPT-4o, Claude 3.x, Gemini 1.5+, Mistral Large, Llama 3.1+.",
          ],
          tip: "Clear, specific tool descriptions are critical. The model's ability to call tools correctly depends entirely on how well you describe them.",
        },
        {
          id: "fine-tuning",
          q: "What is fine-tuning and when should I use it?",
          answer:
            "Fine-tuning updates the base model's weights on your own training data, permanently adapting its behavior and style:",
          bullets: [
            "✅ Best for: consistent brand tone/voice, domain-specific formatting, output structure standardization.",
            "❌ Avoid for: adding new factual knowledge — use RAG instead.",
            "Requires hundreds to thousands of labeled (prompt → ideal response) example pairs.",
            "Fine-tuned models cost 1.5–3× more per token than base models.",
            "Any change in requirements needs a full new training run — RAG is far easier to iterate.",
          ],
          tip: "Exhaust prompt engineering and RAG first. Fine-tuning is the last resort, not the first instinct.",
        },
        {
          id: "rag",
          q: "What is RAG (Retrieval-Augmented Generation)?",
          answer:
            "RAG injects relevant external knowledge into the model's prompt at request time using semantic vector search, without retraining the model:",
          bullets: [
            "1. Documents → split into chunks → converted to embeddings (dense numerical vectors).",
            "2. Embeddings stored in a vector database (pgvector, Pinecone, Chroma, Weaviate).",
            "3. At query time: user question → embed → find nearest document chunks by cosine similarity.",
            "4. Retrieved chunks are added to the prompt as context before the model generates a response.",
            "Much cheaper and faster to update than fine-tuning — just re-embed changed documents.",
          ],
          tip: "Use a small embeddings model (e.g., text-embedding-3-small at $0.02/1M tokens) — not a large chat model — for the embedding step.",
        },
        {
          id: "streaming",
          q: "What is streaming and why should I always use it?",
          answer:
            "Streaming delivers the model's response token-by-token via Server-Sent Events (SSE) as each token is generated, instead of waiting for the complete response:",
          bullets: [
            'Reduces perceived latency from "full completion time" to "first token time" — often a 10–30× UX improvement.',
            "Supported by virtually all major providers: OpenAI, Anthropic, Google, Mistral, Cohere.",
            "Same cost as non-streaming — billed by tokens used, not by request duration.",
            "Enables typewriter animations, real-time UI updates, and early error recovery in the client.",
            "Non-streaming is simpler for background batch pipelines where no user is waiting.",
          ],
          tip: "Always enable streaming for user-facing interfaces. Only use non-streaming for background pipelines.",
        },
      ],
    },
    {
      id: "api-diagram",
      icon: "🔌",
      title: "How LLM APIs Work",
      items: [
        {
          id: "api-flow",
          q: "How does a complete LLM API call work, from request to response?",
          answer:
            "Every chat completion request follows the same lifecycle over HTTPS. Understanding this flow helps you estimate costs, debug errors, and design efficient applications:",
          diagram: true,
        },
      ],
    },
  ],

  // ─────────────────────────────────────────── ESPAÑOL ──────────────────────
  es: [
    {
      id: "decision",
      icon: "🎯",
      title: "Cómo Elegir el Modelo Correcto",
      items: [
        {
          id: "key-factors",
          q: "¿Qué factores clave debo evaluar al seleccionar un modelo?",
          answer:
            "Seis dimensiones determinan qué LLM se adapta mejor a tu caso de uso. Evaluarlos en orden elimina rápidamente las opciones inadecuadas:",
          bullets: [
            "💰 Costo — Precio de entrada vs. salida por 1M tokens. Los tokens de salida son típicamente 3–10× más caros.",
            "📏 Ventana de contexto — Máximo de tokens procesados por solicitud (entrada + salida combinados).",
            "⚡ Latencia — TTFT para chat interactivo; TPS para procesamiento por lotes.",
            "🧠 Capacidades — Visión, llamada a funciones, razonamiento, generación de código, soporte de fine-tuning.",
            "🔒 Privacidad — Las APIs en la nube envían datos a terceros; los modelos locales permanecen en tu hardware.",
            "🔗 Confiabilidad — SLAs de disponibilidad, límites de solicitudes, madurez del SDK y compromiso a largo plazo.",
          ],
          tip: "Comienza por costo × ventana de contexto. Solo estos dos eliminan el 80% de incompatibilidades antes de necesitar comparar capacidades.",
        },
        {
          id: "input-output-pricing",
          q: "¿Cuál es la diferencia entre el precio de tokens de entrada y salida?",
          answer:
            "Cada llamada a la API genera dos costos separados, ambos medidos por millón de tokens:",
          bullets: [
            "Tokens de entrada: todo lo que envías — prompt del sistema + historial de conversación + mensaje del usuario.",
            "Tokens de salida: lo que el modelo genera — la respuesta, el completado o el contenido generado.",
            "La salida suele ser 3–10× más cara (ej: GPT-4o: $2.50 entrada / $10.00 salida por 1M tokens).",
            "Los historiales de chat largos hacen que el costo de entrada domine; las tareas generativas hacen dominar la salida.",
            "Definir max_tokens controla el gasto máximo de salida por solicitud.",
          ],
          tip: "Configura max_tokens de forma conservadora. Limitarlo a 500 tokens puede reducir tu factura un 60–80% en apps de chat.",
        },
        {
          id: "context-window",
          q: "¿Cómo afecta el tamaño de la ventana de contexto al modelo que necesito?",
          answer:
            "La ventana de contexto define el máximo de texto que el modelo puede procesar en una sola solicitud — entrada y salida combinadas. Ventanas más grandes cuestan proporcionalmente más:",
          bullets: [
            "8K tokens — Chatbots simples, preguntas y respuestas cortas, completado de código.",
            "32K tokens — Q&A sobre documentos, conversaciones largas, revisión de código.",
            "128K tokens — Documentos legales, bases de código grandes, resumen de informes.",
            "200K+ tokens — Libros completos, análisis multi-archivo, agentes autónomos complejos.",
          ],
          tip: "Se te factura el contexto completo en cada llamada. Resume periódicamente las conversaciones largas para mantener el contexto ligero.",
        },
        {
          id: "latency",
          q: "¿Cuándo importa la latencia y qué métrica debo medir?",
          answer:
            "La latencia tiene dos métricas independientes que importan para escenarios muy diferentes:",
          bullets: [
            "TTFT (Time to First Token) — ms hasta que llega el primer carácter. Métrica UX dominante para chat con streaming (objetivo < 500ms).",
            "TPS (Tokens por Segundo) — velocidad de generación tras el primer token. Determina el tiempo total de respuesta para completados largos.",
            "Apps de chat en tiempo real: optimiza para TTFT bajo con streaming activado.",
            "Pipelines por lotes (resumen, análisis): optimiza TPS y costo; el TTFT es irrelevante.",
            "Agentes autónomos: ambas importan — cada llamada secuencial acumula latencia total.",
          ],
          tip: "Mide siempre en tu región de producción real, no en la región de referencia del proveedor.",
        },
        {
          id: "cloud-vs-local",
          q: "¿Debo usar una API en la nube o alojar un modelo propio?",
          answer:
            "Ambas son opciones válidas para producción. La elección correcta depende del volumen, requisitos de privacidad y capacidad operativa de tu equipo:",
          bullets: [
            "☁️ APIs en la nube — Modelos de última generación, sin infraestructura, escalado instantáneo, pago por token. Los datos salen de tu red.",
            "🖥️ Auto-alojado — Privacidad total, sin costo por llamada tras la inversión en hardware, sin límites de tasa. Requiere GPU + mantenimiento.",
            "Elige la nube para: prototipos, carga variable, industrias reguladas que necesiten los últimos modelos.",
            "Elige auto-alojado para: >10M tokens/día con carga predecible, soberanía de datos estricta, entornos aislados.",
          ],
        },
      ],
    },
    {
      id: "glossary",
      icon: "📖",
      title: "Glosario Técnico",
      items: [
        {
          id: "token",
          q: '¿Qué es un "token"?',
          answer:
            "Un token es la unidad de texto más pequeña que procesa un LLM. Todos los precios de LLMs se expresan en tokens — no en palabras, oraciones o caracteres:",
          bullets: [
            "1 token ≈ ¾ de una palabra en español, ≈ 4 caracteres.",
            '"Hola mundo" = 2 tokens. "Supercalifragilístico" ≈ 8 tokens.',
            "El código y los idiomas no latinos (chino, árabe) consumen muchos más tokens por carácter.",
            "Regla general: 1.000 tokens ≈ 750 palabras ≈ 1,5 páginas a doble espacio.",
            "Un PDF de 10 páginas equivale aproximadamente a 3.000–5.000 tokens.",
          ],
          tip: "Usa la herramienta de tokenización del proveedor antes de estimar costos. El conteo varía significativamente por idioma y tipo de contenido.",
        },
        {
          id: "ttft",
          q: "¿Qué significa TTFT (Time to First Token)?",
          answer:
            "El TTFT es el tiempo transcurrido desde que envías una solicitud hasta que recibes el primer token de la respuesta:",
          bullets: [
            "Se mide en milisegundos (ms). Rango habitual: 200–2.000ms según el modelo y la carga del servidor.",
            "Componentes: viaje de red + cola del servidor + procesamiento del prompt + generación del primer token.",
            "Menos de 300ms se siente instantáneo; más de 1.000ms se siente lento en interfaces interactivas.",
            "Prompts más largos generalmente aumentan el TTFT.",
            "Métrica clave para: chatbots, asistentes de voz, autocompletado de código en tiempo real.",
          ],
          tip: "Despliega tu backend en la misma región de nube que el endpoint del LLM para reducir la latencia de red.",
        },
        {
          id: "tps",
          q: "¿Qué es TPS (Tokens por Segundo)?",
          answer:
            "TPS mide la velocidad con la que el modelo genera tokens de salida tras emitir el primer token:",
          bullets: [
            "Rango habitual: 30–150 TPS según el tamaño del modelo y el hardware del servidor.",
            "Mayor TPS = menor tiempo total de respuesta, especialmente visible en respuestas de más de 500 tokens.",
            "El TPS se degrada bajo alta carga en endpoints de inferencia compartida.",
            "Las instancias auto-alojadas en GPUs dedicadas ofrecen un rendimiento más estable y predecible.",
            "TPS y TTFT son independientes: inicio rápido (TTFT bajo) + generación lenta (TPS bajo) es común en modelos grandes.",
          ],
        },
        {
          id: "function-calling",
          q: "¿Qué es la llamada a funciones (tool use)?",
          answer:
            "La llamada a funciones permite al modelo invocar herramientas o APIs externas durante su proceso de razonamiento, siendo el fundamento de los agentes LLM:",
          bullets: [
            "Declaras las herramientas disponibles mediante un esquema JSON (nombre, descripción, tipos de parámetros).",
            "El modelo señala qué herramienta llamar y con qué argumentos — tu código la ejecuta realmente.",
            "Devuelves el resultado de la herramienta al modelo, que lo incorpora en su respuesta.",
            "Herramientas comunes: búsqueda web, consultas a bases de datos, intérprete de código, APIs REST.",
            "Compatible con: GPT-4o, Claude 3.x, Gemini 1.5+, Mistral Large, Llama 3.1+.",
          ],
          tip: "Las descripciones de herramientas claras y específicas son fundamentales. La capacidad del modelo para llamarlas correctamente depende directamente de cómo las describes.",
        },
        {
          id: "fine-tuning",
          q: "¿Qué es el fine-tuning y cuándo debo usarlo?",
          answer:
            "El fine-tuning actualiza los pesos del modelo base con tus propios datos de entrenamiento, adaptando permanentemente su comportamiento y estilo:",
          bullets: [
            "✅ Ideal para: tono/voz consistentes, formatos específicos del dominio, estandarización de estructura de salida.",
            "❌ Evitar para: agregar conocimiento factual nuevo — usa RAG para conocimiento actualizado del dominio.",
            "Requiere cientos a miles de pares de ejemplo etiquetados (prompt → respuesta ideal).",
            "Los modelos con fine-tuning cuestan 1,5–3× más por token que los modelos base.",
            "Cualquier cambio en los requisitos necesita un nuevo ciclo de entrenamiento — RAG es mucho más fácil de actualizar.",
          ],
          tip: "Agota primero la ingeniería de prompts y el RAG. El fine-tuning es el último recurso, no el primer instinto.",
        },
        {
          id: "rag",
          q: "¿Qué es RAG (Retrieval-Augmented Generation)?",
          answer:
            "El RAG inyecta conocimiento externo relevante en el prompt del modelo en tiempo de solicitud usando búsqueda vectorial semántica, sin reentrenar el modelo:",
          bullets: [
            "1. Documentos → divididos en fragmentos → convertidos a embeddings (vectores numéricos densos).",
            "2. Embeddings almacenados en una base de datos vectorial (pgvector, Pinecone, Chroma, Weaviate).",
            "3. En consulta: pregunta del usuario → embebida → busca fragmentos más cercanos por similitud coseno.",
            "4. Los fragmentos recuperados se añaden al prompt como contexto antes de que el modelo responda.",
            "Mucho más económico y fácil de actualizar que el fine-tuning — solo re-embebe los documentos cambiados.",
          ],
          tip: "Usa un modelo de embeddings pequeño (ej: text-embedding-3-small a $0,02/1M tokens) — no un modelo generativo grande — para el paso de embedding.",
        },
        {
          id: "streaming",
          q: "¿Qué es el streaming y por qué debería usarlo siempre?",
          answer:
            "El streaming entrega la respuesta del modelo token por token vía Server-Sent Events (SSE) a medida que se genera, en lugar de esperar la respuesta completa:",
          bullets: [
            'Reduce la latencia percibida de "tiempo de respuesta completa" a "tiempo al primer token" — mejora de UX de 10–30×.',
            "Compatible con todos los principales proveedores: OpenAI, Anthropic, Google, Mistral, Cohere.",
            "Mismo costo que sin streaming — se factura por tokens usados, no por duración de la solicitud.",
            "Habilita animaciones de escritura, actualizaciones de UI en tiempo real y recuperación temprana de errores.",
            "El modo sin streaming es más simple para pipelines en lotes donde no hay usuario esperando.",
          ],
          tip: "Activa siempre el streaming en interfaces de usuario. Usa el modo no-streaming solo para pipelines en segundo plano.",
        },
      ],
    },
    {
      id: "api-diagram",
      icon: "🔌",
      title: "Cómo Funcionan las APIs LLM",
      items: [
        {
          id: "api-flow",
          q: "¿Cómo funciona una llamada completa a una API LLM, desde la solicitud hasta la respuesta?",
          answer:
            "Cada solicitud de completado de chat sigue el mismo ciclo de vida sobre HTTPS. Entender este flujo te ayuda a estimar costos, depurar errores y diseñar aplicaciones eficientes:",
          diagram: true,
        },
      ],
    },
  ],

  // ─────────────────────────────────────────── FRANÇAIS ─────────────────────
  fr: [
    {
      id: "decision",
      icon: "🎯",
      title: "Choisir le Bon Modèle",
      items: [
        {
          id: "key-factors",
          q: "Quels facteurs clés évaluer pour choisir un LLM ?",
          answer:
            "Six dimensions déterminent quel LLM convient à votre cas d'usage. Les évaluer dans l'ordre élimine rapidement les mauvais choix :",
          bullets: [
            "💰 Coût — Prix d'entrée vs. sortie par 1M tokens. Les tokens de sortie sont 3–10× plus chers.",
            "📏 Fenêtre de contexte — Nombre maximum de tokens traités par requête (entrée + sortie combinés).",
            "⚡ Latence — TTFT pour le chat interactif ; TPS pour le traitement par lots.",
            "🧠 Capacités — Vision, appel de fonctions, raisonnement, génération de code, fine-tuning.",
            "🔒 Confidentialité — Les APIs cloud envoient les données chez un tiers ; les modèles locaux restent sur votre matériel.",
            "🔗 Fiabilité — SLA de disponibilité, limites de requêtes, maturité du SDK et engagement fournisseur.",
          ],
          tip: "Commencez par coût × fenêtre de contexte. Ces deux critères éliminent 80% des incompatibilités avant de comparer les capacités.",
        },
        {
          id: "input-output-pricing",
          q: "Quelle est la différence entre le prix des tokens d'entrée et de sortie ?",
          answer:
            "Chaque appel API génère deux coûts distincts, tous deux mesurés par million de tokens :",
          bullets: [
            "Tokens d'entrée : tout ce que vous envoyez — prompt système + historique + message utilisateur.",
            "Tokens de sortie : ce que le modèle génère — la réponse, le texte produit.",
            "La sortie est généralement 3–10× plus chère (ex : GPT-4o : $2,50 entrée / $10,00 sortie par 1M tokens).",
            "Les longs historiques de chat font dominer le coût d'entrée ; les tâches de génération font dominer la sortie.",
            "Définir max_tokens contrôle la dépense maximale de sortie par requête.",
          ],
          tip: "Configurez max_tokens de manière conservatrice. Limiter à 500 tokens peut réduire votre facture de 60–80% dans les apps de chat.",
        },
        {
          id: "context-window",
          q: "Comment la taille de la fenêtre de contexte influence-t-elle mon choix ?",
          answer:
            "La fenêtre de contexte définit le volume maximal de texte que le modèle peut traiter en une requête — entrée et sortie combinées :",
          bullets: [
            "8K tokens — Chatbots simples, Q&R courtes, complétions de code.",
            "32K tokens — Q&R documentaires, conversations longues, revue de code.",
            "128K tokens — Documents juridiques, grandes bases de code, résumés de rapports.",
            "200K+ tokens — Livres entiers, analyse multi-fichiers, agents autonomes complexes.",
          ],
          tip: "Vous êtes facturé pour le contexte complet à chaque appel. Résumez périodiquement les longues conversations pour réduire les coûts.",
        },
        {
          id: "latency",
          q: "Quand la latence est-elle importante et quelle métrique mesurer ?",
          answer:
            "La latence comporte deux métriques indépendantes pertinentes pour des scénarios très différents :",
          bullets: [
            "TTFT — ms jusqu'au premier caractère. Métrique UX dominante pour le chat en streaming (cible < 500ms).",
            "TPS — vitesse de génération après le premier token. Détermine le temps de réponse total.",
            "Apps de chat temps réel : optimisez le TTFT avec streaming activé.",
            "Pipelines par lots : optimisez TPS et coût ; le TTFT est sans importance.",
            "Agents autonomes : les deux comptent — chaque appel séquentiel accumule la latence.",
          ],
          tip: "Mesurez toujours dans votre région de déploiement réelle, pas dans la région de référence du fournisseur.",
        },
        {
          id: "cloud-vs-local",
          q: "API cloud ou modèle auto-hébergé : que choisir ?",
          answer:
            "Les deux sont des options valides en production. Le bon choix dépend du volume, des exigences de confidentialité et de la capacité opérationnelle de votre équipe :",
          bullets: [
            "☁️ APIs cloud — Modèles état de l'art, zéro infrastructure, facturation par token, scalabilité instantanée. Les données quittent votre réseau.",
            "🖥️ Auto-hébergé — Confidentialité totale, pas de coût par appel après l'investissement matériel. Nécessite GPU + maintenance.",
            "Choisissez le cloud pour : le prototypage, la charge variable, les industries réglementées.",
            "Choisissez l'auto-hébergement pour : >10M tokens/jour, souveraineté stricte des données, environnements isolés.",
          ],
        },
      ],
    },
    {
      id: "glossary",
      icon: "📖",
      title: "Glossaire Technique",
      items: [
        {
          id: "token",
          q: "Qu'est-ce qu'un « token » ?",
          answer:
            "Un token est la plus petite unité de texte traitée par un LLM. Tous les prix sont exprimés en tokens — pas en mots, phrases ou caractères :",
          bullets: [
            "1 token ≈ ¾ d'un mot en français, ≈ 4 caractères.",
            '"Bonjour monde" = 3 tokens. Un mot long comme "anticonstitutionnellement" ≈ 8 tokens.',
            "Le code et les langues non-latines (chinois, arabe) consomment beaucoup plus de tokens par caractère.",
            "Règle générale : 1 000 tokens ≈ 750 mots ≈ 1,5 page à double interligne.",
            "Un PDF de 10 pages représente environ 3 000–5 000 tokens.",
          ],
          tip: "Utilisez l'outil de tokenisation du fournisseur avant d'estimer les coûts. Le nombre de tokens varie selon la langue et le contenu.",
        },
        {
          id: "ttft",
          q: "Que signifie TTFT (Time to First Token) ?",
          answer:
            "Le TTFT est le temps écoulé entre l'envoi d'une requête et la réception du tout premier token de réponse :",
          bullets: [
            "Mesuré en millisecondes (ms). Plage courante : 200–2 000ms selon le modèle et la charge.",
            "Composants : aller-retour réseau + file d'attente serveur + traitement du prompt + génération du premier token.",
            "Sous 300ms : ressenti comme instantané ; au-delà de 1 000ms : perçu comme lent.",
            "Des prompts plus longs augmentent généralement le TTFT.",
            "Métrique clé pour : chatbots, assistants vocaux, complétion de code en temps réel.",
          ],
          tip: "Déployez votre backend dans la même région cloud que l'endpoint LLM pour minimiser la latence réseau.",
        },
        {
          id: "tps",
          q: "Qu'est-ce que le TPS (Tokens par Seconde) ?",
          answer:
            "Le TPS mesure la vitesse à laquelle le modèle génère des tokens de sortie après l'émission du premier token :",
          bullets: [
            "Plage courante : 30–150 TPS selon la taille du modèle et le matériel.",
            "TPS plus élevé = temps de réponse total plus court, surtout visible sur les réponses longues.",
            "Le TPS se dégrade sous haute charge sur les endpoints d'inférence partagés.",
            "Les instances auto-hébergées sur GPU dédié offrent un débit plus stable.",
          ],
        },
        {
          id: "function-calling",
          q: "Qu'est-ce que l'appel de fonctions (tool use) ?",
          answer:
            "L'appel de fonctions permet au modèle d'invoquer des outils ou APIs externes pendant son raisonnement, constituant la base des agents LLM :",
          bullets: [
            "Vous déclarez les outils disponibles via un schéma JSON (nom, description, types de paramètres).",
            "Le modèle indique quel outil appeler et avec quels arguments — votre code l'exécute réellement.",
            "Vous retournez le résultat au modèle, qui l'intègre dans sa réponse.",
            "Outils courants : recherche web, requêtes BDD, interprète de code, APIs REST.",
            "Pris en charge par : GPT-4o, Claude 3.x, Gemini 1.5+, Mistral Large.",
          ],
          tip: "Des descriptions d'outils claires et précises sont essentielles. La capacité du modèle à les appeler correctement en dépend entièrement.",
        },
        {
          id: "fine-tuning",
          q: "Qu'est-ce que le fine-tuning et quand l'utiliser ?",
          answer:
            "Le fine-tuning met à jour les poids du modèle de base avec vos données d'entraînement, adaptant définitivement son comportement :",
          bullets: [
            "✅ Idéal pour : ton/voix cohérents, formatage spécifique au domaine, standardisation de la structure de sortie.",
            "❌ À éviter pour : l'ajout de connaissances factuelles — utilisez le RAG à la place.",
            "Nécessite des centaines à milliers de paires d'exemples étiquetées.",
            "Les modèles fine-tunés coûtent 1,5–3× plus cher par token.",
            "Tout changement d'exigences nécessite un nouvel entraînement — le RAG est bien plus facile à mettre à jour.",
          ],
          tip: "Épuisez d'abord le prompt engineering et le RAG. Le fine-tuning est le dernier recours.",
        },
        {
          id: "rag",
          q: "Qu'est-ce que le RAG (Retrieval-Augmented Generation) ?",
          answer:
            "Le RAG injecte des connaissances externes pertinentes dans le prompt via une recherche vectorielle sémantique, sans réentraîner le modèle :",
          bullets: [
            "1. Documents → découpés en chunks → convertis en embeddings (vecteurs denses).",
            "2. Embeddings stockés dans une base vectorielle (pgvector, Pinecone, Chroma).",
            "3. À la requête : question utilisateur → embeddée → chunks similaires trouvés par similarité cosinus.",
            "4. Chunks récupérés ajoutés au prompt comme contexte avant la génération.",
            "Bien moins cher et plus facile à mettre à jour que le fine-tuning.",
          ],
          tip: "Utilisez un modèle d'embedding petit et économique (ex : text-embedding-3-small à 0,02$/1M tokens).",
        },
        {
          id: "streaming",
          q: "Qu'est-ce que le streaming et pourquoi l'utiliser ?",
          answer:
            "Le streaming délivre la réponse token par token via Server-Sent Events (SSE) au fur et à mesure de la génération, sans attendre la réponse complète :",
          bullets: [
            'Réduit la latence perçue de "temps de réponse complet" à "premier token" — amélioration UX de 10–30×.',
            "Pris en charge par tous les grands fournisseurs : OpenAI, Anthropic, Google, Mistral, Cohere.",
            "Même coût que sans streaming — facturation par tokens utilisés.",
            "Active les animations de frappe, mises à jour UI en temps réel et récupération d'erreurs précoce.",
          ],
          tip: "Activez toujours le streaming pour les interfaces utilisateur. Réservez le mode non-streaming aux pipelines en arrière-plan.",
        },
      ],
    },
    {
      id: "api-diagram",
      icon: "🔌",
      title: "Comment Fonctionnent les APIs LLM",
      items: [
        {
          id: "api-flow",
          q: "Comment fonctionne un appel API LLM complet, de la requête à la réponse ?",
          answer:
            "Chaque requête de complétion suit le même cycle de vie via HTTPS. Comprendre ce flux aide à estimer les coûts, déboguer les erreurs et concevoir des applications efficaces :",
          diagram: true,
        },
      ],
    },
  ],

  // ──────────────────────────────────────── PORTUGUÊS ───────────────────────
  pt: [
    {
      id: "decision",
      icon: "🎯",
      title: "Como Escolher o Modelo Certo",
      items: [
        {
          id: "key-factors",
          q: "Quais fatores-chave devo avaliar ao selecionar um LLM?",
          answer:
            "Seis dimensões determinam qual LLM se adapta melhor ao seu caso de uso. Avaliá-las em ordem elimina rapidamente as opções inadequadas:",
          bullets: [
            "💰 Custo — Preço de entrada vs. saída por 1M tokens. Tokens de saída são tipicamente 3–10× mais caros.",
            "📏 Janela de contexto — Máximo de tokens processados por requisição (entrada + saída combinados).",
            "⚡ Latência — TTFT para chat interativo; TPS para processamento em lote.",
            "🧠 Capacidades — Visão, chamada de funções, raciocínio, geração de código, suporte a fine-tuning.",
            "🔒 Privacidade — APIs na nuvem enviam dados a terceiros; modelos locais permanecem no seu hardware.",
            "🔗 Confiabilidade — SLAs de disponibilidade, limites de requisições, maturidade do SDK e compromisso do fornecedor.",
          ],
          tip: "Comece por custo × janela de contexto. Só esses dois eliminam 80% das incompatibilidades antes de comparar capacidades.",
        },
        {
          id: "input-output-pricing",
          q: "Qual a diferença entre o preço de tokens de entrada e saída?",
          answer:
            "Cada chamada à API gera dois custos separados, ambos medidos por milhão de tokens:",
          bullets: [
            "Tokens de entrada: tudo o que você envia — prompt do sistema + histórico + mensagem do usuário.",
            "Tokens de saída: o que o modelo gera — a resposta ou conteúdo gerado.",
            "A saída é geralmente 3–10× mais cara (ex: GPT-4o: $2,50 entrada / $10,00 saída por 1M tokens).",
            "Históricos longos de chat fazem o custo de entrada dominar; tarefas gerativas fazem a saída dominar.",
            "Definir max_tokens controla o gasto máximo de saída por requisição.",
          ],
          tip: "Configure max_tokens de forma conservadora. Limitá-lo a 500 tokens pode reduzir sua fatura em 60–80% em aplicações de chat.",
        },
        {
          id: "context-window",
          q: "Como o tamanho da janela de contexto afeta qual modelo eu preciso?",
          answer:
            "A janela de contexto define a quantidade máxima de texto que o modelo pode processar em uma única requisição — entrada e saída combinadas:",
          bullets: [
            "8K tokens — Chatbots simples, perguntas e respostas curtas, completações de código.",
            "32K tokens — Q&A sobre documentos, conversas longas, revisão de código.",
            "128K tokens — Documentos jurídicos, grandes bases de código, resumos de relatórios.",
            "200K+ tokens — Livros inteiros, análise multi-arquivo, agentes autônomos complexos.",
          ],
          tip: "Você é cobrado pelo contexto completo em cada chamada. Resuma periodicamente conversas longas para manter o contexto pequeno e os custos baixos.",
        },
        {
          id: "latency",
          q: "Quando a latência importa e qual métrica devo medir?",
          answer:
            "A latência tem duas métricas independentes que importam para cenários muito diferentes:",
          bullets: [
            "TTFT — ms até o primeiro caractere. Métrica UX dominante para chat com streaming (alvo < 500ms).",
            "TPS — velocidade de geração após o primeiro token. Determina o tempo total de resposta.",
            "Apps de chat em tempo real: otimize o TTFT com streaming ativado.",
            "Pipelines em lote: otimize TPS e custo; o TTFT é irrelevante.",
            "Agentes autônomos: ambos importam — cada chamada sequencial acumula latência.",
          ],
          tip: "Sempre meça na sua região de produção real, não na região de referência do fornecedor.",
        },
        {
          id: "cloud-vs-local",
          q: "Devo usar uma API na nuvem ou hospedar um modelo próprio?",
          answer:
            "Ambas são opções válidas para produção. A escolha certa depende do volume, requisitos de privacidade e capacidade operacional do seu time:",
          bullets: [
            "☁️ APIs na nuvem — Modelos de última geração, sem infraestrutura, faturamento por token, escalabilidade instantânea. Dados saem da sua rede.",
            "🖥️ Auto-hospedado — Privacidade total, sem custo por chamada após o hardware. Requer GPU + manutenção.",
            "Escolha nuvem para: prototipagem, carga variável, indústrias regulamentadas.",
            "Escolha auto-hospedado para: >10M tokens/dia com carga previsível, soberania de dados estrita, ambientes isolados.",
          ],
        },
      ],
    },
    {
      id: "glossary",
      icon: "📖",
      title: "Glossário Técnico",
      items: [
        {
          id: "token",
          q: 'O que é um "token"?',
          answer:
            "Um token é a menor unidade de texto que um LLM processa. Todos os preços são expressos em tokens — não em palavras, frases ou caracteres:",
          bullets: [
            "1 token ≈ ¾ de uma palavra em português, ≈ 4 caracteres.",
            '"Olá mundo" = 2 tokens. "Anticonstitucionalíssimo" ≈ 10 tokens.',
            "Código e scripts não-latinos (chinês, árabe) consomem muito mais tokens por caractere.",
            "Regra geral: 1.000 tokens ≈ 750 palavras ≈ 1,5 páginas com espaçamento duplo.",
            "Um PDF de 10 páginas equivale a aproximadamente 3.000–5.000 tokens.",
          ],
          tip: "Use a ferramenta de tokenização do fornecedor antes de estimar custos. A contagem varia significativamente por idioma e tipo de conteúdo.",
        },
        {
          id: "ttft",
          q: "O que significa TTFT (Time to First Token)?",
          answer:
            "TTFT é o tempo decorrido desde o envio de uma requisição até o recebimento do primeiro token da resposta:",
          bullets: [
            "Medido em milissegundos (ms). Intervalo comum: 200–2.000ms conforme modelo e carga.",
            "Componentes: ida e volta de rede + fila do servidor + processamento do prompt + geração do primeiro token.",
            "Abaixo de 300ms parece instantâneo; acima de 1.000ms parece lento em interfaces interativas.",
            "Prompts mais longos geralmente aumentam o TTFT.",
            "Métrica-chave para: chatbots, assistentes de voz, autocompletar código em tempo real.",
          ],
          tip: "Implante seu backend na mesma região de nuvem que o endpoint do LLM para minimizar a latência de rede.",
        },
        {
          id: "tps",
          q: "O que é TPS (Tokens por Segundo)?",
          answer:
            "TPS mede a velocidade com que o modelo gera tokens de saída após emitir o primeiro token:",
          bullets: [
            "Intervalo comum: 30–150 TPS conforme tamanho do modelo e hardware do servidor.",
            "TPS mais alto = menor tempo total de resposta, especialmente visível em respostas longas.",
            "TPS degrada sob alta carga em endpoints de inferência compartilhada.",
            "Instâncias auto-hospedadas em GPUs dedicadas oferecem throughput mais estável.",
          ],
        },
        {
          id: "function-calling",
          q: "O que é chamada de funções (tool use)?",
          answer:
            "A chamada de funções permite ao modelo invocar ferramentas ou APIs externas durante seu processo de raciocínio, sendo a base dos agentes LLM:",
          bullets: [
            "Você declara ferramentas disponíveis via esquema JSON (nome, descrição, tipos de parâmetros).",
            "O modelo indica qual ferramenta chamar e com quais argumentos — seu código a executa.",
            "Você retorna o resultado ao modelo, que o incorpora na sua resposta.",
            "Ferramentas comuns: busca na web, consultas a banco de dados, interpretador de código, APIs REST.",
            "Suportado por: GPT-4o, Claude 3.x, Gemini 1.5+, Mistral Large, Llama 3.1+.",
          ],
          tip: "Descrições de ferramentas claras e específicas são fundamentais. A capacidade do modelo de chamá-las corretamente depende completamente de como você as descreve.",
        },
        {
          id: "fine-tuning",
          q: "O que é fine-tuning e quando devo usá-lo?",
          answer:
            "O fine-tuning atualiza os pesos do modelo base com seus próprios dados de treinamento, adaptando permanentemente seu comportamento:",
          bullets: [
            "✅ Ideal para: tom/voz consistentes, formatação específica do domínio, padronização da estrutura de saída.",
            "❌ Evitar para: adicionar conhecimento factual — use RAG para conhecimento do domínio atualizado.",
            "Requer centenas a milhares de pares de exemplos rotulados (prompt → resposta ideal).",
            "Modelos com fine-tuning custam 1,5–3× mais por token que modelos base.",
            "Qualquer mudança nos requisitos exige novo ciclo de treinamento — RAG é muito mais fácil de atualizar.",
          ],
          tip: "Esgote primeiro prompt engineering e RAG. Fine-tuning é o último recurso, não o primeiro instinto.",
        },
        {
          id: "rag",
          q: "O que é RAG (Retrieval-Augmented Generation)?",
          answer:
            "O RAG injeta conhecimento externo relevante no prompt do modelo em tempo de requisição usando busca vetorial semântica, sem retreinar o modelo:",
          bullets: [
            "1. Documentos → divididos em chunks → convertidos em embeddings (vetores densos).",
            "2. Embeddings armazenados em banco de dados vetorial (pgvector, Pinecone, Chroma, Weaviate).",
            "3. Na consulta: pergunta do usuário → embeddada → chunks mais próximos por similaridade de cosseno.",
            "4. Chunks recuperados adicionados ao prompt como contexto antes da geração.",
            "Muito mais barato e fácil de atualizar que fine-tuning — apenas re-embedde documentos alterados.",
          ],
          tip: "Use um modelo de embedding pequeno (ex: text-embedding-3-small a $0,02/1M tokens) — não um modelo generativo grande — para o passo de embedding.",
        },
        {
          id: "streaming",
          q: "O que é streaming e por que devo usá-lo?",
          answer:
            "Streaming entrega a resposta do modelo token por token via Server-Sent Events (SSE) à medida que é gerada, sem esperar pela resposta completa:",
          bullets: [
            'Reduz a latência percebida de "tempo de resposta completo" a "primeiro token" — melhoria de UX de 10–30×.',
            "Suportado por todos os principais provedores: OpenAI, Anthropic, Google, Mistral, Cohere.",
            "Mesmo custo que sem streaming — cobrado por tokens usados, não por duração.",
            "Habilita animações de digitação, atualizações de UI em tempo real e recuperação antecipada de erros.",
          ],
          tip: "Sempre ative streaming em interfaces de usuário. Reserve o modo não-streaming para pipelines em segundo plano.",
        },
      ],
    },
    {
      id: "api-diagram",
      icon: "🔌",
      title: "Como Funcionam as APIs LLM",
      items: [
        {
          id: "api-flow",
          q: "Como funciona uma chamada completa de API LLM, da requisição à resposta?",
          answer:
            "Cada requisição de completação segue o mesmo ciclo de vida via HTTPS. Entender esse fluxo ajuda a estimar custos, depurar erros e projetar aplicações eficientes:",
          diagram: true,
        },
      ],
    },
  ],
};
