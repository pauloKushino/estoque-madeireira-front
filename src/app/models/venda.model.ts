export interface ItemVendaRequest {
  produtoId: number;
  quantidade: number;
}

export interface VendaRequest {
  clienteId: number;
  itens: ItemVendaRequest[];
}

export interface ItemVenda {
  id: number;
  produtoId: number;
  nomeProduto: string;
  quantidade: number;
  precoUnitarioNoMomento: number;
  subtotal: number;
}

export interface Venda {
  id: number;
  clienteId: number;
  dataVenda: string;
  valorTotal: number;
  itens: ItemVenda[];
}
