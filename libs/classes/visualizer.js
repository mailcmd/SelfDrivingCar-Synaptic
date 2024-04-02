class Visualizer {
    static drawNetwork(network) {
        const margin = 20;
        const ctx = networkCtx;
        const left = margin;
        const top = margin;
        const width = ctx.canvas.width - margin * 2;
        const height = ctx.canvas.height - margin * 2;
        const levelHeight = height / (network.levels.length-1);
        const maxLevelLength = Math.max(...network.levels.map(l => l.length));

        const outputLabels = ['🢀', '🢁', '🢂', '🢃'];

        const neurons = {};
        for (let i = network.levels.length-1; i >= 0; i--) {
            const right = left + width;
            const level = network.levels[i];
            for (let j = 0; j < level.length; j++) {
                const bottom = top + (levelHeight * (network.levels.length - i - 1));
                neurons[level[j].ID] = {
                    x: Visualizer.#getNodeX(maxLevelLength , j, left, right ),
                    y: bottom,
                    bias: network.lastActivates[i][j],
                    conns: level[j].connections.projected,
                    label: i == network.levels.length-1 ? outputLabels[j] : null
                };
            }
        }
        Visualizer.drawLevels(ctx, neurons);
    }

    static drawLevels(ctx, neurons) {
        for (let id in neurons) {
            const neuron = neurons[id];
            for (let k in neuron.conns) {
                const cNeuron = neurons[neuron.conns[k].to.ID];
                ctx.beginPath();
                ctx.moveTo(
                    neuron.x,
                    neuron.y
                );
                ctx.lineTo(
                    cNeuron.x,
                    cNeuron.y
                );
                ctx.lineWidth = 2;
                ctx.strokeStyle = getRGBA(neuron.conns[k].weight);
                ctx.stroke();
            }    
        }
        const nodeRadius = 10;
        for (let id in neurons) {
            const neuron = neurons[id];            
            ctx.beginPath();
            ctx.arc(neuron.x, neuron.y, nodeRadius, 0, Math.PI * 2);
            ctx.fillStyle = 'black';
            ctx.fill();
            ctx.beginPath();
            ctx.arc(neuron.x, neuron.y, nodeRadius*0.7, 0, Math.PI * 2);
            ctx.fillStyle = getRGBA(neuron.bias);
            ctx.fill();
            if (neuron.label) {
                ctx.beginPath();
                ctx.textAlign = 'center';
                ctx.textBaseline = 'middle';
                ctx.fillStyle = 'black';
                ctx.strokeStyle = 'white';
                ctx.font = (nodeRadius*1)+'px Arial';
                ctx.fillText(neuron.label, neuron.x, neuron.y+1);
                ctx.lineWidth = 0.5;
                ctx.strokeText(neuron.label, neuron.x, neuron.y+1);
            }
        }
    }

    static #getNodeX(len, index, left, right) {
        return lerp(
            left,
            right,
            len == 1 ? 0.5 : index / (len - 1)
        );
    }
}