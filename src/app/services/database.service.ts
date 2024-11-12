import { capSQLiteChanges, SQLiteDBConnection } from '@capacitor-community/sqlite';
import { Injectable } from '@angular/core';
import { SQLiteService } from './sqlite.service';
import { User } from '../model/user';
import { BehaviorSubject } from 'rxjs';
import { EducationalLevel } from '../model/educational-level';
import { showAlertError } from '../tools/message-functions';
import { convertDateToString, convertStringToDate } from '../tools/date-functions';
import { Usuario } from '../model/usuario';

@Injectable({
  providedIn: 'root'
})
export class DatabaseService {
  // Usuarios de prueba para ser creados en la base de datos
  testUser1 = User.getNewUsuario(
    'atorres', 
    'atorres@duocuc.cl', 
    '1234', 
    '¿Cuál es tu animal favorito?', 
    'gato',
    'Ana', 
    'Torres', 
    EducationalLevel.findLevel(6)!,
    new Date(2000, 0, 5),
    'La Florida',
    'default-image.jpg');

  testUser2 = User.getNewUsuario(
    'jperez', 
    'jperez@duocuc.cl', 
    '5678', 
    '¿Cuál es tu postre favorito?',
    'panqueques',
    'Juan', 
    'Pérez',
    EducationalLevel.findLevel(5)!,
    new Date(2000, 1, 10),
    'La Pintana',
    'default-image.jpg');

  testUser3 = User.getNewUsuario(
    'cmujica', 
    'cmujica@duocuc.cl', 
    '0987', 
    '¿Cuál es tu vehículo favorito?',
    'moto',
    'Carla', 
    'Mujica', 
    EducationalLevel.findLevel(6)!,
    new Date(2000, 2, 20),
    'Providencia',
    'default-image.jpg');

  userUpgrades = [
    {
      toVersion: 1,
      statements: [`CREATE TABLE IF NOT EXISTS USER (
        userName         TEXT PRIMARY KEY NOT NULL,
        email            TEXT NOT NULL,
        password         TEXT NOT NULL,
        secretQuestion   TEXT NOT NULL,
        secretAnswer     TEXT NOT NULL,
        firstName        TEXT NOT NULL,
        lastName         TEXT NOT NULL,
        educationalLevel INTEGER NOT NULL,
        dateOfBirth      TEXT NOT NULL,
        address          TEXT NOT NULL,
        image            TEXT NOT NULL
      );`]
    }
  ];

  // Definir una vez la consulta SQL para la inserción o actualización
  private sqlInsertUpdate = `
    INSERT OR REPLACE INTO USER (
      userName, 
      email, 
      password, 
      secretQuestion, 
      secretAnswer,
      firstName, 
      lastName,
      educationalLevel, 
      dateOfBirth,
      address,
      image
    ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);
  `;

  nombreBD = 'DinosaurDataBase';
  db!: SQLiteDBConnection;
  userList: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  listaUsuarios: BehaviorSubject<Usuario[]> = new BehaviorSubject<Usuario[]>([]);

  constructor(private sqliteService: SQLiteService) { }

  async inicializarBaseDeDatos() {
    try {
      // Crear base de datos SQLite
      await this.sqliteService.crearBaseDeDatos({database: this.nombreBD, upgrade: this.userUpgrades});
      // Abrir base de datos
      this.db = await this.sqliteService.abrirBaseDeDatos(this.nombreBD, false, 'no-encryption', 1, false);
      // Crear usuarios de prueba
      await this.createTestUsers();
      // Cargar la lista de usuarios
      await this.readUsers();
    } catch (error) {
      showAlertError('DatabaseService.inicializarBaseDeDatos', error);
    }
  }

  // Crear usuarios de prueba si no existen
  async createTestUsers() {
    try {
      await this.saveUserIfNotExists(this.testUser1);
      await this.saveUserIfNotExists(this.testUser2);
      await this.saveUserIfNotExists(this.testUser3);
    } catch (error) {
      showAlertError('DatabaseService.createTestUsers', error);
    }
  }

  // Verificar si el usuario existe y si no, guardarlo
  async saveUserIfNotExists(user: User) {
    const existingUser = await this.readUser(user.userName);
    if (!existingUser) {
      await this.saveUser(user);
    }
  }

