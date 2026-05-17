import {
PieChart,
Pie,
Cell,
Tooltip,
ResponsiveContainer,
BarChart,
Bar,
XAxis,YAxis,
CartesianGrid

} from "recharts";
export default function AnalyticsCharts({analytics}){

    // PieData:
    const pieData=[
        {
       name:"TODO",
       value:analytics.todoTasks
        },
        {
            name:"In Progress",
            value:analytics.inProgressTasks
        },
        {
            name:"Completed",
            value:analytics.completedTasks
        }
    ];
    // Bar Data
    const barData=[
        {
            name:"Tasks",
            Total:analytics.totalTasks,
            Completed:analytics.completedTasks
        }
    ];
      const COLORS = [
    "#3B82F6",
    "#F59E0B",
    "#10B981"
  ];
  return(
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* PieCharts */}
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-4">
                Task Distribution
            </h2>
            <div className="h-[300px]">
                <ResponsiveContainer>
                    <PieChart>
                        <Pie
                        data={pieData}
                        dataKey="value"
                        outerRadius={100}
                        label
                        >
                            {pieData.map((entry,index)=>(
                                <Cell
                                key={index}
                                fill={COLORS[index]}
                                />

                            ))}
                        </Pie>
                        <Tooltip/>
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </div>

        {/* BarChart */}
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6">
            <h2 className="text-xl font-semibold mb-6">
                Productivity Overview
            </h2>
            <div className="h-[300px]">
                <ResponsiveContainer>
                    <BarChart
                    data={barData}>
                        <CartesianGrid strokeDasharray="3 3"/>
                        <XAxis dataKey="name"/>
                        <YAxis/>
                        <Tooltip/>
                        <Bar dataKey="Total" fill="#3B82F6"/>
                        <Bar dataKey="Completed" fill="#10B981"/>
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </div>

    </div>
  )
}