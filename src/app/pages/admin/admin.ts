import { Component, inject, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CATEGORIAS, IMAGENES, Noticia } from '../../models/noticia';
import { NoticiasService } from '../../services/noticias.service';

interface Aviso { texto: string; tipo: 'ok' | 'error'; }

/** Mini CRUD: crear y eliminar publicaciones (protegido por authGuard en las rutas). */
@Component({
  selector: 'app-admin',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './admin.html',
})
export class Admin {
  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly catalogo = inject(NoticiasService);

  protected readonly categorias = CATEGORIAS;
  protected readonly imagenes = IMAGENES;
  protected readonly aviso = signal<Aviso | null>(null);

  protected readonly form = this.fb.group({
    titulo: '',
    categoria: CATEGORIAS[0],
    ubicacion: '',
    imagen: IMAGENES[0].valor,
    descripcion: '',
    contenido: '',
  });

  protected publicar(): void {
    const v = this.form.getRawValue();
    const datos = {
      titulo: v.titulo.trim(),
      categoria: v.categoria,
      descripcion: v.descripcion.trim(),
      contenido: v.contenido.trim(),
      ubicacion: v.ubicacion.trim(),
      imagen: v.imagen,
    };

    if (!datos.titulo || !datos.descripcion || !datos.contenido) {
      this.avisar('Completa el título, la descripción breve y el contenido.', 'error');
      return;
    }
    if (datos.descripcion.length < 20) {
      this.avisar('La descripción breve debe tener al menos 20 caracteres.', 'error');
      return;
    }

    this.catalogo.crear(datos);
    this.form.reset();
    this.avisar('Publicación creada. Ya aparece en el catálogo y en el inicio.', 'ok');
  }

  protected eliminar(n: Noticia): void {
    if (confirm('¿Eliminar "' + n.titulo + '"?')) {
      this.catalogo.eliminar(n.id);
      this.avisar('Publicación eliminada del catálogo.', 'ok');
    }
  }

  protected restaurar(): void {
    if (confirm('Esto elimina tus publicaciones y restaura el catálogo original. ¿Continuar?')) {
      this.catalogo.restaurar();
      this.avisar('Catálogo restaurado a su estado inicial.', 'ok');
    }
  }

  private avisar(texto: string, tipo: Aviso['tipo']): void {
    this.aviso.set({ texto, tipo });
  }
}
