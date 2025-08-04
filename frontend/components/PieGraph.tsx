import { PieChart, Pie, ResponsiveContainer } from 'recharts';

const fetchData = () => {
    //FETCH REAL DATA FROM BACKEND

    //mockdata
    const data = [
        {key: 'wins', value: 50},
        {key: 'losses', value: 25},
        {key: 'draws', value: 5},
    ];

    const newData = [];

    return data;
};

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042'];

export const PieGraph = () => {
    const data = fetchData();

    return (
        <PieChart width={500} height={300} data={data}>
            <Pie dataKey='value' fill='#2E6F40' stroke='black' strokeWidth={2} />
        </PieChart>
    );
}