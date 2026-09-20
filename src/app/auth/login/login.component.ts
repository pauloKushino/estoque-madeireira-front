import { Component } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { MdbFormsModule } from 'mdb-angular-ui-kit/forms';
import { AlertService } from '../../core/services/alert.service';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, MdbFormsModule],
  templateUrl: './login.component.html',
  styleUrl: './login.component.scss'
})
export class LoginComponent {

  readonly form;

  constructor(
    private readonly formBuilder: FormBuilder,
    private readonly authService: AuthService,
    private readonly alertService: AlertService,
    private readonly router: Router
  ) {
    this.form = this.formBuilder.nonNullable.group({
      usuario: ['', Validators.required],
      senha: ['', Validators.required]
    });
  }

  entrar(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { usuario, senha } = this.form.getRawValue();

    if (this.authService.login(usuario, senha)) {
      this.router.navigate(['/']);
    } else {
      this.alertService.erro('Falha no login', 'Usuario ou senha invalidos. Tente novamente.');
    }
  }
}
