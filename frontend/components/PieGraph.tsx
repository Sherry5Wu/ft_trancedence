import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';

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

// const customTooltip = ({ active, payload, label}) => {
//     if (active && payload && payload.length)
//         return (
//             <div>
//                 <p>{payload.value}</p>
//             </div>
//     )
// }

export const PieGraph = () => {
    const data = fetchData();

    return (
        <div className='p-4'>
        <ResponsiveContainer width='100%' aspect={1.25}>
            <PieChart width={500} height={300} data={data}>
                <Pie dataKey='value' fill='#FFF' stroke='#000' strokeWidth={2} labelLine={false}
                    label={({ percent, payload }) => `${((percent ?? 1)* 100).toFixed(0)}%`}
                    >
                    {data.map((entry, index) => (
                        <Cell key={`cell-${entry.key}`} fill={colors[index % colors.length]} />
                    ))}
                </Pie>
                <Tooltip />
                <Legend
                formatter={(value, entry) => {
                    return entry.payload.key.toUpperCase(); // or just value.toUpperCase()
                }}
                />
            </PieChart>
        </ResponsiveContainer>
        </div>
    );
}