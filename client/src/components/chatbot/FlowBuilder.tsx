import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Plus, Edit, Trash2, MessageSquare, ArrowRight, Save } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface FlowNode {
  id: string;
  type: 'message' | 'question' | 'condition' | 'action';
  content: string;
  responses?: FlowResponse[];
  nextNode?: string;
  conditions?: FlowCondition[];
  action?: string;
}

interface FlowResponse {
  id: string;
  text: string;
  nextNode?: string;
}

interface FlowCondition {
  id: string;
  condition: string;
  nextNode?: string;
}

interface FlowBuilderProps {
  chatbot: any;
  onUpdate: (flows: any) => void;
}

export default function FlowBuilder({ chatbot, onUpdate }: FlowBuilderProps) {
  const { toast } = useToast();
  const [flows, setFlows] = useState<FlowNode[]>(chatbot.flows?.nodes || []);
  const [selectedNode, setSelectedNode] = useState<FlowNode | null>(null);
  const [isEditing, setIsEditing] = useState(false);

  const getNodeTypeColor = (type: string) => {
    switch (type) {
      case 'message': return 'bg-blue-500/10 text-blue-400';
      case 'question': return 'bg-green-500/10 text-green-400';
      case 'condition': return 'bg-yellow-500/10 text-yellow-400';
      case 'action': return 'bg-purple-500/10 text-purple-400';
      default: return 'bg-gray-500/10 text-gray-400';
    }
  };

  const createNewNode = (type: FlowNode['type']) => {
    const newNode: FlowNode = {
      id: crypto.randomUUID(),
      type,
      content: '',
      responses: type === 'question' ? [] : undefined,
      conditions: type === 'condition' ? [] : undefined,
      action: type === 'action' ? '' : undefined,
    };

    setFlows(prev => [...prev, newNode]);
    setSelectedNode(newNode);
    setIsEditing(true);
  };

  const updateNode = (nodeId: string, updates: Partial<FlowNode>) => {
    setFlows(prev =>
      prev.map(node => node.id === nodeId ? { ...node, ...updates } : node)
    );
    
    if (selectedNode?.id === nodeId) {
      setSelectedNode(prev => prev ? { ...prev, ...updates } : null);
    }
  };

  const deleteNode = (nodeId: string) => {
    setFlows(prev => prev.filter(node => node.id !== nodeId));
    if (selectedNode?.id === nodeId) {
      setSelectedNode(null);
      setIsEditing(false);
    }
  };

  const addResponse = (nodeId: string) => {
    const newResponse: FlowResponse = {
      id: crypto.randomUUID(),
      text: '',
      nextNode: undefined,
    };

    updateNode(nodeId, {
      responses: [...(flows.find(n => n.id === nodeId)?.responses || []), newResponse]
    });
  };

  const updateResponse = (nodeId: string, responseId: string, updates: Partial<FlowResponse>) => {
    const node = flows.find(n => n.id === nodeId);
    if (!node?.responses) return;

    const updatedResponses = node.responses.map(resp =>
      resp.id === responseId ? { ...resp, ...updates } : resp
    );

    updateNode(nodeId, { responses: updatedResponses });
  };

  const removeResponse = (nodeId: string, responseId: string) => {
    const node = flows.find(n => n.id === nodeId);
    if (!node?.responses) return;

    const updatedResponses = node.responses.filter(resp => resp.id !== responseId);
    updateNode(nodeId, { responses: updatedResponses });
  };

  const saveFlows = () => {
    const flowData = {
      nodes: flows,
      startNode: flows[0]?.id || null,
      version: Date.now()
    };

    onUpdate(flowData);
    
    toast({
      title: "Success",
      description: "Conversation flows saved successfully",
    });
  };

  return (
    <div className="space-y-6">
      {/* Flow Builder Header */}
      <Card className="bg-gray-800 border-gray-700">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-white">Conversation Flow Builder</CardTitle>
              <CardDescription className="text-gray-400">
                Design conversation paths and responses for your chatbot
              </CardDescription>
            </div>
            <div className="flex items-center space-x-2">
              <Button 
                onClick={saveFlows}
                className="bg-primary hover:bg-primary/90"
              >
                <Save className="w-4 h-4 mr-2" />
                Save Flows
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="flex flex-wrap gap-2">
            <Button
              onClick={() => createNewNode('message')}
              variant="outline"
              size="sm"
              className="border-blue-500/20 text-blue-400 hover:bg-blue-500/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Message
            </Button>
            <Button
              onClick={() => createNewNode('question')}
              variant="outline"
              size="sm"
              className="border-green-500/20 text-green-400 hover:bg-green-500/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Question
            </Button>
            <Button
              onClick={() => createNewNode('condition')}
              variant="outline"
              size="sm"
              className="border-yellow-500/20 text-yellow-400 hover:bg-yellow-500/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Condition
            </Button>
            <Button
              onClick={() => createNewNode('action')}
              variant="outline"
              size="sm"
              className="border-purple-500/20 text-purple-400 hover:bg-purple-500/10"
            >
              <Plus className="w-4 h-4 mr-2" />
              Action
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Flow Nodes List */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">Flow Nodes</CardTitle>
            <CardDescription className="text-gray-400">
              Manage your conversation flow components
            </CardDescription>
          </CardHeader>
          <CardContent>
            {flows.length === 0 ? (
              <div className="text-center py-8">
                <MessageSquare className="w-12 h-12 text-gray-600 mx-auto mb-4" />
                <p className="text-gray-400">No flow nodes created yet</p>
                <p className="text-sm text-gray-500 mt-1">
                  Add nodes to start building your conversation flow
                </p>
              </div>
            ) : (
              <div className="space-y-3">
                {flows.map((node, index) => (
                  <div
                    key={node.id}
                    className={`p-4 rounded-lg border cursor-pointer transition-colors ${
                      selectedNode?.id === node.id
                        ? 'border-primary bg-primary/10'
                        : 'border-gray-600 hover:border-gray-500 bg-gray-700'
                    }`}
                    onClick={() => {
                      setSelectedNode(node);
                      setIsEditing(false);
                    }}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center space-x-2">
                          <span className="text-sm text-gray-400">#{index + 1}</span>
                          <Badge className={getNodeTypeColor(node.type)}>
                            {node.type}
                          </Badge>
                        </div>
                        <h4 className="font-medium text-white">
                          {node.content || `Untitled ${node.type}`}
                        </h4>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNode(node);
                            setIsEditing(true);
                          }}
                          className="text-gray-400 hover:text-white"
                        >
                          <Edit className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            deleteNode(node.id);
                          }}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                    {node.content && (
                      <p className="text-sm text-gray-400 mt-2 truncate">
                        {node.content}
                      </p>
                    )}
                    {node.responses && node.responses.length > 0 && (
                      <div className="mt-2 flex items-center text-xs text-gray-500">
                        <ArrowRight className="w-3 h-3 mr-1" />
                        {node.responses.length} response(s)
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Node Editor */}
        <Card className="bg-gray-800 border-gray-700">
          <CardHeader>
            <CardTitle className="text-white">
              {isEditing ? 'Edit Node' : 'Node Details'}
            </CardTitle>
            <CardDescription className="text-gray-400">
              {selectedNode ? 'Configure the selected flow node' : 'Select a node to view details'}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {!selectedNode ? (
              <div className="text-center py-8">
                <p className="text-gray-400">Select a node to view or edit its details</p>
              </div>
            ) : isEditing ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="content" className="text-white">Content</Label>
                  <Textarea
                    id="content"
                    value={selectedNode.content}
                    onChange={(e) => updateNode(selectedNode.id, { content: e.target.value })}
                    placeholder={`Enter ${selectedNode.type} content...`}
                    className="mt-1"
                    rows={3}
                  />
                </div>

                {selectedNode.type === 'question' && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <Label className="text-white">Response Options</Label>
                      <Button
                        onClick={() => addResponse(selectedNode.id)}
                        size="sm"
                        variant="outline"
                        className="text-green-400 border-green-500/20 hover:bg-green-500/10"
                      >
                        <Plus className="w-4 h-4 mr-1" />
                        Add Response
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {selectedNode.responses?.map((response) => (
                        <div key={response.id} className="flex items-center space-x-2">
                          <Input
                            value={response.text}
                            onChange={(e) => updateResponse(selectedNode.id, response.id, { text: e.target.value })}
                            placeholder="Response text..."
                            className="flex-1"
                          />
                          <Button
                            onClick={() => removeResponse(selectedNode.id, response.id)}
                            size="sm"
                            variant="ghost"
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {selectedNode.type === 'action' && (
                  <div>
                    <Label htmlFor="action" className="text-white">Action Type</Label>
                    <Input
                      id="action"
                      value={selectedNode.action || ''}
                      onChange={(e) => updateNode(selectedNode.id, { action: e.target.value })}
                      placeholder="e.g., schedule_appointment, capture_lead"
                      className="mt-1"
                    />
                  </div>
                )}

                <div className="flex items-center space-x-2 pt-4">
                  <Button
                    onClick={() => setIsEditing(false)}
                    className="bg-primary hover:bg-primary/90"
                  >
                    Save Changes
                  </Button>
                  <Button
                    onClick={() => setIsEditing(false)}
                    variant="outline"
                  >
                    Cancel
                  </Button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div>
                  <Label className="text-white">Type</Label>
                  <Badge className={`mt-1 ${getNodeTypeColor(selectedNode.type)}`}>
                    {selectedNode.type}
                  </Badge>
                </div>
                <div>
                  <Label className="text-white">Content</Label>
                  <p className="mt-1 text-gray-300 bg-gray-700 p-3 rounded">
                    {selectedNode.content || 'No content specified'}
                  </p>
                </div>
                {selectedNode.responses && selectedNode.responses.length > 0 && (
                  <div>
                    <Label className="text-white">Response Options</Label>
                    <div className="mt-1 space-y-2">
                      {selectedNode.responses.map((response) => (
                        <div key={response.id} className="bg-gray-700 p-2 rounded text-sm text-gray-300">
                          {response.text || 'Untitled response'}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
                <Button
                  onClick={() => setIsEditing(true)}
                  className="w-full bg-primary hover:bg-primary/90"
                >
                  <Edit className="w-4 h-4 mr-2" />
                  Edit Node
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
