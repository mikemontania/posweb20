// ============================================================
//  ChartBarComponent — Chart.js 4 standalone
//  Reemplaza ngx-charts + ng2-charts barras
//  Uso:
//    <app-chart-bar
//      [labels]="['Ene','Feb','Mar']"
//      [datasets]="[{ label:'Ventas', data:[100,200,150] }]"
//      [title]="'Ventas por mes'"
//      [horizontal]="false"
//    />
// ============================================================
import {
  Component, Input, AfterViewInit, OnDestroy, OnChanges,
  SimpleChanges, ViewChild, ElementRef, ChangeDetectionStrategy
} from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-chart-bar',
  standalone: true,
  imports: [CommonModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-wrap">
      @if (title) {
        <h4 class="chart-title">{{ title }}</h4>
      }
      @if (loading) {
        <div class="chart-skeleton"></div>
      } @else if (!hasData) {
        <div class="chart-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/>
            <line x1="6" y1="20" x2="6" y2="14"/>
          </svg>
          <span>Sin datos</span>
        </div>
      } @else {
        <canvas #chartCanvas></canvas>
      }
    </div>
  `,
  styles: [`
    .chart-wrap { position: relative; width: 100%; }
    .chart-title {
      font-size: .9375rem; font-weight: 600;
      color: var(--text-primary); margin-bottom: .875rem;
    }
    canvas { width: 100% !important; }
    .chart-skeleton {
      height: 220px; border-radius: var(--radius-md);
      background: linear-gradient(90deg,
        var(--border-color) 25%,
        color-mix(in srgb, var(--border-color) 50%, var(--bg-surface)) 50%,
        var(--border-color) 75%);
      background-size: 200% 100%;
      animation: shimmer 1.4s infinite;
    }
    .chart-empty {
      height: 220px; border-radius: var(--radius-md);
      border: 1px dashed var(--border-color);
      display: flex; flex-direction: column;
      align-items: center; justify-content: center;
      gap: .5rem; color: var(--text-muted); font-size: .8125rem;
    }
    @keyframes shimmer { 0%{background-position:200% 0} 100%{background-position:-200% 0} }
  `]
})
export class ChartBarComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() labels:     string[]  = [];
  @Input() datasets:   any[]     = [];
  @Input() title?:     string;
  @Input() horizontal  = false;
  @Input() stacked     = false;
  @Input() loading     = false;
  @Input() height      = 220;

  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;

  private chart: any;

  get hasData(): boolean {
    return this.datasets.some(d => d.data?.some((v: any) => v > 0));
  }

  async ngAfterViewInit(): Promise<void> {
    if (this.hasData) await this.buildChart();
  }

  async ngOnChanges(changes: SimpleChanges): Promise<void> {
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
    const textColor  = style.getPropertyValue('--text-secondary').trim() || '#9CA3AF';
    const gridColor  = style.getPropertyValue('--border-color').trim()   || '#374151';

    this.canvasRef.nativeElement.height = this.height;

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: this.horizontal ? 'bar' : 'bar',
      data: {
        labels: this.labels,
        datasets: this.styledDatasets,
      },
      options: {
        indexAxis: this.horizontal ? 'y' : 'x',
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: this.datasets.length > 1,
            labels: { color: textColor, font: { size: 12 }, boxWidth: 12 }
          },
          tooltip: { mode: 'index', intersect: false }
        },
        scales: {
          x: {
            stacked: this.stacked,
            grid: { color: gridColor + '40' },
            ticks: { color: textColor, font: { size: 11 } }
          },
          y: {
            stacked: this.stacked,
            grid: { color: gridColor + '40' },
            ticks: { color: textColor, font: { size: 11 } }
          }
        }
      }
    });
  }

  private get styledDatasets(): any[] {
    const palette = [
      '#3B82F6','#10B981','#F59E0B','#EF4444',
      '#8B5CF6','#06B6D4','#F97316','#84CC16'
    ];
    return this.datasets.map((ds, i) => ({
      ...ds,
      backgroundColor: ds.backgroundColor ?? (palette[i % palette.length] + 'CC'),
      borderColor:      ds.borderColor     ?? palette[i % palette.length],
      borderWidth:      ds.borderWidth     ?? 1,
      borderRadius:     ds.borderRadius    ?? 4,
    }));
  }
}
