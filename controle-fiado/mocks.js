window.CONTROLE_FIADO_MOCKS = {
  nav: [
    { id: "dashboard", label: "Dashboard", icon: "layout-dashboard" },
    { id: "clientes", label: "Clientes", icon: "users" },
    { id: "cliente", label: "Detalhe", icon: "user-round" },
    { id: "relatorios", label: "Relatórios", icon: "bar-chart-3" },
    { id: "cobrancas", label: "Cobranças", icon: "message-circle-more" }
  ],
  dashboard: {
    metrics: [
      { label: "Vendido fiado no mês", value: "R$ 12.480", delta: "+18% vs mês anterior", tone: "positive", icon: "shopping-basket" },
      { label: "Recebido no mês", value: "R$ 8.940", delta: "62 pagamentos registrados", tone: "positive", icon: "wallet" },
      { label: "Em aberto", value: "R$ 18.740", delta: "39 clientes com saldo", tone: "neutral", icon: "badge-dollar-sign" },
      { label: "Vencidos", value: "12 clientes", delta: "7 precisam de contato hoje", tone: "warning", icon: "triangle-alert" }
    ],
    topDebtors: [
      { name: "Maria da Silva", phone: "(11) 98811-2201", balance: "R$ 1.420", status: "Atrasado", tone: "danger" },
      { name: "João Pereira", phone: "(11) 99755-6120", balance: "R$ 1.120", status: "Vencendo", tone: "warning" },
      { name: "Ana Souza", phone: "(11) 98441-0045", balance: "R$ 980", status: "Em dia", tone: "good" },
      { name: "Mercinho da Esquina", phone: "(11) 97710-1920", balance: "R$ 875", status: "Atrasado", tone: "danger" }
    ],
    quickActions: [
      { id: "sale", title: "Nova venda fiado", text: "Registrar compra com prazo e cálculo automático.", icon: "receipt-text" },
      { id: "payment", title: "Registrar pagamento", text: "Abater saldo e guardar forma de pagamento.", icon: "hand-coins" },
      { id: "clientForm", title: "Novo cliente", text: "Cadastrar cliente com telefone e limite.", icon: "user-plus" },
      { id: "reports", title: "Ver relatórios", text: "Acompanhar totais e inadimplência do período.", icon: "chart-column" }
    ]
  },
  clients: {
    items: [
      { id: 1, name: "Maria da Silva", phone: "(11) 98811-2201", address: "Rua das Flores, 188", limit: "R$ 1.500", notes: "Prefere pagar aos sábados.", balance: "R$ 1.420", status: "vencido" },
      { id: 2, name: "João Pereira", phone: "(11) 99755-6120", address: "Travessa do Mercado, 42", limit: "R$ 1.200", notes: "", balance: "R$ 1.120", status: "proximo" },
      { id: 3, name: "Ana Souza", phone: "(11) 98441-0045", address: "Rua da Feira, 51", limit: "R$ 1.000", notes: "Comprar no fim do expediente.", balance: "R$ 980", status: "emdia" },
      { id: 4, name: "Carlos Lima", phone: "(11) 97331-7090", address: "Rua Alto da Serra, 9", limit: "R$ 800", notes: "", balance: "R$ 410", status: "emdia" },
      { id: 5, name: "Mercinho da Esquina", phone: "(11) 97710-1920", address: "Av. Central, 131", limit: "R$ 900", notes: "Compra para revenda eventual.", balance: "R$ 875", status: "vencido" }
    ]
  },
  selectedClientId: 1,
  transactions: [
    { id: 1, date: "28 mar", description: "Compra de mercearia", type: "compra", value: "R$ 142,00", status: "vencido" },
    { id: 2, date: "22 mar", description: "Pagamento PIX", type: "pagamento", value: "R$ 80,00", status: "confirmado" },
    { id: 3, date: "14 mar", description: "Compra de bebidas", type: "compra", value: "R$ 64,50", status: "proximo" },
    { id: 4, date: "05 mar", description: "Pagamento em dinheiro", type: "pagamento", value: "R$ 50,00", status: "confirmado" },
    { id: 5, date: "27 fev", description: "Compra da semana", type: "compra", value: "R$ 118,90", status: "confirmado" }
  ],
  reports: {
    bars: [
      { month: "Out", height: 30, sold: "R$ 5.2k" },
      { month: "Nov", height: 52, sold: "R$ 7.1k" },
      { month: "Dez", height: 88, sold: "R$ 11.3k" },
      { month: "Jan", height: 64, sold: "R$ 8.4k" },
      { month: "Fev", height: 74, sold: "R$ 9.8k" },
      { month: "Mar", height: 96, sold: "R$ 12.4k" }
    ],
    summary: [
      { label: "Total vendido fiado", value: "R$ 54.920" },
      { label: "Total recebido", value: "R$ 36.180" },
      { label: "Total em aberto", value: "R$ 18.740" },
      { label: "Clientes inadimplentes", value: "12" }
    ]
  },
  reminders: [
    { client: "Maria da Silva", when: "2 dias após vencimento", preview: "Maria, passou da data combinada. Pode nos informar quando consegue quitar R$ 1.420?", status: "falhou" },
    { client: "João Pereira", when: "No dia do vencimento", preview: "João, hoje vence seu fiado de R$ 1.120. Se puder, já nos responda com a previsão do pagamento.", status: "agendado" },
    { client: "Ana Souza", when: "1 dia antes do vencimento", preview: "Ana, amanhã vence seu saldo de R$ 980. Qualquer dúvida, estamos no mercado.", status: "enviado" }
  ],
  paymentMethods: ["Dinheiro", "Pix", "Cartão"],
  saleTerms: [
    { label: "15 dias", fee: "+15%", multiplier: 1.15 },
    { label: "30 dias", fee: "+20%", multiplier: 1.2 }
  ]
};
