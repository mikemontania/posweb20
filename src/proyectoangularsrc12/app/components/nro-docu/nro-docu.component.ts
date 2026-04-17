import { Component, EventEmitter, Input, OnInit, Output, SimpleChanges } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-nro-docu',
  templateUrl: './nro-docu.component.html',
})
export class NroDocumento {
  @Input() tipoDoc: string;
  @Input() docNro: string;
  @Output() docNroChange: EventEmitter<string> = new EventEmitter<string>();
  limiteDetras = 1;
  form: FormGroup;

  constructor() {
    const personaDocNroInicial = this.extractPersonaDocNro(this.docNro, this.tipoDoc);
    const docNroInicial = this.generateClienteDocNro(personaDocNroInicial, this.tipoDoc);

    this.form = new FormGroup({
      personadocNro: new FormControl(personaDocNroInicial, [Validators.required, Validators.maxLength(14), this.alphaNumericValidator.bind(this)]),
      docNro: new FormControl({ value: docNroInicial, disabled: true }, [Validators.required]),
    });

    this.form.get('personadocNro').valueChanges.subscribe(value => {
      const formattedValue = this.formatPersonaDocNro(value.toLocaleUpperCase());
      this.form.get('personadocNro').setValue(formattedValue, { emitEvent: false });
      this.onDocNroChange(formattedValue);
    });
  }

  ngOnChanges(changes: SimpleChanges) {

    console.log('ngOnChanges', this.docNro)


    // Cuando cambia el tipo de documento, actualiza el campo `personadocNro`
    if (this.form && (changes.docNro || changes.tipoDoc)) {
      const updatedDocNro = this.extractPersonaDocNro(this.docNro, this.tipoDoc);
      const generatedDocNro = this.generateClienteDocNro(updatedDocNro, this.tipoDoc);
      console.log('updatedDocNro', updatedDocNro)

      this.form.get('personadocNro').setValue(updatedDocNro, { emitEvent: false });
      this.form.get('docNro').setValue(generatedDocNro, { emitEvent: false });
      this.onDocNroChange(updatedDocNro);
    }
  }

  private extractPersonaDocNro(docNro: string, tipoDoc: string): string {
    if (tipoDoc === 'RUC') {
      const index = docNro.indexOf('-');
      return index !== -1 ? docNro.substring(0, index) : docNro;
    }
    // Para CI o CE, eliminar la parte después del guion si existe
    return this.removeGuion(docNro);
  }

  private cleanString(value: string): string {
    return value.replace(/[^A-Z0-9-]/g, '')
  }

  onDocNroChange(value: string) {
    //const cleanedValue = this.cleanString(value);
    const docNro = this.generateClienteDocNro(value, this.tipoDoc);
    this.form.get('docNro').setValue(docNro);
    this.docNroChange.emit(docNro);
  }



  private removeGuion(value: string): string {
    if (!value) return '';
    const index = value.indexOf('-');
    return index !== -1 ? value.substring(0, index) : value;
  }
  private formatPersonaDocNro(value: string): string {
    if (!value) return '';

    this.limiteDetras = (this.tipoDoc === 'CE') ? 4 : 1;
    // Limpiar cualquier carácter que no sea alfanumérico
    let cleanValue = value.replace(/[^a-zA-Z0-9]/g, '');
    // Asegurarse de que solo haya una letra en el string
    const letterMatch = cleanValue.match(/[a-zA-Z]/g);

    if (letterMatch && letterMatch.length > this.limiteDetras) {
      // Si hay más de limiteDetras letra, eliminar todas excepto la primera
      cleanValue = cleanValue.replace(/[a-zA-Z]/g, (match, offset) => {
        return offset === cleanValue.indexOf(letterMatch[0]) ? match : '';
      });
    }

    // Limitar a un máximo de 14 caracteres
    return cleanValue.substring(0, 14);
  }

  private alphaNumericValidator(control: FormControl): { [key: string]: boolean } | null {
    const value = control.value;
    const pattern = /^[a-zA-Z0-9]*$/;
    return pattern.test(value) ? null : { 'invalidAlphaNumeric': true };
  }

  //funcion que retorna el numero de documento o dcumento mas DV
  private generateClienteDocNro(personaDocNro: string, tipoDoc: string): string {
    if (tipoDoc === 'RUC' && personaDocNro) {
      const digito = this.calcularDigito(personaDocNro);
      return personaDocNro.concat('-', digito.toString());
    }
    return personaDocNro;
  }
  //funcion que extrae el DV para mostrarlo en pantalla
  extractDigito(value: string): string | null {
    const digito = value.match(/-\d+$/);
    return digito ? digito[0] : null;
  }
  //calcula el digito verificador
  calcularDigito(numero: string) {
    const BASEMAX = 11;
    let codigo: number;
    let numeroAl: string = '';
    let k = 2;
    let total = 0;

    for (let index = 0; index < numero.length; index++) {
      let caracter = numero.charAt(index);
      codigo = caracter.toUpperCase().charCodeAt(0);
      numeroAl += codigo >= 48 && codigo <= 57 ? caracter : codigo.toString();
    }

    for (let i = numeroAl.length - 1; i >= 0; i--) {
      if (k > BASEMAX) k = 2;
      total += +numeroAl.charAt(i) * k;
      k++;
    }

    const resto = total % BASEMAX;
    return resto > 1 ? 11 - resto : 0;
  }
}
