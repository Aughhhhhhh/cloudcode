import { ButtonV2 } from "@opencode-ai/ui/v2/button-v2"
import { Switch } from "@opencode-ai/ui/v2/switch-v2"
import { TextInputV2 } from "@opencode-ai/ui/v2/text-input-v2"
import { type Component, For, Index, Show, createMemo, createSignal, onCleanup } from "solid-js"
import { useModels } from "@/context/models"
import {
  createModelRule,
  duplicateModelRule,
  modelRuleKey,
  readModelRules,
  subscribeModelRules,
  type ModelRule,
  writeModelRules,
} from "@/features/rules/store"
import "./settings-v2.css"

type ModelOption = {
  key: string
  name: string
  provider: string
}

export const SettingsRulesV2: Component = () => {
  const models = useModels()
  const [rules, setRules] = createSignal(readModelRules())
  const [picker, setPicker] = createSignal<string>()
  const [modelSearch, setModelSearch] = createSignal("")

  const unsubscribe = subscribeModelRules(() => setRules(readModelRules()))
  onCleanup(unsubscribe)

  const availableModels = createMemo<ModelOption[]>(() =>
    models
      .list()
      .map((item) => ({
        key: modelRuleKey(item.provider.id, item.id),
        name: item.name,
        provider: item.provider.name,
      }))
      .toSorted((a, b) => a.provider.localeCompare(b.provider) || a.name.localeCompare(b.name)),
  )

  const filteredModels = createMemo(() => {
    const query = modelSearch().trim().toLowerCase()
    if (!query) return availableModels()
    return availableModels().filter((item) =>
      `${item.provider} ${item.name} ${item.key}`.toLowerCase().includes(query),
    )
  })

  const persist = (next: ModelRule[]) => {
    setRules(next)
    writeModelRules(next)
  }

  const update = (id: string, patch: Partial<ModelRule>) => {
    const now = Date.now()
    persist(rules().map((rule) => (rule.id === id ? { ...rule, ...patch, updatedAt: now } : rule)))
  }

  const add = () => {
    const rule = createModelRule()
    persist([...rules(), rule])
    setPicker(rule.id)
    setModelSearch("")
  }

  const duplicate = (rule: ModelRule) => {
    const copy = duplicateModelRule(rule)
    const index = rules().findIndex((item) => item.id === rule.id)
    const next = rules().slice()
    next.splice(index + 1, 0, copy)
    persist(next)
  }

  const remove = (rule: ModelRule) => {
    persist(rules().filter((item) => item.id !== rule.id))
    if (picker() === rule.id) setPicker()
  }

  const togglePicker = (id: string) => {
    setPicker((current) => (current === id ? undefined : id))
    setModelSearch("")
  }

  const toggleModel = (rule: ModelRule, key: string) => {
    const selected = rule.models.includes(key)
    update(rule.id, {
      allModels: false,
      models: selected ? rule.models.filter((item) => item !== key) : [...rule.models, key],
    })
  }

  const scopeLabel = (rule: ModelRule) => {
    if (rule.allModels) return "All models"
    if (rule.models.length === 0) return "No models"
    if (rule.models.length === 1) {
      const item = availableModels().find((model) => model.key === rule.models[0])
      return item ? item.name : rule.models[0]
    }
    return `${rule.models.length} models`
  }

  return (
    <>
      <div class="settings-v2-tab-header settings-v2-tab-header--stacked">
        <div class="settings-v2-tab-header-row">
          <div class="flex min-w-0 flex-col gap-2">
            <h2 class="settings-v2-tab-title">Rules</h2>
            <p class="text-[13px] leading-5 text-v2-text-text-muted">
              Add reusable instructions and choose which models receive them. Rules are stored inside CloudCode.
            </p>
          </div>
          <ButtonV2 type="button" size="small" onClick={add}>
            Add rule
          </ButtonV2>
        </div>
      </div>

      <div class="settings-v2-tab-body gap-4">
        <Show
          when={rules().length > 0}
          fallback={
            <div class="flex flex-col items-center justify-center gap-3 py-16 text-center">
              <span class="text-[13px] font-medium text-v2-text-text-base">No rules yet</span>
              <span class="max-w-80 text-[13px] leading-5 text-v2-text-text-muted">
                Create a rule, write its instructions, then assign it to every model or only selected models.
              </span>
              <ButtonV2 type="button" size="small" variant="outline" onClick={add}>
                Create your first rule
              </ButtonV2>
            </div>
          }
        >
          <Index each={rules()}>
            {(rule) => (
              <section
                class="rounded-lg bg-v2-background-bg-layer-01 p-5"
                style={{ "box-shadow": "inset 0 0 0 0.5px var(--v2-border-border-muted)" }}
              >
                <div class="flex flex-wrap items-center gap-3">
                  <div class="min-w-48 flex-1">
                    <TextInputV2
                      appearance="base"
                      value={rule().name}
                      placeholder="Rule name"
                      spellcheck={false}
                      onInput={(event) => update(rule().id, { name: event.currentTarget.value })}
                    />
                  </div>

                  <Switch
                    checked={rule().enabled}
                    hideLabel
                    onChange={(checked) => update(rule().id, { enabled: checked })}
                  >
                    Enable {rule().name || "rule"}
                  </Switch>

                  <ButtonV2 type="button" size="small" variant="ghost-muted" onClick={() => duplicate(rule())}>
                    Duplicate
                  </ButtonV2>
                  <ButtonV2 type="button" size="small" variant="ghost-muted" onClick={() => remove(rule())}>
                    Delete
                  </ButtonV2>
                </div>

                <textarea
                  class="mt-4 min-h-36 w-full resize-y rounded-md bg-v2-background-bg-base px-3 py-2 font-mono text-[13px] leading-5 text-v2-text-text-base outline-none"
                  style={{ border: "0.5px solid var(--v2-border-border-muted)" }}
                  value={rule().content}
                  placeholder="Write the instructions this model should follow..."
                  spellcheck={false}
                  onInput={(event) => update(rule().id, { content: event.currentTarget.value })}
                />

                <div class="mt-3 flex flex-wrap items-center justify-between gap-3">
                  <div class="flex items-center gap-2">
                    <span class="text-[12px] text-v2-text-text-muted">Applies to</span>
                    <ButtonV2
                      type="button"
                      size="small"
                      variant="outline"
                      onClick={() => togglePicker(rule().id)}
                    >
                      {scopeLabel(rule())}
                    </ButtonV2>
                  </div>
                  <span class="text-[12px] text-v2-text-text-faint">
                    About {Math.ceil(rule().content.length / 4)} tokens
                  </span>
                </div>

                <Show when={picker() === rule().id}>
                  <div
                    class="mt-3 rounded-md bg-v2-background-bg-base p-3"
                    style={{ border: "0.5px solid var(--v2-border-border-muted)" }}
                  >
                    <div class="flex items-center justify-between gap-3 pb-3">
                      <div class="flex flex-col gap-1">
                        <span class="text-[13px] font-medium text-v2-text-text-base">Model assignment</span>
                        <span class="text-[12px] text-v2-text-text-muted">
                          All models overrides the individual selections below.
                        </span>
                      </div>
                      <Switch
                        checked={rule().allModels}
                        hideLabel
                        onChange={(checked) => update(rule().id, { allModels: checked })}
                      >
                        All models
                      </Switch>
                    </div>

                    <TextInputV2
                      type="search"
                      appearance="base"
                      value={modelSearch()}
                      placeholder="Search models"
                      spellcheck={false}
                      onInput={(event) => setModelSearch(event.currentTarget.value)}
                    />

                    <div class="mt-3 max-h-56 overflow-y-auto pr-1">
                      <Show
                        when={filteredModels().length > 0}
                        fallback={<div class="py-6 text-center text-[13px] text-v2-text-text-muted">No models found</div>}
                      >
                        <For each={filteredModels()}>
                          {(model) => (
                            <label
                              class="flex cursor-pointer items-center gap-3 border-b py-2.5 last:border-b-0"
                              style={{ "border-color": "var(--v2-border-border-base)" }}
                            >
                              <input
                                type="checkbox"
                                class="size-4"
                                checked={rule().models.includes(model.key)}
                                disabled={rule().allModels}
                                onChange={() => toggleModel(rule(), model.key)}
                              />
                              <span class="min-w-0 flex-1">
                                <span class="block truncate text-[13px] text-v2-text-text-base">{model.name}</span>
                                <span class="block truncate text-[11px] text-v2-text-text-faint">
                                  {model.provider} Â· {model.key}
                                </span>
                              </span>
                            </label>
                          )}
                        </For>
                      </Show>
                    </div>
                  </div>
                </Show>
              </section>
            )}
          </Index>
        </Show>
      </div>
    </>
  )
}
