import { AuthService } from 'src/app/services/auth.service';
import { Component, OnInit } from '@angular/core';
import { Usuario } from 'src/app/model/usuario';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-miclase',
  templateUrl: './miclase.component.html',
  styleUrls: ['./miclase.component.scss'],
  standalone: true,
  imports:[CommonModule]
})
export class MiclaseComponent  implements OnInit {
  public usuario: Usuario = new Usuario();

  constructor(private authService: AuthService) {
    this.authService.usuarioAutenticado.subscribe((usuarioAutenticado) => {
      if (usuarioAutenticado) {
        this.usuario = usuarioAutenticado;
        // Inicializar la propiedad asistencia con un objeto vacío si no tiene datos
        if (!this.usuario.asistencia) {
          this.usuario.asistencia = this.usuario.asistenciaVacia();
        }
      }
    });
  }
  
  ngOnInit(): void {
    throw new Error('Method not implemented.');
  }

  

}
