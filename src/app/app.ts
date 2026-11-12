import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import {FormsModule} from '@angular/forms';
import { Parser } from './parser/parser';


@Component({
  imports: [RouterOutlet, FormsModule],
  selector: 'app-root',
  styleUrl: './app.css',
  templateUrl: './app.html',
})
export class App {
  protected readonly title = signal('proyecto-automatas');
  texto:string ="";
  tokens:any = [];
  palabrasReservadas = new Set([
    "STACK", "QUEUE", "LIST", "HASH", "TREE", "PUSH", "POP", "ENQUEUE",
    "DEQUEUE", "INSERT", "REMOVE", "SET","GET", "ADDNODE", "ROOT", 
    "LEFT", "RIGHT", "PRINT", "GRAPH", "NUMERO", "TEXTO"
  ]);
  errores:any = [];
  pilas:any = {};
  
  constructor(private parser: Parser) {
  }

  probarSintactico(){

  try {

    let resultado = this.parser.parse(this.texto);

    console.log("Resultado sintáctico:");
    console.log(resultado);

    alert("Cadena válida");

  } catch (e:any) {

    console.log("Error sintáctico:");
    console.log(e);

    alert("Cadena inválida");
  }

  }
  analizar(){
    this.texto = this.texto + "\n";
    let caracteres = [...this.texto, "\n"];
    let fila = 1; 
    let columna = 0;
    let token :any = {};

    this.tokens = [];
    this.errores = [];
    
    let lexema = "";
    let estado = "A"; 

    for (let c of caracteres) {

      let caracter = c
      let codigo =c.charCodeAt(0);
      columna++;

      switch (estado) {
        case "A":
        switch (codigo) {

        case 40: // (
          token = this.llenarTokens(
            "(", fila,  
            columna, 
            "Simbolo"
          );
          this.tokens.push(token);
          console.log(token);
          break;

        case 41: // )
          token = this.llenarTokens(
            ")", fila, 
            columna, 
            "Simbolo"
          );
          this.tokens.push(token);
          console.log(token);
          break;

        case 44: // ,
          token = this.llenarTokens(
            ",", fila,
            columna,
            "Simbolo"
          );
          this.tokens.push(token);
          console.log(token);
          break;

        case 62: // =
          token = this.llenarTokens(
            "=>", fila,  
          columna,
          "ASIGNACION"
          );
          this.tokens.push(token);
          console.log(token);
          break;


        case 59: // ;
          token = this.llenarTokens(
            ";", fila,
            columna,
            "Simbolo"
          );
          this.tokens.push(token);
          console.log(token);
          break;
          
        case 34: // "
        lexema = caracter;
        estado = "CADENA";
        break;

        case 47: // /
        lexema = "/";
        estado = "COMENTARIO";
        break;


        
          default:
          if((codigo >= 65 && codigo <= 90) || 
          (codigo >= 97 && codigo <= 122)){

           lexema  = c;
           estado = "ID";

          }else if(codigo >= 48 && codigo <= 57){
            lexema  = c;
            estado = "ENTERO";

          }else if(
            codigo != 32 && codigo != 10 && codigo != 13 && codigo != 9
          )/*{
            let error = {
              simbolo: caracter, 
              fila: fila,
              columna: columna,
              descripcion: "Simbolo no reconocido"
            
            this.errores.push(error);
            console.log(error);
          }*/
          break;
        }
        break;
        
            case "ID":
              if((codigo >= 65 && codigo <= 90) || 
              (codigo >= 97 && codigo <= 122)||
              (codigo >= 48 && codigo <= 57)||
              codigo == 95) {

               lexema  = lexema + caracter;

              }else {

                let tipoToken = this.palabrasReservadas.has(lexema)
                ?"Palabra Reservada"
                : "Identificador";

                token = this.llenarTokens(
                  lexema, fila,
                  columna - lexema.length, tipoToken 
                );
                
                this.tokens.push(token);
                console.log(token);

                if(codigo == 40 || codigo == 41 || codigo == 44 ||
                  codigo == 59  || codigo == 61){
                token = this.llenarTokens(
                  caracter, fila,
                  columna,
                  "Simbolo"
                );
                this.tokens.push(token);
                console.log(token);
              }else if(
                codigo !=32 && codigo != 10 && codigo != 13 && codigo !=9
              ){
                let error ={
                  simbolo: caracter,
                  fila: fila,
                  columna: columna,
                  descripcion: "Simbolo no reconocido"
                };
                this.errores.push(error);
                console.log(error);
              }
                
                lexema = "";
                estado = "A";
              break;
            }
            break;

            case "ENTERO":
              if ((codigo >= 48 && codigo <= 57)) {
                lexema  = lexema + caracter;
              }else {
                token = this.llenarTokens(
                  lexema, fila,
                  columna - lexema.length, 
                  "Entero"
                );
                this.tokens.push(token);
                console.log(token);
                if (codigo == 41) { // )
                  token = this.llenarTokens(
                    ")", fila,
                    columna,
                    "Simbolo"
                  );  
                  this.tokens.push(token);
                  console.log(token);
                }else if (codigo == 59) { //;
                  token = this.llenarTokens(
                    ";", fila,
                    columna,
                    "Simbolo"
                  );  
                  this.tokens.push(token);
                  console.log(token);
                }else if (codigo == 44) { //,
                  token = this.llenarTokens(
                    ",", fila,
                    columna,
                    "Simbolo"
                  );  
                  this.tokens.push(token);
                  console.log(token);
                }
                lexema = "";
                estado = "A";
              }
              break;

            case "CADENA":
              
              if(codigo == 34){ // "
                lexema = lexema + caracter;

                token = this.llenarTokens(
                  lexema, fila,
                  columna - lexema.length + 1, 
                  "Cadena"
                );
                this.tokens.push(token);
                console.log(token);
                lexema = "";
                estado = "A";
              }else if(codigo == 10){
                let error = {
                  simbolo: lexema,
                  fila: fila,
                  columna: columna - lexema.length,
                  descripcion : "Cadena sin cerrar"
                };

                this.errores.push(error);
                console.log(error);
                
                lexema = "";
                estado = "A";

              }else{

                lexema = lexema + caracter;
              }
              break;

              case "COMENTARIO":
                switch (codigo) {
                case 47: // Segundo /
                lexema = "//";
                estado = "COMENTARIO_LINEA";
              break;
                  case 42: // *
                  lexema = "/*";
                  estado = "COMENTARIO_BLOQUE";
                break; 
              }
                 break;

              case "COMENTARIO_LINEA":
                lexema = lexema + caracter;
                if(codigo != 10){ // Salto de linea
                }else{
                  lexema = "";
                  estado = "A";
                }
                break;
        
              case "COMENTARIO_BLOQUE":
              lexema = lexema + caracter;

                if (codigo == 42) { // *
                  estado = "COMENTARIO_BLOQUE_CIERRE";
                }
              break;

              case "COMENTARIO_BLOQUE_CIERRE":
                lexema = lexema + caracter; 

                if (codigo == 47) { // /
                  lexema = "";
                  estado = "A";
                }else if(codigo == 42){
                  estado = "COMENTARIO_BLOQUE_CIERRE";
                }else{
                  estado ="COMENTARIO_BLOQUE";
                }
                break;
            }

            if(codigo == 10){ // Salto de linea
            fila++;
            columna = 0;
            }
          }
        }

      llenarTokens(lexema:string, fila:number, columna:number, token:string){
    let objeto:any = {};

    objeto.lexema = lexema;
    objeto.fila = fila;
    objeto.columna = columna;
    objeto.token = token;

    return objeto;
  }

  obtenerNombreToken(token:any){

  if(token.token == "Palabra Reservada"){
    return token.lexema;
  }

  if(token.token == "Identificador"){
    return "ID";
  }

  if(token.token == "Entero"){
    return "NUMERO";
  }

  if(token.token == "Cadena"){
    return "CADENA";
  }

  if(token.token == "Simbolo"){
    return token.lexema;
  }

  return token.token;
}

  obtenerColor(tipo:string){

  if(tipo == "Palabra Reservada"){
    return "#00FFFF"
  }

  if(tipo == "Identificador"){
    return "darkgreen";
  }

  if(tipo == "Entero"){
    return "orange";
  }

  if(tipo == "Cadena"){
    return "purple";
  }

  if(tipo == "Simbolo"){
    return "red";
  }
  if(tipo == "NUMERO"){
    return 
  }
  return "black";
}

}
