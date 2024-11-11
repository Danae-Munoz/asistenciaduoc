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
  static crearUsuariosDePrueba() {
    throw new Error('Method not implemented.');
  }

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
      statements: [`
      CREATE TABLE IF NOT EXISTS USER (
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
      );
      `]
    }
  ];

  sqlInsertUpdate = `
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

  dataBaseName = 'DinosaurDataBase';
  db!: SQLiteDBConnection;
  userList: BehaviorSubject<User[]> = new BehaviorSubject<User[]>([]);
  listaUsuarios: BehaviorSubject<Usuario[]> = new BehaviorSubject<Usuario[]>([]);
  constructor(private sqliteService: SQLiteService) { }

  async initializeDataBase() {
    try {
      await this.sqliteService.createDataBase({database: this.dataBaseName, upgrade: this.userUpgrades});
      this.db = await this.sqliteService.open(this.dataBaseName, false, 'no-encryption', 1, false);
      await this.createTestUsers();
      await this.readUsers();
    } catch (error) {
      showAlertError('DataBaseService.initializeDataBase', error);
    }
  }

  async createTestUsers() {
    try {
      // Verifica y guarda al usuario 'atorres' si no existe
      const user1 = await this.readUser(this.testUser1.userName);
      if (!user1) {
        await this.saveUser(this.testUser1);
      }
  
      // Verifica y guarda al usuario 'jperez' si no existe
      const user2 = await this.readUser(this.testUser2.userName);
      if (!user2) {
        await this.saveUser(this.testUser2);
      }
  
      // Verifica y guarda al usuario 'cmujica' si no existe
      const user3 = await this.readUser(this.testUser3.userName);
      if (!user3) {
        await this.saveUser(this.testUser3);
      }
  
    } catch (error) {
      showAlertError('DataBaseService.createTestUsers', error);
    }
  }


  // Create y Update del CRUD. La creación y actualización de un usuario
  // se realizarán con el mismo método, ya que la instrucción "INSERT OR REPLACE"
  // revisa la clave primaria y si el registro es nuevo entonces lo inserta,
  // pero si el registro ya existe, entonces los actualiza. Se debe tener cuidado de
  // no permitir que el usuario cambie su correo, pues dado que es la clave primaria
  // no debe poder ser cambiada.
  
  async saveUser(user: User): Promise<void> {
    try {
      this.sqlInsertUpdate = `
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

  // Cada vez que se ejecute leerUsuarios() la aplicación va a cargar los usuarios desde la base de datos,
  // y por medio de la instrucción "this.listaUsuarios.next(usuarios);" le va a notificar a todos los programas
  // que se subscribieron a la propiedad "listaUsuarios", que la tabla de usuarios se acaba de cargar. De esta
  // forma los programas subscritos a la variable listaUsuarios van a forzar la actualización de sus páginas HTML.
  // ReadAll del CRUD. Si existen registros entonces convierte los registros en una lista de usuarios
  // con la instrucción ".values as Usuario[];". Si la tabla no tiene registros devuelve null.

  async readUsers(): Promise<User[]> {
    try {
      const q = 'SELECT * FROM USER;';
      const rows = (await this.db.query(q)).values;
      let users: User[] = [];
      if (rows) {
        users = rows.map((row: any) => this.rowToUser(row));
      }
      this.userList.next(users);
      return users;
    } catch (error) {
      showAlertError('DataBaseService.readUsers', error);
      return [];
    }
  }

  // Read del CRUD
  async readUser(userName: string): Promise<User | undefined> {
    try {
      const q = 'SELECT * FROM USER WHERE userName=?;';
      const rows = (await this.db.query(q, [userName])).values;
      return rows?.length? this.rowToUser(rows[0]) : undefined;
    } catch (error) {
      showAlertError('DataBaseService.readUser', error);
      return undefined;
    }
  }

  // Delete del CRUD
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

  // Validar usuario
  async findUser(userName: string, password: string): Promise<User | undefined> {
    try {
        const q = 'SELECT * FROM USER WHERE userName=? AND password=?;';
        const rows = (await this.db.query(q, [userName, password])).values;

        // Verifica si hay resultados
        if (rows && rows.length > 0) {
            return this.rowToUser(rows[0]);
        } else {
            // No se encontró un usuario
            return undefined;
        }
    } catch (error) {
        showAlertError('DataBaseService.findUser', error);
        return undefined;
    }
}


  async findUserByUserName(userName: string): Promise<User | undefined> {
    try {
      const q = 'SELECT * FROM USER WHERE userName=?;';
      const rows = (await this.db.query(q, [userName])).values;
      return rows? this.rowToUser(rows[0]) : undefined;
    } catch (error) {
      showAlertError('DataBaseService.findUserByEmail', error);
      return undefined;
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
      return user;
    } catch (error) {
      showAlertError('DataBaseService.rowToUser', error);
      return new User();
    }
  }
  // Create y Update del CRUD. La creación y actualización de un usuario
  // se realizarán con el mismo método, ya que la instrucción "INSERT OR REPLACE"
  // revisa la clave primaria y si el registro es nuevo entonces lo inserta,
  // pero si el registro ya existe, entonces los actualiza. Se debe tener cuidado de
  // no permitir que el usuario cambie su correo, pues dado que es la clave primaria
  // no debe poder ser cambiada.
  
  async guardarUsuario(usuario: Usuario): Promise<void> {
    await this.db.run(this.sqlInsertUpdate, [usuario.cuenta, usuario.correo, usuario.password,
      usuario.preguntaSecreta, usuario.respuestaSecreta, usuario.nombre, usuario.apellido,
      usuario.nivelEducacional.id, usuario.fechaNacimiento?.getTime()]);
    await this.leerUsuarios();
  }

  // Cada vez que se ejecute leerUsuarios() la aplicación va a cargar los usuarios desde la base de datos,
  // y por medio de la instrucción "this.listaUsuarios.next(usuarios);" le va a notificar a todos los programas
  // que se subscribieron a la propiedad "listaUsuarios", que la tabla de usuarios se acaba de cargar. De esta
  // forma los programas subscritos a la variable listaUsuarios van a forzar la actualización de sus páginas HTML.

  // ReadAll del CRUD. Si existen registros entonces convierte los registros en una lista de usuarios
  // con la instrucción ".values as Usuario[];". Si la tabla no tiene registros devuelve null.
  async leerUsuarios(): Promise<void> {
    const usuarios: Usuario[]= (await this.db.query('SELECT * FROM USUARIO;')).values as Usuario[];
    this.listaUsuarios.next(usuarios);
  }

  // Read del CRUD
  async leerUsuario(cuenta: string): Promise<Usuario | undefined> {
    const usuarios: Usuario[]= (await this.db.query(
      'SELECT * FROM USUARIO WHERE cuenta=?;', 
      [cuenta])).values as Usuario[];
    return usuarios[0];
  }

  async leerCorreo(cuenta: string): Promise<Usuario | undefined> {
    const usuarios: Usuario[]= (await this.db.query(
      'SELECT * FROM USUARIO WHERE correo=?;', 
      [cuenta])).values as Usuario[];
    return usuarios[0];
  }

  // Delete del CRUD
  async eliminarUsuarioUsandoCuenta(cuenta: string): Promise<void> {
    await this.db.run('DELETE FROM USUARIO WHERE cuenta=?', 
      [cuenta]);
    await this.leerUsuarios();
  }

  // Validar usuario
  async buscarUsuarioValido(cuenta: string, password: string): Promise<Usuario | undefined> {
    const usuarios: Usuario[]= (await this.db.query(
      'SELECT * FROM USUARIO WHERE cuenta=? AND password=?;',
      [cuenta, password])).values as Usuario[];
    return usuarios[0];
  }
  

  // Validar usuario
  async buscarUsuarioPorCuenta(cuenta: string): Promise<Usuario | undefined> {
    const usuarios: Usuario[]= (await this.db.query(
      'SELECT * FROM USUARIO WHERE cuenta=?;',
      [cuenta])).values as Usuario[];
    return usuarios[0];
  }
  async buscarUsuarioPorCorreo(correo: string): Promise<Usuario | undefined> {
    const usuarios: Usuario[]= (await this.db.query(
      'SELECT * FROM USUARIO WHERE correo=?;',
      [correo])).values as Usuario[];
    return usuarios[0];
  }

}
