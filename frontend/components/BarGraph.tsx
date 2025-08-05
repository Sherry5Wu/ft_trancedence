import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, ReferenceLine, Cell, ResponsiveContainer } from 'recharts';

const fetchData = () => {
    //FETCH REAL DATA FROM BACKEND

    //mockdata
    const data = [
        {key: 0, value: 0},
        {key: 1, value: 100},
        {key: 2, value: 50},
        {key: 3, value: 50},
        {key: 4, value: -200},
        {key: 5, value: -150},
        {key: 6, value: 300}
    ];

    const newData = [];

    return data;
};

export const BarGraph = () => {
    const data = fetchData();

    // return (
    //     <BarChart width={600} height={300} data={data}>
    //         <Tooltip cursor={false}/>
    //         <CartesianGrid stroke='#aaa' strokeDasharray='3 3' />
    //         <Bar dataKey='value' fill='#000' stroke='black' strokeWidth={2} activeBar={<Rectangle fill="#FFEE8C" />} />
    //         <XAxis dataKey='key' />
    //         <YAxis />
    //     </BarChart>
    // );

    return (
        <ResponsiveContainer width="100%" aspect={1.5}>
            <BarChart width={500} height={300} data={data} >
                <Tooltip cursor={false}/>
                <CartesianGrid stroke='#aaa' strokeDasharray='3 3' />
                <Bar dataKey='value' barSize={20} stroke='black' strokeWidth={2} activeBar={<Rectangle fill="#FFEE8C" />}>
                    {data.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.value >= 0 ? '#2E6F40' : '#CD1C18'} />
                    ))}
                </Bar>
                <XAxis dataKey='key' />
                <YAxis />
                <ReferenceLine y={0} stroke='black' strokeWidth={2}/>
            </BarChart>
        </ResponsiveContainer>
    );
}