import { CommonModule } from '@angular/common';
import { Component, OnInit } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { NavigationExtras, Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { AlertController } from '@ionic/angular';
import { AuthService } from 'src/app/services/auth.service';
import { Usuario } from 'src/app/model/usuario';
@Component({
  selector: 'app-correcto',
  templateUrl: 'correcto.page.html',
  styleUrls: ['correcto.page.scss'],
  imports: [IonicModule, CommonModule, FormsModule],
  standalone: true,
})
export class CorrectoPage implements OnInit {
  usu = new Usuario ();
  password:string =''
  
  constructor(private router: Router, private alertController: AlertController, private authService: AuthService) { }

  ngOnInit() {

    this.authService.contraseña$.subscribe(contraseña => {
      this.password = contraseña;
    });   



    const nav = this.router.getCurrentNavigation();
    if (nav) {
      if (nav.extras.state) {
        this.usu = nav.extras.state['usuario'];
        console.log(this.usu)
        this.password=this.usu.password;
        console.log(this.usu.toString());
        console.log(this.password)
        return;
      }
    }
  }

  login(){
    this.router.navigate(['/login']);
  }
}
