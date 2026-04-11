type OperationNoticeProps = {
  tone: "success" | "error";
  message: string;
};

export function OperationNotice({ tone, message }: OperationNoticeProps) {
  return <div className={`operation-notice ${tone}`}>{message}</div>;
}
