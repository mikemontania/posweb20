// ============================================================
//  DebounceInputDirective — reemplaza inputDebounce original
//  Emite el valor después de que el usuario deja de tipear.
//  Uso: <input debounceInput [debounceTime]="400" (debouncedValue)="onSearch($event)">
// ============================================================
import {
  Directive, Input, Output, EventEmitter,
  HostListener, OnDestroy, OnInit
} from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

@Directive({ selector: '[debounceInput]', standalone: true })
export class DebounceInputDirective implements OnInit, OnDestroy {
  @Input() debounceTime = 350;
  @Output() debouncedValue = new EventEmitter<string>();

  private readonly subject$ = new Subject<string>();
  private readonly destroy$ = new Subject<void>();

  ngOnInit(): void {
    this.subject$.pipe(
      debounceTime(this.debounceTime),
      distinctUntilChanged(),
      takeUntil(this.destroy$)
    ).subscribe(value => this.debouncedValue.emit(value));
  }

  @HostListener('input', ['$event.target.value'])
  onInput(value: string): void {
    this.subject$.next(value);
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
