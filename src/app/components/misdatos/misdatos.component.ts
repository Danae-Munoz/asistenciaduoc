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

import { Component, OnInit } from '@angular/core';
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

@Component({
  selector: 'app-mis-datos',  // Este es el selector, lo puedes cambiar si quieres.
  templateUrl: './misdatos.component.html', // Cambié el nombre del archivo a .component.html
  styleUrls: ['./misdatos.component.scss'], // Cambié el nombre del archivo de estilo a .component.scss
  standalone: true,
  imports: [IonButton, IonInput, IonContent, IonHeader, IonTitle, IonToolbar, 
            CommonModule, FormsModule, IonItem, IonSelect, IonSelectOption, TranslateModule]
})
export class MisDatosComponent implements OnInit {

  usuario: User = new User();
  usuarios: User[] = [];
  publicaciones: Post[] = [];
  listaNivelesEducacionales: EducationalLevel[] = EducationalLevel.getLevels();

  constructor(
    private bd: DatabaseService,
    private auth: AuthService,
    private api: APIClientService
  ) {
    this.bd.userList.subscribe((usuarios) => {
      if (usuarios) {
        this.usuarios = usuarios;
      }
    });
    this.auth.readAuthUser().then((usuario) => {
      if (usuario) {
        alert('en constructor: ' + this.usuario.educationalLevel.id);
        this.usuario = usuario;
        console.log(this.usuario);
      }
    });
  }

  ngOnInit() {
    console.log(this.usuario)
  }

  guardarUsuario() {
    if (this.usuario.firstName.trim() === '') {
      showToast('El usuario debe tener un nombre');
    } else {
      console.log(this.usuario);
      alert('en pagina nombre: ' + this.usuario.firstName);
      alert('en pagina nivelEducacional: ' + this.usuario.educationalLevel.id);
      alert('en pagina fecha: ' + this.usuario.dateOfBirth);
      this.bd.saveUser(this.usuario);
      this.auth.saveAuthUser(this.usuario);
      showToast('El usuario fue guardado correctamente');
    }
  }

  public actualizarNivelEducacional(event: any) {
    this.usuario.educationalLevel = EducationalLevel.findLevel(event.detail.value)!;
  }

  onFechaNacimientoChange(event: any) {
    this.usuario.dateOfBirth = new Date(event.detail.value); // Convertir de ISO a Date
  }
}
