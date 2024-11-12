import { NivelEducacional } from './nivel-educacional';
import { Persona } from "./persona";
import { Asistencia } from '../interfaces/asistencia';
import { DatabaseService } from '../services/database.service';
import { Optional } from '@angular/core';

export class Usuario extends Persona {
  correo: string = '';
  password: string = '';
  preguntaSecreta: string = '';
  respuestaSecreta: string = '';
  sesionActiva: string = '';
  cuenta: string = '';
  asistencia: Asistencia | null = null;

  constructor() {
    super();
  }

 


  setUsuario(correo: string, password: string, nombre: string, apellido: string, preguntaSecreta: string,
    respuestaSecreta: string, sesionActiva: string)
  {
    this.correo = correo;
    this.password = password;
    this.nombre = nombre;
    this.apellido = apellido;
    this.preguntaSecreta = preguntaSecreta;
    this.respuestaSecreta = respuestaSecreta;
    this.sesionActiva = sesionActiva;
  }

  // Asistencia vacía
  public asistenciaVacia(): Asistencia {
    return {  
      bloqueInicio: 0,
      bloqueTermino: 0,
      dia: '',
      horaFin: '',
      horaInicio: '',
      idAsignatura: '',
      nombreAsignatura: '',
      nombreProfesor: '',
      seccion: '',
      sede: ''
    };
  }

  // Método estático para crear un nuevo usuario
  static getUsuario(
    correo: string, 
    password: string, 
    nombre: string, 
    apellido: string, 
    preguntaSecreta: string,
    respuestaSecreta: string, 
    sesionActiva: string
  ): Usuario {
    const usu = new Usuario();
    usu.setUsuario(correo, password, nombre, apellido, preguntaSecreta, respuestaSecreta, sesionActiva);
    return usu;
  }

  // Método para validar campos requeridos
  validarCampoRequerido(nombreCampo: string, valor: string): string {
    if (valor.trim() === '') {
      return `El campo "${nombreCampo}" debe tener un valor.`;
    }
    return '';
  }

  // Métodos específicos de validación de cada campo
  validarCorreo(correo: string): string {
    return this.validarCampoRequerido('correo', correo);
  }

  validarPassword(password: string): string {
    return this.validarCampoRequerido('contraseña', password);
  }

  validarNombre(nombre: string): string {
    return this.validarCampoRequerido('nombre', nombre);
  }

  validarApellido(apellido: string): string {
    return this.validarCampoRequerido('apellido', apellido);
  }

  validarPreguntaSecreta(preguntaSecreta: string): string {
    return this.validarCampoRequerido('pregunta secreta', preguntaSecreta);
  }

  validarRespuestaSecreta(respuestaSecreta: string): string {
    return this.validarCampoRequerido('respuesta secreta', respuestaSecreta);
  }

  // Método para validar todos los campos del usuario
  validarPropiedadesUsuario(
    correo: string, 
    password: string, 
    nombre: string, 
    apellido: string, 
    preguntaSecreta: string, 
    respuestaSecreta: string
  ): string {
    return this.validarCorreo(correo) || 
           this.validarPassword(password) || 
           this.validarNombre(nombre) || 
           this.validarApellido(apellido) || 
           this.validarPreguntaSecreta(preguntaSecreta) || 
           this.validarRespuestaSecreta(respuestaSecreta);
  }

  // Método para validar el correo, con restricciones de longitud
  public validarCorreoCompleto(): string {
    if (this.correo.trim() === '') {
      return 'Al ingresar en el sistema debe ingresar un nombre de usuario.';
    }
    if (this.correo.length < 3 || this.correo.length > 8) {
      return 'El nombre de usuario debe tener entre 3 y 8 caracteres.';
    }
    return '';
  }

  
}
