import { NgModule } from '@angular/core';
import { ImagenPipe } from './imagen.pipe';
import { SearchPipe } from './SearchPipe.pipe';
import { ImagenProductoPipe } from './imagenProducto.pipe';

@NgModule({
  declarations: [ImagenPipe, ImagenProductoPipe, SearchPipe],
  imports: [],
  exports: [ImagenPipe, ImagenProductoPipe, SearchPipe]
})
export class PipesModule { }
