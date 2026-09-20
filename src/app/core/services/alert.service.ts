import { Injectable } from '@angular/core';
import Swal from 'sweetalert2';

@Injectable({ providedIn: 'root' })
export class AlertService {

  sucesso(titulo: string, mensagem?: string): void {
    Swal.fire({
      icon: 'success',
      title: titulo,
      text: mensagem,
      confirmButtonText: 'OK',
      confirmButtonColor: '#3b71ca'
    });
  }

  erro(titulo: string, mensagem?: string): void {
    Swal.fire({
      icon: 'error',
      title: titulo,
      text: mensagem,
      confirmButtonText: 'OK',
      confirmButtonColor: '#3b71ca'
    });
  }

  async confirmar(titulo: string, mensagem: string, textoConfirmar = 'Sim, confirmar'): Promise<boolean> {
    const resultado = await Swal.fire({
      icon: 'warning',
      title: titulo,
      text: mensagem,
      showCancelButton: true,
      confirmButtonText: textoConfirmar,
      cancelButtonText: 'Cancelar',
      confirmButtonColor: '#dc4c64',
      reverseButtons: true
    });
    return resultado.isConfirmed;
  }
}
