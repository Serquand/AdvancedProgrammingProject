interface Props {
    children: JSX.Element;
    title: string;
    value: string | number;
}

const Statistic = (props: Props) => {
    return (
        <>
            <div>
                <div className="relative overflow-hidden rounded-lg bg-white pl-6 pr-20 w-fit py-5 shadow">
                    <dt>
                        <div className="absolute rounded-md bg-indigo-500 p-3">
                            {props.children}
                        </div>
                        <p className="ml-16 truncate text-sm font-medium text-gray-500">{props.title}</p>
                    </dt>
                    <dd className="ml-16 flex items-baseline">
                        <p className="text-2xl font-semibold text-gray-900">{props.value}</p>
                    </dd>
                </div>
            </div>
        </>
    )
}

export default Statistic;