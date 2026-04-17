type OperationNoticeProps = {
  tone: "success" | "error";
  message: string;
};

function getNoticeLabel(tone: OperationNoticeProps["tone"]) {
  if (tone === "success") {
    return "Sucesso";
  }

  return "Atencao";
}

export function OperationNotice({ tone, message }: OperationNoticeProps) {
  return (
    <div className={`operation-notice ${tone}`}>
      <span className="operation-notice-label">{getNoticeLabel(tone)}</span>
      <strong>{message}</strong>
    </div>
  );
}
