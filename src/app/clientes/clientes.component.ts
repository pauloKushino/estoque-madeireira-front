import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, ReactiveFormsModule, Validators } from '@angular/forms';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { AlertService } from '../core/services/alert.service';
import { Cliente, ClienteRequest } from '../models/cliente.model';
import { ClienteService } from '../services/cliente.service';
import { EnderecoService } from '../services/endereco.service';

@Component({
  selector: 'app-clientes',
  imports: [ReactiveFormsModule, MdbFormsModule],
  templateUrl: './clientes.component.html'
})
export class ClientesComponent implements OnInit {

  readonly filtroNome = new FormControl('', { nonNullable: true });

  readonly form;

  clientes: Cliente[] = [];
  carregando = false;
  salvando = false;
  buscandoCep = false;
  formVisivel = false;
  clienteEmEdicao: Cliente | null = null;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly clienteService: ClienteService,
    private readonly enderecoService: EnderecoService,
    private readonly alertService: AlertService
  ) {
    this.form = this.formBuilder.nonNullable.group({
      nome: ['', [Validators.required, Validators.maxLength(120)]],
      cpfCnpj: ['', Validators.maxLength(18)],
      telefone: ['', Validators.maxLength(20)],
      email: ['', Validators.email],
      cep: ['', Validators.pattern('\\d{5}-?\\d{3}')],
      logradouro: [''],
      bairro: [''],
      cidade: [''],
      uf: ['', Validators.pattern('[A-Za-z]{2}')]
    });
  }

  ngOnInit(): void {
    this.carregar();
  }

  carregar(nome?: string): void {
    this.carregando = true;
    this.clienteService.listar(nome).subscribe({
      next: (clientes) => {
        this.clientes = clientes;
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
    this.clienteEmEdicao = null;
    this.form.reset();
    this.formVisivel = true;
  }

  abrirEdicao(cliente: Cliente): void {
    this.clienteEmEdicao = cliente;
    this.form.reset();
    this.form.patchValue({
      nome: cliente.nome,
      cpfCnpj: cliente.cpfCnpj ?? '',
      telefone: cliente.telefone ?? '',
      email: cliente.email ?? '',
      cep: cliente.cep ?? '',
      logradouro: cliente.logradouro ?? '',
      bairro: cliente.bairro ?? '',
      cidade: cliente.cidade ?? '',
      uf: cliente.uf ?? ''
    });
    this.formVisivel = true;
  }

  fecharFormulario(): void {
    this.formVisivel = false;
    this.clienteEmEdicao = null;
    this.form.reset();
  }

  buscarCep(): void {
    const cepControl = this.form.controls.cep;
    if (cepControl.invalid) {
      cepControl.markAsTouched();
      return;
    }

    this.buscandoCep = true;
    this.enderecoService.consultarCep(cepControl.value).subscribe({
      next: (endereco) => {
        this.form.patchValue({
          logradouro: endereco.logradouro,
          bairro: endereco.bairro,
          cidade: endereco.cidade,
          uf: endereco.uf
        });
        this.buscandoCep = false;
      },
      error: () => {
        // O interceptor global ja exibe o alerta de erro; os campos nao sao preenchidos
        this.buscandoCep = false;
      }
    });
  }

  salvar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const valores = this.form.getRawValue();
    const request: ClienteRequest = { nome: valores.nome.trim() };
    this.preencherOpcional(valores.cpfCnpj, (valor) => request.cpfCnpj = valor);
    this.preencherOpcional(valores.telefone, (valor) => request.telefone = valor);
    this.preencherOpcional(valores.email, (valor) => request.email = valor);
    this.preencherOpcional(valores.cep, (valor) => request.cep = valor);
    this.preencherOpcional(valores.logradouro, (valor) => request.logradouro = valor);
    this.preencherOpcional(valores.bairro, (valor) => request.bairro = valor);
    this.preencherOpcional(valores.cidade, (valor) => request.cidade = valor);
    this.preencherOpcional(valores.uf.toUpperCase(), (valor) => request.uf = valor);

    const emEdicao = this.clienteEmEdicao;
    this.salvando = true;

    const operacao = emEdicao
      ? this.clienteService.atualizar(emEdicao.id, request)
      : this.clienteService.criar(request);

    operacao.subscribe({
      next: () => {
        this.salvando = false;
        this.alertService.sucesso(
          emEdicao ? 'Cliente atualizado' : 'Cliente criado',
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

  async excluir(cliente: Cliente): Promise<void> {
    const confirmado = await this.alertService.confirmar(
      'Excluir cliente',
      `Deseja realmente excluir "${cliente.nome}"?`
    );
    if (!confirmado) {
      return;
    }

    this.clienteService.excluir(cliente.id).subscribe({
      next: () => {
        this.alertService.sucesso('Cliente excluido', `"${cliente.nome}" foi removido.`);
        this.carregar(this.filtroAtual());
      },
      error: () => {
        // O interceptor global ja exibe o alerta de erro
      }
    });
  }

  campoInvalido(campo: string): boolean {
    const control = this.form.get(campo);
    return !!control && control.invalid && control.touched;
  }

  temErro(campo: string, erro: string): boolean {
    return this.form.get(campo)?.hasError(erro) ?? false;
  }

  valorOuTraco(valor?: string): string {
    const texto = valor?.trim();
    return texto ? texto : '-';
  }

  cidadeUf(cliente: Cliente): string {
    const cidade = cliente.cidade?.trim();
    const uf = cliente.uf?.trim();
    if (!cidade && !uf) {
      return '-';
    }
    return `${cidade || '-'}/${uf || '-'}`;
  }

  private preencherOpcional(valor: string, atribuir: (valor: string) => void): void {
    const texto = valor.trim();
    if (texto) {
      atribuir(texto);
    }
  }

  private filtroAtual(): string | undefined {
    const nome = this.filtroNome.value.trim();
    return nome ? nome : undefined;
  }
}
