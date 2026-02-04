interface SourceFilterProps {
  sourceFilter: string
  sources: string[]
  onChange: (value: string) => void
}

export const SourceFilter = ({
  sourceFilter,
  sources,
  onChange,
}: SourceFilterProps) => {
  return (
    <div className="flex items-center space-x-2">
      <select
        value={sourceFilter}
        onChange={e => onChange(e.target.value)}
        className="h-9 rounded-md border border-slate-200 bg-white px-3 text-sm text-slate-700 focus:outline-none focus:ring-2 focus:ring-[#53a533]/40"
      >
        <option value="all">All Sources</option>
        {sources.map(source => (
          <option key={source} value={source}>
            {source}
          </option>
        ))}
      </select>
    </div>
  )
}
