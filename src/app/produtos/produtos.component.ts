import { CurrencyPipe, DecimalPipe, registerLocaleData } from '@angular/common';
import localePt from '@angular/common/locales/pt';
import { Component, LOCALE_ID, OnInit } from '@angular/core';
import { AbstractControl, FormBuilder, FormControl, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { AlertService } from '../core/services/alert.service';
import { Produto, ProdutoRequest, UnidadeMedida } from '../models/produto.model';
import { ProdutoService } from '../services/produto.service';

registerLocaleData(localePt);

interface UnidadeMedidaOpcao {
  valor: UnidadeMedida;
  rotulo: string;
}

// Validators.min e inclusivo; aqui o preco precisa ser estritamente maior que zero
function precoPositivo(control: AbstractControl): ValidationErrors | null {
  const valor = control.value;
  if (valor === null || valor === undefined || valor === '') {
    return null; // campo vazio e tratado pelo Validators.required
  }
  return Number(valor) > 0 ? null : { precoPositivo: true };
}

@Component({
  selector: 'app-produtos',
  imports: [ReactiveFormsModule, MdbFormsModule, CurrencyPipe, DecimalPipe],
  providers: [{ provide: LOCALE_ID, useValue: 'pt-BR' }],
  templateUrl: './produtos.component.html'
})
export class ProdutosComponent implements OnInit {

  readonly unidadesMedida: UnidadeMedidaOpcao[] = [
    { valor: 'M3', rotulo: 'm³' },
    { valor: 'METRO_LINEAR', rotulo: 'Metro linear' },
    { valor: 'UNIDADE', rotulo: 'Unidade' }
  ];

  readonly filtroNome = new FormControl('', { nonNullable: true });

  readonly form;

  produtos: Produto[] = [];
  carregando = false;
  salvando = false;
  formVisivel = false;
  produtoEmEdicao: Produto | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly produtoService: ProdutoService,
    private readonly alertService: AlertService
  ) {
    this.form = this.formBuilder.nonNullable.group({
      nome: ['', [Validators.required, Validators.maxLength(120)]],
      unidadeMedida: ['' as UnidadeMedida | '', Validators.required],
      quantidadeEstoque: [null as number | null, [Validators.required, Validators.min(0)]],
      precoUnitario: [null as number | null, [Validators.required, precoPositivo]],
      estoqueMinimo: [null as number | null, Validators.min(0)]
    });
  }

  ngOnInit(): void {
    this.carregar();
  }

  carregar(nome?: string): void {
    this.carregando = true;
    this.produtoService.listar(nome).subscribe({
      next: (produtos) => {
        this.produtos = produtos;
        this.carregando = false;
      },
      error: () => {
        // O interceptor global ja exibe o alerta de erro
        this.carregando = false;
      }
    });
  }

  buscar(): void {
    this.carregar(this.filtroAtual());
  }

  limparFiltro(): void {
    this.filtroNome.setValue('');
    this.carregar();
  }

  abrirNovo(): void {
    this.produtoEmEdicao = null;
    this.form.reset();
    this.formVisivel = true;
  }

  abrirEdicao(produto: Produto): void {
    this.produtoEmEdicao = produto;
    this.form.reset();
    this.form.patchValue({
      nome: produto.nome,
      unidadeMedida: produto.unidadeMedida,
      quantidadeEstoque: produto.quantidadeEstoque,
      precoUnitario: produto.precoUnitario,
      estoqueMinimo: produto.estoqueMinimo ?? null
    });
    this.formVisivel = true;
  }

  fecharFormulario(): void {
    this.formVisivel = false;
    this.produtoEmEdicao = null;
    this.form.reset();
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const request: ProdutoRequest = {
      nome: valores.nome.trim(),
      unidadeMedida: valores.unidadeMedida as UnidadeMedida,
      quantidadeEstoque: Number(valores.quantidadeEstoque),
      precoUnitario: Number(valores.precoUnitario)
    };
    if (valores.estoqueMinimo !== null) {
      request.estoqueMinimo = Number(valores.estoqueMinimo);
    }

    const emEdicao = this.produtoEmEdicao;
    this.salvando = true;

    const operacao = emEdicao
      ? this.produtoService.atualizar(emEdicao.id, request)
      : this.produtoService.criar(request);

    operacao.subscribe({
      next: () => {
        this.salvando = false;
        this.alertService.sucesso(
          emEdicao ? 'Produto atualizado' : 'Produto criado',
          `"${request.nome}" foi salvo com sucesso.`
        );
        this.fecharFormulario();
        this.carregar(this.filtroAtual());
      },
      error: () => {
        // O interceptor global ja exibe o alerta de erro; o formulario permanece aberto
        this.salvando = false;
      }
    });
  }

  async excluir(produto: Produto): Promise<void> {
    const confirmado = await this.alertService.confirmar(
      'Excluir produto',
      `Deseja realmente excluir "${produto.nome}"?`
    );
    if (!confirmado) {
      return;
    }

    this.produtoService.excluir(produto.id).subscribe({
      next: () => {
        this.alertService.sucesso('Produto excluido', `"${produto.nome}" foi removido.`);
        this.carregar(this.filtroAtual());
      },
      error: () => {
        // O interceptor global ja exibe o alerta de erro
      }
    });
  }

  estoqueBaixo(produto: Produto): boolean {
    return produto.estoqueMinimo !== undefined && produto.quantidadeEstoque <= produto.estoqueMinimo;
  }

  rotuloUnidade(unidade: UnidadeMedida): string {
    return this.unidadesMedida.find((opcao) => opcao.valor === unidade)?.rotulo ?? unidade;
  }

  // Inteiros sem casas decimais; valores fracionados com exatamente 3 casas
  digitosQuantidade(produto: Produto): string {
    return Number.isInteger(produto.quantidadeEstoque) ? '1.0-0' : '1.3-3';
  }

  private filtroAtual(): string | undefined {
    const nome = this.filtroNome.value.trim();
    return nome ? nome : undefined;
  }
}
