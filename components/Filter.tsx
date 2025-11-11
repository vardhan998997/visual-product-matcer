import { Filter as FilterIcon, Sliders } from 'lucide-react';

type Props = {
  value: number;
  setValue: (v: number) => void;
};

export default function Filter({ value, setValue }: Props) {
  const label = value < 0.3 ? 'Loose' : value < 0.7 ? 'Good' : 'Precise';
  const badgeClass =
    value < 0.3
      ? 'bg-amber-50 text-amber-700 ring-1 ring-amber-200'
      : value < 0.7
      ? 'bg-indigo-50 text-indigo-700 ring-1 ring-indigo-200'
      : 'bg-emerald-50 text-emerald-700 ring-1 ring-emerald-200';

  return (
    <div className="group relative flex items-center gap-5 rounded-2xl border border-slate-200 bg-white/70 px-6 py-4 shadow-md backdrop-blur-sm">
      {/* Header */}
      <div className="flex items-center gap-2 min-w-fit">
        <Sliders className="w-4 h-4 text-slate-600" />
        <span className="text-slate-800 font-medium text-sm">Quality Match</span>
      </div>

      {/* Slider + meta */}
      <div className="flex items-center gap-4 flex-1">
        <span
          className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold ${badgeClass}`}
        >
          {label}
          <span className="ml-0.5 text-slate-500/70 font-medium">•</span>
          <span className="text-slate-900">{(value * 100).toFixed(0)}%</span>
        </span>

        <div className="relative flex-1 max-w-80 md:max-w-[420px]">
          {/* Track background (unfilled) */}
          <div className="absolute left-0 top-1/2 -translate-y-1/2 h-2 w-full rounded-full bg-slate-200 shadow-inner" />

          {/* Track fill */}
          <div
            className="pointer-events-none absolute left-0 top-1/2 -translate-y-1/2 h-2 rounded-full bg-gradient-to-r from-blue-500 to-indigo-600 shadow-[0_0_0_1px_rgba(255,255,255,0.6)_inset]"
            style={{ width: `${value * 100}%` }}
          />

          {/* Glow at thumb position (purely visual) */}
          <div
            aria-hidden
            className="pointer-events-none absolute top-1/2 -translate-y-1/2 -translate-x-1/2 w-7 h-7 rounded-full blur-sm opacity-60"
            style={{
              left: `${value * 100}%`,
              background:
                'radial-gradient(circle at center, rgba(99,102,241,0.45), rgba(99,102,241,0) 60%)',
            }}
          />

          {/* Range input (actual control) */}
          <input
            type="range"
            min={0}
            max={1}
            step={0.05}
            value={value}
            aria-label="Quality match threshold"
            onChange={(e) => setValue(Number(e.target.value))}
            className="
              relative z-10 w-full appearance-none bg-transparent outline-none
              focus-visible:ring-2 focus-visible:ring-blue-500/60 focus-visible:ring-offset-2 focus-visible:rounded
              cursor-pointer
              [&::-webkit-slider-runnable-track]:h-2
              [&::-webkit-slider-runnable-track]:rounded-full
              [&::-webkit-slider-runnable-track]:bg-transparent

              [&::-webkit-slider-thumb]:appearance-none
              [&::-webkit-slider-thumb]:w-5
              [&::-webkit-slider-thumb]:h-5
              [&::-webkit-slider-thumb]:rounded-full
              [&::-webkit-slider-thumb]:bg-white
              [&::-webkit-slider-thumb]:shadow-[0_1px_4px_rgba(0,0,0,0.2),0_0_0_2px_#fff]
              [&::-webkit-slider-thumb]:border
              [&::-webkit-slider-thumb]:border-slate-200
              [&::-webkit-slider-thumb]:transition-transform
              [&::-webkit-slider-thumb]:active:scale-110
              [&::-webkit-slider-thumb]:cursor-pointer

              [&::-moz-range-track]:h-2
              [&::-moz-range-track]:rounded-full
              [&::-moz-range-track]:bg-transparent
              [&::-moz-range-thumb]:w-5
              [&::-moz-range-thumb]:h-5
              [&::-moz-range-thumb]:rounded-full
              [&::-moz-range-thumb]:border
              [&::-moz-range-thumb]:border-slate-200
              [&::-moz-range-thumb]:background-clip:padding-box
              [&::-moz-range-thumb]:bg-white
              [&::-moz-range-thumb]:box-shadow:[0_1px_4px_rgba(0,0,0,0.2),0_0_0_2px_#fff]
              [&::-moz-range-thumb]:transition-transform
              [&::-moz-range-thumb]:active:scale-110
              [&::-moz-range-thumb]:cursor-pointer
            "
          />

          {/* Floating value pill */}
          <div
            className="
              pointer-events-none absolute -top-7 translate-y-0 -translate-x-1/2
              select-none
            "
            style={{ left: `${value * 100}%` }}
          >
            <div className="rounded-full bg-slate-900/90 px-2 py-0.5 text-[10px] font-semibold text-white shadow">
              {(value * 100).toFixed(0)}%
            </div>
          </div>

          {/* Min / Mid / Max ticks */}
          <div className="mt-2 grid grid-cols-3 text-[10px] text-slate-500">
            <span>0%</span>
            <span className="text-center">50%</span>
            <span className="text-right">100%</span>
          </div>
        </div>

        {/* Decorative icon on the far right */}
        <FilterIcon className="hidden md:block w-4 h-4 text-slate-400/70" />
      </div>
    </div>
  );
}
