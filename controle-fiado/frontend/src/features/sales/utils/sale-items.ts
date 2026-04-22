import type { Sale, SaleItem } from "../types/sale";

const SALE_ITEMS_MARKER = "\n[[SALE_ITEMS]]";

export function normalizeSaleItemDraft(items: Array<Partial<SaleItem>>): SaleItem[] {
  return items
    .map((item) => ({
      name: item.name?.trim() ?? "",
      quantity: Number(item.quantity ?? 0),
      unitPrice: Number(item.unitPrice ?? 0)
    }))
    .filter((item) => item.name && item.quantity > 0 && item.unitPrice > 0)
    .map((item) => ({
      name: item.name,
      quantity: roundSaleValue(item.quantity),
      unitPrice: roundSaleValue(item.unitPrice)
    }));
}

export function serializeSaleDescription(description: string, saleItems: SaleItem[] = []) {
  const cleanDescription = description.trim();
  const normalizedItems = normalizeSaleItemDraft(saleItems);

  if (!normalizedItems.length) {
    return cleanDescription;
  }

  return `${cleanDescription}${SALE_ITEMS_MARKER}${encodeURIComponent(JSON.stringify(normalizedItems))}`;
}

export function parseSaleDescription(rawDescription: string) {
  const markerIndex = rawDescription.lastIndexOf(SALE_ITEMS_MARKER);

  if (markerIndex === -1) {
    return {
      description: rawDescription,
      saleItems: [] as SaleItem[]
    };
  }

  const description = rawDescription.slice(0, markerIndex).trim();
  const encodedItems = rawDescription.slice(markerIndex + SALE_ITEMS_MARKER.length);

  try {
    const parsedItems = JSON.parse(decodeURIComponent(encodedItems));

    if (!Array.isArray(parsedItems)) {
      throw new Error("Itens invalidos.");
    }

    return {
      description,
      saleItems: normalizeSaleItemDraft(parsedItems)
    };
  } catch {
    return {
      description: rawDescription,
      saleItems: [] as SaleItem[]
    };
  }
}

export function normalizeSale(sale: Sale): Sale {
  const parsed = parseSaleDescription(sale.description);

  return {
    ...sale,
    description: parsed.description,
    saleItems: sale.saleItems?.length ? normalizeSaleItemDraft(sale.saleItems) : parsed.saleItems
  };
}

export function getSaleItemsTotal(saleItems: Array<Partial<SaleItem>>) {
  return normalizeSaleItemDraft(saleItems).reduce((total, item) => total + item.quantity * item.unitPrice, 0);
}

function roundSaleValue(value: number) {
  return Math.round(value * 100) / 100;
}