  // Guardar o actualizar un usuario
  async saveUser(user: User): Promise<void> {
    try {
      await this.db.run(this.sqlInsertUpdate, [
        user.userName, 
        user.email, 
        user.password,
        user.secretQuestion, 
        user.secretAnswer, 
        user.firstName, 
        user.lastName,
        user.educationalLevel.id, 
        convertDateToString(user.dateOfBirth), 
        user.address,
        user.image
      ]);
      await this.readUsers();
    } catch (error) {
      showAlertError('DataBaseService.saveUser', error);
    }
  }

  // Leer todos los usuarios desde la base de datos
  async readUsers(): Promise<void> {
    try {
      const q = 'SELECT * FROM USER;';
      const rows = (await this.db.query(q)).values;
      let users: User[] = [];
      if (rows) {
        users = rows.map((row: any) => this.rowToUser(row));
      }
      this.userList.next(users);
    } catch (error) {
      showAlertError('DataBaseService.readUsers', error);
    }
  }

  // Leer un usuario por su userName
  async readUser(userName: string): Promise<User | undefined> {
    try {
      const q = 'SELECT * FROM USER WHERE userName=?;';
      const rows = (await this.db.query(q, [userName])).values;
      return rows?.length ? this.rowToUser(rows[0]) : undefined;
    } catch (error) {
      showAlertError('DataBaseService.readUser', error);
      return undefined;
    }
  }

  // Convertir un registro de base de datos a un objeto User
  private rowToUser(row: any): User {
    try {
      const user = new User();
      user.userName = row.userName;
      user.email = row.email;
      user.password = row.password;
      user.secretQuestion = row.secretQuestion;
      user.secretAnswer = row.secretAnswer;
      user.firstName = row.firstName;
      user.lastName = row.lastName;
      user.educationalLevel = EducationalLevel.findLevel(row.educationalLevel) || new EducationalLevel();
      user.dateOfBirth = convertStringToDate(row.dateOfBirth);
      user.address = row.address;
      user.image = row.image;
      return user;
    } catch (error) {
      showAlertError('DataBaseService.rowToUser', error);
      return new User();
    }
  }

  // Eliminar un usuario por su userName
  async deleteByUserName(userName: string): Promise<boolean> {
    try {
      const q = 'DELETE FROM USER WHERE userName=?';
      const result: capSQLiteChanges = await this.db.run(q, [userName]);
      const rowsAffected = result.changes?.changes ?? 0;
      await this.readUsers();
      return rowsAffected > 0;
    } catch (error) {
      showAlertError('DataBaseService.deleteByUserName', error);
      return false;
    }
  }

  // Validar un usuario por su userName y password
  async findUser(userName: string, password: string): Promise<User | undefined> {
    try {
      const q = 'SELECT * FROM USER WHERE userName=? AND password=?;';
      const rows = (await this.db.query(q, [userName, password])).values;
      return rows?.length ? this.rowToUser(rows[0]) : undefined;
    } catch (error) {
      showAlertError('DataBaseService.findUser', error);
      return undefined;
    }
  }

  // Guardar un usuario de la clase Usuario
  async saveUsuario(usuario: Usuario): Promise<void> {
    try {
      await this.db.run(this.sqlInsertUpdate, [
        usuario.cuenta, usuario.correo, usuario.password,
        usuario.preguntaSecreta, usuario.respuestaSecreta, usuario.nombre, usuario.apellido,
        usuario.nivelEducacional.id, usuario.fechaNacimiento?.getTime()
      ]);
      await this.readUsuarios();
    } catch (error) {
      showAlertError('DataBaseService.saveUsuario', error);
    }
  }

  // Leer usuarios de la tabla USUARIO
  async readUsuarios(): Promise<void> {
    try {
      const usuarios: Usuario[] = (await this.db.query('SELECT * FROM USUARIO;')).values as Usuario[];
      this.listaUsuarios.next(usuarios);
    } catch (error) {
      showAlertError('DatabaseService.readUsuarios', error);
    }
  }

  async findUserByEmail(email: string): Promise<User | undefined> {
    try {
      const q = 'SELECT * FROM USER WHERE email=?;';
      const rows = (await this.db.query(q, [email])).values;
      return rows? this.rowToUser(rows[0]) : undefined;
    } catch (error) {
      showAlertError('DataBaseService.findUserByEmail', error);
      return undefined;
    }
  }
  
}


