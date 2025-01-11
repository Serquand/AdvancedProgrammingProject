// @ts-nocheck
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Pie } from 'react-chartjs-2';
import { generateDistinctColors } from '../utils/utils';

ChartJS.register(ArcElement, Tooltip, Legend);

interface Props {
    questionLabel: string;
    responsesOccurence: {
        label: string;
        occurrences: number
    }[];
}

const PieChart = (props: Props) => {
    const totalResponses = props.responsesOccurence.reduce((sum, item) => sum + item.occurrences, 0);
    const labels = props.responsesOccurence.map(item => item.label);
    const dataValues = props.responsesOccurence.map(item => item.occurrences);
    const backgroundColors = generateDistinctColors(4)

    const data = {
        labels,
        datasets: [
            {
                data: dataValues,
                backgroundColor: backgroundColors,
                borderColor: backgroundColors.map(color => color.replace('0.6', '1')),
                borderWidth: 1,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: { position: 'top' },
            tooltip: {
                callbacks: {
                    label: function (tooltipItem: any) {
                        const value = dataValues[tooltipItem.dataIndex];
                        const percentage = ((value / totalResponses) * 100).toFixed(1);
                        return `${labels[tooltipItem.dataIndex]}: ${value} réponses (${percentage}%)`;
                    },
                },
            },
        },
    };

    return (
        <div className="w-full max-w-md mx-auto">
            <p className="text-lg font-semibold mb-4 text-center">{props.questionLabel}</p>
            <Pie data={data} options={options} />
        </div>
    );
};

export default PieChart;
