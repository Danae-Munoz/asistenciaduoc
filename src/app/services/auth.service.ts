import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { BehaviorSubject } from 'rxjs';
import { showAlertError, showToast } from 'src/app/tools/message-functions';
import { User } from '../model/user';
import { Storage } from '@ionic/storage-angular';
import { DataBaseService } from './data-base.service';
import { Usuario } from '../model/usuario';


@Injectable({
  providedIn: 'root'
})
export class AuthService {

  storageAuthUserKey = 'AUTHENTICATED_USER';
  keyUsuario = 'USUARIO_AUTENTICADO';
  usuarioAutenticado = new BehaviorSubject<Usuario | null>(null);
  authUser = new BehaviorSubject<User | null>(null);
  isFirstLogin = new BehaviorSubject<boolean>(false);
  storageQrCodeKey = 'QR_CODE';
  qrCodeData = new BehaviorSubject<string | null>(null);
  // La variable primerInicioSesion vale true cuando el usuario digita correctamente sus
  // credenciales y logra entrar al sistema por primera vez. Pero vale falso, si el 
  // usuario ya ha iniciado sesión, luego cierra la aplicación sin cerrar la sesión
  // y vuelve a entrar nuevamente. Si el usuario ingresa por primera vez, se limpian todas
  // las componentes, pero se dejan tal como están y no se limpian, si el suario
  // cierra al aplicación y la vuelve a abrir sin haber previamente cerrado la sesión.
  primerInicioSesion =  new BehaviorSubject<boolean>(false);
  selectedButton = new BehaviorSubject<string>('codigoqr');

  constructor(private router: Router, private db: DataBaseService, private storage: Storage) {
    
   }

  async initializeAuthService() {
    try {
      await this.storage.create();
    } catch (error) {
      showAlertError('AuthService.initializeAuthService', error);
    }
  }

  async isAuthenticated(): Promise<boolean> {
    try {
      return Boolean(await this.readAuthUser());
    } catch (error) {
      showAlertError('AuthService.isAuthenticated', error);
      return false;
    }
  }

  async readAuthUser(): Promise<User | null> {
    try {
      const user = (await this.storage.get(this.storageAuthUserKey)) as User | null;
      this.authUser.next(user ?? null);
      return user;
    } catch (error) {
      showAlertError('AuthService.readAuthUser', error);
      return null;
    }
  }

  async saveAuthUser(user: User): Promise<User | null> {
    try {
      await this.storage.set(this.storageAuthUserKey, user);
      this.authUser.next(user);
      return user;
    } catch (error) {
      showAlertError('AuthService.saveAuthUser', error);
      return null;
    }
  }

  async deleteAuthUser(): Promise<boolean> {
    try {
      await this.storage.remove(this.storageAuthUserKey);
      this.authUser.next(null);
      return true;
    } catch (error) {
      showAlertError('AuthService.deleteAuthUser', error);
      return false;
    }
  }

  async login(userName: string, password: string): Promise<boolean> {
    try {
      const authUser = await this.storage.get(this.storageAuthUserKey);

      if (authUser) {
        this.authUser.next(authUser);
        this.isFirstLogin.next(false);
        await this.router.navigate(['/home']);
        return true;
      } else {
        const user = await this.db.findUser(userName, password);

        if (user) {
          showToast(`¡Bienvenid@ ${user.firstName} ${user.lastName}!`);
          await this.saveAuthUser(user);
          this.isFirstLogin.next(true);
          await this.router.navigate(['/home']);
          return true;
        } else {
          showToast('El correo o la password son incorrectos');
          await this.router.navigate(['/login']);
          return false;
        }
      }
    } catch (error) {
      showAlertError('AuthService.login', error);
      return false;
    }
  }

  async inicializarAutenticacion() {
    await this.storage.create();
  }

  async leerUsuarioAutenticado(): Promise<Usuario | null> {
    const usuario = await this.storage.get(this.keyUsuario) as Usuario;
    this.usuarioAutenticado.next(usuario);
    return usuario;
  }

  guardarUsuarioAutenticado(usuario: Usuario) {
    this.storage.set(this.keyUsuario, usuario);
    this.usuarioAutenticado.next(usuario);
  }

  eliminarUsuarioAutenticado(usuario: Usuario) {
    this.storage.remove(this.keyUsuario);
    this.usuarioAutenticado.next(null);
  }



  async logout() {
    this.leerUsuarioAutenticado().then((usuario) => {
      if (usuario) {
        showToast(`¡Hasta pronto ${usuario.nombre} ${usuario.apellido}!`);
        this.eliminarUsuarioAutenticado(usuario);
      }
      this.router.navigate(['/login']);
    })
  }

  // async readQrFromStorage(): Promise<string | null> {
  //   try {
  //     const qrData = await this.storage.get(this.storageQrCodeKey) as string | null;
  //     this.qrCodeData.next(qrData);
  //     return qrData;
  //   } catch (error) {
  //     showAlertError('AuthService.readQrFromStorage', error);
  //     return null;
  //   }
  // }

  // async saveQrToStorage(qrData: string): Promise<string | null> {
  //   try {
  //     await this.storage.set(this.storageQrCodeKey, qrData);
  //     this.qrCodeData.next(qrData);
  //     return qrData;
  //   } catch (error) {
  //     showAlertError('AuthService.saveQrToStorage', error);
  //     return null;
  //   }
  // }

  // async deleteQrFromStorage(): Promise<boolean> {
  //   try {
  //     await this.storage.remove(this.storageQrCodeKey);
  //     this.qrCodeData.next(null);
  //     return true;
  //   } catch (error) {
  //     showAlertError('AuthService.deleteQrFromStorage', error);
  //     return false;
  //   }
  // }
}
