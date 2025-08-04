import { LineChart, Line } from 'recharts';

const fetchData = () => {
    //FETCH REAL DATA FROM BACKEND

    //mockdata
    const data = [
    {key: 0, value: 0},
    {key: 1, value: 100},
    {key: 2, value: 250},
    {key: 3, value: 300},
    {key: 4, value: 200},
    {key: 5, value: 350},
    {key: 6, value: 500}
    ];

    return data;
};

export const LineGraph = () => {
    const data = fetchData();

    if (data.length === 0)
        return 'No data yet';

    return (
    <LineChart width={data.length} height={Math.max(...data.map((d) => d.value))} data={data}>
        <Line dataKey='data' />
    </LineChart>
    )
};