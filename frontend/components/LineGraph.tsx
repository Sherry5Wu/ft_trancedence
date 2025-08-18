import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ScoreHistory } from '../utils/Interfaces';

export const LineGraph = ({ data }: { data: ScoreHistory[] | null }) => {
    if (!data)
		return <div className='flex justify-center my-5'>No data yet</div>

    return (
        <ResponsiveContainer width="100%" aspect={1.5}>
            <LineChart width={500} height={300} data={data}>
                <CartesianGrid stroke='#aaa' strokeDasharray='5 5' />
                <Line dataKey='elo_score' type='monotone' stroke='black' strokeWidth={2}/>
                <XAxis dataKey='id' />
                <YAxis/>
                <Tooltip cursor={false}/>
            </LineChart>
        </ResponsiveContainer>
    );
}