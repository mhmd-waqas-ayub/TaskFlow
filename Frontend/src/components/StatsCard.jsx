export default function StatsCard({
    title,
    value
})
{
    return(
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-lg p-6 backdrop-blur-lg transition-all hover:scale-[1.02]">
            <h3 className="text-gray-500 mb-2">
                {title}
            </h3>
            <p className="text-3xl font-bold">
                {value}
            </p>
        </div>
    )
}