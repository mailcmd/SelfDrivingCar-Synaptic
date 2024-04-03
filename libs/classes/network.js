class NeuralNetwork {
   constructor(neuronsCenter, neuronsSides) {
      this.neuronsCenter = neuronsCenter;
      this.neuronsSides = neuronsSides;
      this.lastActivates = [];
      
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

   feedForward(givenInputs, binarize = true) {
      this.lastActivates[0] = givenInputs;
      this.lastActivates[1] = [];
      this.lastActivates[2] = [];
      for (let i = 0; i < givenInputs.length; i++) {
         this.levels[0][i].activate(givenInputs[i]);
      }
      for (let i = 0; i < this.levels[1].length; i++) {
         this.lastActivates[1].push(this.levels[1][i].activate());
      }
      const outputs = [];
      for (let i = 0; i < this.levels[2].length; i++) {
         outputs.push(this.levels[2][i].activate());
      }
      this.lastActivates[2] = binarize ? outputs.map( o => Math.round(o)) : o;
      return this.lastActivates[2];
   }

   train({
      inputs,
      outputs,
      epoch = 500,
      learningRate = 0.3
   }) {
      for (let i = 0; i < epoch; i++) {
         for (let j = 0; j < this.levels[0].length; j++) {
            this.levels[0][j].activate(inputs[j]);
         }
         for (let j = 0; j < this.levels[1].length; j++) {
            this.levels[1][j].activate();
         }
         for (let j = 0; j < this.levels[2].length; j++) {
            this.levels[2][j].activate();
            this.levels[2][j].propagate(learningRate, outputs[j]);
         }
      }
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

   static crossNetworksModels(net1, net2) {
      const [ model1, model2 ] = [ [], [] ];
      for (let i = 0; i < net1.levels.length; i++) {
         model1[i] = [];
         model2[i] = [];
         const neurons1 = net1.levels[i];
         const neurons2 = net2.levels[i];
         for (let j = 0; j < neurons1.length; j++) {
            let neuron1 = {};            
            let neuron2 = {};
            if (j % 2 == 0) {
               neuron1 = { bias: neurons1[j].bias, weights: [] };            
               neuron2 = { bias: neurons2[j].bias, weights: [] };
            } else {
               neuron1 = { bias: neurons2[j].bias, weights: [] };            
               neuron2 = { bias: neurons1[j].bias, weights: [] };
            }            
            if (Object.values(neurons1[j].connections.projected).length > 0) {
               let n = 0;
               const conns1 = Object.values(neurons1[j].connections.projected);
               const conns2 = Object.values(neurons2[j].connections.projected);
               for (let n = 0; n < conns1.length; n++) {
                  const conn1 = conns1[n];
                  const conn2 = conns2[n];
                  if (n % 2 == 0) {
                     neuron1.weights.push(conn1.weight); 
                     neuron2.weights.push(conn2.weight); 
                  } else {
                     neuron1.weights.push(conn2.weight); 
                     neuron2.weights.push(conn1.weight); 
                  }
               }
            }
            model1[i].push(neuron1);
            model2[i].push(neuron2);
         }         
      }
      return [ model1, model2 ];
   }
}

