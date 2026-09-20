import { Injectable } from '@angular/core';

const CHAVE_LOGIN = 'estoque_madeireira_logado';

@Injectable({ providedIn: 'root' })
export class AuthService {

  // Validacao mockada em memoria: nao chama o backend (autenticacao fake para o trabalho)
  login(usuario: string, senha: string): boolean {
    if (usuario === 'admin' && senha === '1234') {
      localStorage.setItem(CHAVE_LOGIN, 'true');
      return true;
    }
    return false;
  }

  logout(): void {
    localStorage.removeItem(CHAVE_LOGIN);
  }

  estaLogado(): boolean {
    return localStorage.getItem(CHAVE_LOGIN) === 'true';
  }
}
