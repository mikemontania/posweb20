import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'search', standalone: true, pure: true })
export class SearchPipe implements PipeTransform {
  transform(items: any[], query: string, field?: string): any[] {
    if (!items?.length || !query?.trim()) return items ?? [];
    const q = this.norm(query);
    return items.filter(item => {
      if (typeof item === 'string') return this.norm(item).includes(q);
      if (field) {
        const v = item[field];
        return v != null && this.norm(String(v)).includes(q);
      }
      return Object.values(item).some(v => v != null && this.norm(String(v)).includes(q));
    });
  }
  private norm(s: string): string {
    return s.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  }
}
