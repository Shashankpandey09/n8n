const isObject = (v: any) => v !== null && typeof v === "object";
export function JSONNode({
  data,
  path,
  expanded,
  onToggle,
}: {
  data: any;
  path: string;
  expanded: Set<string>;
  onToggle: (p: string) => void;
}) {
  if (!isObject(data)) {
    return <span className="font-mono text-sm">{JSON.stringify(data)}</span>;
  }

  const isExpanded = expanded.has(path);
  const isArr = Array.isArray(data);

  return (
    <div>
      <button
        onClick={() => onToggle(path)}
        className="flex items-center gap-2 text-sm font-medium cursor-pointer mb-2"
        aria-expanded={isExpanded}
      >
        <span className="w-4">{isExpanded ? "▾" : "▸"}</span>
        <span className="font-mono text-xs">
          {isArr ? `Array[${data.length}]` : `Object{${Object.keys(data).length}}`}
        </span>
      </button>
      
      {isExpanded && (
        <div className="pl-5 space-y-2">
          {isArr
            ? data.map((item: any, i: number) => (
                <div key={i}>
                  <div className="text-xs text-muted-foreground mb-1">[{i}]</div>
                  <JSONNode data={item} path={`${path}[${i}]`} expanded={expanded} onToggle={onToggle} />
                </div>
              ))
            : Object.entries(data).map(([k, v]) => (
                <div key={k} className="flex gap-3 items-start">
                  <div className="w-44 text-xs text-muted-foreground font-medium break-words">{k}</div>
                  <div className="flex-1">
                    <JSONNode data={v} path={`${path}.${k}`} expanded={expanded} onToggle={onToggle} />
                  </div>
                </div>
              ))}
        </div>
      )}
    </div>
  );
}
