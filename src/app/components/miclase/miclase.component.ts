import { DataBaseService } from 'src/app/services/data-base.service';
import { Component } from '@angular/core';
import { Asistencia } from 'src/app/model/asistencia';
import { IonicModule, ViewWillEnter } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-miclase',
  templateUrl: './miclase.component.html',
  styleUrls: ['./miclase.component.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
  standalone: true,
})
export class MiclaseComponent  implements ViewWillEnter {

  asistencia= new Asistencia();

  constructor(private bd: DataBaseService) { 
    this.bd.datosQR.subscribe((datosQR) => {
      this.asistencia = new Asistencia().obtenerAsistenciaDesdeQR(datosQR);
    })
  }

  ionViewWillEnter() {
    this.asistencia = new Asistencia();
  }

}
