import { LineChart, Line, CartesianGrid, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

const fetchData = () => {
    //FETCH REAL DATA FROM BACKEND

    //mockdata
    const data = [
        {key: 0, value: 100},
        {key: 1, value: 85},
        {key: 2, value: 60},
        {key: 3, value: 45},
        {key: 4, value: 55},
        {key: 5, value: 70},
        {key: 6, value: 30}
    ];

    const newData = [];

    return data;
};

export const LineGraph = () => {
    const data = fetchData();

    if (data.length === 0)
        return 'No data yet';

    return (
    <div className=''>
            <LineChart width={600} height={300} data={data}>
                <CartesianGrid stroke='#aaa' strokeDasharray='5 5' />
                <Line dataKey='value' type='monotone' stroke='black' strokeWidth={2}/>
                <XAxis dataKey='key' />
                <YAxis reversed/>
                <Tooltip cursor={false}/>
            </LineChart>
    </div>
    );
}