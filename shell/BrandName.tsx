/** "(Re)Connected" → "Connected" is set in the accent colour. */
export default function BrandName({ name }: { name: string }) {
  const match = /^(\([^)]*\))(.*)$/.exec(name);
  if (!match) return <span className="rc-brand__name">{name}</span>;
  return (
    <span className="rc-brand__name">
      {match[1]}
      <span className="rc-brand__accent">{match[2]}</span>
    </span>
  );
}
