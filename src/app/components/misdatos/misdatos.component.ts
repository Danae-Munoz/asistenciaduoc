// import { Component, OnInit } from '@angular/core';

// @Component({
//   selector: 'app-misdatos',
//   templateUrl: './misdatos.component.html',
//   styleUrls: ['./misdatos.component.scss'],
//   standalone: true
// })
// export class MisdatosComponent  implements OnInit {

//   constructor() { }

//   ngOnInit() {}

// }

import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonSelect, IonSelectOption, IonContent, IonHeader, IonTitle, IonToolbar, IonInput, IonButton, IonItem } from '@ionic/angular/standalone';
import { User } from 'src/app/model/user';
import { DatabaseService } from 'src/app/services/database.service';
import { AuthService } from 'src/app/services/auth.service';
import { Post } from 'src/app/model/post';
import { APIClientService } from 'src/app/services/apiclient.service';
import { EducationalLevel } from 'src/app/model/educational-level';
import { showToast } from 'src/app/tools/message-functions';
import { TranslateModule } from '@ngx-translate/core';
import { Subscription } from 'rxjs';

@Component({
  selector: 'app-mis-datos',
  templateUrl: './misdatos.component.html',
  styleUrls: ['./misdatos.component.scss'],
  standalone: true,
  imports: [IonButton, IonInput, IonContent, IonHeader, IonTitle, IonToolbar, 
            CommonModule, FormsModule, IonItem, IonSelect, IonSelectOption, TranslateModule]
})
export class MisDatosComponent implements OnInit, OnDestroy {

  usuario: User = new User();
  usuarios: User[] = [];
  publicaciones: Post[] = [];
  listaNivelesEducacionales: EducationalLevel[] = EducationalLevel.getLevels();
  private userListSubscription: Subscription;

  constructor(
    private bd: DatabaseService,
    private auth: AuthService,
    private api: APIClientService
  ) {
    this.userListSubscription = this.bd.userList.subscribe((usuario) => {
      if (usuario) {
        this.usuarios = usuario;
      }
    });
    this.auth.readAuthUser().then((usuario) => {
      if (usuario) {
        this.usuario = usuario;
        console.log('Usuario cargado:', this.usuario);
      } else {
        console.warn('No se encontró el usuario');
      }
    });
  }

  ngOnInit() {
    console.log('Usuario en ngOnInit:', this.usuario);
  }

  ngOnDestroy() {
    if (this.userListSubscription) {
      this.userListSubscription.unsubscribe();
    }
  }

  guardarUsuario() {
    if (this.usuario.firstName.trim() === '') {
      showToast('El usuario debe tener un nombre');
    } else {
      console.log('Usuario a guardar:', this.usuario);
      showToast('El usuario fue guardado correctamente');
      this.bd.saveUser(this.usuario);
      this.auth.saveAuthUser(this.usuario);
    }
  }

  public actualizarNivelEducacional(event: any) {
    const levelId = event.detail.value;
    const level = EducationalLevel.findLevel(levelId);
    if (level) {
      this.usuario.educationalLevel = level;
    } else {
      console.warn('Nivel educativo no encontrado:', levelId);
    }
  }

  onFechaNacimientoChange(event: any) {
    const dateValue = event.detail.value;
    if (dateValue) {
      this.usuario.dateOfBirth = new Date(dateValue);
    } else {
      console.warn('Fecha no válida');
    }
  }
}
