import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend } from "chart.js";
import { Line } from "react-chartjs-2";
import Statistic from "./Statistic";
import { PresentationChartLineIcon } from "@heroicons/react/24/outline";
import { calculateMean, calculateMedian } from "../utils/utils";
import { useTranslation } from "react-i18next";

interface Props {
    minValue: number;
    maxValue: number;
    numbers: number[];
}

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, Title, Tooltip, Legend);

const kernelDensityEstimation = (x: number[], data: number[], bandwidth: number) => {
    const gaussianKernel = (u: number) => (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-0.5 * u * u);

    return x.map((xi) =>
        data.reduce((sum, di) => sum + gaussianKernel((xi - di) / bandwidth), 0) /
        (data.length * bandwidth)
    );
};

const DensityChart = (props: Props) => {
    const { t } = useTranslation();
    const step = 0.1;
    const xRange = Array.from({ length: Math.ceil((props.maxValue - props.minValue) / step) + 1 }, (_, i) => props.minValue + i * step);

    const bandwidth = 0.5;
    const densities = kernelDensityEstimation(xRange, props.numbers, bandwidth);

    const data = {
        labels: xRange.map((x) => x.toFixed(1)),
        datasets: [
            {
                label: "Densité",
                data: densities,
                borderColor: "rgba(75, 192, 192, 1)",
                backgroundColor: "rgba(75, 192, 192, 0.1)",
                fill: true,
                tension: 0.4,
                pointRadius: 0,
            },
        ],
    };

    const options = {
        responsive: true,
        scales: {
            x: {
                title: {
                    display: true,
                    text: "Valeurs",
                },
            },
            y: {
                title: {
                    display: true,
                    text: "Densité",
                },
            },
        },
    };

    return <>
        <div className="w-3/5 flex flex-col mx-auto items-center gap-7">
            <Line data={data} options={options} />
            <div className="flex gap-5">
                <Statistic
                    title={t("Mean")}
                    value={calculateMean(props.numbers)}
                >
                    <PresentationChartLineIcon className="size-6 text-white" />
                </Statistic>

                <Statistic
                    title={t("Median")}
                    value={calculateMedian(props.numbers)}
                >
                    <PresentationChartLineIcon className="size-6 text-white" />
                </Statistic>
            </div>
        </div>
    </>
};

export default DensityChart;
