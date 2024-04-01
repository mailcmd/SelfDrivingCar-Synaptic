class NeuralNetwork {
   constructor(neuronsCenter, neuronsSides) {
      this.neuronsCenter = neuronsCenter;
      this.neuronsSides = neuronsSides;
      
      this.levels = [[], [], []];
      this.levels[2] = [ 
         new Neuron(),
         new Neuron(),
         new Neuron(),
         new Neuron()
      ];
      for (let i = 0; i < this.neuronsCenter; i++) {
         this.levels[0].push(new Neuron());
         this.levels[1].push(new Neuron());
      }
      for (let i = 0; i < this.neuronsCenter; i++) {
         for (let j = 0; j < this.neuronsCenter; j++) {
            this.levels[0][i].project(this.levels[1][j]);
         }
      }
      for (let i = 0; i < this.neuronsCenter; i++) {
         for (let j = 0; j < 4; j++) {
            this.levels[1][i].project(this.levels[2][j]);
         }
      }

      for (let i = 0; i < this.neuronsSides; i++) {
         this.levels[0].push(new Neuron());
      }
      for (let i = 0; i < this.neuronsSides; i++) {
         for (let j = 0; j < 4; j++) {
            this.levels[0][this.neuronsCenter + i].project(this.levels[2][j]);
         }
      }
   }

   load(model) {      
      for (let i = 0; i < this.levels.length; i++) {
         const neurons = this.levels[i];
         for (let j = 0; j < neurons.length; j++) {
            neurons[j].bias = model[i][j].bias;
            let k = 0;
            for (let id in neurons[j].connections.projected) {
               neurons[j].connections.projected[id].weight = model[i][j].weights[k];
               k++;
            }
         }
      }
   }

   getModel() {
      const model = [];
      for (let i = 0; i < this.levels.length; i++) {
         const neurons = this.levels[i];
         model[i] = [];
         for (let j = 0; j < neurons.length; j++) {
            const neuron = { bias: neurons[j].bias, weights: [] };            
            if (Object.values(neurons[j].connections.projected).length > 0) {
               for (let id in neurons[j].connections.projected) {
                  const conn = neurons[j].connections.projected[id];
                  neuron.weights.push(conn.weight); 
               }
            }
            model[i].push(neuron);
         }         
      }
      return JSON.parse(JSON.stringify(model));
   }

   feedForward(givenInputs, binarize = true) {
      for (let i = 0; i < givenInputs.length; i++) {
         this.levels[0][i].activate(givenInputs[i]);
      }
      for (let i = 0; i < this.levels[1].length; i++) {
         this.levels[1][i].activate();
      }
      const outputs = [];
      for (let i = 0; i < this.levels[2].length; i++) {
         outputs.push(this.levels[2][i].activate());
      }
      return binarize ? outputs.map( o => Math.round(o)) : o;
   }

   mutate(amount = 1) {
      for (let i = 0; i < this.levels.length; i++) {
         const neurons = this.levels[i];
         for (let j = 0; j < neurons.length; j++) {
            neurons[j].bias = lerp(
               neurons[j].bias,
               100*(Math.random() * 2 - 1)/100,
               amount
            );
            if (Object.values(neurons[j].connections.projected).length > 0) {
               for (let id in neurons[j].connections.projected) {
                  const conn = neurons[j].connections.projected[id];
                  conn.weight = lerp(
                     conn.weight,
                     100*(Math.random() * 2 - 1)/100,
                     amount
                  ); 
               }
            }
         }
      }
   }

   static crossNetworks(network1, network2) {
   }
 
}

