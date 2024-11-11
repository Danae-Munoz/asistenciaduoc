import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { HeaderComponent } from "../../components/header/header.component";
import { CodigoqrComponent } from 'src/app/components/codigoqr/codigoqr.component';
import { MisdatosComponent } from 'src/app/components/mis-datos/mis-datos';
import { MiclaseComponent } from 'src/app/components/miclase/miclase.component';
import { ForumComponent } from 'src/app/components/forum/forum.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { home } from 'ionicons/icons';
import { HomePage } from '../home/home.page';
import { Usuario } from 'src/app/model/usuario';
import { AuthService } from 'src/app/services/auth.service';
import { ScannerService } from 'src/app/services/scanner.service';
import { Capacitor } from '@capacitor/core';
import { TranslateModule } from '@ngx-translate/core';
@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, 
    CommonModule, FormsModule, HeaderComponent
  ,CodigoqrComponent, MisdatosComponent, MiclaseComponent, 
  ForumComponent,FooterComponent, HomePage,TranslateModule, InicioPage,
]
})
export class InicioPage  {
  @ViewChild(FooterComponent) footer!: FooterComponent;
  selectedComponent = 'inicio';

  constructor(private auth: AuthService, private scanner: ScannerService) { }

  footerClick(button: string) {
    this.selectedComponent = button;
  }

  ionViewWillEnter() {
    this.changeComponent('welcome');
  }

  async headerClick(button: string) {

    if (button === 'testqr')
      this.showDinoComponent(Usuario.jsonUserExample);

    if (button === 'scan' && Capacitor.getPlatform() === 'web')
      this.selectedComponent = 'qrwebscanner';

    if (button === 'scan' && Capacitor.getPlatform() !== 'web')
        this.showDinoComponent(await this.scanner.scan());
  }

  webQrScanned(qr: string) {
    this.showDinoComponent(qr);
  }

  webQrStopped() {
    this.changeComponent('welcome');
  }

  showDinoComponent(qr: string) {

    if (Usuario.isValidUserQrCode(qr)) {
      this.auth.qrCodeData.next(qr);
      this.changeComponent('dinosaur');
      return;
    }
    
    this.changeComponent('welcome');
  }


  changeComponent(name: string) {
    this.selectedComponent = name;
    this.footer.selectedButton = name;
  }

  

}
