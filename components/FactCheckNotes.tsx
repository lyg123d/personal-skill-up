export function FactCheckNotes({ notes }: { notes: string[] }) {
  if (!notes.length) return null;
  return (
    <aside className="factNotes">
      <strong>확인 필요</strong>
      <ul>
        {notes.map((note) => (
          <li key={note}>{note}</li>
        ))}
      </ul>
    </aside>
  );
}
