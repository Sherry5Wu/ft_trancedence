import { BarChart, Bar, Rectangle, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

const fetchData = () => {
    //FETCH REAL DATA FROM BACKEND

    //mockdata
    const data = [
        {key: 0, value: 0},
        {key: 1, value: 100},
        {key: 2, value: 250},
        {key: 3, value: 300},
        {key: 4, value: 200},
        {key: 5, value: 150},
        {key: 6, value: 450}
    ];

    const newData = [];

    return data;
};

export const BarGraph = () => {
    const data = fetchData();

    if (data.length === 0)
        return 'No data yet';

    return (
    <div className=''>
            <BarChart width={600} height={300} data={data}>
                <Tooltip cursor={false}/>
                <CartesianGrid stroke='#aaa' strokeDasharray='3 3' />
                <Bar dataKey='value' fill='#000' stroke='black' strokeWidth={2} activeBar={<Rectangle fill="#FFF" />} />
                <XAxis dataKey='key' />
                <YAxis />
            </BarChart>
    </div>
    );
}