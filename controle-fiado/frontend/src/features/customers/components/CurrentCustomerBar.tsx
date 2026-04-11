type CurrentCustomerBarProps = {
  customerName: string;
  openBalance: number;
};

function formatMoney(value: number) {
  return new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL"
  }).format(value);
}

export function CurrentCustomerBar({ customerName, openBalance }: CurrentCustomerBarProps) {
  return (
    <section className="section-block">
      <div className="current-customer-bar">
        <div>
          <div className="eyebrow">Cliente atual</div>
          <strong>{customerName}</strong>
        </div>
        <div>
          <div className="eyebrow">Saldo em aberto</div>
          <strong>{formatMoney(openBalance)}</strong>
        </div>
      </div>
    </section>
  );
}
