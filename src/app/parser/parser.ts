import { Injectable } from '@angular/core';
import * as peggy from 'peggy';

@Injectable({
  providedIn: 'root'
})
export class Parser {

  private parser!: peggy.Parser;

  constructor() {
    this.compileGrammar();
  }

  private compileGrammar() {

    const grammar = `
      Inicio
        = _ instrucciones:Instrucciones _ {
            return instrucciones;
          }

        Instrucciones
            = primera:Instruccion resto:(_ Instruccion)* {
             return [primera, ...resto.map(x => x[1])];
        }

        Instruccion
            = DeclaracionEstructura
                / Push
                / Pop
                / Enqueue
                / Dequeue
                / Insert
                / Remove
                / Set
                / Get
                / Root
                / Left
                / Right
                / Graph

            Enqueue
                = "ENQUEUE" _ "(" _ nombre:Identificador _ "," _ valor:Valor _ ")" _ ";" {
                return {
                tipo: "ENQUEUE",
                nombre: nombre,
                valor: valor
            };
        }

            Dequeue
                = "DEQUEUE" _ "(" _ nombre:Identificador _ ")" _ ";" {
                return {
                tipo: "DEQUEUE",
                nombre: nombre
            };
        }

            Insert
                = "INSERT" _ "(" _ nombre:Identificador _ "," _ valor:Valor _ ")" _ ";" {
                return {
                tipo: "INSERT",
                nombre: nombre,
                valor: valor
            };
        }

            Remove
                = "REMOVE" _ "(" _ nombre:Identificador _ "," _ valor:Valor _ ")" _ ";" {
                return {
                tipo: "REMOVE",
                nombre: nombre,
                valor: valor
            };
        }

            Set
                = "SET" _ "(" _ nombre:Identificador _ "," _ llave:Numero _ "," _ valor:Valor _ ")" _ ";" {
                return {
                tipo: "SET",
                nombre: nombre,
                llave: llave,
                valor: valor
            };
        }

            Get
                = "GET" _ "(" _ nombre:Identificador _ "," _ llave:Numero _ ")" _ ";" {
                return {
                tipo: "GET",
                nombre: nombre,
                llave: llave
            };
        }

            Root
                = "ROOT" _ "(" _ nombre:Identificador _ "," _ valor:Valor _ ")" _ ";" {
                return {
                tipo: "ROOT",
                nombre: nombre,
                valor: valor
            };
        }

            Left
                = "LEFT" _ "(" _ nombre:Identificador _ "," _ padre:Valor _ "," _ valor:Valor _ ")" _ ";" {
                return {
                tipo: "LEFT",
                nombre: nombre,
                padre: padre,
                valor: valor
            };
        }

            Right
                = "RIGHT" _ "(" _ nombre:Identificador _ "," _ padre:Valor _ "," _ valor:Valor _ ")" _ ";" {
                return {
                tipo: "RIGHT",
                nombre: nombre,
                padre: padre,
                valor: valor
            };
        }
            
        DeclaracionEstructura
            = tipo:TipoEstructura __ nombre:Identificador _ ";" {
            return {
            tipo: tipo,
            nombre: nombre
            };
        }

            TipoEstructura
            = "STACK"
            / "QUEUE"
            / "LIST"
            / "HASH"
            / "TREE"

            Push
                = "PUSH" _ "(" _ nombre:Identificador _ "," _ valor:Valor _ ")" _ ";" {
                return {
                tipo: "PUSH",
                nombre: nombre,
                valor: valor
            };
         }

            Pop
                = "POP" _ "(" _ nombre:Identificador _ ")" _ ";" {
                return {
                tipo: "POP",
                nombre: nombre
            };
        }

            Graph
                = "GRAPH" _ "(" _ nombre:Identificador _ ")" _ ";" {
                return {
                tipo: "GRAPH",
                nombre: nombre
            };
        }

        Valor
            = Cadena
            / Numero

        Numero
            = digitos:[0-9]+ {
            return Number(digitos.join(""));
        }

        Cadena
            = ["] contenido:[^"]* ["] {
      return contenido.join("");
        }

      Identificador
        = inicio:[a-zA-Z_] resto:[a-zA-Z0-9_]* {
            return inicio + resto.join("");
          }

        _ = (Blancos / Comentario)*

Blancos
  = [ \\t\\n\\r]+

Comentario
  = ComentarioLinea
  / ComentarioBloque

ComentarioLinea
  = "//" [^\\n]* ("\\n" / !.)

ComentarioBloque
  = "/*" (!"*/" .)* "*/"

__ = [ \\t\\n\\r]+
    `;

    this.parser = peggy.generate(grammar);
  }

  parse(texto: string): any {
    return this.parser.parse(texto);
  }

}