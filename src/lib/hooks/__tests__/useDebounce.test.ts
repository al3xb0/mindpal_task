import { renderHook, act } from '@testing-library/react'
import { vi, describe, it, expect, beforeEach, afterEach } from 'vitest'
import { useDebounce, useDebouncedCallback } from '../useDebounce'

describe('useDebounce', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('returns initial value immediately', () => {
    const { result } = renderHook(() => useDebounce('hello', 300))
    expect(result.current).toBe('hello')
  })

  it('does not update value before delay elapses', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: 'hello' } },
    )
    rerender({ value: 'world' })
    act(() => { vi.advanceTimersByTime(299) })
    expect(result.current).toBe('hello')
  })

  it('updates value after delay', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: 'hello' } },
    )
    rerender({ value: 'world' })
    act(() => { vi.advanceTimersByTime(300) })
    expect(result.current).toBe('world')
  })

  it('debounces rapid changes — only last value wins', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: string }) => useDebounce(value, 300),
      { initialProps: { value: 'a' } },
    )
    rerender({ value: 'b' })
    rerender({ value: 'c' })
    rerender({ value: 'd' })
    expect(result.current).toBe('a')
    act(() => { vi.advanceTimersByTime(300) })
    expect(result.current).toBe('d')
  })

  it('handles numeric values', () => {
    const { result, rerender } = renderHook(
      ({ value }: { value: number }) => useDebounce(value, 200),
      { initialProps: { value: 1 } },
    )
    rerender({ value: 42 })
    act(() => { vi.advanceTimersByTime(200) })
    expect(result.current).toBe(42)
  })
})

describe('useDebouncedCallback', () => {
  beforeEach(() => {
    vi.useFakeTimers()
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it('does not call callback before delay', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 300))
    act(() => { result.current('arg1') })
    expect(callback).not.toHaveBeenCalled()
  })

  it('calls callback after delay', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 300))
    act(() => { result.current('arg1') })
    act(() => { vi.advanceTimersByTime(300) })
    expect(callback).toHaveBeenCalledWith('arg1')
    expect(callback).toHaveBeenCalledTimes(1)
  })

  it('debounces multiple calls — only last fires', () => {
    const callback = vi.fn()
    const { result } = renderHook(() => useDebouncedCallback(callback, 300))
    act(() => {
      result.current('first')
      result.current('second')
      result.current('third')
    })
    act(() => { vi.advanceTimersByTime(300) })
    expect(callback).toHaveBeenCalledTimes(1)
    expect(callback).toHaveBeenCalledWith('third')
  })
})
