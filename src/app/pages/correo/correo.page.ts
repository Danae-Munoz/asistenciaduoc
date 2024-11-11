import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { NavigationExtras, Router } from '@angular/router';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { DatabaseService } from 'src/app/services/database.service';
import { Usuario } from 'src/app/model/usuario';

@Component({
  selector: 'app-correo',
  templateUrl: './correo.page.html',
  styleUrls: ['./correo.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class CorreoPage implements OnInit {

  correo = '';

  constructor(private router: Router, private bd: DatabaseService , private authService: AuthService) { }

  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }



  async recuperarContrasena() {
    const usu=await this.bd.findUserByEmail(this.correo);
    if (usu == undefined){
    this.router.navigate(['/incorrecto']);
  }else{
    this.router.navigate(['/pregunta']);
    if (!usu) {
      this.router.navigate(['/incorrecto']);
    } else {
      const navigationExtras: NavigationExtras = {
        state: {
          usuario: usu
        }
      };
      this.router.navigate(['/pregunta'], navigationExtras);
    }
  }
  
  }

  volverAlInicio() {
    this.router.navigate(['/login']);
  }

}

