import { NivelEducacional } from './nivel-educacional';
import { Persona } from "./persona";
import { Asistencia } from '../interfaces/asistencia';
import { DataBaseService } from '../services/data-base.service';
import { Optional } from '@angular/core';
import { showAlert } from '../tools/message-functions';

export class Usuario extends Persona {

  public cuenta: string;
  public correo: string;
  public password: string;
  public preguntaSecreta: string;
  public respuestaSecreta: string;
  public asistencia: Asistencia;
  public listaUsuarios: Usuario[];


  constructor(@Optional() private db?: DataBaseService) {
    super();
    this.cuenta = '';
    this.correo = '';
    this.password = '';
    this.preguntaSecreta = '';
    this.respuestaSecreta = '';
    this.nombre = '';
    this.apellido = '';
    this.nivelEducacional = NivelEducacional.buscarNivelEducacional(1)!;
    this.fechaNacimiento = undefined;
    this.asistencia = this.asistenciaVacia();
    this.listaUsuarios = [];
  }

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

  public static getNewUsuario(
    cuenta: string,
    correo: string,
    password: string,
    preguntaSecreta: string,
    respuestaSecreta: string,
    nombre: string,
    apellido: string,
    nivelEducacional: NivelEducacional,
    fechaNacimiento: Date | undefined
  ) {
    let usuario = new Usuario();
    usuario.cuenta = cuenta;
    usuario.correo = correo;
    usuario.password = password;
    usuario.preguntaSecreta = preguntaSecreta;
    usuario.respuestaSecreta = respuestaSecreta;
    usuario.nombre = nombre;
    usuario.apellido = apellido;
    usuario.nivelEducacional = nivelEducacional;
    usuario.fechaNacimiento = fechaNacimiento;
    return usuario;
  }

  static jsonUserExample = 
  `{
    "cuenta": "user123",
    "correo": "user@example.com",
    "password": "securePassword123",
    "preguntaSecreta": "Nombre de tu primera mascota",
    "respuestaSecreta": "Fido",
    "nombre": "Juan",
    "apellido": "Pérez",
    "nivelEducacional": "Universitario",
    "fechaNacimiento": "1990-01-01"
  }`;


  async buscarUsuarioValido(cuenta: string, password: string): Promise<Usuario | undefined> {
    return await this.db!.buscarUsuarioValido(cuenta, password);
  }

  async buscarUsuarioPorCuenta(cuenta: string): Promise<Usuario | undefined>  {
    return await this.db!.buscarUsuarioPorCuenta(cuenta);
  }
  public static buscarUsuarioPorCorreo(correo: string): Usuario | undefined {
    const usuario = new Usuario();  // Crear una nueva instancia de Usuario
    DataBaseService.crearUsuariosDePrueba();  // Asegurarte de que la lista de usuarios esté poblada
    return usuario.listaUsuarios.find(usu => usu.correo === correo);  // Buscar en la lista de usuarios
  }
  

  async guardarUsuario(usuario: Usuario): Promise<void> {
    this.db!.guardarUsuario(usuario);
  }

  async eliminarUsuario(cuenta: string): Promise<void>  {
    this.db!.eliminarUsuarioUsandoCuenta(cuenta);
  }

  public override toString(): string {
    return `
      ${this.cuenta}
      ${this.correo}
      ${this.password}
      ${this.preguntaSecreta}
      ${this.respuestaSecreta}
      ${this.nombre}
      ${this.apellido}
      ${this.nivelEducacional.getEducacion()}
      ${this.getFechaNacimiento()}`;
  }

  static isValidUserQrCode(qr: string) {

    if (qr === '') return false;

    try {
        const json = JSON.parse(qr);

        if ( json.cuenta            !== undefined
          && json.correo            !== undefined
          && json.password          !== undefined
          && json.preguntaSecreta   !== undefined
          && json.respuestaSecreta  !== undefined
          && json.nombre            !== undefined
          && json.apellido          !== undefined
          && json.nivelEducacional  !== undefined
          && json.fechaNacimiento   !== undefined)
        {
            return true;
        }
    } catch (error) { }

    showAlert('El código QR escaneado no corresponde a un usuario válido');
    return false;
}


}