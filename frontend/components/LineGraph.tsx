import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const fetchData = () => {
    //FETCH REAL DATA FROM BACKEND

    //mockdata
    // const data = [
    //     {key: 0, value: 100},
    //     {key: 1, value: 85},
    //     {key: 2, value: 60},
    //     {key: 3, value: 45},
    //     {key: 4, value: 55},
    //     {key: 5, value: 70},
    //     {key: 6, value: 30}
    // ];

    const data = [
        {key: 0, value: 0},
        {key: 1, value: 100},
        {key: 2, value: 250},
        {key: 3, value: 300},
        {key: 4, value: 200},
        {key: 5, value: 150},
        {key: 6, value: 450}
    ];

    const newData = [];

    return data;
};

export const LineGraph = () => {
    const data = fetchData();

    return (
        <LineChart width={500} height={300} data={data}>
            <CartesianGrid stroke='#aaa' strokeDasharray='5 5' />
            <Line dataKey='value' type='monotone' stroke='black' strokeWidth={2}/>
            <XAxis dataKey='key' />
            <YAxis/>
            <Tooltip cursor={false}/>
        </LineChart>
    );
}