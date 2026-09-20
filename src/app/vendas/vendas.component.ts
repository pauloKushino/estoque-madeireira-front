import { CurrencyPipe, DatePipe, DecimalPipe, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { Component, LOCALE_ID, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  ReactiveFormsModule,
  ValidationErrors,
  Validators
} from '@angular/forms';
import { AlertService } from '../core/services/alert.service';
import { Cliente } from '../models/cliente.model';
import { Produto, UnidadeMedida } from '../models/produto.model';
import { Venda, VendaRequest } from '../models/venda.model';
import { ClienteService } from '../services/cliente.service';
import { ProdutoService } from '../services/produto.service';
import { VendaService } from '../services/venda.service';

registerLocaleData(localePt);

type ItemVendaForm = FormGroup<{
  produtoId: FormControl<number | null>;
  quantidade: FormControl<number | null>;
}>;

// Validators.min e inclusivo; a quantidade precisa ser estritamente maior que zero
function quantidadePositiva(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (valor === null || valor === undefined || valor === '') {
    return null; // campo vazio e tratado pelo Validators.required
  }
  return Number(valor) > 0 ? null : { quantidadePositiva: true };
}

@Component({
  selector: 'app-vendas',
  imports: [ReactiveFormsModule, CurrencyPipe, DatePipe, DecimalPipe],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }, CurrencyPipe],
  templateUrl: './vendas.component.html',
  styleUrl: './vendas.component.scss'
})
export class VendasComponent implements OnInit {

  private readonly rotulosUnidade: Record<UnidadeMedida, string> = {
    M3: 'm3',
    METRO_LINEAR: 'm linear',
    UNIDADE: 'un'
  };

  readonly form;

  vendas: Venda[] = [];
  clientes: Cliente[] = [];
  produtos: Produto[] = [];
  private nomesClientes = new Map<number, string>();

  carregando = false;
  carregandoProdutos = false;
  registrando = false;
  formVisivel = false;
  vendaExpandidaId: number | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly vendaService: VendaService,
    private readonly clienteService: ClienteService,
    private readonly produtoService: ProdutoService,
    private readonly alertService: AlertService,
    private readonly currency: CurrencyPipe
  ) {
    this.form = this.formBuilder.nonNullable.group({
      clienteId: [null as number | null, Validators.required],
      itens: this.formBuilder.nonNullable.array<ItemVendaForm>([], Validators.minLength(1))
    });
  }

  get itens(): FormArray<ItemVendaForm> {
    return this.form.controls.itens;
  }

  ngOnInit(): void {
    this.carregarVendas();
    this.carregarClientes();
  }

  carregarVendas(): void {
    this.carregando = true;
    this.vendaService.listar().subscribe({
      next: (vendas) => {
        // Mais recentes primeiro
        this.vendas = [...vendas].sort((a, b) => b.id - a.id);
        this.carregando = false;
      },
      error: () => {
        // O interceptor global ja exibe o alerta de erro
        this.carregando = false;
      }
    });
  }

  abrirNovaVenda(): void {
    this.form.reset({ clienteId: null });
    this.itens.clear();
    this.adicionarItem();
    this.formVisivel = true;
    this.carregarProdutos();
  }

  fecharFormulario(): void {
    this.formVisivel = false;
    this.form.reset({ clienteId: null });
    this.itens.clear();
  }

  adicionarItem(): void {
    this.itens.push(this.criarItemGroup());
  }

  removerItem(indice: number): void {
    if (this.itens.length > 1) {
      this.itens.removeAt(indice);
    }
  }

  registrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const request: VendaRequest = {
      clienteId: valores.clienteId as number,
      itens: valores.itens.map((item) => ({
        produtoId: item.produtoId as number,
        quantidade: Number(item.quantidade)
      }))
    };

    this.registrando = true;
    this.vendaService.criar(request).subscribe({
      next: () => {
        this.registrando = false;
        this.alertService.sucesso(
          'Venda registrada',
          `Total: ${this.currency.transform(this.totalVenda, 'BRL')}`
        );
        this.fecharFormulario();
        this.carregarVendas();
      },
      error: () => {
        // O interceptor global ja exibe o alerta de erro; o formulario permanece aberto
        this.registrando = false;
      }
    });
  }

  alternarDetalhes(vendaId: number): void {
    this.vendaExpandidaId = this.vendaExpandidaId === vendaId ? null : vendaId;
  }

  nomeCliente(clienteId: number): string {
    return this.nomesClientes.get(clienteId) ?? `Cliente #${clienteId}`;
  }

  subtotalItem(item: ItemVendaForm): number {
    const { produtoId, quantidade } = item.getRawValue();
    const produto = this.produtos.find((p) => p.id === produtoId);
    const qtd = Number(quantidade);
    if (!produto || !qtd || qtd <= 0) {
      return 0;
    }
    return produto.precoUnitario * qtd;
  }

  get totalVenda(): number {
    return this.itens.controls.reduce((total, item) => total + this.subtotalItem(item), 0);
  }

  descricaoEstoque(produto: Produto): string {
    return `${produto.nome} — estoque: ${produto.quantidadeEstoque} ${this.rotulosUnidade[produto.unidadeMedida]}`;
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  itemInvalido(item: ItemVendaForm, campo: 'produtoId' | 'quantidade'): boolean {
    const control = item.controls[campo];
    return control.invalid && control.touched;
  }

  private criarItemGroup(): ItemVendaForm {
    return this.formBuilder.nonNullable.group({
      produtoId: [null as number | null, Validators.required],
      quantidade: [null as number | null, [Validators.required, quantidadePositiva]]
    });
  }

  private carregarClientes(): void {
    this.clienteService.listar().subscribe({
      next: (clientes) => {
        this.clientes = clientes;
        this.nomesClientes = new Map(clientes.map((cliente) => [cliente.id, cliente.nome]));
      },
      error: () => {
        // O interceptor global ja exibe o alerta de erro
      }
    });
  }

  private carregarProdutos(): void {
    this.carregandoProdutos = true;
    this.produtoService.listar().subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.carregandoProdutos = false;
      },
      error: () => {
        // O interceptor global ja exibe o alerta de erro
        this.carregandoProdutos = false;
      }
    });
  }
}
