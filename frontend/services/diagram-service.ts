import api from './api';
import { Node, Edge } from 'reactflow';

export interface DiagramData {
  nodes: Node[];
  edges: Edge[];
}

export interface DiagramResponse {
  id: number;
  name: string;
  user_id: string;
  diagram_data: DiagramData;
  created_at: string;
  updated_at: string;
}

export const saveDiagramToServer = async (name: string, diagramData: DiagramData): Promise<DiagramResponse> => {
  const response = await api.post('/diagrams/save', {
    name,
    diagram_data: diagramData,
    user_id: 'anonymous' // This can be updated when authentication is implemented
  });
  return response.data;
};

export const getDiagramsFromServer = async (): Promise<DiagramResponse[]> => {
  const response = await api.get('/diagrams/list/anonymous');
  return response.data;
};

export const getDiagramById = async (id: number): Promise<DiagramResponse> => {
  const response = await api.get(`/diagrams/${id}`);
  return response.data;
};

export const deleteDiagram = async (id: number): Promise<void> => {
  await api.delete(`/diagrams/${id}`);
};