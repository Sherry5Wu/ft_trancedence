import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell, ResponsiveContainer } from 'recharts';
import { ScoreHistory } from './Stats';

// const fetchData = (user: string) => {
//     //FETCH REAL DATA FROM BACKEND

//     //mockdata
//     const data = [
//         {key: 0, value: 0},
//         {key: 1, value: 100},
//         {key: 2, value: 50},
//         {key: 3, value: 50},
//         {key: 4, value: -200},
//         {key: 5, value: -150},
//         {key: 6, value: 250}
//     ];

//     const newData = [];

//     return data;
// };

const calculateDifference = ({ data }: { data: ScoreHistory[] | null }) => {
	if (!data)
		return [];
    console.log("in bar graph");
    console.log(data);
	const newData = data.map((score, index, array) => {
		if (index !== array.length - 1)
		{
			const nextScore = array[index + 1];
			return (
			{
				id: score.id,
				elo_score: nextScore.elo_score - score.elo_score,
			});
		}
	}).filter(Boolean);
	return newData;
}

export const BarGraph = ({ data }: { data: ScoreHistory[] | null }) => {
	if (!data)
		return <div className='flex justify-center my-5'>No data yet</div>

	const differenceData = calculateDifference({ data });

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
                <YAxis />
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
