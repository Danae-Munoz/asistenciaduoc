import { User } from 'src/app/model/user';
import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IonContent, IonGrid, IonRow, IonCol } from '@ionic/angular/standalone';
import { Subscription } from 'rxjs';
import { AuthService } from 'src/app/services/auth.service';

@Component({
  selector: 'app-dinosaur',
  templateUrl: './dinosaur.component.html',
  styleUrls: ['./dinosaur.component.scss'],
  standalone: true,
  imports: [IonContent, IonGrid, IonRow, IonCol, CommonModule, FormsModule]
})
export class DinosaurComponent implements OnInit {
  // Definir la propiedad 'dino' aquí
  dino: any; // O el tipo específico si tienes una interfaz para Dino

  constructor() { }

  ngOnInit() {
    // Inicializa 'dino' con los datos deseados
    this.dino = {
      name: 'Tyrannosaurus Rex',
      length: '12 meters',
      height: '6 meters',
      weight: '8000 kg',
      diet: 'Carnivore',
      period: 'Late Cretaceous',
      extinction: '65 million years ago',
      found: '1902'
    };
  }
}