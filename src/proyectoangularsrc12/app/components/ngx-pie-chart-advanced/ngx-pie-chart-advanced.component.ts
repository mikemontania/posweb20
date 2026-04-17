import { Component, OnDestroy, Input } from '@angular/core';
 
@Component({
  selector: 'ngx-pie-advanced',
  templateUrl: './ngx-pie-chart-advanced.component.html',
  styleUrls: ['./ngx-pie-chart-advanced.component.css']
})
export class NGXPieAdvancedComponent  implements OnDestroy  {
  @Input() results: any[] = [];
  @Input() legendTitle: string;
  @Input() dashTema ;
 
   gradient: boolean = true;
  showLegend: boolean = true;
  showLabels: boolean = false;
  isDoughnut: boolean = false;
  legendPosition: string = 'below';


  constructor() {}

  onSelect(data): void {
    console.log('Item clicked', JSON.parse(JSON.stringify(data)));
  }

  ngOnDestroy() {
    // clearInterval( this.intervalo );
  }
}
