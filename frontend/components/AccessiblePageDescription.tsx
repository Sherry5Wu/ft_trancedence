// AccessiblePageDescription.tsx

export const AccessiblePageDescription = ({ id, text }: { id: string; text: string }) => (
  <p id={id} className="sr-only">
    {text}
  </p>
);
