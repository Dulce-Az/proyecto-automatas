
import { AfterViewInit, Component, ElementRef, ViewChild, inject } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import * as d3 from 'd3';
import 'd3-graphviz';

@Component({
  imports: [],
  selector: 'app-grafica',
  styleUrl: './grafica.css',
  templateUrl: './grafica.html',
})
export class Grafica implements AfterViewInit {

  @ViewChild('graphContainer', { static: true }) graphContainer!: ElementRef;

  codigoGraphviz: string = '';
  nombre: string = '';

  private route = inject(ActivatedRoute);

  constructor() {
    this.route.queryParams.subscribe(params => {
      this.codigoGraphviz = params['codigoGraphviz'] || '';
      this.nombre = params['nombre'] || 'Estructura';
    });
  }

  ngAfterViewInit() {
    let codigo = "digraph {" + this.codigoGraphviz + "}";

    let grafo: any = d3.select(this.graphContainer.nativeElement);

    grafo.graphviz().renderDot(codigo);
  }
}
