import nats, { Stan } from 'node-nats-streaming';

class NatsWrapper {
  private _client?: Stan;

  get client() {
    if (!this._client) {
      throw new Error('Cannot access NATS client before connecting');
    }
    return this._client;
  }

  connect(clusterId: string, clientId: string, url: string) {
    this._client = nats.connect(clusterId, clientId, { url: url });

    return new Promise((resolve, reject) => {
      this.client.on('connect', () => {
        console.log(
          `Cluster: ${clusterId} with Client: ${clientId} connected to NATS`
        );
        resolve(true);
      });
      this.client.on('error', (err) => {
        console.log(
          `Cluster: ${clusterId} with Client: ${clientId} failed to connect to NATS`
        );
        reject(err);
      });
    });
  }
}

export const natsWrapper = new NatsWrapper();
