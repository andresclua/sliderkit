const BADGE =
  'background:#6C2BD9;color:#fff;padding:2px 6px;border-radius:3px 0 0 3px;font-weight:bold'

export const logger = {
  error(msg: string, detail?: unknown): void {
    console.error(
      `%c SLIDERKIT %c ERROR %c ${msg}`,
      BADGE,
      'background:#EF4444;color:#fff;padding:2px 6px;border-radius:0 3px 3px 0;font-weight:bold',
      'color:#EF4444;font-weight:normal',
      ...(detail !== undefined ? ['\n', detail] : [])
    )
  },

  warn(msg: string, detail?: unknown): void {
    console.warn(
      `%c SLIDERKIT %c WARN %c ${msg}`,
      BADGE,
      'background:#F59E0B;color:#000;padding:2px 6px;border-radius:0 3px 3px 0;font-weight:bold',
      'color:#F59E0B;font-weight:normal',
      ...(detail !== undefined ? ['\n', detail] : [])
    )
  },

  info(msg: string): void {
    console.log(
      `%c SLIDERKIT %c INFO %c ${msg}`,
      BADGE,
      'background:#3B82F6;color:#fff;padding:2px 6px;border-radius:0 3px 3px 0;font-weight:bold',
      'color:#3B82F6;font-weight:normal'
    )
  },
}
