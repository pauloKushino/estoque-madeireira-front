export type UnidadeMedida = 'M3' | 'METRO_LINEAR' | 'UNIDADE';

export interface Produto {
  id: number;
  nome: string;
  unidadeMedida: UnidadeMedida;
  quantidadeEstoque: number;
  precoUnitario: number;
  estoqueMinimo?: number;
}

export interface ProdutoRequest {
  nome: string;
  unidadeMedida: UnidadeMedida;
  quantidadeEstoque: number;
  precoUnitario: number;
  estoqueMinimo?: number;
}

export interface EstoqueResponse {
  produtoId: number;
  nomeProduto: string;
  quantidadeDisponivel: number;
  unidadeMedida: UnidadeMedida;
}
