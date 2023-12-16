const fs = require('fs');
const { ChartJSNodeCanvas } = require('chartjs-node-canvas');
const yargs = require('yargs');

const argv = yargs
    .option('input', {
        alias: 'i',
        describe: 'Caminho para o arquivo output_quick_sort.txt',
        demandOption: true, // Torna obrigatório fornecer este argumento
        type: 'string'
    })
    .argv;

const data = fs.readFileSync(argv.input, 'utf8');
const lines = data.split('\n');
const processedData = lines.map(line => {
    const [length, disorder, , iteration, , , , , pivotType, , time] = line.split(' ');
    return {
        length,
        disorder,
        iteration,
        pivotType,
        time
    };
});

const groupedData = processedData.reduce((acc, curr) => {
    const key = `${curr.disorder}-${curr.pivotType}`;

    if (curr.length && curr.disorder && curr.iteration && curr.pivotType && curr.time) {
        acc[key] = acc[key] || [];
        acc[key].push(curr.time);
    }

    return acc;
}, {});

const commonOptions = {
    plugins: {
        legend: {
            labels: {
                color: 'black'
            }
        }
    },
    scales: {
        x: {
            grid: {
                color: 'rgba(0, 0, 0, 0.1)',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                backgroundColor: 'white'
            }
        },
        y: {
            grid: {
                color: 'rgba(0, 0, 0, 0.1)',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                backgroundColor: 'white'
            }
        }
    }
};

const width = 800;
const height = 600;
const backgroundColour = 'white';
const chartJSNodeCanvas = new ChartJSNodeCanvas({ width, height, backgroundColour});

Object.keys(groupedData).forEach((key) => {
    const [disorder, pivotType] = key.split('-');
    const configuration = {
        type: 'line',
        data: {
            labels: Array.from({ length: groupedData[key].length }, (_, i) => i + 1),
            datasets: [{
                label: `Disorder ${disorder}, Pivot Type ${pivotType}`,
                data: groupedData[key],
                fill: false,
                borderColor: 'blue',
                backgroundColor: 'blue', // Agora a cor de fundo coincide com a cor da linha
                tension: 0.1
            }]
        },
        options: commonOptions
    };

    chartJSNodeCanvas.renderToBuffer(configuration).then((buffer) => {
        // Salvando a imagem como um arquivo PNG
        fs.writeFileSync(`chart-${disorder}-${pivotType}.png`, buffer);
        console.log(`Chart saved as chart-${disorder}-${pivotType}.png`);
    }).catch((err) => {
        console.error(err);
    });
});
