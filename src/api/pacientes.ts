import client from './client';
import type { Paciente, PacienteForm } from '../types/paciente';
import type { Ficha } from '../types/ficha';
import type { Sesion } from '../types/sesion';

export const getPacientes = async (): Promise<Paciente[]> => {
  const { data } = await client.get<Paciente[]>('/pacientes');
  return data;
};

export const getPaciente = async (id: number): Promise<Paciente> => {
  const { data } = await client.get<Paciente>(`/pacientes/${id}`);
  return data;
};

export const getPacienteFicha = async (id: number): Promise<Ficha> => {
  const { data } = await client.get<Ficha>(`/pacientes/${id}/ficha`);
  return data;
};

export const getPacienteSesiones = async (id: number): Promise<Sesion[]> => {
  const { data } = await client.get<Sesion[]>(`/pacientes/${id}/sesiones`);
  return data;
};

export const createPaciente = async (form: PacienteForm): Promise<Paciente> => {
  const { data } = await client.post<Paciente>('/pacientes', form);
  return data;
};

export const updatePaciente = async (id: number, form: Partial<PacienteForm>): Promise<Paciente> => {
  const { data } = await client.put<Paciente>(`/pacientes/${id}`, form);
  return data;
};

export const deletePaciente = async (id: number): Promise<void> => {
  await client.delete(`/pacientes/${id}`);
};
