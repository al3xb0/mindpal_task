type LogLevel = 'debug' | 'info' | 'warn' | 'error'

interface LogEntry {
  level: LogLevel
  message: string
  context?: Record<string, unknown>
  timestamp: string
}

function getConsoleFn(level: LogLevel): (...args: unknown[]) => void {
  if (level === 'error') return console.error.bind(console)
  if (level === 'warn') return console.warn.bind(console)
  if (level === 'info') return console.info.bind(console)
  return console.log.bind(console)
}

function log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
  const entry: LogEntry = {
    level,
    message,
    ...(context !== undefined && { context }),
    timestamp: new Date().toISOString(),
  }
  const fn = getConsoleFn(level)
  if (process.env.NODE_ENV === 'production') {
    fn(JSON.stringify(entry))
  } else {
    const prefix = `[${level.toUpperCase()}]`
    if (context !== undefined) {
      fn(prefix, message, context)
    } else {
      fn(prefix, message)
    }
  }
}

export const logger = {
  debug: (message: string, context?: Record<string, unknown> | undefined) =>
    log('debug', message, context),
  info: (message: string, context?: Record<string, unknown> | undefined) =>
    log('info', message, context),
  warn: (message: string, context?: Record<string, unknown> | undefined) =>
    log('warn', message, context),
  error: (message: string, context?: Record<string, unknown> | undefined) =>
    log('error', message, context),
}
