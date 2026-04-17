// ============================================================
//  ChartLineComponent — Chart.js 4 líneas / área
//  Uso:
//    <app-chart-line
//      [labels]="fechas"
//      [datasets]="[{ label:'Ventas', data: valores }]"
//      [area]="true"
//    />
// ============================================================
import {
  Component, Input, AfterViewInit, OnDestroy, OnChanges,
  SimpleChanges, ViewChild, ElementRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chart-line',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-wrap">
      @if (title) { <h4 class="chart-title">{{ title }}</h4> }
      @if (loading) {
        <div class="chart-skeleton"></div>
      } @else if (!hasData) {
        <div class="chart-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/>
          </svg>
          <span>Sin datos</span>
        </div>
      } @else {
        <canvas #chartCanvas></canvas>
      }
    </div>
  `,
  styles: [`
    .chart-wrap{position:relative;width:100%;}
    .chart-title{font-size:.9375rem;font-weight:600;color:var(--text-primary);margin-bottom:.875rem;}
    canvas{width:100%!important;}
    .chart-skeleton,.chart-empty{height:220px;border-radius:var(--radius-md);}
    .chart-skeleton{background:linear-gradient(90deg,var(--border-color) 25%,color-mix(in srgb,var(--border-color) 50%,var(--bg-surface)) 50%,var(--border-color) 75%);background-size:200% 100%;animation:shimmer 1.4s infinite;}
    .chart-empty{border:1px dashed var(--border-color);display:flex;flex-direction:column;align-items:center;justify-content:center;gap:.5rem;color:var(--text-muted);font-size:.8125rem;}
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  `]
})
export class ChartLineComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() labels:   string[] = [];
  @Input() datasets: any[]    = [];
  @Input() title?:   string;
  @Input() area      = false;
  @Input() smooth    = true;
  @Input() loading   = false;
  @Input() height    = 220;

  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private chart: any;

  get hasData(): boolean {
    return this.datasets.some(d => d.data?.some((v: any) => v > 0));
  }

  async ngAfterViewInit(): Promise<void> {
    if (this.hasData) await this.buildChart();
  }

  async ngOnChanges(c: SimpleChanges): Promise<void> {
    if (this.chart) {
      this.chart.data.labels   = this.labels;
      this.chart.data.datasets = this.styledDatasets;
      this.chart.update('active');
    } else if (this.canvasRef && this.hasData) {
      await this.buildChart();
    }
  }

  ngOnDestroy(): void { this.chart?.destroy(); }

  private async buildChart(): Promise<void> {
    const { Chart, registerables } = await import('chart.js');
    Chart.register(...registerables);
    const style = getComputedStyle(document.documentElement);
    const textColor = style.getPropertyValue('--text-secondary').trim() || '#9CA3AF';
    const gridColor = style.getPropertyValue('--border-color').trim()   || '#374151';
    this.canvasRef.nativeElement.height = this.height;

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: 'line',
      data: { labels: this.labels, datasets: this.styledDatasets },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        interaction: { mode: 'index', intersect: false },
        plugins: {
          legend: {
            display: this.datasets.length > 1,
            labels: { color: textColor, font: { size: 12 }, boxWidth: 12 }
          }
        },
        scales: {
          x: {
            grid: { color: gridColor + '30' },
            ticks: { color: textColor, font: { size: 11 } }
          },
          y: {
            grid: { color: gridColor + '30' },
            ticks: { color: textColor, font: { size: 11 } }
          }
        }
      }
    });
  }

  private get styledDatasets(): any[] {
    const palette = ['#3B82F6','#10B981','#F59E0B','#EF4444','#8B5CF6'];
    return this.datasets.map((ds, i) => ({
      ...ds,
      borderColor:     ds.borderColor     ?? palette[i % palette.length],
      backgroundColor: ds.backgroundColor ?? (this.area ? palette[i % palette.length] + '33' : 'transparent'),
      fill:            this.area,
      tension:         this.smooth ? 0.4 : 0,
      pointRadius:     4,
      pointHoverRadius: 6,
      borderWidth:     2,
    }));
  }
}
