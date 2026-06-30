type ErrorMessageProps = {
  message?: string;
};

export function ErrorMessage({ message }: ErrorMessageProps) {
  if (!message) return null;
  return <div className="errorMessage">{message}</div>;
}
