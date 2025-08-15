import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';
import { UserStats } from './Stats';
// const fetchData = (user: string) => {
//     //FETCH REAL DATA FROM BACKEND

//     //mockdata
//     const data = [
//         {key: 'wins', value: 7},
//         {key: 'draws', value: 1},
//         {key: 'losses', value: 5}
//     ];

//     const newData = [];

//     return data;
// };

const colors = ['#2E6F40', '#252525', '#CD1C18'];

// const customTooltip = ({ active, payload, label}) => {
//     if (active && payload && payload.length)
//         return (
//             <div>
//                 <p>{payload.value}</p>
//             </div>
//     )
// }

function userStatsToPieData(stats: UserStats) {
  return [
    { key: "games_played", value: stats.games_played },
    { key: "win_streak", value: stats.win_streak },
    { key: "longest_win_streak", value: stats.longest_win_streak },
    { key: "games_draw", value: stats.games_draw },
    { key: "games_lost", value: stats.games_lost },
    { key: "games_won", value: stats.games_won },
  ];
}


export const PieGraph = (data: UserStats) => {

    let stats = userStatsToPieData(data);
    return (
        <ResponsiveContainer width='100%' aspect={1.25}>
            <PieChart width={500} height={300} data={stats}>
                <Pie dataKey='value' fill='#FFF' stroke='#000' strokeWidth={2} labelLine={false}
                    label={({ percent, payload }) => `${((percent ?? 1)* 100).toFixed(0)}%`}
                    >
                    {stats.map((entry, index) => (
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
    );
}