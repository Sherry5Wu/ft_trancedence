import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ScoreHistory } from '../utils/Interfaces';

export const LineGraph = ({ data }: { data: ScoreHistory[] | null }) => {
    if (!data)
		return <div className='flex justify-center my-5'>No data yet</div>

    const correctedData = [{id: 0, elo_score: 1000}, ...data];

    return (
        <ResponsiveContainer width="100%" aspect={1.5}>
            <LineChart width={500} height={300} data={correctedData}>
                <CartesianGrid stroke='#aaa' strokeDasharray='5 5' />
                <Line dataKey='elo_score' type='monotone' stroke='black' strokeWidth={2}/>
                <XAxis dataKey='id' />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip cursor={false}/>
            </LineChart>
        </ResponsiveContainer>
    );
}