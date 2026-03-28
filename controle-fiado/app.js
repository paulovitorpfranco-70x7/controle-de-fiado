(function () {
  const mocks = window.CONTROLE_FIADO_MOCKS;
  const state = {
    view: "dashboard",
    clientsState: "success",
    search: "",
    drawer: null,
    saleTerm: "15 dias",
    paymentMethod: "Pix"
  };

  const primaryViews = [
    { id: "dashboard", label: "Inicio", icon: "house" },
    { id: "clientes", label: "Clientes", icon: "users" }
  ];

  const secondaryViews = [
    { id: "relatorios", label: "Relatorios", icon: "bar-chart-3", hint: "Ver totais e periodo" },
    { id: "cobrancas", label: "Cobrancas", icon: "message-circle-more", hint: "Lembretes e WhatsApp" }
  ];

  const root = document.getElementById("app-root");
  const pageTitle = document.getElementById("page-title");
  const desktopNav = document.getElementById("desktop-nav");
  const mobileNav = document.getElementById("mobile-nav");
  const drawer = document.getElementById("drawer");
  const drawerBody = document.getElementById("drawer-body");
  const drawerTitle = document.getElementById("drawer-title");
  const drawerKicker = document.getElementById("drawer-kicker");
  const drawerBackdrop = document.getElementById("drawer-backdrop");

  function moneyToNumber(value) {
    return Number(String(value).replace(/[^\d,]/g, "").replace(".", "").replace(",", ".")) || 0;
  }

  function formatBRL(value) {
    return `R$ ${value.toFixed(2).replace(".", ",")}`;
  }

  function selectedClient() {
    return mocks.clients.items.find((client) => client.id === mocks.selectedClientId) || mocks.clients.items[0];
  }

  function statusClass(status) {
    if (["vencido", "falhou", "danger"].includes(status)) return "status-danger";
    if (["proximo", "agendado", "warning"].includes(status)) return "status-warning";
    return "status-good";
  }

  function statusLabel(status) {
    const labels = {
      emdia: "Em dia",
      proximo: "Vencendo",
      vencido: "Atrasado",
      confirmado: "Confirmado",
      agendado: "Agendado",
      enviado: "Enviado",
      falhou: "Falhou",
      warning: "Atencao",
      danger: "Critico"
    };
    return labels[status] || status;
  }

  function renderNav() {
    desktopNav.innerHTML = [
      `<div class="text-[10px] font-bold tracking-[0.28em] uppercase text-white/35 px-4 pb-2">Acoes principais</div>`,
      ...primaryViews.map((item) => `
      <button class="nav-link ${state.view === item.id ? "active" : ""}" data-view="${item.id}" type="button">
        <i data-lucide="${item.icon}" class="w-4 h-4"></i>
        <span class="text-sm font-medium">${item.label}</span>
      </button>
    `),
      `<button class="nav-link" data-open-drawer="menu" type="button"><i data-lucide="ellipsis" class="w-4 h-4"></i><span class="text-sm font-medium">Mais opcoes</span></button>`
    ].join("");

    mobileNav.innerHTML = [
      ...primaryViews.map((item) => `
      <button class="mobile-link ${state.view === item.id ? "active" : ""}" data-view="${item.id}" type="button">
        <i data-lucide="${item.icon}" class="w-4 h-4"></i>
        <span>${item.label}</span>
      </button>
    `),
      `<button class="mobile-link" data-open-drawer="menu" type="button"><i data-lucide="ellipsis" class="w-4 h-4"></i><span>Mais</span></button>`
    ].join("");
  }

  function renderSectionHeader(title, copy, extra = "") {
    return `
      <div class="section-heading">
        <div>
          <div class="text-[10px] font-bold tracking-[0.28em] uppercase text-orange-500/80">Visao do modulo</div>
          <h2 class="mt-3">${title}</h2>
          <p class="mt-3 max-w-2xl text-sm md:text-base leading-relaxed text-white/60">${copy}</p>
        </div>
        ${extra}
      </div>
    `;
  }

  function renderDashboard() {
    const primaryActions = [
      { id: "sale", title: "Nova venda fiado", text: "Escolha o cliente, digite o valor e confirme.", icon: "plus", tone: "is-primary" },
      { id: "payment", title: "Registrar pagamento", text: "Recebeu? Baixe o saldo em poucos toques.", icon: "wallet" },
      { id: "clientes", title: "Ver clientes", text: "Procure pelo nome e abra a ficha.", icon: "users", view: true }
    ].map((item) => `
      <button class="primary-action-card ${item.tone || ""}" ${item.view ? `data-view="${item.id}"` : `data-open-drawer="${item.id}"`} type="button">
        <div class="w-14 h-14 rounded-[20px] bg-white/5 border border-white/10 flex items-center justify-center text-orange-400">
          <i data-lucide="${item.icon}" class="w-6 h-6"></i>
        </div>
        <div>
          <div class="text-2xl font-medium tracking-tighter text-white">${item.title}</div>
          <div class="mt-3 text-sm leading-relaxed text-white/58">${item.text}</div>
        </div>
      </button>
    `).join("");

    const topDebtors = mocks.dashboard.topDebtors.map((item) => `
      <div class="data-row">
        <div>
          <div class="text-base font-medium tracking-tight text-white">${item.name}</div>
          <div class="mt-1 text-sm text-white/45">${item.phone}</div>
        </div>
        <div class="text-sm text-white/70">${item.balance}</div>
        <div class="flex justify-start md:justify-end"><span class="status-chip ${statusClass(item.tone)}">${item.status}</span></div>
      </div>
    `).join("");

    const todaySummary = `
      <div class="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div class="simple-stat"><div><div class="text-xs uppercase tracking-[0.22em] text-white/40">Em aberto</div><div class="mt-2 text-xl font-medium tracking-tight text-white">R$ 18.740</div></div><span class="status-chip status-warning">Acompanhar</span></div>
        <div class="simple-stat"><div><div class="text-xs uppercase tracking-[0.22em] text-white/40">Vencendo</div><div class="mt-2 text-xl font-medium tracking-tight text-white">5 clientes</div></div><span class="status-chip status-warning">Hoje</span></div>
        <div class="simple-stat"><div><div class="text-xs uppercase tracking-[0.22em] text-white/40">Atrasados</div><div class="mt-2 text-xl font-medium tracking-tight text-white">12 clientes</div></div><span class="status-chip status-danger">Prioridade</span></div>
      </div>
    `;

    return `
      <section class="section-block">
        ${renderSectionHeader(
          "Tres acoes e pronto",
          "Quem esta no caixa precisa fazer so tres coisas: vender fiado, registrar pagamento e achar cliente. O resto fica secundario."
        )}
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">${primaryActions}</div>
      </section>
      <section class="section-block">
        <div class="surface-panel p-5 md:p-6">
          <div class="text-xl font-medium tracking-tight text-white">Resumo de hoje</div>
          <div class="mt-1 text-sm text-white/50">So o que ajuda a decidir rapido</div>
          <div class="mt-5">${todaySummary}</div>
        </div>
      </section>
      <section class="section-block grid grid-cols-1 xl:grid-cols-[1.2fr_0.8fr] gap-5">
        <div class="surface-panel overflow-hidden">
          <div class="px-5 pt-5 md:px-6 md:pt-6 flex items-center justify-between gap-4">
            <div>
              <div class="text-xl font-medium tracking-tight text-white">Clientes para olhar agora</div>
              <div class="mt-1 text-sm text-white/50">Quem esta vencendo ou atrasado</div>
            </div>
            <span class="status-chip status-warning">12 vencidos</span>
          </div>
          <div class="data-list mt-4">${topDebtors}</div>
        </div>
        <div class="surface-panel p-5 md:p-6">
          <div class="text-xl font-medium tracking-tight text-white">Como usar</div>
          <div class="mt-1 text-sm text-white/50">Fluxo simples para quem esta com pressa</div>
          <div class="mt-5 step-flow">
            <div class="step-card"><div class="step-badge">1</div><div><div class="text-base font-medium text-white">Venda</div><div class="mt-1 text-sm text-white/55">Cliente, valor e prazo.</div></div></div>
            <div class="step-card"><div class="step-badge">2</div><div><div class="text-base font-medium text-white">Pagamento</div><div class="mt-1 text-sm text-white/55">Valor pago e forma.</div></div></div>
            <div class="step-card"><div class="step-badge">3</div><div><div class="text-base font-medium text-white">Clientes</div><div class="mt-1 text-sm text-white/55">Buscar nome e abrir ficha.</div></div></div>
            <div class="step-card"><div class="step-badge">4</div><div><div class="text-base font-medium text-white">Mais opcoes</div><div class="mt-1 text-sm text-white/55">Relatorios e cobrancas ficam no menu.</div></div></div>
          </div>
        </div>
      </section>
    `;
  }

  function renderClients() {
    let body = "";
    if (state.clientsState === "loading") {
      body = document.getElementById("state-loading").innerHTML;
    } else if (state.clientsState === "empty") {
      body = document.getElementById("state-empty").innerHTML;
    } else if (state.clientsState === "error") {
      body = document.getElementById("state-error").innerHTML;
    } else {
      const filtered = mocks.clients.items.filter((client) => client.name.toLowerCase().includes(state.search.toLowerCase()));
      if (!filtered.length) {
        body = `
          <div class="empty-state">
            <div class="empty-state-icon"><i data-lucide="search-x" class="w-6 h-6"></i></div>
            <h3 class="text-xl font-medium tracking-tight text-white">Nenhum cliente encontrado</h3>
            <p class="max-w-md text-sm leading-relaxed text-white/60">A busca esta pronta para filtragem local e futura integracao com API.</p>
          </div>
        `;
      } else {
        body = `
          <div class="surface-panel overflow-hidden">
            <div class="data-list">
              ${filtered.map((client) => `
                <button class="data-row text-left" data-view-client="${client.id}" type="button">
                  <div>
                    <div class="text-base font-medium tracking-tight text-white">${client.name}</div>
                    <div class="mt-1 text-sm text-white/45">${client.phone}</div>
                  </div>
                  <div class="text-sm text-white/70">${client.balance}</div>
                  <div class="flex justify-start md:justify-end"><span class="status-chip ${statusClass(client.status)}">${statusLabel(client.status)}</span></div>
                </button>
              `).join("")}
            </div>
          </div>
        `;
      }
    }

    return `
      <section class="section-block">
        ${renderSectionHeader(
          "Clientes cadastrados",
          "Busca rapida e lista simples. O foco aqui e achar o cliente sem pensar demais."
        )}
        <div class="surface-panel p-4 md:p-5">
          <div class="grid grid-cols-1 md:grid-cols-[1fr_auto] gap-3">
            <label class="field-group">
              <span class="field-label">Buscar cliente</span>
              <input id="search-client" class="field-control" value="${state.search}" placeholder="Digite nome ou apelido" />
            </label>
            <button class="button-custom md:self-end" data-open-drawer="clientForm" type="button">
              <div class="points_wrapper"><i class="point"></i><i class="point"></i><i class="point"></i><i class="point"></i></div>
              <span class="inner"><span>Novo cliente</span><i data-lucide="user-plus" class="icon"></i></span>
            </button>
          </div>
        </div>
      </section>
      <section class="section-block">${body}</section>
    `;
  }

  function renderClientDetail() {
    const client = selectedClient();
    const history = mocks.transactions.map((item) => `
      <div class="timeline-item">
        <div class="timeline-icon ${item.type === "compra" ? "text-orange-400" : "text-white"}">
          <i data-lucide="${item.type === "compra" ? "shopping-cart" : "wallet"}" class="w-5 h-5"></i>
        </div>
        <div>
          <div class="flex flex-wrap items-center gap-2">
            <div class="text-sm font-semibold tracking-tight text-white">${item.description}</div>
            <span class="status-chip ${statusClass(item.status)}">${statusLabel(item.status)}</span>
          </div>
          <div class="mt-1 text-sm text-white/50">${item.date} • ${item.type === "compra" ? "Compra" : "Pagamento"}</div>
        </div>
        <div class="text-sm md:text-base font-medium text-white">${item.value}</div>
      </div>
    `).join("");

    return `
      <section class="section-block grid grid-cols-1 xl:grid-cols-[1fr_0.95fr] gap-5">
        <div class="surface-panel p-5 md:p-6">
          <div class="flex items-start justify-between gap-4">
            <div>
              <div class="text-[10px] font-bold tracking-[0.28em] uppercase text-orange-500/80">Ficha do cliente</div>
              <h2 class="mt-3 text-3xl md:text-4xl font-medium tracking-tighter text-white">${client.name}</h2>
              <div class="mt-3 flex flex-wrap gap-2 text-sm text-white/60">
                <span>${client.phone}</span>
                <span>•</span>
                <span>${client.address}</span>
              </div>
            </div>
            <span class="status-chip ${statusClass(client.status)}">${statusLabel(client.status)}</span>
          </div>
          <div class="mt-8 grid grid-cols-1 md:grid-cols-3 gap-3">
            <div class="surface-card p-4">
              <div class="text-xs uppercase tracking-[0.24em] text-white/45">Saldo atual</div>
              <div class="mt-4 text-2xl font-medium tracking-tighter text-white">${client.balance}</div>
            </div>
            <div class="surface-card p-4">
              <div class="text-xs uppercase tracking-[0.24em] text-white/45">Limite</div>
              <div class="mt-4 text-2xl font-medium tracking-tighter text-white">${client.limit}</div>
            </div>
            <div class="surface-card p-4">
              <div class="text-xs uppercase tracking-[0.24em] text-white/45">Observacao</div>
              <div class="mt-4 text-sm leading-relaxed text-white/70">${client.notes || "Sem observacoes por enquanto."}</div>
            </div>
          </div>
          <div class="mt-6 flex flex-wrap gap-3">
            <button class="action-pill action-pill-primary" data-open-drawer="sale" type="button"><i data-lucide="plus" class="w-4 h-4"></i><span>Nova venda</span></button>
            <button class="action-pill" data-open-drawer="payment" type="button"><i data-lucide="wallet" class="w-4 h-4"></i><span>Registrar pagamento</span></button>
            <button class="action-pill" data-open-drawer="clientForm" type="button"><i data-lucide="pencil" class="w-4 h-4"></i><span>Editar cliente</span></button>
          </div>
        </div>
        <div class="surface-panel p-5 md:p-6">
          <div class="text-xl font-medium tracking-tight text-white">Resumo da conta</div>
          <div class="mt-1 text-sm text-white/50">Visual para atendimento rapido</div>
          <div class="mt-6 space-y-4">
            <div class="surface-card p-4">
              <div class="text-xs uppercase tracking-[0.24em] text-white/45">Proximo vencimento</div>
              <div class="mt-3 text-lg font-medium text-white">02 abr 2026</div>
              <div class="mt-2 text-sm text-white/55">Compra de mercearia R$ 142,00</div>
            </div>
            <div class="surface-card p-4">
              <div class="text-xs uppercase tracking-[0.24em] text-white/45">Contato rapido</div>
              <div class="mt-3 text-lg font-medium text-white">${client.phone}</div>
              <div class="mt-2 text-sm text-white/55">Cobranca futura por WhatsApp vai sair daqui.</div>
            </div>
          </div>
        </div>
      </section>
      <section class="section-block">
        ${renderSectionHeader(
          "Historico de transacoes",
          "Compras e pagamentos em ordem cronologica, com leitura curta e status simples: Em dia, Vencendo ou Atrasado."
        )}
        <div class="timeline-list">${history}</div>
      </section>
    `;
  }

  function renderReports() {
    const summary = mocks.reports.summary.map((item) => `
      <div class="surface-card p-5">
        <div class="text-xs uppercase tracking-[0.24em] text-white/45">${item.label}</div>
        <div class="mt-5 text-3xl font-medium tracking-tighter text-white">${item.value}</div>
      </div>
    `).join("");

    const bars = mocks.reports.bars.map((bar) => `
      <div class="flex flex-col justify-end gap-3">
        <div class="chart-bar" style="height:${bar.height}%"></div>
        <div class="text-center">
          <div class="text-xs text-white/80">${bar.month}</div>
          <div class="text-[10px] text-white/40">${bar.sold}</div>
        </div>
      </div>
    `).join("");

    return `
      <section class="section-block">
        ${renderSectionHeader(
          "Relatorios simples e operacionais",
          "Sem depender de biblioteca de graficos. O modulo ja comunica totais, variacao mensal e inadimplencia com cards e barras leves derivadas do visual base."
        )}
        <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">${summary}</div>
      </section>
      <section class="section-block grid grid-cols-1 xl:grid-cols-[1.1fr_0.9fr] gap-5">
        <div class="surface-panel p-5 md:p-6">
          <div class="text-xl font-medium tracking-tight text-white">Vendido fiado por periodo</div>
          <div class="mt-1 text-sm text-white/50">Ultimos seis meses</div>
          <div class="chart-bars mt-8">${bars}</div>
        </div>
        <div class="surface-panel p-5 md:p-6">
          <div class="text-xl font-medium tracking-tight text-white">Leitura rapida</div>
          <div class="mt-6 space-y-4">
            <div class="surface-card p-4"><div class="text-sm font-medium text-white">Maior crescimento</div><div class="mt-2 text-sm text-white/60">Marco teve o pico de vendas fiado puxado por compras de fim de mes.</div></div>
            <div class="surface-card p-4"><div class="text-sm font-medium text-white">Risco atual</div><div class="mt-2 text-sm text-white/60">12 clientes inadimplentes concentram boa parte do valor aberto e devem entrar na fila de cobranca.</div></div>
            <div class="surface-card p-4"><div class="text-sm font-medium text-white">Proxima integracao</div><div class="mt-2 text-sm text-white/60">Filtros por periodo, exportacao e cruzamento com API de vendas reais.</div></div>
          </div>
        </div>
      </section>
    `;
  }

  function renderReminders() {
    return `
      <section class="section-block">
        ${renderSectionHeader(
          "Cobrancas por WhatsApp",
          "Estrutura visual para futura automacao: lembrete antes do vencimento, no dia e apos atraso, com status de envio e previa da mensagem."
        )}
        <div class="grid grid-cols-1 xl:grid-cols-[0.95fr_1.05fr] gap-5">
          <div class="surface-panel p-5 md:p-6">
            <div class="text-xl font-medium tracking-tight text-white">Regras de lembrete</div>
            <div class="mt-5 space-y-3">
              <div class="surface-card p-4"><div class="text-sm font-medium text-white">Antes do vencimento</div><div class="mt-2 text-sm text-white/60">Mensagem amigavel lembrando o valor e a data.</div></div>
              <div class="surface-card p-4"><div class="text-sm font-medium text-white">No dia do vencimento</div><div class="mt-2 text-sm text-white/60">Confirmacao da data combinada com pedido de retorno.</div></div>
              <div class="surface-card p-4"><div class="text-sm font-medium text-white">Apos vencimento</div><div class="mt-2 text-sm text-white/60">Tom mais direto, mantendo linguagem respeitosa para o cliente do bairro.</div></div>
            </div>
          </div>
          <div class="surface-panel p-5 md:p-6">
            <div class="text-xl font-medium tracking-tight text-white">Fila de mensagens</div>
            <div class="mt-5 space-y-4">
              ${mocks.reminders.map((item) => `
                <div class="surface-card p-4">
                  <div class="flex flex-wrap items-center justify-between gap-3">
                    <div class="text-sm font-medium text-white">${item.client}</div>
                    <span class="status-chip ${statusClass(item.status)}">${statusLabel(item.status)}</span>
                  </div>
                  <div class="mt-2 text-xs font-bold uppercase tracking-[0.22em] text-orange-500/80">${item.when}</div>
                  <p class="mt-4 text-sm leading-relaxed text-white/62">${item.preview}</p>
                </div>
              `).join("")}
            </div>
          </div>
        </div>
      </section>
    `;
  }

  function renderDrawerContent() {
    if (!state.drawer) return "";

    const client = selectedClient();
    const clientOptions = mocks.clients.items.map((item) => `<option value="${item.id}" ${item.id === client.id ? "selected" : ""}>${item.name}</option>`).join("");

    if (state.drawer === "sale") {
      const term = mocks.saleTerms.find((item) => item.label === state.saleTerm) || mocks.saleTerms[0];
      const originalValue = 120;
      const increase = originalValue * (term.multiplier - 1);
      const finalValue = originalValue * term.multiplier;
      drawerKicker.textContent = "Venda fiado";
      drawerTitle.textContent = "Nova venda fiado";

      return `
        <form class="space-y-5">
          <div class="step-flow">
            <div class="step-card"><div class="step-badge">1</div><div><div class="text-sm font-medium text-white">Escolha o cliente</div><div class="mt-1 text-xs text-white/55">Ja vem um cliente selecionado.</div></div></div>
            <div class="step-card"><div class="step-badge">2</div><div><div class="text-sm font-medium text-white">Digite o valor</div><div class="mt-1 text-xs text-white/55">Sem campos desnecessarios.</div></div></div>
            <div class="step-card"><div class="step-badge">3</div><div><div class="text-sm font-medium text-white">Escolha o prazo</div><div class="mt-1 text-xs text-white/55">15 dias ja fica marcado.</div></div></div>
            <div class="step-card"><div class="step-badge">4</div><div><div class="text-sm font-medium text-white">Confirme</div><div class="mt-1 text-xs text-white/55">Veja o valor final antes de salvar.</div></div></div>
          </div>
          <div class="form-grid two-col">
            <label class="field-group"><span class="field-label">Cliente</span><select class="field-control">${clientOptions}</select></label>
            <label class="field-group"><span class="field-label">Prazo</span><div class="choice-row">${mocks.saleTerms.map((item) => `<button class="choice-chip ${item.label === state.saleTerm ? "active" : ""}" data-term="${item.label}" type="button">${item.label} <span class="text-white/50">${item.fee}</span></button>`).join("")}</div></label>
          </div>
          <label class="field-group"><span class="field-label">Descricao</span><input class="field-control" value="Compra de balcao" placeholder="Ex.: mercearia da semana" /></label>
          <div class="form-grid two-col">
            <label class="field-group"><span class="field-label">Valor da compra</span><input class="field-control" value="120,00" /></label>
            <label class="field-group"><span class="field-label">Data de vencimento</span><input class="field-control" value="${state.saleTerm === "15 dias" ? "12/04/2026" : "27/04/2026"}" /></label>
          </div>
          <div class="surface-panel p-5">
            <div class="text-sm font-medium text-white">Calculo automatico</div>
            <div class="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
              <div class="surface-card p-4"><div class="text-xs uppercase tracking-[0.24em] text-white/45">Original</div><div class="mt-3 text-xl font-medium tracking-tight text-white">${formatBRL(originalValue)}</div></div>
              <div class="surface-card p-4"><div class="text-xs uppercase tracking-[0.24em] text-white/45">Acrescimo</div><div class="mt-3 text-xl font-medium tracking-tight text-white">${formatBRL(increase)}</div></div>
              <div class="surface-card p-4"><div class="text-xs uppercase tracking-[0.24em] text-white/45">Valor final</div><div class="mt-3 text-xl font-medium tracking-tight text-orange-400">${formatBRL(finalValue)}</div></div>
            </div>
          </div>
          <div class="flex gap-3 pt-2">
            <button class="button-custom flex-1" type="button"><div class="points_wrapper"><i class="point"></i><i class="point"></i><i class="point"></i><i class="point"></i></div><span class="inner"><span>Salvar venda</span><i data-lucide="check" class="icon"></i></span></button>
            <button class="action-pill px-5" data-close-drawer type="button">Cancelar</button>
          </div>
        </form>
      `;
    }

    if (state.drawer === "payment") {
      const paid = 120;
      const remaining = Math.max(moneyToNumber(client.balance) - paid, 0);
      drawerKicker.textContent = "Baixa de saldo";
      drawerTitle.textContent = "Registrar pagamento";

      return `
        <form class="space-y-5">
          <div class="step-flow">
            <div class="step-card"><div class="step-badge">1</div><div><div class="text-sm font-medium text-white">Confirme o cliente</div><div class="mt-1 text-xs text-white/55">O ultimo cliente aberto ja aparece.</div></div></div>
            <div class="step-card"><div class="step-badge">2</div><div><div class="text-sm font-medium text-white">Digite o valor pago</div><div class="mt-1 text-xs text-white/55">O novo saldo aparece automaticamente.</div></div></div>
            <div class="step-card"><div class="step-badge">3</div><div><div class="text-sm font-medium text-white">Escolha a forma</div><div class="mt-1 text-xs text-white/55">Pix ja fica marcado por padrao.</div></div></div>
            <div class="step-card"><div class="step-badge">4</div><div><div class="text-sm font-medium text-white">Salvar</div><div class="mt-1 text-xs text-white/55">Pronto para voltar ao caixa.</div></div></div>
          </div>
          <div class="form-grid two-col">
            <label class="field-group"><span class="field-label">Cliente</span><select class="field-control">${clientOptions}</select></label>
            <label class="field-group"><span class="field-label">Data do pagamento</span><input class="field-control" value="28/03/2026" /></label>
          </div>
          <div class="form-grid two-col">
            <label class="field-group"><span class="field-label">Valor pago</span><input class="field-control" value="120,00" /></label>
            <label class="field-group"><span class="field-label">Forma de pagamento</span><div class="choice-row">${mocks.paymentMethods.map((item) => `<button class="choice-chip ${item === state.paymentMethod ? "active" : ""}" data-payment-method="${item}" type="button">${item}</button>`).join("")}</div></label>
          </div>
          <label class="field-group"><span class="field-label">Observacao</span><textarea class="field-control">Pagamento parcial registrado no caixa.</textarea></label>
          <div class="surface-panel p-5">
            <div class="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div class="surface-card p-4"><div class="text-xs uppercase tracking-[0.24em] text-white/45">Saldo atual</div><div class="mt-3 text-2xl font-medium tracking-tight text-white">${client.balance}</div></div>
              <div class="surface-card p-4"><div class="text-xs uppercase tracking-[0.24em] text-white/45">Saldo apos pagamento</div><div class="mt-3 text-2xl font-medium tracking-tight text-orange-400">${formatBRL(remaining)}</div></div>
            </div>
          </div>
          <div class="flex gap-3 pt-2">
            <button class="button-custom flex-1" type="button"><div class="points_wrapper"><i class="point"></i><i class="point"></i><i class="point"></i><i class="point"></i></div><span class="inner"><span>Registrar pagamento</span><i data-lucide="check" class="icon"></i></span></button>
            <button class="action-pill px-5" data-close-drawer type="button">Cancelar</button>
          </div>
        </form>
      `;
    }

    if (state.drawer === "menu") {
      drawerKicker.textContent = "Secundario";
      drawerTitle.textContent = "Mais opcoes";
      return `
        <div class="space-y-5">
          <div class="secondary-menu-list">
            ${secondaryViews.map((item) => `
              <button class="secondary-menu-item" data-menu-view="${item.id}" type="button">
                <div class="flex items-center gap-3">
                  <div class="w-11 h-11 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-orange-400">
                    <i data-lucide="${item.icon}" class="w-5 h-5"></i>
                  </div>
                  <div>
                    <div class="text-base font-medium tracking-tight text-white">${item.label}</div>
                    <div class="mt-1 text-sm text-white/50">${item.hint}</div>
                  </div>
                </div>
                <i data-lucide="chevron-right" class="w-5 h-5 text-white/50"></i>
              </button>
            `).join("")}
          </div>
          <div class="surface-panel p-5">
            <div class="text-sm font-medium text-white">Regra da tela inicial</div>
            <div class="mt-2 text-sm leading-relaxed text-white/55">Na entrada aparecem so venda, pagamento e clientes. O restante fica aqui para reduzir erro e hesitacao.</div>
          </div>
        </div>
      `;
    }

    drawerKicker.textContent = "Cadastro";
    drawerTitle.textContent = "Cliente";
    return `
      <form class="space-y-5">
        <div class="step-flow">
          <div class="step-card"><div class="step-badge">1</div><div><div class="text-sm font-medium text-white">Nome e telefone</div><div class="mt-1 text-xs text-white/55">So o essencial primeiro.</div></div></div>
          <div class="step-card"><div class="step-badge">2</div><div><div class="text-sm font-medium text-white">Detalhes opcionais</div><div class="mt-1 text-xs text-white/55">Endereco, limite e observacoes.</div></div></div>
        </div>
        <div class="form-grid two-col">
          <label class="field-group"><span class="field-label">Nome</span><input class="field-control" value="${client.name}" placeholder="Nome completo" /></label>
          <label class="field-group"><span class="field-label">Telefone</span><input class="field-control" value="${client.phone}" placeholder="(11) 99999-9999" /></label>
        </div>
        <div class="form-grid two-col">
          <label class="field-group"><span class="field-label">Endereco</span><input class="field-control" value="${client.address}" placeholder="Opcional" /></label>
          <label class="field-group"><span class="field-label">Limite de credito</span><input class="field-control" value="${client.limit.replace("R$ ", "")}" placeholder="Opcional" /></label>
        </div>
        <label class="field-group"><span class="field-label">Observacoes</span><textarea class="field-control" placeholder="Opcional">${client.notes}</textarea></label>
        <div class="surface-panel p-5">
          <div class="text-sm font-medium text-white">Estado visual de sucesso</div>
          <div class="mt-3 flex items-center gap-3 rounded-2xl border border-orange-500/20 bg-orange-500/10 px-4 py-3 text-sm text-orange-100">
            <i data-lucide="check-circle-2" class="w-4 h-4 text-orange-400"></i>
            <span>Previa pronta para feedback apos salvar cliente.</span>
          </div>
        </div>
        <div class="flex gap-3 pt-2">
          <button class="button-custom flex-1" type="button"><div class="points_wrapper"><i class="point"></i><i class="point"></i><i class="point"></i><i class="point"></i></div><span class="inner"><span>Salvar cliente</span><i data-lucide="check" class="icon"></i></span></button>
          <button class="action-pill px-5" data-close-drawer type="button">Cancelar</button>
        </div>
      </form>
    `;
  }

  function renderMain() {
    const titles = {
      dashboard: "Dashboard",
      clientes: "Clientes",
      cliente: "Detalhe do cliente",
      relatorios: "Relatorios",
      cobrancas: "Cobrancas WhatsApp"
    };
    pageTitle.textContent = titles[state.view] || "Controle de Fiado";

    if (state.view === "dashboard") root.innerHTML = renderDashboard();
    if (state.view === "clientes") root.innerHTML = renderClients();
    if (state.view === "cliente") root.innerHTML = renderClientDetail();
    if (state.view === "relatorios") root.innerHTML = renderReports();
    if (state.view === "cobrancas") root.innerHTML = renderReminders();
  }

  function renderDrawer() {
    if (!state.drawer) {
      drawer.classList.add("hidden");
      drawerBackdrop.classList.add("hidden");
      drawer.setAttribute("aria-hidden", "true");
      drawerBody.innerHTML = "";
      return;
    }

    drawer.classList.remove("hidden");
    drawerBackdrop.classList.remove("hidden");
    drawer.setAttribute("aria-hidden", "false");
    drawerBody.innerHTML = renderDrawerContent();
  }

  function openDrawer(type) {
    state.drawer = type;
    renderDrawer();
    bindEvents();
    lucide.createIcons({ attrs: { "stroke-width": 1.5 } });
  }

  function closeDrawer() {
    state.drawer = null;
    renderDrawer();
  }

  function routeQuickAction(action) {
    if (action === "clientes") {
      state.view = "clientes";
      render();
      return;
    }
    if (action === "reports") {
      state.view = "relatorios";
      render();
      return;
    }
    openDrawer(action);
  }

  function bindEvents() {
    document.querySelectorAll("[data-view]").forEach((item) => {
      item.onclick = () => {
        state.view = item.dataset.view;
        render();
      };
    });

    document.querySelectorAll("[data-open-drawer]").forEach((item) => {
      item.onclick = () => routeQuickAction(item.dataset.openDrawer);
    });

    document.querySelectorAll("[data-close-drawer]").forEach((item) => {
      item.onclick = closeDrawer;
    });

    document.querySelectorAll("[data-client-state]").forEach((item) => {
      item.onclick = () => {
        state.clientsState = item.dataset.clientState;
        render();
      };
    });

    document.querySelectorAll("[data-view-client]").forEach((item) => {
      item.onclick = () => {
        mocks.selectedClientId = Number(item.dataset.viewClient);
        state.view = "cliente";
        render();
      };
    });

    document.querySelectorAll("[data-menu-view]").forEach((item) => {
      item.onclick = () => {
        state.view = item.dataset.menuView;
        state.drawer = null;
        render();
      };
    });

    document.querySelectorAll("[data-quick-action]").forEach((item) => {
      item.onclick = () => routeQuickAction(item.dataset.quickAction);
    });

    document.querySelectorAll("[data-term]").forEach((item) => {
      item.onclick = () => {
        state.saleTerm = item.dataset.term;
        renderDrawer();
        bindEvents();
        lucide.createIcons({ attrs: { "stroke-width": 1.5 } });
      };
    });

    document.querySelectorAll("[data-payment-method]").forEach((item) => {
      item.onclick = () => {
        state.paymentMethod = item.dataset.paymentMethod;
        renderDrawer();
        bindEvents();
        lucide.createIcons({ attrs: { "stroke-width": 1.5 } });
      };
    });

    const searchField = document.getElementById("search-client");
    if (searchField) {
      searchField.oninput = (event) => {
        state.search = event.target.value;
        if (state.clientsState !== "success") state.clientsState = "success";
        render();
      };
    }

    drawerBackdrop.onclick = closeDrawer;
  }

  function render() {
    renderNav();
    renderMain();
    renderDrawer();
    bindEvents();
    lucide.createIcons({ attrs: { "stroke-width": 1.5 } });
  }

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") closeDrawer();
  });

  render();
})();
