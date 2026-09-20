export interface Cliente {
  id: number;
  nome: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  cep?: string;
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}

export interface ClienteRequest {
  nome: string;
  cpfCnpj?: string;
  telefone?: string;
  email?: string;
  cep?: string;
  logradouro?: string;
  bairro?: string;
  cidade?: string;
  uf?: string;
}
