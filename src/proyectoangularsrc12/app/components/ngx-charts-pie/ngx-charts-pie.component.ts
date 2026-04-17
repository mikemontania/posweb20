import { Component, OnDestroy, Input } from '@angular/core';
 
@Component({
  selector: 'ngx-pie-chart',
  templateUrl: './ngx-charts-pie.component.html',
  styleUrls: ['./ngx-charts-pie.component.css']
})
export class NGXPieComponent  implements OnDestroy  {
  @Input() results: any[] = [];
  @Input() legendTitle: string;
  @Input()   dashTema ;
/*   results: any[] = [
    {
      "name": "Germany",
      "value": 8940000
    },
    {
      "name": "USA",
      "value": 5000000
    },
    {
      "name": "France",
      "value": 7200000
    },
      {
      "name": "UK",
      "value": 6200000
    }
  ]; */
 
  // options
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
