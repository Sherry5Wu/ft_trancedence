import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip } from 'recharts';

const fetchData = () => {
    //FETCH REAL DATA FROM BACKEND

    //mockdata
    const data = [
        {key: 'wins', value: 7},
        {key: 'draws', value: 1},
        {key: 'losses', value: 5}
    ];

    const newData = [];

    return data;
};

const colors = ['#2E6F40', '#252525', '#cd1c18'];

export const PieGraph = () => {
    const data = fetchData();

    return (
        <PieChart width={500} height={300} data={data}>
            <Pie dataKey='value' fill='#FFF' stroke='#000' strokeWidth={2}
                label={({ percent, payload }) => `${payload.key.toUpperCase()} ${((percent ?? 1)* 100).toFixed(0)}%`}
                labelLine={false}>
                {data.map((entry, index) => (
                    <Cell key={`cell-${entry.key}`} fill={colors[index % colors.length]} />
                ))}
            </Pie>
            <Tooltip  />
        </PieChart>
    );
}