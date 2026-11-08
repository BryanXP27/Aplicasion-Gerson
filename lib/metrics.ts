const counters: Record<string, number> = {}
const gauges: Record<string, number> = {}
const histograms: Record<string, number[]> = {}

const startTime = Date.now()

function storeKey(name: string, labels: Record<string, string>): string {
  return name + "|" + Object.entries(labels).sort().map(([k, v]) => `${k}=${v}`).join(",")
}

function quoteLabels(raw: string): string {
  if (!raw) return ""
  return raw.replace(/(^|,)([^=]+)=([^,]*)/g, (_, pre, k, v) => `${pre}${k}="${v}"`)
}

export function incrementCounter(name: string, labels: Record<string, string> = {}, value = 1) {
  const key = storeKey(name, labels)
  counters[key] = (counters[key] || 0) + value
}

export function setGauge(name: string, value: number, labels: Record<string, string> = {}) {
  const key = storeKey(name, labels)
  gauges[key] = value
}

export function observeHistogram(name: string, value: number, labels: Record<string, string> = {}) {
  const key = storeKey(name, labels)
  if (!histograms[key]) histograms[key] = []
  histograms[key].push(value)
  if (histograms[key].length > 1000) histograms[key].shift()
}

function escapeLabel(v: string) {
  return v.replace(/\\/g, "\\\\").replace(/"/g, '\\"').replace(/\n/g, "\\n")
}

function formatMapLabels(labels: Record<string, string>): string {
  const entries = Object.entries(labels)
  if (entries.length === 0) return ""
  return "{" + entries.map(([k, v]) => `${k}="${escapeLabel(v)}"`).join(",") + "}"
}

const bucketBounds = [0.005, 0.01, 0.025, 0.05, 0.1, 0.25, 0.5, 1, 2.5, 5, 10]

function formatHistogram(name: string, key: string, values: number[]): string {
  const prefix = name + "_bucket"
  const total = values.length
  const sorted = [...values].sort((a, b) => a - b)
  const rawLabels = key.split("|")[1] || ""
  const qLabels = quoteLabels(rawLabels)
  const sep = qLabels ? "," : ""
  let lines = ""
  let le = 0
  for (const bound of bucketBounds) {
    while (le < total && sorted[le] <= bound) le++
    lines += `${prefix}{${qLabels}${sep}le="${bound}"} ${le}\n`
  }
  lines += `${prefix}{${qLabels}${sep}le="+Inf"} ${total}\n`
  lines += `${name}_count{${qLabels}} ${total}\n`
  const sum = values.reduce((a, b) => a + b, 0)
  lines += `${name}_sum{${qLabels}} ${sum}\n`
  return lines
}

function emitMetric(name: string, rawLabels: string, value: number): string {
  const qLabels = quoteLabels(rawLabels)
  return `${name}${qLabels ? "{" + qLabels + "}" : ""} ${value}`
}

export function generateMetrics(): string {
  const lines: string[] = []

  lines.push("# HELP uptime_seconds Application uptime")
  lines.push("# TYPE uptime_seconds gauge")
  setGauge("uptime_seconds", (Date.now() - startTime) / 1000)

  lines.push("# HELP nodejs_memory_bytes Node.js memory usage")
  lines.push("# TYPE nodejs_memory_bytes gauge")
  const mem = process.memoryUsage()
  lines.push(`nodejs_memory_bytes{type="rss"} ${mem.rss}`)
  lines.push(`nodejs_memory_bytes{type="heapTotal"} ${mem.heapTotal}`)
  lines.push(`nodejs_memory_bytes{type="heapUsed"} ${mem.heapUsed}`)
  lines.push(`nodejs_memory_bytes{type="external"} ${mem.external}`)

  for (const [key, val] of Object.entries(counters)) {
    const [name, ...labelParts] = key.split("|")
    const labels = labelParts.join("|")
    lines.push(`# HELP ${name} Counter metric`)
    lines.push(`# TYPE ${name} counter`)
    lines.push(emitMetric(name, labels, val))
  }

  for (const [key, val] of Object.entries(gauges)) {
    const [name, ...labelParts] = key.split("|")
    const labels = labelParts.join("|")
    lines.push(`# HELP ${name} Gauge metric`)
    lines.push(`# TYPE ${name} gauge`)
    lines.push(emitMetric(name, labels, val))
  }

  for (const [key, values] of Object.entries(histograms)) {
    const [name] = key.split("|")
    lines.push(`# HELP ${name} Histogram metric`)
    lines.push(`# TYPE ${name} histogram`)
    lines.push(formatHistogram(name, key, values))
  }

  return lines.join("\n") + "\n"
}

export function formatPrometheusMetrics(): string {
  return generateMetrics()
}
