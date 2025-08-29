import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ScoreHistory } from '../utils/Interfaces';

export const LineGraph = ({ data }: { data: ScoreHistory[] | null }) => {
    if (!data)
		return <div className='flex justify-center my-5'>No data yet</div>

    const correctedData = [{id: 0, elo_score: 1000}, ...data];
    correctedData.sort((a, b) => a.id - b.id);
    const indexedData = correctedData.map((data, index) => ({...data, index: index}))

    return (
        <ResponsiveContainer width="100%" aspect={1.5}>
            <LineChart width={500} height={300} data={indexedData}>
                <CartesianGrid stroke='#aaa' strokeDasharray='5 5' />
                <Line dataKey='elo_score' type='monotone' stroke='black' strokeWidth={2}/>
                <XAxis dataKey='index' />
                <YAxis domain={['auto', 'auto']} />
                <Tooltip cursor={false}/>
            </LineChart>
        </ResponsiveContainer>
    );
}