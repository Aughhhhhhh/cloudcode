export type ModelRule = {
  id: string
  name: string
  content: string
  enabled: boolean
  allModels: boolean
  models: string[]
  createdAt: number
  updatedAt: number
}

export const MODEL_RULES_STORAGE_KEY = "cloudcode.rules.v1"
const MODEL_RULES_CHANGE_EVENT = "cloudcode:rules-change"

function createID() {
  return globalThis.crypto?.randomUUID?.() ?? `${Date.now().toString(36)}-${Math.random().toString(36).slice(2)}`
}

function normalizeRule(value: unknown, index: number): ModelRule | undefined {
  if (!value || typeof value !== "object" || Array.isArray(value)) return

  const rule = value as Partial<ModelRule>
  const now = Date.now()
  const models = Array.isArray(rule.models) ? rule.models.filter((item): item is string => typeof item === "string") : []

  return {
    id: typeof rule.id === "string" && rule.id ? rule.id : `${createID()}-${index}`,
    name: typeof rule.name === "string" ? rule.name : "Untitled rule",
    content: typeof rule.content === "string" ? rule.content : "",
    enabled: rule.enabled !== false,
    allModels: typeof rule.allModels === "boolean" ? rule.allModels : models.length === 0,
    models,
    createdAt: typeof rule.createdAt === "number" ? rule.createdAt : now,
    updatedAt: typeof rule.updatedAt === "number" ? rule.updatedAt : now,
  }
}

export function readModelRules(): ModelRule[] {
  if (typeof localStorage !== "object") return []

  try {
    const raw = localStorage.getItem(MODEL_RULES_STORAGE_KEY)
    if (!raw) return []

    const parsed = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []

    return parsed.flatMap((item, index) => {
      const rule = normalizeRule(item, index)
      return rule ? [rule] : []
    })
  } catch {
    return []
  }
}

export function writeModelRules(rules: ModelRule[]) {
  if (typeof localStorage !== "object") return

  localStorage.setItem(MODEL_RULES_STORAGE_KEY, JSON.stringify(rules))
  window.dispatchEvent(new CustomEvent(MODEL_RULES_CHANGE_EVENT))
}

export function subscribeModelRules(listener: () => void) {
  const onStorage = (event: StorageEvent) => {
    if (event.key === MODEL_RULES_STORAGE_KEY) listener()
  }

  window.addEventListener(MODEL_RULES_CHANGE_EVENT, listener)
  window.addEventListener("storage", onStorage)

  return () => {
    window.removeEventListener(MODEL_RULES_CHANGE_EVENT, listener)
    window.removeEventListener("storage", onStorage)
  }
}

export function createModelRule(): ModelRule {
  const now = Date.now()
  return {
    id: createID(),
    name: "New rule",
    content: "",
    enabled: true,
    allModels: true,
    models: [],
    createdAt: now,
    updatedAt: now,
  }
}

export function duplicateModelRule(rule: ModelRule): ModelRule {
  const now = Date.now()
  return {
    ...rule,
    id: createID(),
    name: `${rule.name || "Untitled rule"} copy`,
    createdAt: now,
    updatedAt: now,
  }
}

export function modelRuleKey(providerID: string, modelID: string) {
  return `${providerID}/${modelID}`
}
