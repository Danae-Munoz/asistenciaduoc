import { Component, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonContent, IonHeader, IonTitle, IonToolbar } from '@ionic/angular/standalone';
import { HeaderComponent } from "../../components/header/header.component";
import { CodigoqrComponent } from 'src/app/components/codigoqr/codigoqr.component';
import { MisdatosComponent } from 'src/app/components/misdatos/misdatos.component';
import { MiclaseComponent } from 'src/app/components/miclase/miclase.component';
import { ForoComponent } from 'src/app/components/foro/foro.component';
import { FooterComponent } from 'src/app/components/footer/footer.component';
import { home } from 'ionicons/icons';
import { HomePage } from '../home/home.page';

@Component({
  selector: 'app-inicio',
  templateUrl: './inicio.page.html',
  styleUrls: ['./inicio.page.scss'],
  standalone: true,
  imports: [IonContent, IonHeader, IonTitle, IonToolbar, 
    CommonModule, FormsModule, HeaderComponent
  ,CodigoqrComponent, MisdatosComponent, MiclaseComponent, 
  ForoComponent,FooterComponent, HomePage]
})
export class InicioPage  {
  @ViewChild(FooterComponent) footer!: FooterComponent;
  selectedComponent = 'inicio';

  constructor() { }

  footerClick(button: string) {
    this.selectedComponent = button;
  }

  

}
