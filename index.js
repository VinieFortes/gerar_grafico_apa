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
    // Use uma expressão regular para extrair os valores desejados
    const match = line.match(/Length: (\d+) Disorder: ([\d,]+) Iteration: (\d+) Pivot type: (\d+) took (\d+) ns/);

    // Se não houver correspondência, retorne null ou um objeto vazio, dependendo dos requisitos
    if (!match) {
        return null; // ou return {};
    }

    // Extrai os valores correspondentes
    const [, length, disorder, iteration, pivotType, time] = match;

    // Retorna um novo objeto com os valores desejados
    return {
        tamanho: `${length}`,
        disorder,
        iteration,
        pivotType,
        time
    };
});


const groupedData = processedData.reduce((acc, curr) => {
    if (curr && curr.disorder && curr.pivotType && curr.time) {
        const key = `${curr.disorder}-${curr.pivotType}-${curr.tamanho}`;
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
            title: {
                display: true,
                text: 'Número da Execução',
                color: 'black'
            },
            grid: {
                color: 'rgba(0, 0, 0, 0.1)',
                borderColor: 'rgba(0, 0, 0, 0.1)',
                backgroundColor: 'white'
            }
        },
        y: {
            title: {
                display: true,
                text: 'Tempo de Execução (ns)',
                color: 'black'
            },
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
    const [disorder, pivotType, tamanho] = key.split('-');
    const configuration = {
        type: 'line',
        data: {
            labels: Array.from({ length: groupedData[key].length }, (_, i) => i + 1),
            datasets: [{
                label: `Desordem ${disorder}, Tamanho ${parseInt(tamanho)}, Tipo de Pivô ${pivotType}`, // Convertendo tamanho para número
                data: groupedData[key],
                fill: false,
                borderColor: 'blue',
                backgroundColor: 'blue',
                tension: 0.1
            }]
        },
        options: {
            ...commonOptions,
            title: {
                display: true,
                text: `Tempo de Execução do Algoritmo Quicksort para Desordem ${disorder} e Tipo de Pivô ${pivotType}`,
                color: 'black'
            }
        }
    };

    chartJSNodeCanvas.renderToBuffer(configuration).then((buffer) => {
        // Salvando a imagem como um arquivo PNG
        fs.writeFileSync(`chart-${disorder}-${pivotType}-${tamanho}.png`, buffer); // Incluindo tamanho no nome do arquivo
        console.log(`Chart saved as chart-${disorder}-${pivotType}-${tamanho}.png`);
    }).catch((err) => {
        console.error(err);
    });
});
