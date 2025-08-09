export class WebSocketManager {
  private ws: WebSocket | null = null;
  private reconnectAttempts = 0;
  private maxReconnectAttempts = 5;
  private reconnectDelay = 1000;
  private tenantId: string | null = null;
  private listeners: Map<string, (data: any) => void> = new Map();

  constructor() {
    this.connect();
  }

  private connect() {
    try {
      const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
      const wsUrl = `${protocol}//${window.location.host}/ws`;
      
      this.ws = new WebSocket(wsUrl);
      
      this.ws.onopen = () => {
        console.log('WebSocket connected');
        this.reconnectAttempts = 0;
        
        // Subscribe to tenant updates if we have a tenantId
        if (this.tenantId) {
          this.send({
            type: 'subscribe_tenant',
            tenantId: this.tenantId
          });
        }
      };

      this.ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          this.handleMessage(data);
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error);
        }
      };

      this.ws.onclose = () => {
        console.log('WebSocket disconnected');
        this.scheduleReconnect();
      };

      this.ws.onerror = (error) => {
        console.error('WebSocket error:', error);
      };
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error);
      this.scheduleReconnect();
    }
  }

  private scheduleReconnect() {
    if (this.reconnectAttempts < this.maxReconnectAttempts) {
      setTimeout(() => {
        this.reconnectAttempts++;
        console.log(`Attempting to reconnect (${this.reconnectAttempts}/${this.maxReconnectAttempts})`);
        this.connect();
      }, this.reconnectDelay * Math.pow(2, this.reconnectAttempts));
    }
  }

  private handleMessage(data: any) {
    const { type } = data;
    
    // Call registered listeners
    const listener = this.listeners.get(type);
    if (listener) {
      listener(data);
    }

    // Handle specific message types
    switch (type) {
      case 'subscribed':
        console.log('Subscribed to tenant updates:', data.tenantId);
        break;
      case 'new_lead':
        this.notifyListeners('lead_update', data);
        break;
      case 'new_appointment':
        this.notifyListeners('appointment_update', data);
        break;
      case 'conversation_update':
        this.notifyListeners('conversation_update', data);
        break;
      case 'analytics_update':
        this.notifyListeners('analytics_update', data);
        break;
    }
  }

  private notifyListeners(event: string, data: any) {
    const listener = this.listeners.get(event);
    if (listener) {
      listener(data);
    }
  }

  public send(data: any) {
    if (this.ws && this.ws.readyState === WebSocket.OPEN) {
      this.ws.send(JSON.stringify(data));
    }
  }

  public subscribeTenant(tenantId: string) {
    this.tenantId = tenantId;
    this.send({
      type: 'subscribe_tenant',
      tenantId
    });
  }

  public addEventListener(event: string, callback: (data: any) => void) {
    this.listeners.set(event, callback);
  }

  public removeEventListener(event: string) {
    this.listeners.delete(event);
  }

  public disconnect() {
    if (this.ws) {
      this.ws.close();
      this.ws = null;
    }
  }

  public isConnected(): boolean {
    return this.ws !== null && this.ws.readyState === WebSocket.OPEN;
  }
}

// Singleton instance
export const wsManager = new WebSocketManager();
