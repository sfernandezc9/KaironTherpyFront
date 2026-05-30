export interface Persona {
  id_persona: number;
  rut: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  genero: string;
  telefono: string;
  email: string;
  direccion: string;
}

export interface PersonaForm {
  rut: string;
  nombres: string;
  apellidos: string;
  fecha_nacimiento: string;
  genero: string;
  telefono: string;
  email: string;
  direccion: string;
}
