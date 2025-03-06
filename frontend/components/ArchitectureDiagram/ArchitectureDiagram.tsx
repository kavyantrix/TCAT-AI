import React, { useState, useRef, useCallback, useEffect } from 'react';
import ReactFlow, {
  ReactFlowProvider,
  addEdge,
  useNodesState,
  useEdgesState,
  Controls,
  Background,
  Connection,
  Edge,
  Node,
  NodeTypes,
  MarkerType,
  Panel,
} from 'reactflow';
import 'reactflow/dist/style.css';
import { Box, Button, Typography, TextField, Dialog, DialogTitle, DialogContent, DialogActions, Divider, CircularProgress, List, ListItem, ListItemText, IconButton, Snackbar, Alert } from '@mui/material';
import UploadFileIcon from '@mui/icons-material/UploadFile';
import DeleteIcon from '@mui/icons-material/Delete';
import ServicePalette from './ServicePalette';
import AwsServiceNode from './AwsServiceNode';
import { saveDiagramToServer, getDiagramsFromServer, getDiagramById, deleteDiagram, DiagramResponse } from '../../services/diagram-service';

const nodeTypes: NodeTypes = {
  awsService: AwsServiceNode,
};

const ArchitectureDiagram: React.FC = () => {
  const reactFlowWrapper = useRef<HTMLDivElement>(null);
  const [nodes, setNodes, onNodesChange] = useNodesState([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState([]);
  const [reactFlowInstance, setReactFlowInstance] = useState<any>(null);
  const [openSaveDialog, setOpenSaveDialog] = useState(false);
  const [openLoadDialog, setOpenLoadDialog] = useState(false);
  const [diagramName, setDiagramName] = useState('');
  const [savedDiagrams, setSavedDiagrams] = useState<string[]>([]);
  const [selectedDiagram, setSelectedDiagram] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // New state variables for server integration
  const [loading, setLoading] = useState(false);
  const [serverDiagrams, setServerDiagrams] = useState<DiagramResponse[]>([]);
  const [selectedServerDiagram, setSelectedServerDiagram] = useState<number | null>(null);
  const [snackbar, setSnackbar] = useState<{open: boolean, message: string, severity: 'success' | 'error'}>({
    open: false,
    message: '',
    severity: 'success'
  });

  // Load saved diagrams from localStorage and server on component mount
  useEffect(() => {
    // Load from localStorage
    const diagrams = Object.keys(localStorage).filter(key => key.startsWith('tcat-diagram-'));
    setSavedDiagrams(diagrams.map(key => key.replace('tcat-diagram-', '')));
    
    // Load from server
    fetchDiagramsFromServer();
  }, []);

  const fetchDiagramsFromServer = async () => {
    try {
      setLoading(true);
      const diagrams = await getDiagramsFromServer();
      setServerDiagrams(diagrams);
    } catch (error) {
      console.error('Error fetching diagrams:', error);
      showSnackbar('Failed to fetch diagrams from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const showSnackbar = (message: string, severity: 'success' | 'error') => {
    setSnackbar({
      open: true,
      message,
      severity
    });
  };

  const handleCloseSnackbar = () => {
    setSnackbar({...snackbar, open: false});
  };

  const onConnect = useCallback(
    (params: Connection) => setEdges((eds) => addEdge({ 
      ...params, 
      markerEnd: { type: MarkerType.ArrowClosed },
      style: { stroke: '#555' },
      type: 'straight',
      animated: false,
    }, eds)),
    [setEdges]
  );

  const onDragOver = useCallback((event: React.DragEvent) => {
    event.preventDefault();
    event.dataTransfer.dropEffect = 'move';
  }, []);

  const onDrop = useCallback(
    (event: React.DragEvent) => {
      event.preventDefault();

      const serviceType = event.dataTransfer.getData('application/awsServiceType');
      
      if (typeof serviceType === 'undefined' || !serviceType) {
        return;
      }

      const position = reactFlowInstance.screenToFlowPosition({
        x: event.clientX,
        y: event.clientY,
      });

      const newNode: Node = {
        id: `${serviceType}-${Date.now()}`,
        type: 'awsService',
        position,
        data: { label: `${serviceType}`, serviceType },
        zIndex: Math.floor(Math.random() * 100),
      };

      setNodes((nds) => nds.concat(newNode));
    },
    [reactFlowInstance, setNodes]
  );

  const onDragStart = (event: React.DragEvent, serviceType: string) => {
    event.dataTransfer.setData('application/awsServiceType', serviceType);
    event.dataTransfer.effectAllowed = 'move';
  };

  const onNodeClick = useCallback((event: React.MouseEvent, node: Node) => {
    setNodes((nds) => 
      nds.map((n) => {
        if (n.id === node.id) {
          return { ...n, zIndex: 999 };
        }
        return n;
      })
    );
  }, [setNodes]);

  const saveDiagram = async () => {
    if (diagramName.trim() === '') return;
    
    const flow = {
      nodes,
      edges,
    };
    
    try {
      setLoading(true);
      // Save to localStorage for backward compatibility
      localStorage.setItem(`tcat-diagram-${diagramName}`, JSON.stringify(flow));
      setSavedDiagrams(prev => [...prev.filter(d => d !== diagramName), diagramName]);
      
      // Save to server
      await saveDiagramToServer(diagramName, flow);
      
      // Refresh server diagrams
      await fetchDiagramsFromServer();
      
      setOpenSaveDialog(false);
      setDiagramName('');
      showSnackbar('Diagram saved successfully', 'success');
    } catch (error) {
      console.error('Error saving diagram:', error);
      showSnackbar('Failed to save diagram to server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const loadDiagram = () => {
    if (selectedDiagram === '') return;
    
    const flow = JSON.parse(localStorage.getItem(`tcat-diagram-${selectedDiagram}`) || '{"nodes":[],"edges":[]}');
    
    if (flow) {
      setNodes(flow.nodes || []);
      setEdges(flow.edges || []);
      showSnackbar('Diagram loaded from local storage', 'success');
    }
    
    setOpenLoadDialog(false);
  };

  const loadDiagramFromServer = async (id: number) => {
    try {
      setLoading(true);
      const diagram = await getDiagramById(id);
      
      if (diagram && diagram.diagram_data) {
        setNodes(diagram.diagram_data.nodes || []);
        setEdges(diagram.diagram_data.edges || []);
        showSnackbar('Diagram loaded from server', 'success');
      }
      
      setOpenLoadDialog(false);
    } catch (error) {
      console.error('Error loading diagram:', error);
      showSnackbar('Failed to load diagram from server', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteDiagram = async (id: number, event: React.MouseEvent) => {
    event.stopPropagation();
    
    if (window.confirm('Are you sure you want to delete this diagram?')) {
      try {
        setLoading(true);
        await deleteDiagram(id);
        setServerDiagrams(prev => prev.filter(d => d.id !== id));
        showSnackbar('Diagram deleted successfully', 'success');
      } catch (error) {
        console.error('Error deleting diagram:', error);
        showSnackbar('Failed to delete diagram', 'error');
      } finally {
        setLoading(false);
      }
    }
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const jsonContent = JSON.parse(e.target?.result as string);
        
        if (jsonContent && jsonContent.nodes && jsonContent.edges) {
          setNodes(jsonContent.nodes || []);
          setEdges(jsonContent.edges || []);
          showSnackbar('Diagram imported successfully', 'success');
        } else {
          showSnackbar('Invalid diagram file format', 'error');
        }
      } catch (error) {
        console.error('Error parsing JSON file:', error);
        showSnackbar('Error loading diagram file', 'error');
      }
    };
    reader.readAsText(file);
    
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const triggerFileUpload = () => {
    fileInputRef.current?.click();
  };

  const exportDiagram = () => {
    const flow = {
      nodes,
      edges,
    };
    
    const dataStr = JSON.stringify(flow, null, 2);
    const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
    
    const exportFileDefaultName = 'architecture-diagram.json';
    
    const linkElement = document.createElement('a');
    linkElement.setAttribute('href', dataUri);
    linkElement.setAttribute('download', exportFileDefaultName);
    linkElement.click();
  };

  return (
    <Box sx={{ height: 'calc(100vh - 200px)', display: 'flex', flexDirection: 'column' }}>
      <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
        <Button variant="outlined" onClick={() => setOpenSaveDialog(true)}>
          Save Diagram
        </Button>
        <Button variant="outlined" onClick={() => setOpenLoadDialog(true)}>
          Load Diagram
        </Button>
        <Button variant="contained" onClick={exportDiagram}>
          Export as JSON
        </Button>
        <Button 
          variant="outlined" 
          startIcon={<UploadFileIcon />}
          onClick={triggerFileUpload}
        >
          Import from JSON
        </Button>
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          accept=".json"
          onChange={handleFileUpload}
        />
      </Box>
      
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        <ServicePalette onDragStart={onDragStart} />
        
        <Box sx={{ flexGrow: 1, border: '1px solid #ddd', borderRadius: 1 }} ref={reactFlowWrapper}>
          <ReactFlowProvider>
            <ReactFlow
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
              onInit={setReactFlowInstance}
              onDrop={onDrop}
              onDragOver={onDragOver}
              onNodeClick={onNodeClick}
              nodeTypes={nodeTypes}
              defaultEdgeOptions={{ 
                type: 'straight',
                markerEnd: { type: MarkerType.ArrowClosed },
                style: { stroke: '#555' }
              }}
              connectionLineStyle={{ stroke: '#1a73e8', strokeWidth: 2 }}
              connectionLineType="straight"
              fitView
            >
              <Panel position="top-left">
                <Typography variant="body2" color="text.secondary">
                  Tip: Select a node to resize it by dragging the handles. Connect nodes by dragging from one handle to another.
                </Typography>
              </Panel>
              <Controls />
              <Background />
            </ReactFlow>
          </ReactFlowProvider>
        </Box>
      </Box>

      {/* Save Dialog */}
      <Dialog open={openSaveDialog} onClose={() => setOpenSaveDialog(false)}>
        <DialogTitle>Save Diagram</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            margin="dense"
            label="Diagram Name"
            fullWidth
            variant="outlined"
            value={diagramName}
            onChange={(e) => setDiagramName(e.target.value)}
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenSaveDialog(false)}>Cancel</Button>
          <Button onClick={saveDiagram} disabled={loading || diagramName.trim() === ''}>
            {loading ? <CircularProgress size={24} /> : 'Save'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Load Dialog */}
      <Dialog open={openLoadDialog} onClose={() => setOpenLoadDialog(false)} maxWidth="md" fullWidth>
        <DialogTitle>Load Diagram</DialogTitle>
        <DialogContent>
          <Typography variant="subtitle1" gutterBottom>Local Diagrams</Typography>
          <List dense>
            {savedDiagrams.length > 0 ? (
              savedDiagrams.map((name) => (
                <ListItem 
                  key={name} 
                  button 
                  selected={selectedDiagram === name}
                  onClick={() => setSelectedDiagram(name)}
                >
                  <ListItemText primary={name} />
                </ListItem>
              ))
            ) : (
              <ListItem>
                <ListItemText primary="No local diagrams saved" />
              </ListItem>
            )}
          </List>
          
          <Divider sx={{ my: 2 }} />
          
          <Typography variant="subtitle1" gutterBottom>Server Diagrams</Typography>
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', p: 2 }}>
              <CircularProgress />
            </Box>
          ) : (
            <List dense>
              {serverDiagrams.length > 0 ? (
                serverDiagrams.map((diagram) => (
                  <ListItem 
                    key={diagram.id} 
                    button
                    selected={selectedServerDiagram === diagram.id}
                    onClick={() => setSelectedServerDiagram(diagram.id)}
                    secondaryAction={
                      <IconButton 
                        edge="end" 
                        aria-label="delete"
                        onClick={(e) => handleDeleteDiagram(diagram.id, e)}
                      >
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <ListItemText 
                      primary={diagram.name} 
                      secondary={`Last updated: ${new Date(diagram.updated_at).toLocaleString()}`} 
                    />
                  </ListItem>
                ))
              ) : (
                <ListItem>
                  <ListItemText primary="No server diagrams saved" />
                </ListItem>
              )}
            </List>
          )}
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenLoadDialog(false)}>Cancel</Button>
          <Button 
            onClick={loadDiagram} 
            disabled={loading || selectedDiagram === ''}
            sx={{ mr: 1 }}
          >
            Load Local
          </Button>
          <Button 
            onClick={() => selectedServerDiagram && loadDiagramFromServer(selectedServerDiagram)} 
            disabled={loading || selectedServerDiagram === null}
            variant="contained"
          >
            Load from Server
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar 
        open={snackbar.open} 
        autoHideDuration={6000} 
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default ArchitectureDiagram;