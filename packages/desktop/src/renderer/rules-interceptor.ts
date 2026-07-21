const STORAGE_KEY = "cloudcode.rules.v1"
const MARKER = "<cloudcode-model-rules>"

type StoredRule = {
  name?: unknown
  content?: unknown
  enabled?: unknown
  allModels?: unknown
  models?: unknown
}

function rulesForModel(providerID: string, modelID: string) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return

    const key = `${providerID}/${modelID}`
    const rules = parsed.flatMap((value): { name: string; content: string }[] => {
      if (!value || typeof value !== "object" || Array.isArray(value)) return []

      const rule = value as StoredRule
      if (rule.enabled === false) return []
      if (typeof rule.content !== "string" || !rule.content.trim()) return []

      const models = Array.isArray(rule.models)
        ? rule.models.filter((item): item is string => typeof item === "string")
        : []
      const allModels = typeof rule.allModels === "boolean" ? rule.allModels : models.length === 0
      if (!allModels && !models.includes(key)) return []

      return [
        {
          name: typeof rule.name === "string" && rule.name.trim() ? rule.name.trim() : "Untitled rule",
          content: rule.content.trim(),
        },
      ]
    })

    if (rules.length === 0) return

    return `${MARKER}
These are user-configured, model-specific system instructions. Follow every enabled rule below.

${rules.map((rule, index) => `Rule ${index + 1}: ${rule.name}\n${rule.content}`).join("\n\n")}
</cloudcode-model-rules>`
  } catch {
    return
  }
}

function isPromptRequest(url: string, method: string) {
  if (method.toUpperCase() !== "POST") return false

  try {
    const path = new URL(url, window.location.href).pathname
    return /\/session\/[^/]+\/(?:prompt_async|message)$/.test(path)
  } catch {
    return false
  }
}

function addRules(body: string) {
  try {
    const parsed = JSON.parse(body) as {
      model?: { providerID?: unknown; modelID?: unknown }
      system?: unknown
    }

    const providerID = parsed.model?.providerID
    const modelID = parsed.model?.modelID
    if (typeof providerID !== "string" || typeof modelID !== "string") return body

    const rules = rulesForModel(providerID, modelID)
    if (!rules) return body

    const current = typeof parsed.system === "string" ? parsed.system.trim() : ""
    if (current.includes(MARKER)) return body

    parsed.system = current ? `${current}\n\n${rules}` : rules
    return JSON.stringify(parsed)
  } catch {
    return body
  }
}

const originalFetch = window.fetch.bind(window)

window.fetch = async (input: RequestInfo | URL, init?: RequestInit) => {
  if (input instanceof Request) {
    if (!isPromptRequest(input.url, input.method)) return originalFetch(input)

    const body = await input
      .clone()
      .text()
      .catch(() => "")
    if (!body) return originalFetch(input)

    const next = addRules(body)
    if (next === body) return originalFetch(input)

    return originalFetch(new Request(input, { body: next }))
  }

  const url = input.toString()
  const method = init?.method ?? "GET"
  if (!isPromptRequest(url, method) || typeof init?.body !== "string") {
    return originalFetch(input, init)
  }

  const body = addRules(init.body)
  if (body === init.body) return originalFetch(input, init)

  return originalFetch(input, { ...init, body })
}
