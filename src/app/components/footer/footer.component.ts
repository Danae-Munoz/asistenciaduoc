import { AuthService } from 'src/app/services/auth.service';

import { CommonModule } from '@angular/common';
import { Component, EventEmitter, Output } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { TranslateModule, TranslateService } from '@ngx-translate/core';
import { IonicModule } from '@ionic/angular';
import { MiclaseComponent } from '../miclase/miclase.component';
import { CodigoqrComponent } from '../codigoqr/codigoqr.component';
import { ForoComponent } from '../foro/foro.component';
import { addIcons } from 'ionicons';
import { gridOutline, homeOutline, pencilOutline, schoolOutline } from 'ionicons/icons';

@Component({
  selector: 'app-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
  standalone: true,
  imports: [
      CommonModule    // CGV-Permite usar directivas comunes de Angular
    , FormsModule     // CGV-Permite usar formularios
    , IonicModule     // CGV-Permite usar componentes de Ionic como IonContent, IonItem, etc.
    , TranslateModule // CGV-Permite usar pipe 'translate'
    ,MiclaseComponent, CodigoqrComponent, ForoComponent
  ]
})
export class FooterComponent {
  selectedButton = 'codigoqr';
  @Output() footerClick = new EventEmitter<string>();


  constructor() { 
    addIcons({homeOutline,schoolOutline,pencilOutline,gridOutline})
  }

  sendClickEvent($event: any) {
    this.footerClick.emit(this.selectedButton);
  }

}
