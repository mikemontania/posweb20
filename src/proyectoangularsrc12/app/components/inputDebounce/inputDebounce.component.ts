import { Observable } from 'rxjs/Rx';
import { Component, Input, Output, ElementRef, EventEmitter, ViewChild } from '@angular/core';

@Component({
    selector: 'input-debounce',
    template: `
    <div class="input-group" >
            <input type="text" #inputDebounce
                   id="inputDebounce"
                   class="form-control"
                   width="100%"
                   [placeholder] = "placeholder"
                   [(ngModel)] = "inputValue"
                   (ngModelChange) = "inputValue = toUpeCaseEvent($event)" >
    </div>
    `
})

export class InputDebounceComponent {
    @Input() placeholder: string;
    @Input() delay: number = 1000;
    @Output() value: EventEmitter<any> = new EventEmitter();
    @ViewChild('inputDebounce') inputDebounce: ElementRef;

    public inputValue: string;

    constructor(private elementRef: ElementRef) {
        const eventStream = Observable.fromEvent(elementRef.nativeElement, 'keyup')
            .map(() => this.inputValue)
            .debounceTime(this.delay)
        /*             .distinctUntilChanged();
         */
        eventStream.subscribe(input => this.value.emit(input));
    }

    toUpeCaseEvent(evento: string) {
        return evento.toLocaleUpperCase();
    }

    enfocar() {
        this.inputDebounce.nativeElement.focus();
    }
}