import { describe, it, expect, beforeEach } from 'vitest'
import { SlideEngine } from '../../src/engine/SlideEngine'

describe('SlideEngine', () => {
  let engine: SlideEngine

  beforeEach(() => {
    engine = new SlideEngine({
      activeIndex: 0,
      previousIndex: 0,
      slideCount: 5,
      slidesPerPage: 1,
      loop: false,
      rewind: false,
    })
  })

  // ── resolve ──
  describe('resolve()', () => {
    it('returns next index for "next"', () => {
      engine.commit(2)
      expect(engine.resolve('next')).toBe(3)
    })

    it('returns null at end without loop/rewind', () => {
      engine.commit(4)
      expect(engine.resolve('next')).toBeNull()
    })

    it('returns 0 at end with loop', () => {
      const looped = new SlideEngine({ activeIndex: 4, previousIndex: 3, slideCount: 5, slidesPerPage: 1, loop: true, rewind: false })
      expect(looped.resolve('next')).toBe(0)
    })

    it('returns 0 at end with rewind', () => {
      const rewound = new SlideEngine({ activeIndex: 4, previousIndex: 3, slideCount: 5, slidesPerPage: 1, loop: false, rewind: true })
      expect(rewound.resolve('next')).toBe(0)
    })

    it('returns null at beginning for "prev" without loop/rewind', () => {
      expect(engine.resolve('prev')).toBeNull()
    })

    it('returns last index for "prev" with loop', () => {
      const looped = new SlideEngine({ activeIndex: 0, previousIndex: 4, slideCount: 5, slidesPerPage: 1, loop: true, rewind: false })
      expect(looped.resolve('prev')).toBe(4)
    })

    it('resolves "first" to 0', () => {
      engine.commit(3)
      expect(engine.resolve('first')).toBe(0)
    })

    it('resolves "last" to slideCount - slidesPerPage', () => {
      expect(engine.resolve('last')).toBe(4)
    })

    it('resolves "last" correctly with multiple slides per page', () => {
      const multi = new SlideEngine({ activeIndex: 0, previousIndex: 0, slideCount: 5, slidesPerPage: 2, loop: false, rewind: false })
      expect(multi.resolve('last')).toBe(3)
    })

    it('resolves numeric index', () => {
      expect(engine.resolve(3)).toBe(3)
    })

    it('clamps numeric index to valid range', () => {
      expect(engine.resolve(99)).toBe(4)
      expect(engine.resolve(-1)).toBe(0)
    })

    it('wraps numeric index with loop', () => {
      const looped = new SlideEngine({ activeIndex: 0, previousIndex: 0, slideCount: 5, slidesPerPage: 1, loop: true, rewind: false })
      expect(looped.resolve(6)).toBe(1)
      expect(looped.resolve(-1)).toBe(4)
    })
  })

  // ── commit ──
  describe('commit()', () => {
    it('updates activeIndex', () => {
      engine.commit(3)
      expect(engine.activeIndex).toBe(3)
    })

    it('sets previousIndex to old activeIndex', () => {
      engine.commit(2)
      engine.commit(4)
      expect(engine.previousIndex).toBe(2)
    })
  })

  // ── isBeginning / isEnd ──
  describe('isBeginning / isEnd', () => {
    it('isBeginning true at index 0', () => {
      expect(engine.isBeginning).toBe(true)
    })

    it('isBeginning false after moving', () => {
      engine.commit(1)
      expect(engine.isBeginning).toBe(false)
    })

    it('isEnd true at last valid index', () => {
      engine.commit(4)
      expect(engine.isEnd).toBe(true)
    })

    it('isEnd false before last', () => {
      engine.commit(3)
      expect(engine.isEnd).toBe(false)
    })
  })

  // ── progress ──
  describe('progress', () => {
    it('returns 0 at start', () => {
      expect(engine.progress).toBe(0)
    })

    it('returns 1 at end', () => {
      engine.commit(4)
      expect(engine.progress).toBe(1)
    })

    it('returns 0.5 in middle', () => {
      engine.commit(2)
      expect(engine.progress).toBe(0.5)
    })
  })

  // ── update ──
  describe('update()', () => {
    it('clamps activeIndex after reducing slidesPerPage', () => {
      engine.commit(4)
      engine.update(3) // max is now 5-3=2
      expect(engine.activeIndex).toBe(2)
    })
  })
})
