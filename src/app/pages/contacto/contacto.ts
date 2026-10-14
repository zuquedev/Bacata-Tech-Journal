import { Component, ElementRef, inject, signal, viewChild } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { correoValido, minTrim, requeridoTrim } from '../../utils/validadores';

@Component({
  selector: 'app-contacto',
  imports: [ReactiveFormsModule],
  templateUrl: './contacto.html',
})
export class Contacto {
  private readonly fb = inject(NonNullableFormBuilder);

  protected readonly form = this.fb.group({
    nombre: ['', requeridoTrim],
    correo: ['', correoValido],
    asunto: ['Consulta general'],
    mensaje: ['', minTrim(20)],
  });

  /** Los errores solo se muestran después de pulsar "Enviar" (igual que antes). */
  protected readonly intentado = signal(false);
  protected readonly enviado = signal(false);
  private readonly confirmacion = viewChild<ElementRef<HTMLElement>>('confirmacion');

  protected mostrarError(campo: 'nombre' | 'correo' | 'mensaje'): boolean {
    return this.intentado() && this.form.controls[campo].invalid;
  }

  protected enviar(): void {
    this.intentado.set(true);

    if (this.form.invalid) {
      this.enviado.set(false);
      return;
    }

    this.enviado.set(true);
    this.form.reset();            // vuelve a los valores iniciales
    this.intentado.set(false);
    setTimeout(() => this.confirmacion()?.nativeElement.scrollIntoView({ behavior: 'smooth', block: 'center' }));
  }
}
