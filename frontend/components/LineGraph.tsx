import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ScoreHistory } from './Stats';


export const LineGraph = ({ data} : { data: ScoreHistory[] | null }) => {
    // Jos data on null, käytetään tyhjää taulukkoa
    const safeData = data || [];

    console.log('From line graph');
    console.log(safeData);

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