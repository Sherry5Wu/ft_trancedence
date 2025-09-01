import { PieChart, Pie, ResponsiveContainer, Cell, Tooltip, Legend } from 'recharts';
import { UserStats } from '../utils/Interfaces';
import { useTranslation } from 'react-i18next';

const colors = ['#2E6F40', '#252525', '#CD1C18'];

function userStatsToPieData(stats: UserStats) {
    const { t } = useTranslation();

    const pieData = [
        { key: "games_won", value: stats.games_won },
        { key: "games_draw", value: stats.games_draw },
        { key: "games_lost", value: stats.games_lost },
    ];

    const newPie = pieData.map((entry) => {
        if (entry.key === 'games_won')
            return { ...entry, key: t('components.pieGraph.wins')}
        if (entry.key === 'games_draw')
            return { ...entry, key: t('components.pieGraph.draws')}
        if (entry.key === 'games_lost')
            return { ...entry, key: t('components.pieGraph.losses')}
    })

    return newPie;
}

export const PieGraph = ({ data }: { data: UserStats }) => {
    const stats = userStatsToPieData(data);

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
                    return entry.payload.key.toUpperCase();
                }}
                />
            </PieChart>
        </ResponsiveContainer>
    );
}