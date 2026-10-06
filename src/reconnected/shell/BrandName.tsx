/** "(Re)Connected" → the "(Re)" part is set in the accent colour. */
export default function BrandName({ name }: { name: string }) {
  const match = /^(\([^)]*\))(.*)$/.exec(name);
  if (!match) return <span className="rc-brand__name">{name}</span>;
  return (
    <span className="rc-brand__name">
      <span className="rc-brand__accent">{match[1]}</span>
      {match[2]}
    </span>
  );
}
