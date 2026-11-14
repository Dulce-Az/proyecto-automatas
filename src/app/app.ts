import { Component, signal } from '@angular/core';
import { Router, RouterOutlet } from '@angular/router';
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
  colas:any = {};
  listas:any = {};
  hashes:any = {};
  arboles:any = {};
  resultadoEjecucion: string = "";
  errorSintactico: any = null;
  
  constructor(private parser: Parser, private router: Router) {
  }

  probarSintactico(){
      this.errorSintactico = null;

      try {

        let resultado = this.parser.parse(this.texto);

        console.log("Resultado sintáctico:");
        console.log(resultado);

        alert("Cadena válida");

        } catch (e:any) {
        this.errorSintactico = e;

        console.log("Error sintáctico:");
        console.log(e);

            const inicio = e.location?.start;

         const esperados = e.expected
           ?.map((elemento: any) => elemento.text || elemento.description)
          .filter((valor: any) =>
          valor && !["//", "/*", "/", "*"].includes(valor)
          )
          .filter((valor: any, indice: number, arreglo: any[]) =>
          arreglo.indexOf(valor) === indice
          );

const esperado = esperados?.includes(")")
  ? ")"
  : esperados?.join(" o ");

       this.errorSintactico = {
      linea: inicio?.line || "-",
      columna: inicio?.column || "-",
      encontrado: e.found === null ? "EOF" : e.found,
      descripcion: esperado
        ? "Se esperaba " + esperado
        : e.message
    };

        alert("Cadena inválida");
      }
    }


  ejecutar() {
  try {
    const instrucciones = this.parser.parse(this.texto);

    this.pilas = {};
    this.colas = {};
    this.listas = {};
    this.hashes = {};
    this.arboles = {};

    for (const instruccion of instrucciones) {

      switch (instruccion.tipo) {

        case "STACK":
          this.pilas[instruccion.nombre] = [];
          break;

        case "PUSH":
          if (!this.pilas[instruccion.nombre]) {
            throw new Error("La pila no ha sido declarada: " + instruccion.nombre);
          }

          this.pilas[instruccion.nombre].push(instruccion.valor);
          break;

        case "POP":
          if (!this.pilas[instruccion.nombre]) {
            throw new Error("La pila no ha sido declarada: " + instruccion.nombre);
          }

          if (this.pilas[instruccion.nombre].length === 0) {
            throw new Error("La pila está vacía: " + instruccion.nombre);
          }

          this.pilas[instruccion.nombre].pop();
          break;


case "QUEUE":
  this.colas[instruccion.nombre] = [];
  break;

case "ENQUEUE":
  if (!this.colas[instruccion.nombre]) {
    throw new Error("La cola no ha sido declarada: " + instruccion.nombre);
  }

  this.colas[instruccion.nombre].push(instruccion.valor);
  break;

case "DEQUEUE":
  if (!this.colas[instruccion.nombre]) {
    throw new Error("La cola no ha sido declarada: " + instruccion.nombre);
  }

  if (this.colas[instruccion.nombre].length === 0) {
    throw new Error("La cola está vacía: " + instruccion.nombre);
  }

  this.colas[instruccion.nombre].shift();
  break;


case "LIST":
  this.listas[instruccion.nombre] = [];
  break;

case "INSERT":
  if (!this.listas[instruccion.nombre]) {
    throw new Error("La lista no ha sido declarada: " + instruccion.nombre);
  }

  this.listas[instruccion.nombre].push(instruccion.valor);
  break;

case "REMOVE": {
  if (!this.listas[instruccion.nombre]) {
    throw new Error("La lista no ha sido declarada: " + instruccion.nombre);
  }

  const indice = this.listas[instruccion.nombre].indexOf(instruccion.valor);

  if (indice === -1) {
    throw new Error("El elemento no existe en la lista: " + instruccion.valor);
  }

  this.listas[instruccion.nombre].splice(indice, 1);
  break;
}


case "HASH":
  this.hashes[instruccion.nombre] = {};
  break;

case "SET": {
  if (!this.hashes[instruccion.nombre]) {
    throw new Error("La tabla hash no ha sido declarada: " + instruccion.nombre);
  }

  this.hashes[instruccion.nombre][instruccion.llave] = instruccion.valor;
  break;
}

case "GET": {
  if (!this.hashes[instruccion.nombre]) {
    throw new Error("La tabla hash no ha sido declarada: " + instruccion.nombre);
  }

  if (!Object.prototype.hasOwnProperty.call(
    this.hashes[instruccion.nombre],
    instruccion.llave
  )) {
    throw new Error("La llave no existe: " + instruccion.llave);
  }

  delete this.hashes[instruccion.nombre][instruccion.llave];
  break;
}


case "TREE":
  this.arboles[instruccion.nombre] = null;
  break;

case "ROOT": {
  if (this.arboles[instruccion.nombre] === undefined) {
    throw new Error("El árbol no ha sido declarado: " + instruccion.nombre);
  }

  if (this.arboles[instruccion.nombre] !== null) {
    throw new Error("El árbol ya tiene una raíz");
  }

  this.arboles[instruccion.nombre] = {
    valor: instruccion.valor,
    izquierdo: null,
    derecho: null
  };

  break;
}

case "LEFT": {
  if (this.arboles[instruccion.nombre] === undefined) {
    throw new Error("El árbol no ha sido declarado: " + instruccion.nombre);
  }

  if (this.arboles[instruccion.nombre] === null) {
    throw new Error("Primero debes crear la raíz del árbol");
  }

  const buscarNodo = (nodo: any): any => {
    if (nodo === null) {
      return null;
    }

    if (nodo.valor === instruccion.padre) {
      return nodo;
    }

    return buscarNodo(nodo.izquierdo) || buscarNodo(nodo.derecho);
  };

  const padre = buscarNodo(this.arboles[instruccion.nombre]);

  if (!padre) {
    throw new Error("No se encontró el nodo padre: " + instruccion.padre);
  }

  if (padre.izquierdo !== null) {
    throw new Error("El nodo ya tiene un hijo izquierdo");
  }

  padre.izquierdo = {
    valor: instruccion.valor,
    izquierdo: null,
    derecho: null
  };

  break;
}

case "RIGHT": {
  if (this.arboles[instruccion.nombre] === undefined) {
    throw new Error("El árbol no ha sido declarado: " + instruccion.nombre);
  }

  if (this.arboles[instruccion.nombre] === null) {
    throw new Error("Primero debes crear la raíz del árbol");
  }

  const buscarNodo = (nodo: any): any => {
    if (nodo === null) {
      return null;
    }

    if (nodo.valor === instruccion.padre) {
      return nodo;
    }

    return buscarNodo(nodo.izquierdo) || buscarNodo(nodo.derecho);
  };

  const padre = buscarNodo(this.arboles[instruccion.nombre]);

  if (!padre) {
    throw new Error("No se encontró el nodo padre: " + instruccion.padre);
  }

  if (padre.derecho !== null) {
    throw new Error("El nodo ya tiene un hijo derecho");
  }

  padre.derecho = {
    valor: instruccion.valor,
    izquierdo: null,
    derecho: null
  };

  break;
}



case "GRAPH": {
  const nombre = instruccion.nombre;
  let codigoGraphviz = "";

  if (this.pilas[nombre]) {

    for (let i = 0; i < this.pilas[nombre].length; i++) {
      codigoGraphviz += this.pilas[nombre][i];

      if (i != this.pilas[nombre].length - 1) {
        codigoGraphviz += "->";
      }
    }

  } else if (this.colas[nombre]) {

    codigoGraphviz = "rankdir=LR;";

    for (let i = 0; i < this.colas[nombre].length; i++) {
      const valor = String(this.colas[nombre][i])
        .replace(/\\/g, "\\\\")
        .replace(/"/g, '\\"');

      codigoGraphviz += `n${i} [label="${valor}"];`;

      if (i != this.colas[nombre].length - 1) {
        codigoGraphviz += `n${i} -> n${i + 1};`;
      }
    }

  } else if (this.listas[nombre]) {

  codigoGraphviz = "rankdir=LR;";

  for (let i = 0; i < this.listas[nombre].length; i++) {

    const valor = String(this.listas[nombre][i])
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"');

    codigoGraphviz += `n${i} [label="${valor}"];`;

    if (i != this.listas[nombre].length - 1) {
      codigoGraphviz += `n${i} -> n${i + 1};`;
      codigoGraphviz += `n${i + 1} -> n${i};`;
    }
  }

} else if (this.hashes[nombre]) {

  codigoGraphviz = "node [shape=record];";

  const elementos = Object.entries(this.hashes[nombre]);

  const campos = elementos.map(([llave, valor]) => {

    const llaveTexto = String(llave)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\{/g, "\\{")
      .replace(/\}/g, "\\}")
      .replace(/\|/g, "\\|");

    const valorTexto = String(valor)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"')
      .replace(/\{/g, "\\{")
      .replace(/\}/g, "\\}")
      .replace(/\|/g, "\\|");

    return `{${llaveTexto}|${valorTexto}}`;
  });

  codigoGraphviz += `tabla [label="{${campos.join("|")}}"];`;


} else if (this.arboles[nombre] !== undefined) {

  if (this.arboles[nombre] === null) {
    throw new Error("El árbol no tiene una raíz: " + nombre);
  }

  let contador = 0;

  const generarArbol = (nodo: any, id: string): void => {

    const valor = String(nodo.valor)
      .replace(/\\/g, "\\\\")
      .replace(/"/g, '\\"');

    codigoGraphviz += `${id} [label="${valor}"];`;

    if (nodo.izquierdo !== null) {
      const idIzquierdo = `n${++contador}`;

      codigoGraphviz += `${id} -> ${idIzquierdo};`;

      generarArbol(nodo.izquierdo, idIzquierdo);
    }

    if (nodo.derecho !== null) {
      const idDerecho = `n${++contador}`;

      codigoGraphviz += `${id} -> ${idDerecho};`;

      generarArbol(nodo.derecho, idDerecho);
    }
  };

  generarArbol(this.arboles[nombre], "n0");

  } else {
    throw new Error("La estructura no ha sido declarada: " + nombre);
  }

  const urlTree = this.router.createUrlTree(['/grafo'], {
    queryParams: {
      codigoGraphviz: codigoGraphviz,
      nombre: nombre
    }
  });

  const urlCompleta = this.router.serializeUrl(urlTree);

  window.open(urlCompleta, '_blank');

  break;
}

        default:
          throw new Error("La instrucción todavía no está implementada: " + instruccion.tipo);
      }
    }

    this.resultadoEjecucion = JSON.stringify({...this.pilas, ...this.colas,
      ...this.listas, ...this.hashes, ...this.arboles}, null, 2);

    alert("Programa ejecutado correctamente");


  } catch (e: any) {

    this.resultadoEjecucion = e.message;

    console.log("Error al ejecutar:", e);

    alert("Error al ejecutar el programa");
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

         
} else if (
  codigo != 32 && codigo != 10 && codigo != 13 && codigo != 9
) {
  let error = {
    simbolo: caracter,
    fila: fila,
    columna: columna,
    descripcion: "Simbolo no reconocido"
  };

  this.errores.push(error);
  console.log(error);
}
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

}else if (
  codigo != 32 && codigo != 10 &&
  codigo != 13 && codigo != 9
) {
  let error = {
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
    return "darkblue";
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
