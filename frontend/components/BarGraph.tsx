import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell, ResponsiveContainer } from 'recharts';
import { ScoreHistory } from '../utils/Interfaces';

const calculateDifference = ({ correctedData }: { correctedData: ScoreHistory[] | null }) => {
	if (!correctedData)
		return [];
	const newData = correctedData.map((score, index, array) => {
		if (index < (array.length - 1))
		{
			const nextScore = array[index + 1];
			return (
			{
				id: score.id + 1,
				elo_score: nextScore.elo_score - score.elo_score,
			});
		}
	}).filter(Boolean);
    newData.unshift({id: 0, elo_score: 0});
	return newData;
}

export const BarGraph = ({ data }: { data: ScoreHistory[] | null }) => {
	if (!data)
		return <div className='flex justify-center my-5'>No data yet</div>

    const correctedData: ScoreHistory[] = [{id: 0, elo_score: 1000}, ...data];
    correctedData.sort((a, b) => a.id - b.id);
	const differenceData = calculateDifference({ correctedData });
    console.log('DATA');
    console.log(correctedData);
    console.log(differenceData);

    return (
        <ResponsiveContainer width="100%" aspect={1.5}>
            <BarChart width={500} height={300} data={differenceData} >
                <Tooltip cursor={false}/>
                <CartesianGrid stroke='#aaa' strokeDasharray='3 3' />
                <Bar dataKey='elo_score' barSize={20} stroke='black' strokeWidth={2} activeBar={<Rectangle fill="#FFEE8C" />}>
                    {differenceData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.elo_score >= 0 ? '#2E6F40' : '#CD1C18'} />
                    ))}
                </Bar>
                <XAxis dataKey='id' />
                <YAxis domain={['auto', 'auto']} />
                <ReferenceLine y={0} stroke='black' strokeWidth={2}/>
            </BarChart>
        </ResponsiveContainer>
    );
}

    // return (
    //     <BarChart width={600} height={300} data={data}>
    //         <Tooltip cursor={false}/>
    //         <CartesianGrid stroke='#aaa' strokeDasharray='3 3' />
    //         <Bar dataKey='value' fill='#000' stroke='black' strokeWidth={2} activeBar={<Rectangle fill="#FFEE8C" />} />
    //         <XAxis dataKey='key' />
    //         <YAxis />
    //     </BarChart>
    // );
