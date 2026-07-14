import client from './client';

export interface PostulacionForm {
  nombre: string;
  celular: string;
  correo: string;
  cv: File;
}

// POST /api/postulaciones (multipart/form-data). Axios detecta el FormData
// y deja que el navegador fije el Content-Type con boundary.
export async function enviarPostulacion(data: PostulacionForm): Promise<void> {
  const formData = new FormData();
  formData.append('nombre', data.nombre);
  formData.append('celular', data.celular);
  formData.append('correo', data.correo);
  formData.append('cv', data.cv);

  await client.post('/postulaciones', formData);
}
