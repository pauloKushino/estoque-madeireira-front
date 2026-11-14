# Estoque Madeireira — Frontend

![CI/CD](https://github.com/pauloKushino/estoque-madeireira-front/actions/workflows/ci-cd.yml/badge.svg)

Interface web para o sistema de controle de estoque de uma madeireira, consumindo a API Spring Boot.

## Stack

- Angular 19 (componentes standalone, sem NgModules)
- MDBootstrap (mdb-angular-ui-kit) para componentes visuais
- SweetAlert2 para alertas (via `AlertService`)
- RxJS + HttpClient com interceptor global de erros

## Como rodar

Pré-requisitos: Node.js 20+ e o backend no ar (veja o repositório do backend).

```powershell
npm install
npm start          # http://localhost:4200
```

Login de teste (mockado no front): **admin / 1234**

## Demo

A demo pública ainda não foi publicada. Para rodar localmente, siga os passos acima (front em http://localhost:4200 e API em http://localhost:8080/swagger-ui.html).

## Estrutura

```
src/app/
├── core/        layout (navbar/sidebar), guards, interceptors, AlertService
├── services/    AuthService + services HTTP da API
├── models/      interfaces TypeScript dos DTOs
├── shared/      (componentes reutilizaveis futuros)
├── produtos/    listagem, CRUD, filtro por nome, badge de estoque baixo
├── clientes/    listagem, CRUD, busca de endereco por CEP (ViaCEP)
├── vendas/      listagem, detalhes, nova venda com itens dinamicos
└── auth/login/  tela de login (fora do layout principal)
```

## Decisoes tecnicas

- Erros HTTP (4xx/5xx) sao tratados uma unica vez no `errorInterceptor` (exibe a mensagem `message` da ApiError do backend) — os componentes nao repetem alertas.
- Rotas protegidas por `authGuard` (flag em `localStorage`); autenticacao mockada apenas para fins academicos.
- A URL da API fica em `src/environments/environment.ts`.