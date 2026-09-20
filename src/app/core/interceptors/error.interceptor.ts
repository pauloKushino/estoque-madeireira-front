import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { catchError, throwError } from 'rxjs';
import { AlertService } from '../services/alert.service';

export const errorInterceptor: HttpInterceptorFn = (req, next) => {
  const alertService = inject(AlertService);

  return next(req).pipe(
    catchError((erro: HttpErrorResponse) => {
      let mensagem: string;

      if (erro.status === 0) {
        // Backend fora do ar ou sem resposta de rede
        mensagem = 'Nao foi possivel conectar ao servidor. Verifique se a API esta no ar.';
      } else {
        // O backend devolve ApiError { timestamp, status, error, message, path }
        mensagem = erro.error?.message ?? `Erro ${erro.status} ao processar a requisicao.`;
      }

      alertService.erro('Ops, algo deu errado', mensagem);
      return throwError(() => erro);
    })
  );
};
