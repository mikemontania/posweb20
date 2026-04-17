// ============================================================
//  ChartPieComponent — Chart.js 4 (pie + doughnut)
//  Reemplaza ngx-charts pie, pie-advanced, pie-grid
//  Uso:
//    <app-chart-pie
//      [labels]="['Efectivo','Tarjeta','QR']"
//      [data]="[450000, 200000, 80000]"
//      [donut]="true"
//    />
// ============================================================
import {
  Component, Input, AfterViewInit, OnDestroy, OnChanges,
  SimpleChanges, ViewChild, ElementRef, ChangeDetectionStrategy
} from '@angular/core';

@Component({
  selector: 'app-chart-pie',
  standalone: true,
  imports: [],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="chart-wrap">
      @if (title) { <h4 class="chart-title">{{ title }}</h4> }
      @if (loading) {
        <div class="chart-skeleton"></div>
      } @else if (!hasData) {
        <div class="chart-empty">
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path d="M21.21 15.89A10 10 0 1 1 8 2.83"/>
            <path d="M22 12A10 10 0 0 0 12 2v10z"/>
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
    .chart-title { font-size:.9375rem;font-weight:600;color:var(--text-primary);margin-bottom:.875rem; }
    canvas { width:100%!important; }
    .chart-skeleton,.chart-empty {
      height:220px;border-radius:var(--radius-md);
    }
    .chart-skeleton {
      background:linear-gradient(90deg,var(--border-color) 25%,color-mix(in srgb,var(--border-color) 50%,var(--bg-surface)) 50%,var(--border-color) 75%);
      background-size:200% 100%;animation:shimmer 1.4s infinite;
    }
    .chart-empty {
      border:1px dashed var(--border-color);
      display:flex;flex-direction:column;align-items:center;justify-content:center;
      gap:.5rem;color:var(--text-muted);font-size:.8125rem;
    }
    @keyframes shimmer{0%{background-position:200% 0}100%{background-position:-200% 0}}
  `]
})
export class ChartPieComponent implements AfterViewInit, OnDestroy, OnChanges {
  @Input() labels:  string[] = [];
  @Input() data:    number[] = [];
  @Input() title?:  string;
  @Input() donut    = false;
  @Input() loading  = false;
  @Input() height   = 220;

  @ViewChild('chartCanvas') canvasRef!: ElementRef<HTMLCanvasElement>;
  private chart: any;

  get hasData(): boolean { return this.data.some(v => v > 0); }

  async ngAfterViewInit(): Promise<void> {
    if (this.hasData) await this.buildChart();
  }

  async ngOnChanges(c: SimpleChanges): Promise<void> {
    if (this.chart) {
      this.chart.data.labels            = this.labels;
      this.chart.data.datasets[0].data  = this.data;
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
    this.canvasRef.nativeElement.height = this.height;

    this.chart = new Chart(this.canvasRef.nativeElement, {
      type: this.donut ? 'doughnut' : 'pie',
      data: {
        labels: this.labels,
        datasets: [{
          data: this.data,
          backgroundColor: [
            '#3B82F6CC','#10B981CC','#F59E0BCC','#EF4444CC',
            '#8B5CF6CC','#06B6D4CC','#F97316CC','#84CC16CC'
          ],
          borderWidth: 2,
          borderColor: style.getPropertyValue('--bg-surface').trim() || '#1C1C1C',
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: this.donut ? '60%' : 0,
        plugins: {
          legend: {
            position: 'bottom',
            labels: { color: textColor, font: { size: 11 }, boxWidth: 12, padding: 12 }
          },
          tooltip: {
            callbacks: {
              label: ctx => {
                const total = (ctx.dataset.data as number[]).reduce((a, b) => a + b, 0);
                const pct = total > 0 ? ((ctx.parsed / total) * 100).toFixed(1) : '0';
                return ` ${ctx.label}: ${ctx.formattedValue} (${pct}%)`;
              }
            }
          }
        }
      }
    });
  }
}
